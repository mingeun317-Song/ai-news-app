// 카테고리 슬러그 규칙. 필터 주소(/dashboard?category=<slug>)에 쓰이므로 영문 소문자·숫자·하이픈만 허용한다.

export const SLUG_MAX_LENGTH = 50;

/** HTML `pattern` 속성과 서버 검사에 함께 쓰는 정규식 */
export const SLUG_PATTERN = "[a-z0-9]+(?:-[a-z0-9]+)*";

const SLUG_REGEX = new RegExp(`^${SLUG_PATTERN}$`);

// 필터 주소에서 이미 다른 뜻으로 쓰는 값
const RESERVED_SLUGS = new Set(["all", "none"]);

export type SlugProblem = "format" | "reserved";

/** 슬러그로 쓸 수 없으면 이유를, 쓸 수 있으면 `null`을 돌려준다. */
export function checkSlug(slug: string): SlugProblem | null {
  if (slug.length === 0 || slug.length > SLUG_MAX_LENGTH || !SLUG_REGEX.test(slug)) {
    return "format";
  }
  if (RESERVED_SLUGS.has(slug)) return "reserved";
  return null;
}

/** Claude가 준 값처럼 규칙을 모를 수 있는 입력을 슬러그 모양으로 다듬는다. 남는 글자가 없으면 빈 문자열이다. */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}
