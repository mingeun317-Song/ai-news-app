import { UserButton } from "@clerk/nextjs";
import { FetchNewsBanner, FetchNewsButton, FetchNewsProvider } from "./fetch-news";

// 헤더를 레이아웃에 두어 error.tsx가 보일 때도 헤더가 남게 한다.
export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <FetchNewsProvider>
      <div className="min-h-full flex-1 bg-background">
        <header className="sticky top-0 z-10 border-b border-line bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <h1 className="text-lg font-bold tracking-tight">AI 뉴스 수집기</h1>
            <div className="flex items-center gap-4">
              <FetchNewsButton />
              <UserButton />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
          {/* 수집 결과 배너는 카테고리 바 위에 둔다(ui.md 7장). */}
          <FetchNewsBanner />
          {children}
        </main>
      </div>
    </FetchNewsProvider>
  );
}
