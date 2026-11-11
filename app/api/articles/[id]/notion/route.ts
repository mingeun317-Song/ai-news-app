import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { saveArticleToNotion } from "@/lib/notion";

/** 기사 하나를 노션 데이터베이스에 저장한다. 이미 저장한 기사는 다시 저장하지 않는다. */
export async function POST(_request: Request, ctx: RouteContext<"/api/articles/[id]/notion">) {
  // proxy.ts가 막고 있지만, API는 직접 호출될 수 있으므로 여기서도 확인한다.
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id: rawId } = await ctx.params;
  if (!/^\d+$/.test(rawId)) return Response.json({ error: "not_found" }, { status: 404 });
  const id = Number(rawId);

  const [article] = await db
    .select({
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      url: articles.url,
      publishedAt: articles.publishedAt,
      notionSavedAt: articles.notionSavedAt,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id));

  if (!article) return Response.json({ error: "not_found" }, { status: 404 });
  if (article.notionSavedAt) {
    return Response.json({ notionSavedAt: article.notionSavedAt });
  }

  try {
    const pageId = await saveArticleToNotion(article);
    const notionSavedAt = new Date();
    await db
      .update(articles)
      .set({ notionPageId: pageId, notionSavedAt })
      .where(eq(articles.id, id));
    return Response.json({ notionSavedAt });
  } catch (error) {
    console.error("[saveToNotion]", error);
    return Response.json({ error: "save_failed" }, { status: 502 });
  }
}
