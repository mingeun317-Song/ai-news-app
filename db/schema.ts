import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  // 필터 주소(/dashboard?category=<slug>)에 쓰는 영문 식별자
  slug: text().notNull().unique(),
  description: text().notNull(),
  // lib/category-colors.ts의 색 이름. NULL이면 ID로 자동으로 정한다.
  color: text(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const articles = pgTable("articles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  source: text().notNull(),
  // 추적 파라미터와 # 이하를 제거한 정규화된 URL. 중복 판단의 기준이다.
  url: text().notNull().unique(),
  originalTitle: text("original_title").notNull(),
  author: text(),
  titleKo: text("title_ko").notNull(),
  summaryKo: text("summary_ko").notNull(),
  // NULL이 곧 '미분류'다. 미분류용 행을 따로 만들지 않는다.
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  notionPageId: text("notion_page_id"),
  notionSavedAt: timestamp("notion_saved_at", { withTimezone: true }),
});
