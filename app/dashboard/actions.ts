"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { isHexColor } from "@/lib/category-colors";
import { checkSlug } from "@/lib/category-slug";
import { collectNews, type CollectResult } from "@/lib/collect";

export type FetchNewsState =
  | ({ status: "done" } & CollectResult)
  | { status: "error" }
  | null;

export async function fetchNews(): Promise<FetchNewsState> {
  // proxy.ts가 막고 있지만, Server Action은 직접 호출될 수 있으므로 여기서도 확인한다.
  const { userId } = await auth();
  if (!userId) throw new Error("로그인이 필요합니다.");

  try {
    const result = await collectNews();
    // 새 기사가 바로 카드로 보이도록 화면을 다시 그린다.
    refresh();
    return { status: "done", ...result };
  } catch (error) {
    console.error("[fetchNews]", error);
    return { status: "error" };
  }
}

export type CreateCategoryState =
  | { status: "done" }
  | {
      status: "invalid";
      errors: Partial<Record<"name" | "slug" | "description" | "color", string>>;
    }
  | { status: "error" }
  | null;

export async function createCategory(formData: FormData): Promise<CreateCategoryState> {
  const { userId } = await auth();
  if (!userId) throw new Error("로그인이 필요합니다.");

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim().toLowerCase();

  const errors: Extract<CreateCategoryState, { status: "invalid" }>["errors"] = {};
  if (!name) errors.name = "이름을 입력해 주세요.";
  if (!description) errors.description = "설명을 입력해 주세요.";
  const slugProblem = checkSlug(slug);
  if (slugProblem === "format") {
    errors.slug = "영문 소문자, 숫자, 하이픈(-)만 쓸 수 있어요.";
  } else if (slugProblem === "reserved") {
    errors.slug = "이 슬러그는 쓸 수 없어요.";
  }
  if (!isHexColor(color)) errors.color = "#으로 시작하는 6자리 색 코드를 입력해 주세요. 예: #4f46e5";
  if (Object.keys(errors).length > 0) return { status: "invalid", errors };

  try {
    const duplicates = await db
      .select({ name: categories.name, slug: categories.slug })
      .from(categories)
      .where(or(eq(categories.name, name), eq(categories.slug, slug)));
    if (duplicates.some((c) => c.name === name)) errors.name = "이미 있는 카테고리예요.";
    if (duplicates.some((c) => c.slug === slug)) errors.slug = "이미 쓰고 있는 슬러그예요.";
    if (Object.keys(errors).length > 0) return { status: "invalid", errors };

    await db.insert(categories).values({ name, slug, description, color });
  } catch (error) {
    console.error("[createCategory]", error);
    return { status: "error" };
  }

  // 새 칩이 바로 보이도록 화면을 다시 그린다.
  refresh();
  return { status: "done" };
}
