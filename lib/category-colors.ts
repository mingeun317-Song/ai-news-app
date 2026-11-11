// 카테고리별 색. 사용자가 고른 색(categories.color, `#rrggbb`)이 있으면 그 색을, 없으면 ID로 정한 기본 팔레트 색을 쓴다.
// Claude가 만든 카테고리는 색이 비어 있으므로 ID로 정해지고, ID가 이어서 생기므로 서로 다른 색이 된다.
// 팔레트 색은 Tailwind 클래스로 칠한다. 클래스를 찾을 수 있도록 클래스 이름은 문자열 그대로 둔다(조합해서 만들지 않는다).
// 팔레트 색 값은 app/globals.css의 --cat-* 토큰에 있다(ui.md 2.1).
// 사용자가 고른 색은 미리 클래스로 만들 수 없으므로 인라인 style로 칠하고,
// 라이트·다크 모드 모두에서 읽히도록 surface·foreground 토큰과 섞어 쓴다.

import type { CSSProperties } from "react";

export type CategoryColor = {
  /** 연한 바탕 + 진한 글자. 카드 배지와 선택되지 않은 필터 칩 */
  soft: string;
  /** 진한 바탕 + 대비되는 글자. 선택된 필터 칩 */
  solid: string;
  /** 사용자가 고른 색일 때 `soft`와 함께 붙이는 style */
  softStyle?: CSSProperties;
  /** 사용자가 고른 색일 때 `solid`와 함께 붙이는 style */
  solidStyle?: CSSProperties;
};

const PALETTE = [
  { key: "sky", hex: "#0ea5e9", soft: "bg-cat-1-soft text-cat-1", solid: "bg-cat-1 text-surface" },
  { key: "emerald", hex: "#10b981", soft: "bg-cat-2-soft text-cat-2", solid: "bg-cat-2 text-surface" },
  { key: "amber", hex: "#f59e0b", soft: "bg-cat-3-soft text-cat-3", solid: "bg-cat-3 text-surface" },
  { key: "rose", hex: "#f43f5e", soft: "bg-cat-4-soft text-cat-4", solid: "bg-cat-4 text-surface" },
  { key: "violet", hex: "#8b5cf6", soft: "bg-cat-5-soft text-cat-5", solid: "bg-cat-5 text-surface" },
  { key: "teal", hex: "#14b8a6", soft: "bg-cat-6-soft text-cat-6", solid: "bg-cat-6 text-surface" },
  { key: "orange", hex: "#f97316", soft: "bg-cat-7-soft text-cat-7", solid: "bg-cat-7 text-surface" },
  { key: "fuchsia", hex: "#d946ef", soft: "bg-cat-8-soft text-cat-8", solid: "bg-cat-8 text-surface" },
] as const;

const UNCATEGORIZED: CategoryColor = {
  soft: "bg-subtle text-muted",
  solid: "bg-muted text-surface",
};

const HEX_REGEX = /^#[0-9a-f]{6}$/i;

/** `#rrggbb` 형식인지 확인한다. */
export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_REGEX.test(value);
}

function paletteIndex(categoryId: number) {
  return ((((categoryId - 1) % PALETTE.length) + PALETTE.length) % PALETTE.length);
}

/** 사용자가 고른 색으로 칠하는 클래스와 style */
export function hexColor(hex: string): CategoryColor {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  // WCAG 상대 휘도. 밝은 색 위에는 어두운 글자, 어두운 색 위에는 흰 글자를 쓴다.
  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

  return {
    soft: "",
    solid: "",
    softStyle: {
      backgroundColor: `color-mix(in oklab, ${hex} 18%, var(--surface))`,
      color: `color-mix(in oklab, ${hex} 60%, var(--foreground))`,
    },
    solidStyle: {
      backgroundColor: hex,
      color: luminance > 0.4 ? "#18181b" : "#ffffff",
    },
  };
}

/** 카테고리의 색. `categoryId`가 `null`(미분류)이면 회색이다. */
export function categoryColor(
  categoryId: number | null,
  color: string | null = null,
): CategoryColor {
  if (categoryId === null) return UNCATEGORIZED;
  if (isHexColor(color)) return hexColor(color);
  return PALETTE[paletteIndex(categoryId)];
}

/**
 * 새 카테고리 폼의 기본 색. 색을 고르지 않은 카테고리들이 아직 쓰지 않는 팔레트 색의 hex 값이다.
 * 모두 쓰고 있으면 첫 색이다.
 */
export function suggestColor(categories: { id: number; color: string | null }[]): string {
  const used = new Set(
    categories.filter((c) => !isHexColor(c.color)).map((c) => paletteIndex(c.id)),
  );
  return PALETTE.find((_, i) => !used.has(i))?.hex ?? PALETTE[0].hex;
}
