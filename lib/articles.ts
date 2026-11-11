import { asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

/** 카테고리 필터. `"all"`은 전체, `"none"`은 미분류(category_id가 NULL), 숫자는 카테고리 ID. */
export type CategoryFilter = "all" | "none" | number;

/** URL의 `?category=` 값을 필터로 바꾼다. 알 수 없는 값은 전체로 본다. */
export function parseCategoryFilter(
  value: string | string[] | undefined,
): CategoryFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "none") return "none";
  if (raw && /^\d+$/.test(raw)) return Number(raw);
  return "all";
}

export async function getCategories() {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.name));
}

/** 필터와 상관없는 전체 기사 수 */
export async function countArticles() {
  return db.$count(articles);
}

export async function getArticles(filter: CategoryFilter) {
  const where =
    filter === "all"
      ? undefined
      : filter === "none"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, filter);

  return db
    .select({
      id: articles.id,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      source: articles.source,
      url: articles.url,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      notionSavedAt: articles.notionSavedAt,
      categoryId: articles.categoryId,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    // 발행일이 없는 기사는 수집 시각을 기준으로 정렬한다.
    .orderBy(
      desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`),
      desc(articles.id),
    );
}

export type ArticleListItem = Awaited<ReturnType<typeof getArticles>>[number];
