// 카테고리별 색. 카테고리는 Claude가 수시로 만들기 때문에 이름이 아니라 ID로 색을 정한다.
// ID가 이어서 생기므로 새로 만든 카테고리끼리는 서로 다른 색이 된다.
// Tailwind가 클래스를 찾을 수 있도록 클래스 이름은 문자열 그대로 둔다(조합해서 만들지 않는다).
// 색 값은 app/globals.css의 --cat-* 토큰에 있다(ui.md 2.1).

export type CategoryColor = {
  /** 연한 바탕 + 진한 글자. 카드 배지와 선택되지 않은 필터 칩 */
  soft: string;
  /** 진한 바탕 + 바탕색 글자. 선택된 필터 칩 */
  solid: string;
};

const PALETTE: readonly CategoryColor[] = [
  { soft: "bg-cat-1-soft text-cat-1", solid: "bg-cat-1 text-surface" },
  { soft: "bg-cat-2-soft text-cat-2", solid: "bg-cat-2 text-surface" },
  { soft: "bg-cat-3-soft text-cat-3", solid: "bg-cat-3 text-surface" },
  { soft: "bg-cat-4-soft text-cat-4", solid: "bg-cat-4 text-surface" },
  { soft: "bg-cat-5-soft text-cat-5", solid: "bg-cat-5 text-surface" },
  { soft: "bg-cat-6-soft text-cat-6", solid: "bg-cat-6 text-surface" },
  { soft: "bg-cat-7-soft text-cat-7", solid: "bg-cat-7 text-surface" },
  { soft: "bg-cat-8-soft text-cat-8", solid: "bg-cat-8 text-surface" },
];

const UNCATEGORIZED: CategoryColor = {
  soft: "bg-subtle text-muted",
  solid: "bg-muted text-surface",
};

/** 카테고리 ID에 맞는 색 클래스. `null`(미분류)은 회색이다. */
export function categoryColor(categoryId: number | null): CategoryColor {
  if (categoryId === null) return UNCATEGORIZED;
  const index =
    (((categoryId - 1) % PALETTE.length) + PALETTE.length) % PALETTE.length;
  return PALETTE[index];
}
