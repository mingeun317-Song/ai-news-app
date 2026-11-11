import Link from "next/link";
import type { CategoryFilter } from "@/lib/articles";
import { categoryColor, suggestColor, type CategoryColor } from "@/lib/category-colors";
import { AddCategory } from "./add-category";
import { PendingLabel } from "./pending-label";

const chipBase =
  "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
  showFilters = true,
}: {
  categories: { id: number; name: string; slug: string; color: string | null }[];
  selected: CategoryFilter;
  /** `false`면 필터 칩을 숨기고 '+ 카테고리 추가' 버튼만 보여 준다(기사가 하나도 없을 때). */
  showFilters?: boolean;
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
      href: `/dashboard?category=${category.slug}`,
      selected: typeof selected === "object" && selected.id === category.id,
      color: categoryColor(category.id, category.color),
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
    <AddCategory defaultColor={suggestColor(categories)}>
      {showFilters &&
        chips.map((chip) => (
          <Link
            key={chip.key}
            href={chip.href}
            aria-current={chip.selected ? "page" : undefined}
            className={
              chip.selected
                ? `${chipBase} ${chip.color.solid}`
                : `${chipBase} ${chip.color.soft} hover:ring-1 hover:ring-current/40`
            }
            style={chip.selected ? chip.color.solidStyle : chip.color.softStyle}
          >
            <PendingLabel>{chip.label}</PendingLabel>
          </Link>
        ))}
    </AddCategory>
  );
}
