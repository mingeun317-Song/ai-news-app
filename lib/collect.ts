import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { FEEDS, fetchFeed, type FeedItem } from "@/lib/rss";

const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_ITEMS_PER_FEED = 20;

export type CollectResult = {
  /** 새로 저장한 기사 수 */
  added: number;
  /** 가져오지 못한 피드 이름 */
  failedFeeds: string[];
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
  const candidates = new Map<string, FeedItem>();

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

  if (candidates.size === 0) return { added: 0, failedFeeds };

  // 이미 저장한 URL은 제외한다. 나중에 번역을 붙여도 같은 기사를 다시 번역하지 않도록 저장 전에 거른다.
  const existing = await db
    .select({ url: articles.url })
    .from(articles)
    .where(inArray(articles.url, [...candidates.keys()]));
  for (const { url } of existing) candidates.delete(url);

  if (candidates.size === 0) return { added: 0, failedFeeds };

  // 번역·요약·분류(Claude)를 붙이기 전까지는 원문 제목과 RSS 요약을 임시로 넣고 미분류로 둔다.
  const inserted = await db
    .insert(articles)
    .values(
      [...candidates.values()].map((item) => ({
        source: item.source,
        url: item.url,
        originalTitle: item.title,
        author: item.author,
        titleKo: item.title,
        summaryKo: item.snippet,
        publishedAt: item.publishedAt,
      })),
    )
    // 버튼을 연달아 눌러 같은 기사가 동시에 들어와도 URL 고유 제약으로 한 번만 저장된다.
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  return { added: inserted.length, failedFeeds };
}
