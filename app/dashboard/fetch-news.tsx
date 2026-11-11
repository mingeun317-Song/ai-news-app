"use client";

import { createContext, use, useActionState } from "react";
import { fetchNews, type FetchNewsState } from "./actions";

type FetchNewsContextValue = {
  state: FetchNewsState;
  run: () => void;
  pending: boolean;
};

const FetchNewsContext = createContext<FetchNewsContextValue | null>(null);

function useFetchNews() {
  const value = use(FetchNewsContext);
  if (!value) throw new Error("FetchNewsProvider 안에서만 쓸 수 있습니다.");
  return value;
}

/**
 * 버튼(헤더, 빈 화면)과 결과 배너(카테고리 바 위)가 떨어져 있으므로 수집 상태를 여기서 함께 쓴다.
 */
export function FetchNewsProvider({ children }: { children: React.ReactNode }) {
  const [state, run, pending] = useActionState(fetchNews, null);

  return <FetchNewsContext value={{ state, run, pending }}>{children}</FetchNewsContext>;
}

export function FetchNewsButton() {
  const { run, pending } = useFetchNews();

  return (
    <form action={run}>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && (
          <span
            aria-hidden
            className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
          />
        )}
        {pending ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
    </form>
  );
}

const infoBanner = "rounded-lg border border-line bg-surface px-4 py-3 text-sm";
const errorBanner =
  "rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger";

export function FetchNewsBanner() {
  const { state, pending } = useFetchNews();

  if (pending) {
    return (
      <p role="status" className="text-sm text-muted">
        새 기사를 가져오고 있어요. 잠시 기다려 주세요.
      </p>
    );
  }

  if (!state) return null;

  if (state.status === "error") {
    return (
      <p role="alert" className={errorBanner}>
        뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  const { added, failedFeeds } = state;
  // 모든 피드가 실패했으면 '새 기사가 없어요.'는 오해를 주므로 실패 안내만 보여 준다.
  const allFailed = failedFeeds.length > 0 && added === 0;

  return (
    <div className="flex flex-col gap-2">
      {!allFailed && (
        <p role="status" className={infoBanner}>
          {added > 0 ? `새 기사 ${added}건을 가져왔어요.` : "새 기사가 없어요."}
        </p>
      )}
      {failedFeeds.length > 0 && (
        <p role="alert" className={errorBanner}>
          {failedFeeds.join(", ")} 피드를 가져오지 못했어요. 다음 수집 때 다시 시도합니다.
        </p>
      )}
    </div>
  );
}
