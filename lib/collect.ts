import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { processArticles } from "@/lib/claude";
import { checkSlug, toSlug } from "@/lib/category-slug";
import { FEEDS, fetchFeed, type FeedItem } from "@/lib/rss";

const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_ITEMS_PER_FEED = 20;
/** Claude에 한 번에 보내는 기사 수 */
const BATCH_SIZE = 10;

export type CollectResult = {
  /** 새로 저장한 기사 수 */
  added: number;
  /** 가져오지 못한 피드 이름 */
  failedFeeds: string[];
  /** 번역·요약·분류에 실패해 저장하지 못한 기사 수. 다음 수집 때 다시 시도된다. */
  failedArticles: number;
};

/** 지난 24시간 안에 발행된 기사만 최신순으로 피드당 최대 20건 남긴다. 발행일이 없으면 기간을 알 수 없어 건너뛴다. */
function pickRecent(items: FeedItem[], now: number) {
  return items
    .filter(
      (item): item is FeedItem & { publishedAt: Date } =>
        item.publishedAt !== null &&
        now - item.publishedAt.getTime() <= RECENT_WINDOW_MS,
    )
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, MAX_ITEMS_PER_FEED);
}

/**
 * 모든 피드에서 지난 24시간의 기사를 가져와 새 기사만 저장한다.
 * 한 피드가 실패해도 다른 피드는 계속 처리한다.
 */
export async function collectNews(): Promise<CollectResult> {
  const now = Date.now();
  const results = await Promise.allSettled(FEEDS.map((feed) => fetchFeed(feed)));

  const failedFeeds: string[] = [];
  // 정규화된 URL을 키로 써서 같은 수집 안의 중복(같은 기사가 두 번 실린 경우 등)을 거른다.
  const candidates = new Map<string, FeedItem & { publishedAt: Date }>();

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[collectNews] ${FEEDS[i].source} 피드 실패`, result.reason);
      failedFeeds.push(FEEDS[i].source);
      return;
    }
    for (const item of pickRecent(result.value, now)) {
      if (!candidates.has(item.url)) candidates.set(item.url, item);
    }
  });

  if (candidates.size === 0) return { added: 0, failedFeeds, failedArticles: 0 };

  // 이미 저장한 URL은 제외한다. 같은 기사를 다시 번역하지 않도록 Claude에 보내기 전에 거른다.
  const existing = await db
    .select({ url: articles.url })
    .from(articles)
    .where(inArray(articles.url, [...candidates.keys()]));
  for (const { url } of existing) candidates.delete(url);

  if (candidates.size === 0) return { added: 0, failedFeeds, failedArticles: 0 };

  let added = 0;
  let failedArticles = 0;
  // 앞 묶음에서 만든 카테고리를 다음 묶음이 재사용하도록 순서대로 처리한다. 병렬화하지 않는다.
  for (const batch of chunk([...candidates.values()], BATCH_SIZE)) {
    try {
      const result = await processBatch(batch);
      added += result.added;
      failedArticles += result.skipped;
    } catch (error) {
      // 기록하지 않은 기사는 다음 수집 때 다시 시도된다.
      console.error(`[collectNews] 기사 ${batch.length}건 처리 실패`, error);
      failedArticles += batch.length;
    }
  }

  return { added, failedFeeds, failedArticles };
}

/** 슬러그 규칙에 맞지 않거나 이미 쓰는 값이면 `category`·`-2` 같은 꼬리를 붙여 쓸 수 있는 값으로 만든다. */
function uniqueSlug(base: string, used: Set<string>) {
  // 빈 값이나 예약어(all·none)는 앞에 category를 붙인다. toSlug로 길이와 끝 하이픈을 다시 다듬는다.
  const root = checkSlug(base) === null ? base : toSlug(`category-${base}`.slice(0, 40));
  let slug = root;
  for (let n = 2; used.has(slug) || checkSlug(slug) !== null; n++) slug = `${root}-${n}`;
  return slug;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

/**
 * 기사 묶음을 Claude로 번역·요약·분류하고, 새 카테고리와 기사를 기록한다.
 * 저장한 기사 수와 Claude 결과에서 빠져 저장하지 못한 기사 수를 돌려준다.
 */
async function processBatch(batch: (FeedItem & { publishedAt: Date })[]) {
  const existingCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
    })
    .from(categories);

  const processed = await processArticles(
    batch.map(({ url, source, title, snippet }) => ({ url, source, title, snippet })),
    existingCategories.map(({ name, slug, description }) => ({ name, slug, description })),
  );
  const skipped = batch.length - processed.length;
  if (processed.length === 0) return { added: 0, skipped };

  const categoryIds = new Map(existingCategories.map((c) => [c.name, c.id]));
  const usedSlugs = new Set(existingCategories.map((c) => c.slug));
  const newCategories = new Map<string, { slug: string; description: string }>();
  for (const { categoryName, categoryDescription, categorySlug } of processed) {
    if (categoryIds.has(categoryName) || newCategories.has(categoryName)) continue;
    const slug = uniqueSlug(toSlug(categorySlug), usedSlugs);
    usedSlugs.add(slug);
    newCategories.set(categoryName, { slug, description: categoryDescription });
  }
  if (newCategories.size > 0) {
    // 같은 이름·슬러그가 동시에 만들어져도 고유 제약으로 한 번만 생긴다.
    // 슬러그 충돌로 빠진 카테고리는 아래 조회에서 찾지 못해 그 기사들이 미분류로 저장된다.
    await db
      .insert(categories)
      .values([...newCategories].map(([name, { slug, description }]) => ({ name, slug, description })))
      .onConflictDoNothing();
    const created = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(inArray(categories.name, [...newCategories.keys()]));
    for (const { id, name } of created) categoryIds.set(name, id);
  }

  const itemsByUrl = new Map(batch.map((item) => [item.url, item]));
  const inserted = await db
    .insert(articles)
    .values(
      processed.map((result) => {
        const item = itemsByUrl.get(result.url)!;
        return {
          source: item.source,
          url: item.url,
          originalTitle: item.title,
          author: item.author,
          titleKo: result.titleKo,
          summaryKo: result.summaryKo,
          categoryId: categoryIds.get(result.categoryName) ?? null,
          publishedAt: item.publishedAt,
        };
      }),
    )
    // 버튼을 연달아 눌러 같은 기사가 동시에 들어와도 URL 고유 제약으로 한 번만 저장된다.
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  return { added: inserted.length, skipped };
}
