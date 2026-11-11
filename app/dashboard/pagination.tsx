import Link from "next/link";
import { categoryParam, type CategoryFilter } from "@/lib/articles";
import { PendingLabel } from "./pending-label";

const itemBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const linkClass = `${itemBase} border border-line bg-surface transition-colors hover:bg-subtle`;
const currentClass = `${itemBase} bg-accent text-white`;
const disabledClass = `${itemBase} border border-line bg-surface text-muted opacity-60`;

/** 카테고리 필터는 유지하고 페이지만 바꾼 주소. 1페이지는 `?page=`를 붙이지 않는다. */
export function pageHref(filter: CategoryFilter, page: number) {
  const params = new URLSearchParams();
  const category = categoryParam(filter);
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}

/** 첫 페이지, 마지막 페이지, 현재 페이지 앞뒤 1개를 보여 주고 사이는 '…'로 줄인다. */
function visiblePages(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  sorted.forEach((page, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && page - prev > 1) {
      // 한 칸만 비면 '…' 대신 그 번호를 보여 준다.
      result.push(page - prev === 2 ? prev + 1 : "gap");
    }
    result.push(page);
  });
  return result;
}

export function Pagination({
  filter,
  page,
  totalPages,
}: {
  filter: CategoryFilter;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="페이지" className="flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={pageHref(filter, page - 1)} className={linkClass}>
          <PendingLabel>← 이전</PendingLabel>
        </Link>
      ) : (
        <span aria-disabled className={disabledClass}>
          ← 이전
        </span>
      )}

      {visiblePages(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-sm text-muted">
            …
          </span>
        ) : item === page ? (
          <span key={item} aria-current="page" className={currentClass}>
            <span className="sr-only">현재 </span>
            {item}
            <span className="sr-only">페이지</span>
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(filter, item)}
            aria-label={`${item}페이지`}
            className={linkClass}
          >
            <PendingLabel>{item}</PendingLabel>
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={pageHref(filter, page + 1)} className={linkClass}>
          <PendingLabel>다음 →</PendingLabel>
        </Link>
      ) : (
        <span aria-disabled className={disabledClass}>
          다음 →
        </span>
      )}
    </nav>
  );
}
