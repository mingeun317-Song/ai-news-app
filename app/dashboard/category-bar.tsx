import Link from "next/link";
import type { CategoryFilter } from "@/lib/articles";
import { categoryColor, type CategoryColor } from "@/lib/category-colors";

const chipBase =
  "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

// '전체'는 카테고리가 아니므로 카테고리 색 대신 기본 회색·강조색을 쓴다.
const ALL_COLOR: CategoryColor = {
  soft: "bg-subtle text-foreground/80",
  solid: "bg-accent text-white",
};

type Chip = {
  key: string;
  label: string;
  href: string;
  selected: boolean;
  color: CategoryColor;
};

export function CategoryBar({
  categories,
  selected,
}: {
  categories: { id: number; name: string }[];
  selected: CategoryFilter;
}) {
  const chips: Chip[] = [
    {
      key: "all",
      label: "전체",
      href: "/dashboard",
      selected: selected === "all",
      color: ALL_COLOR,
    },
    ...categories.map((category) => ({
      key: String(category.id),
      label: category.name,
      href: `/dashboard?category=${category.id}`,
      selected: selected === category.id,
      color: categoryColor(category.id),
    })),
    {
      key: "none",
      label: "미분류",
      href: "/dashboard?category=none",
      selected: selected === "none",
      color: categoryColor(null),
    },
  ];

  return (
    <nav aria-label="카테고리 필터" className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          aria-current={chip.selected ? "page" : undefined}
          className={
            chip.selected
              ? `${chipBase} ${chip.color.solid}`
              : `${chipBase} ${chip.color.soft} hover:ring-1 hover:ring-current/40`
          }
        >
          {chip.label}
        </Link>
      ))}
      {/* '+ 카테고리 추가' 버튼과 추가 폼(ui.md 5.2)은 카테고리 추가 기능을 만들 때 이 자리에 넣는다. */}
    </nav>
  );
}
