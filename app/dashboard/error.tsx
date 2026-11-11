"use client";

import { useEffect, useTransition } from "react";

export default function DashboardError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const [isRetrying, startRetry] = useTransition();

  useEffect(() => {
    // 서버 오류 원문은 프로덕션에서 클라이언트로 오지 않는다. 자세한 내용은 서버 로그(digest)로 확인한다.
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-danger">
        뉴스를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={() => startRetry(() => retry())}
        disabled={isRetrying}
        aria-busy={isRetrying}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRetrying && (
          <span
            aria-hidden
            className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
          />
        )}
        {isRetrying ? "다시 불러오는 중…" : "다시 시도"}
      </button>
    </div>
  );
}
