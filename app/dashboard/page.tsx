import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  countArticles,
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
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
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

  // 삭제된 카테고리 주소(예: 즐겨찾기)로 들어오면 전체 보기로 보낸다.
  if (typeof filter === "number" && !categories.some((c) => c.id === filter)) {
    redirect("/dashboard");
  }

  // 필터 결과가 비었을 때만 전체 기사 수를 따로 센다.
  const hasAnyArticle =
    articles.length > 0 || (filter !== "all" && (await countArticles()) > 0);

  if (!hasAnyArticle) {
    // 기사가 하나도 없으면 필터가 의미 없으므로 카테고리 바를 숨긴다.
    // '+ 카테고리 추가' 버튼을 만들면 수집 전에도 카테고리를 추가할 수 있도록 그 버튼만은 여기서도 보여 준다.
    return <EmptyState />;
  }

  return (
    <>
      <CategoryBar categories={categories} selected={filter} />

      {articles.length === 0 ? (
        <FilteredEmptyState />
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

function NewspaperIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-10 text-muted"
    >
      <path d="M4 5h13a1 1 0 0 1 1 1v12a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V5Z" />
      <path d="M18 9h2v9a2 2 0 0 1-2 2" />
      <path d="M8 9h6M8 13h6M8 17h3" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line px-4 py-16 text-center">
      <NewspaperIcon />
      <p className="font-medium">아직 수집한 뉴스가 없어요.</p>
      <p className="text-sm break-keep text-muted">
        새 기사를 가져오면 한국어로 번역·요약한 카드가 여기에 표시돼요.
      </p>
      {/* '뉴스 가져오기' 버튼을 만들면 이 자리에도 넣는다(ui.md 8장). */}
    </div>
  );
}

function FilteredEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line px-4 py-16 text-center">
      <p className="font-medium">이 카테고리에는 아직 뉴스가 없어요.</p>
      <Link
        href="/dashboard"
        className="inline-flex h-9 items-center rounded-lg border border-line bg-surface px-4 text-sm font-medium transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        전체 뉴스 보기
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">뉴스를 불러오는 중이에요.</span>
      <div aria-hidden className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-8 w-16 shrink-0 rounded-full bg-subtle motion-safe:animate-pulse" />
        ))}
      </div>
      <div aria-hidden className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
