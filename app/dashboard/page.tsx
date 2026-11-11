import { UserButton } from "@clerk/nextjs";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  getArticles,
  getCategories,
  parseCategoryFilter,
} from "@/lib/articles";
import { ArticleCard } from "./article-card";
import { CategoryBar } from "./category-bar";

export default function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  return (
    <div className="min-h-full flex-1 bg-background">
      <header className="sticky top-0 z-10 border-b border-line bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <h1 className="text-lg font-bold tracking-tight">AI 뉴스 수집기</h1>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function DashboardContent({
  searchParams,
}: Pick<PageProps<"/dashboard">, "searchParams">) {
  // 수집 직후 새 기사가 바로 보이도록 매 요청마다 DB에서 읽는다.
  await connection();
  const filter = parseCategoryFilter((await searchParams).category);
  const [categories, articles] = await Promise.all([
    getCategories(),
    getArticles(filter),
  ]);

  return (
    <>
      <CategoryBar categories={categories} selected={filter} />

      {articles.length === 0 ? (
        <EmptyState filtered={filter !== "all"} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line px-4 py-16 text-center">
      {filtered ? (
        <p className="font-medium">이 카테고리에는 아직 뉴스가 없어요.</p>
      ) : (
        <>
          <p className="font-medium">아직 수집한 뉴스가 없어요.</p>
          <p className="text-sm text-muted">
            &apos;뉴스 가져오기&apos;로 새 기사를 모아 보세요.
          </p>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="뉴스를 불러오는 중" className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-8 w-16 rounded-full bg-subtle motion-safe:animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5">
            <div className="h-5 w-14 rounded-full bg-subtle motion-safe:animate-pulse" />
            <div className="h-4 w-full rounded bg-subtle motion-safe:animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-subtle motion-safe:animate-pulse" />
            <div className="h-3 w-full rounded bg-subtle motion-safe:animate-pulse" />
            <div className="h-3 w-full rounded bg-subtle motion-safe:animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-subtle motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
