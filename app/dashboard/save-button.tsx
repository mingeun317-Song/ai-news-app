"use client";

import { useState } from "react";

type Status = "idle" | "saving" | "saved" | "error";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const secondaryButton = `inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;
const savedButton =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-transparent px-3 text-sm font-medium text-success disabled:cursor-default";

/** 뉴스 카드의 노션 저장 버튼(ui.md 6.1). 저장한 기사는 '저장됨'으로 바뀌고 다시 누를 수 없다. */
export function SaveButton({ articleId, saved }: { articleId: number; saved: boolean }) {
  const [status, setStatus] = useState<Status>(saved ? "saved" : "idle");

  async function save() {
    setStatus("saving");
    try {
      const response = await fetch(`/api/articles/${articleId}/notion`, { method: "POST" });
      setStatus(response.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "saved") {
    return (
      <button type="button" disabled className={savedButton}>
        저장됨 ✓
      </button>
    );
  }

  const saving = status === "saving";

  return (
    <div className="flex items-center gap-2">
      {status === "error" && (
        <p role="alert" className="text-xs text-danger">
          저장에 실패했어요.
        </p>
      )}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        aria-busy={saving}
        className={secondaryButton}
      >
        {saving && (
          <span
            aria-hidden
            className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
          />
        )}
        {saving ? "저장 중…" : status === "error" ? "다시 시도" : "뉴스 저장"}
      </button>
    </div>
  );
}
