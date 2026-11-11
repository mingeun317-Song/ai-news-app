"use client";

import { useLinkStatus } from "next/link";

/**
 * 필터 칩(<Link>) 안의 글자. 필터 데이터는 요청마다 새로 읽어서 미리 받아 둘 수 없으므로,
 * 누른 뒤 새 목록이 올 때까지 칩을 깜빡여 반응하고 있음을 보여 준다.
 */
export function PendingLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();

  return (
    <span className={pending ? "opacity-60 motion-safe:animate-pulse" : undefined}>
      {children}
      {pending && <span className="sr-only"> 불러오는 중</span>}
    </span>
  );
}
