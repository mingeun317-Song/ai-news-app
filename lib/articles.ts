import { asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

/** 카테고리 필터. `"all"`은 전체, `"none"`은 미분류(category_id가 NULL), 객체는 특정 카테고리. */
export type CategoryFilter = "all" | "none" | { id: number; slug: string };

/**
 * URL의 `?category=` 값을 필터로 바꾼다. 값이 없으면 전체로 본다.
 * 어느 카테고리의 슬러그도 아니면(삭제된 카테고리 등) `null`을 돌려준다.
 */
export function parseCategoryFilter(
  value: string | string[] | undefined,
  categoryList: { id: number; slug: string }[],
): CategoryFilter | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "all";
  if (raw === "none") return "none";
  const category = categoryList.find((c) => c.slug === raw);
  return category ? { id: category.id, slug: category.slug } : null;
}

/** 필터 주소의 `?category=` 값. 전체는 `null`이다. */
export function categoryParam(filter: CategoryFilter): string | null {
  if (filter === "all") return null;
  return filter === "none" ? "none" : filter.slug;
}

/** 한 페이지에 보여 줄 카드 수(3열 그리드 기준 3줄) */
export const PAGE_SIZE = 9;

/** URL의 `?page=` 값을 1 이상의 정수로 바꾼다. 알 수 없는 값은 1페이지로 본다. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && /^\d+$/.test(raw)) return Math.max(1, Number(raw));
  return 1;
}

export async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      color: categories.color,
    })
    .from(categories)
    .orderBy(asc(categories.name));
}

function filterCondition(filter: CategoryFilter) {
  return filter === "all"
    ? undefined
    : filter === "none"
      ? isNull(articles.categoryId)
      : eq(articles.categoryId, filter.id);
}

/** 필터에 맞는 기사 수. 필터를 주지 않으면 전체 기사 수 */
export async function countArticles(filter: CategoryFilter = "all") {
  return db.$count(articles, filterCondition(filter));
}

export async function getArticles(filter: CategoryFilter, page: number) {
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
      categoryColor: categories.color,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(filterCondition(filter))
    // 발행일이 없는 기사는 수집 시각을 기준으로 정렬한다. id를 함께 두어 페이지가 바뀌어도 순서가 흔들리지 않게 한다.
    .orderBy(
      desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`),
      desc(articles.id),
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
}

export type ArticleListItem = Awaited<ReturnType<typeof getArticles>>[number];
