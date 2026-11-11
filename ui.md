# UI 가이드 — AI 뉴스 수집기

이 문서는 화면을 만들 때 따르는 UI 기준이다. 스타일은 Tailwind CSS v4 유틸리티 클래스로만 작성하고, 색은 아래 디자인 토큰(`app/globals.css`의 `@theme`)을 통해 쓴다. 화면 구성과 기능의 기준은 `PRD.md`다.

## 1. 원칙

- **읽기가 먼저다.** 화면의 주인공은 기사 제목과 요약이다. 장식, 그림자, 색은 최소로 쓰고 글자 크기·줄 간격·여백으로 위계를 만든다.
- **조용한 배경, 한 가지 강조색.** 회색 계열(zinc) 바탕에 강조색(indigo) 하나만 쓴다. 강조색은 주요 버튼, 선택된 필터, 링크처럼 "누를 수 있는 것"에만 쓴다.
- **상태는 글로 알린다.** 로딩·성공·실패를 색만으로 구분하지 않고 항상 문구를 함께 보여준다.
- **라이트·다크 모드를 모두 지원한다.** 모든 색은 토큰을 거치므로 `dark:` 클래스를 직접 쓰지 않는다.

## 2. 디자인 토큰

`app/globals.css`를 아래처럼 바꿔 토큰을 정의한다. 컴포넌트에서는 `bg-surface`, `text-muted`, `border-line`처럼 토큰 이름으로 쓴다.

```css
@import "tailwindcss";

:root {
  --background: #fafafa;      /* zinc-50: 페이지 바탕 */
  --surface: #ffffff;         /* 카드, 입력창 */
  --foreground: #18181b;      /* zinc-900: 본문, 제목 */
  --muted: #71717a;           /* zinc-500: 출처, 날짜, 보조 문구 */
  --line: #e4e4e7;            /* zinc-200: 테두리, 구분선 */
  --subtle: #f4f4f5;          /* zinc-100: 비선택 칩, hover 바탕 */
  --accent: #4f46e5;          /* indigo-600: 주요 버튼, 선택 상태, 링크 */
  --accent-hover: #4338ca;    /* indigo-700 */
  --accent-soft: #eef2ff;     /* indigo-50: 카테고리 배지 바탕 */
  --accent-soft-fg: #4338ca;  /* indigo-700: 카테고리 배지 글자 */
  --danger: #dc2626;          /* red-600: 오류 문구 */
  --success: #16a34a;         /* green-600: 저장됨 */
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #09090b;    /* zinc-950 */
    --surface: #18181b;       /* zinc-900 */
    --foreground: #f4f4f5;    /* zinc-100 */
    --muted: #a1a1aa;         /* zinc-400 */
    --line: #27272a;          /* zinc-800 */
    --subtle: #27272a;        /* zinc-800 */
    --accent: #6366f1;        /* indigo-500 */
    --accent-hover: #818cf8;  /* indigo-400 */
    --accent-soft: #1e1b4b;   /* indigo-950 */
    --accent-soft-fg: #a5b4fc;/* indigo-300 */
    --danger: #f87171;        /* red-400 */
    --success: #4ade80;       /* green-400 */
  }
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-subtle: var(--subtle);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-soft: var(--accent-soft);
  --color-accent-soft-fg: var(--accent-soft-fg);
  --color-danger: var(--danger);
  --color-success: var(--success);
  --font-sans: system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

- 현재 `body`에 지정된 `font-family: Arial`은 지운다. Tailwind의 `font-sans`(위 `--font-sans`)가 적용되게 한다.
- 글꼴은 따로 추가하지 않고 시스템 글꼴을 쓴다. macOS는 Apple SD Gothic Neo, Windows는 맑은 고딕으로 표시된다.
- `app/layout.tsx`의 Geist(`next/font/google`)는 한글 글리프가 없으므로 `--font-sans`에 연결하지 않는다. 코드 표시용 Geist Mono만 남긴다.

### 2.1 카테고리 색

카테고리마다 색을 하나씩 정해 카드 배지와 필터 칩 전체를 칠하는 데 쓴다. 칩과 배지가 같은 색이라 필터와 카드가 한눈에 이어진다. 강조색(indigo)과 헷갈리지 않도록 indigo·blue 계열은 빼고 8가지 색을 돌려 쓴다.

| 토큰 | 라이트(글자 / 바탕) | 다크(글자 / 바탕) |
|---|---|---|
| `cat-1` sky | `#075985` / `#e0f2fe` | `#7dd3fc` / `#082f49` |
| `cat-2` emerald | `#065f46` / `#d1fae5` | `#6ee7b7` / `#022c22` |
| `cat-3` amber | `#92400e` / `#fef3c7` | `#fcd34d` / `#451a03` |
| `cat-4` rose | `#9f1239` / `#ffe4e6` | `#fda4af` / `#4c0519` |
| `cat-5` violet | `#5b21b6` / `#ede9fe` | `#c4b5fd` / `#2e1065` |
| `cat-6` teal | `#115e59` / `#ccfbf1` | `#5eead4` / `#042f2e` |
| `cat-7` orange | `#9a3412` / `#ffedd5` | `#fdba74` / `#431407` |
| `cat-8` fuchsia | `#86198f` / `#fae8ff` | `#f0abfc` / `#4a044e` |

- 토큰은 `app/globals.css`에 `--cat-N`(진한 색)과 `--cat-N-soft`(연한 색)로 정의한다. 클래스는 두 가지다.
  - `soft`: `bg-cat-N-soft text-cat-N` — 카드 배지, 선택되지 않은 필터 칩
  - `solid`: `bg-cat-N text-surface` — 선택된 필터 칩. 다크 모드에서는 `cat-N`이 밝은 색, `surface`가 어두운 색이라 대비가 그대로 유지된다.
- 사용자가 카테고리를 추가할 때 고른 색은 `categories.color`에 `#rrggbb`로 저장한다. 이 색은 미리 클래스로 만들 수 없으므로 `categoryColor()`가 돌려주는 인라인 `style`로 칠한다. 라이트·다크 모드 모두에서 읽히도록 `soft`는 `color-mix()`로 `--surface`(바탕)·`--foreground`(글자)와 섞고, `solid`는 고른 색 바탕에 밝기에 따라 흰 글자나 어두운 글자를 쓴다. 디자인 토큰 밖의 색은 이 경우에만 쓴다.
- 색이 비어 있으면(Claude가 만든 카테고리) 이름이 아니라 ID로 정한다: `(id - 1) % 8`번째 색. 이름을 바꿔도 색이 유지되고, 이어서 만든 카테고리끼리는 색이 겹치지 않는다. 9번째 카테고리부터는 색이 다시 돌아온다.
- 미분류는 회색을 쓴다: `soft`는 `bg-subtle text-muted`, `solid`는 `bg-muted text-surface`.
- 색 선택은 `lib/category-colors.ts`의 `categoryColor(categoryId, color)` 한 곳에서만 한다. Tailwind가 클래스를 찾을 수 있도록 클래스 이름을 문자열 조합(`` `bg-cat-${n}` ``)으로 만들지 않는다.
- 색은 보조 수단이다. 배지와 칩에는 항상 카테고리 이름을 함께 쓴다.

## 3. 타이포그래피

한국어 본문은 줄 간격을 넉넉히 두고(`leading-relaxed` 이상), 한 줄이 너무 길어지지 않게 카드 폭으로 제한한다. 단어 중간에서 줄이 바뀌지 않도록 본문 요소에 `break-keep`을 쓴다.

| 용도 | 클래스 |
|---|---|
| 앱 이름(헤더) | `text-lg font-bold tracking-tight` |
| 화면 제목 | `text-2xl font-bold tracking-tight` |
| 카드 제목 | `text-base font-semibold leading-snug break-keep wrap-break-word` (최대 2줄: `line-clamp-2`) |
| 카드 요약 | `text-sm leading-relaxed text-foreground/80 break-keep wrap-break-word` (최대 4줄: `line-clamp-4`) |
| 출처·날짜·보조 문구 | `text-xs text-muted` (카드 안에서는 `break-keep wrap-break-word` 추가) |
| 버튼·칩 | `text-sm font-medium` |

- `break-keep`만 쓰면 `GPT-5.5-Turbo-Preview` 같은 긴 영어 단어가 줄바꿈되지 않아 좁은 화면에서 카드 밖으로 넘친다. RSS에서 온 글자(제목, 요약, 출처)에는 `wrap-break-word`를 함께 붙여, 한글은 단어 단위로 바꾸고 너무 긴 단어만 중간에서 끊는다.
- 날짜는 `2026. 11. 11.` 형식(`Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" })`)으로 표시한다.
- 숫자를 세로로 맞춰야 하는 곳에는 `tabular-nums`를 붙인다.

## 4. 레이아웃과 간격

- 콘텐츠 폭: `mx-auto w-full max-w-6xl px-4 sm:px-6`
- 간격은 4의 배수만 쓴다. 섹션 사이 `gap-6`~`gap-8`, 카드 안 요소 사이 `gap-3`, 칩 사이 `gap-2`.
- 모서리: 카드 `rounded-xl`, 버튼·입력창 `rounded-lg`, 칩·배지 `rounded-full`.
- 그림자는 쓰지 않거나 `shadow-sm`까지만 쓴다. 영역 구분은 테두리(`border border-line`)로 한다.
- 모바일(375px)에서도 가로 스크롤이 생기지 않아야 한다.

## 5. 메인 화면(`/dashboard`) 구조

`/`로 들어오면 `/dashboard`로 보낸다. 로그인 후 이동하는 주소도 `/dashboard`다.

```
┌──────────────────────────────────────────────────────────┐
│ AI 뉴스 수집기                  [뉴스 가져오기]  (사용자) │  ← 헤더
├──────────────────────────────────────────────────────────┤
│ [전체] [모델] [정책] [연구] [미분류] [+ 카테고리 추가]    │  ← 카테고리 바
│                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│ │ 뉴스 카드 │ │ 뉴스 카드 │ │ 뉴스 카드 │                   │  ← 카드 그리드
│ └──────────┘ └──────────┘ └──────────┘                   │
└──────────────────────────────────────────────────────────┘
```

```tsx
<div className="min-h-full bg-background">
  <Header />
  <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
    <CategoryBar />
    <ArticleGrid />
  </main>
</div>
```

### 5.1 헤더

- 상단에 고정하고 아래 테두리로 구분한다: `sticky top-0 z-10 border-b border-line bg-background/80 backdrop-blur`
- 안쪽: `mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6`
- 왼쪽에 앱 이름 'AI 뉴스 수집기', 오른쪽에 '뉴스 가져오기' 버튼과 Clerk `UserButton`을 둔다.
- 현재 `app/layout.tsx`에서 `UserButton`을 `fixed`로 띄우고 있는데, 헤더를 만들면 헤더 안으로 옮긴다.
- 카테고리 관리 화면(`/categories`)으로 가는 링크는 헤더에 텍스트 링크('카테고리 관리')로 둔다.

### 5.2 카테고리 바

카드 목록 바로 위에 필터 칩을 한 줄로 나열하고, **맨 끝에 '카테고리 추가' 버튼**을 둔다.

- 순서: `전체` → 카테고리들(이름순) → `미분류` → `+ 카테고리 추가`
- 컨테이너: `-mx-4 flex items-center gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0`
- **모바일(`sm` 미만):** 칩이 여러 줄로 쌓여 카드가 화면 아래로 밀리지 않도록 한 줄로 두고 옆으로 밀어 넘긴다. 화면 끝까지 넘길 수 있게 페이지 좌우 여백을 상쇄하고(`-mx-4 px-4`), 포커스 테두리가 잘리지 않게 `py-1`을 둔다. 칩에는 `shrink-0 whitespace-nowrap`을 붙인다.
- **`sm` 이상:** 줄바꿈으로 모든 칩을 보여 준다.
- 칩 묶음 안에서만 옆으로 넘기며, 페이지 전체에는 가로 스크롤이 생기지 않아야 한다(4장).
- 필터를 바꾸면 주소가 바뀌므로 필터 칩은 버튼이 아니라 `next/link`의 `<Link>`로 만든다. 선택된 칩에는 `aria-current="page"`를 붙이고, 칩 묶음은 `<nav aria-label="카테고리 필터">`로 감싼다.
- 선택된 필터는 URL 검색 파라미터(`/dashboard?category=<slug>`, 미분류는 `/dashboard?category=none`, 전체는 파라미터 없음)에 담아 새로고침·뒤로 가기·링크 공유 때도 유지한다. 알 수 없는 값은 전체로 본다.
- 카테고리 칩과 미분류 칩은 칩 전체를 카테고리 색(2.1)으로 칠한다. 선택되지 않은 칩은 카드 배지와 같은 `soft`, 선택된 칩은 진한 `solid`다. 마우스를 올리면 `hover:ring-1 hover:ring-current/40`으로 같은 색 테두리를 보여 준다.
- '전체' 칩은 카테고리가 아니므로 아래 표의 회색(기본)·강조색(선택)을 쓴다.
- 칩에 해당 카테고리의 기사 수를 함께 보여줄 수 있다: `모델 12` (숫자는 `text-xs opacity-70 tabular-nums`).

| 요소 | 클래스 |
|---|---|
| 칩 공통 | `inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-shadow` |
| 전체 칩(기본) | 공통 + `bg-subtle text-foreground/80 hover:ring-1 hover:ring-current/40` |
| 전체 칩(선택) | 공통 + `bg-accent text-white` |
| 카테고리 칩(기본 / 선택) | 공통 + `categoryColor(id).soft` / `categoryColor(id).solid` |
| 카테고리 추가 버튼 | `inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-line px-3.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent` |

**카테고리 추가 폼**

이름, 슬러그, 설명, 색을 받는다. 설명은 DB에서 필수 값(`categories.description`은 `notNull`)이고, Claude가 기사를 분류할 때 기준으로 쓴다(PRD 8.3). 구현은 `app/dashboard/add-category.tsx`.

```
            ┌──────────────────────────────┐
            │ 새 카테고리                    │
            │ 이름   [예: 오픈소스 모델    ]  │
            │ 슬러그 [open-source-models  ]  │
            │ 필터 주소: /dashboard?category=…│
            │ 설명   [                    ]  │
            │ Claude가 기사를 분류할 때 …     │
            │ 색 [■] [#0ea5e9] (미리보기 칩)  │
            │                [취소] [추가하기]│
            └──────────────────────────────┘
```

1. '+ 카테고리 추가'를 누르면 화면 가운데에 작은 팝업이 뜨고, 이름 입력창에 포커스가 들어간다. 버튼에는 `aria-haspopup="dialog"`를 단다.
   - 팝업은 네이티브 모달 `<dialog>`(`showModal()`)로 만든다. 포커스가 팝업 안에 갇히고, `Esc`로 닫히며, 닫히면 포커스가 버튼으로 돌아간다.
   - 크기: `m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-line bg-surface p-0 shadow-sm`, 뒤 배경은 `backdrop:bg-overlay`(`--overlay` 토큰).
   - 팝업 바깥 배경을 눌러도 닫는다.
2. 폼 구성(`<form>`, 서버 액션 `createCategory`로 제출):
   - 영역: `flex flex-col gap-4 p-5`
   - 제목: `새 카테고리` (`text-base font-semibold`, `<dialog aria-labelledby>`로 연결)
   - 라벨: `text-sm font-medium`, 입력창과 `<label htmlFor>`로 연결한다. 입력란은 한 열로 쌓는다.
   - 이름 입력창: `h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent`, placeholder `예: 오픈소스 모델`, `required`
   - 슬러그 입력창: `font-mono`, placeholder `예: open-source-models`. 입력하는 동안 대문자는 소문자로, 공백은 하이픈으로 바꾼다. 아래 도움말로 실제 필터 주소를 보여 준다. 규칙은 `lib/category-slug.ts`(영문 소문자·숫자·하이픈, 50자 이하, `all`·`none` 불가).
   - 설명 입력창: `<textarea rows={3}>`, `w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-relaxed outline-none focus:border-accent`, placeholder `예: 공개 가중치로 배포된 모델의 출시, 성능 비교, 라이선스 소식`, `required`
   - 도움말(`text-xs text-muted`, 설명 입력창에 `aria-describedby`로 연결): `Claude가 기사를 분류할 때 이 설명을 기준으로 삼아요. 이후 수집하는 뉴스부터 적용돼요.`
   - 색: 색 선택기(`<input type="color">`, `h-9 w-12`)와 색 코드 입력창(`#rrggbb`, `w-28 font-mono`)을 나란히 두고 서로 맞춘다. 옆에 고른 색으로 칠한 `soft` 칩 미리보기를 둔다. 기본값은 색을 고르지 않은 카테고리들이 아직 쓰지 않는 팔레트 색이다(`suggestColor()`).
   - 버튼(오른쪽 정렬 `flex justify-end gap-2`): '취소'(보조 버튼), '추가하기'(주요 버튼)
3. 이름과 설명은 앞뒤 공백을 지운 뒤 비어 있지 않아야 하고, 슬러그와 색 코드는 규칙에 맞아야 한다. 하나라도 어긋나면 '추가하기'를 비활성화한다. 형식이 틀린 슬러그와 색 코드는 제출 전에 입력창 아래에 바로 알린다.
4. `Esc`, '취소', 바깥 배경을 누르면 팝업을 닫고 입력값을 지운 뒤 포커스를 '+ 카테고리 추가' 버튼으로 돌려준다. 설명 입력창에서 `Enter`는 줄바꿈이며 제출하지 않는다.
5. 제출하는 동안 입력창과 버튼을 비활성화하고 '추가하기'를 `추가하는 중…`으로 바꾼다.
6. 성공하면 팝업을 닫고 새 칩이 목록에 나타난다.
7. 실패하면 팝업을 연 채로 입력값을 유지하고, 해당 입력창 아래에 `text-xs text-danger`로 이유를 표시한다(입력창에는 `aria-invalid`).
   - 이름이 이미 있을 때(`name` 고유 제약): `이미 있는 카테고리예요.`
   - 슬러그가 이미 있을 때(`slug` 고유 제약): `이미 쓰고 있는 슬러그예요.`
   - 그 밖의 오류: 폼 아래에 `카테고리를 추가하지 못했어요. 다시 시도해 주세요.`
8. 이름·설명 수정과 삭제는 카테고리 관리 화면(`/categories`)에서 한다.

### 5.3 카드 그리드

- `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`
- 최신순으로 표시한다.
- 한 페이지에 카드 9개(3열 × 3줄)를 보여 주고, 그리드 아래에 페이지 이동을 둔다(`app/dashboard/pagination.tsx`).
  - 주소는 `?page=N`이며 카테고리 필터(`?category=`)와 함께 쓴다. 1페이지에는 `page`를 붙이지 않고, 필터를 바꾸면 1페이지로 돌아간다.
  - `← 이전` · 페이지 번호 · `다음 →`를 `<nav aria-label="페이지">` 안에 `<Link>`로 둔다. 번호는 첫·마지막 페이지와 현재 페이지 앞뒤 1개만 보여 주고 사이는 `…`로 줄인다.
  - 번호와 이동 버튼은 보조 버튼 모양(`h-9 min-w-9`), 현재 페이지는 `bg-accent text-white`와 `aria-current="page"`로 표시한다. 처음·마지막 페이지의 이전·다음은 흐리게(`opacity-60`) 두고 누를 수 없게 한다.
  - 누른 링크는 필터 칩처럼 `PendingLabel`로 깜빡여 반응을 보여 준다.
  - 페이지가 1개뿐이면 페이지 이동을 숨긴다. 마지막 페이지보다 큰 번호로 들어오면 마지막 페이지로 보낸다.

### 5.4 뉴스 카드

```
┌────────────────────────────────┐
│ [모델]                          │  ← 카테고리 배지
│ 오픈소스 모델, 추론 성능에서 …    │  ← 제목 (최대 2줄)
│ 새로 공개된 모델은 수학·코딩 …    │  ← 요약 (최대 4줄)
│ …                              │
│ TechCrunch · 2026. 11. 11.      │  ← 출처 · 발행일
│ ────────────────────────────── │
│ 원문보기 ↗            [저장하기] │  ← 동작
└────────────────────────────────┘
```

```tsx
<article className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-foreground/20">
  {/* 색 클래스는 categoryColor(categoryId).soft (2.1) */}
  <span className="w-fit rounded-full bg-cat-1-soft px-2.5 py-0.5 text-xs font-medium text-cat-1">
    모델
  </span>
  <h2 className="line-clamp-2 text-base font-semibold leading-snug break-keep">…</h2>
  <p className="line-clamp-4 text-sm leading-relaxed text-foreground/80 break-keep">…</p>
  <p className="text-xs text-muted">
    TechCrunch · <time dateTime="2026-11-11">2026. 11. 11.</time>
  </p>
  <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
    <a href="…" target="_blank" rel="noopener noreferrer"
       className="text-sm font-medium text-accent hover:underline underline-offset-4">
      원문보기 ↗
    </a>
    <SaveButton />
  </div>
</article>
```

- 배지는 카테고리 색(2.1)으로 칠한다. 미분류 기사는 배지를 `bg-subtle text-muted`로 표시하고 문구는 `미분류`로 쓴다.
- 날짜는 발행일을 쓴다. RSS에 발행일이 없으면 수집일을 `수집 2026. 11. 11.`처럼 앞에 '수집'을 붙여 표시한다. 정렬도 같은 기준(발행일, 없으면 수집 시각)이다.
- '원문보기' 링크는 모바일에서 누르기 쉽도록 글자 크기는 그대로 두고 누르는 영역만 넓힌다: `-ml-1 inline-flex h-9 items-center px-1`. 카드 하단 영역은 `min-h-9`.
- '원문보기' 링크에는 화면 낭독기용으로 `<span className="sr-only"> (새 탭에서 열림)</span>`을 붙인다. 원문 URL이 `http`·`https`가 아니면 링크를 표시하지 않는다.
- 카드 전체를 링크로 만들지 않는다. '원문보기'와 '저장하기'를 각각 누르게 한다.
- 원문 링크는 항상 새 탭(`target="_blank" rel="noopener noreferrer"`)으로 연다.
- RSS에서 온 제목·요약은 텍스트로만 렌더링한다(`dangerouslySetInnerHTML` 금지).

## 6. 버튼

| 종류 | 용도 | 클래스 |
|---|---|---|
| 주요(Primary) | 뉴스 가져오기 | `inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60` |
| 보조(Secondary) | 저장하기, 취소 | `inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-60` |
| 위험(Danger) | 카테고리 삭제 | 보조 버튼에 `text-danger hover:border-danger` 추가 |

모든 버튼과 링크에 키보드 포커스 표시를 둔다: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`

### 6.1 '저장하기' 버튼 상태

| 상태 | 문구 | 표시 |
|---|---|---|
| 기본 | `저장하기` | 보조 버튼 |
| 저장 중 | `저장 중…` | `disabled`, 스피너 |
| 저장됨 | `저장됨 ✓` | `disabled`, `text-success`, 테두리 없음(`border-transparent`) — 다시 누를 수 없음 |
| 실패 | `다시 시도` | 보조 버튼, 버튼 왼쪽에 `text-xs text-danger`로 `저장에 실패했어요.` |

### 6.2 '뉴스 가져오기' 버튼 상태

- 수집 중에는 `disabled`로 바꾸고 문구를 `가져오는 중…`으로, 앞에 스피너를 둔다. 첫 수집은 오래 걸릴 수 있으므로(PRD 10) 버튼 아래나 카테고리 바 위에 `text-sm text-muted`로 `새 기사를 번역하고 있어요. 잠시 기다려 주세요.`를 보여준다.
- 끝나면 결과를 한 줄로 알린다: `새 기사 8건을 가져왔어요.` / `새 기사가 없어요.`
- 일부 피드가 실패하면 성공 결과와 함께 실패한 피드를 알린다: `TechCrunch 피드를 가져오지 못했어요. 다음 수집 때 다시 시도합니다.`

스피너: `<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />`

## 7. 알림(배너)

수집 결과와 오류는 카테고리 바 위에 배너로 표시한다. 토스트 라이브러리는 쓰지 않는다.

| 종류 | 클래스 |
|---|---|
| 정보·성공 | `rounded-lg border border-line bg-surface px-4 py-3 text-sm` |
| 오류 | `rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger` |

배너 영역에는 `role="status"`(오류는 `role="alert"`)를 붙여 스크린 리더가 읽게 한다.

## 8. 빈 상태, 로딩, 오류

### 8.1 빈 상태

빈 상태 영역: `flex flex-col items-center gap-3 rounded-xl border border-dashed border-line px-4 py-16 text-center`

- **기사가 하나도 없을 때(필터와 상관없이 0건):**
  - 필터가 의미 없으므로 카테고리 필터 칩은 숨긴다. 단, '+ 카테고리 추가' 버튼은 수집 전에도 카테고리를 만들 수 있도록 남긴다.
  - 신문 아이콘(`size-10 text-muted`, `aria-hidden`), 문구 `아직 수집한 뉴스가 없어요.`, 보조 문구(`text-sm text-muted`) `새 기사를 가져오면 한국어로 번역·요약한 카드가 여기에 표시돼요.`
  - 그 아래에 '뉴스 가져오기' 주요 버튼을 둔다. 버튼이 아직 없는 동안에는 문구로 없는 버튼을 가리키지 않는다.
- **필터 결과가 없을 때:** 문구 `이 카테고리에는 아직 뉴스가 없어요.`와 '전체 뉴스 보기' 링크(`/dashboard`, 보조 버튼 모양 `h-9`)를 둔다.
- **삭제된 카테고리 주소로 들어왔을 때**(`?category=<없는 ID>`): 빈 화면을 보여 주지 않고 `/dashboard`로 보낸다.

### 8.2 로딩

- **처음 열 때:** `<Suspense>` 대체 화면으로 칩 4개와 카드 6개 모양의 스켈레톤을 보여준다. 스켈레톤 줄은 `h-4 rounded bg-subtle motion-safe:animate-pulse`.
  - 스켈레톤 영역에 `role="status"`와 화면에는 보이지 않는 문구(`<span className="sr-only">뉴스를 불러오는 중이에요.</span>`)를 둔다. 스켈레톤 도형은 `aria-hidden`.
- **필터를 바꿀 때:** 같은 페이지에서 주소만 바뀌므로 스켈레톤이 다시 뜨지 않고 이전 카드가 남는다. 대신 누른 칩의 글자를 `useLinkStatus`로 `opacity-60 motion-safe:animate-pulse` 처리해 반응을 보여 준다(`app/dashboard/pending-label.tsx`).

### 8.3 오류

- 목록을 불러오지 못하면 `app/dashboard/error.tsx`가 헤더 아래에 오류 배너(7장, `role="alert"`)를 보여준다. 헤더는 `app/dashboard/layout.tsx`에 있어 오류 때도 남는다.
- 문구: `뉴스를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.` 옆에 '다시 시도' 보조 버튼을 두고, 누르면 Next.js `retry()`로 다시 불러온다. 다시 불러오는 동안 `다시 불러오는 중…`과 스피너를 보여 준다.
- 서버 오류 원문은 화면에 표시하지 않는다.

## 9. 카테고리 관리 화면(`/categories`)

- 화면 제목 '카테고리 관리'와 메인(`/dashboard`)으로 돌아가는 링크(`← 뉴스로 돌아가기`)를 위에 둔다.
- 목록은 카드 하나 안에 행으로 나열한다: `divide-y divide-line rounded-xl border border-line bg-surface`
- 각 행: 이름(`font-medium`), 설명(`text-sm text-muted`), 오른쪽에 '수정'·'삭제' 보조 버튼.
- 목록 위에 메인 화면과 같은 카테고리 추가 버튼·팝업(5.2)을 둔다. 두 화면이 같은 컴포넌트를 쓴다.
- 수정은 행 안에서 이름·설명 입력창으로 바꿔 처리한다. 추가할 때와 같이 이름과 설명 모두 비울 수 없다.
- 삭제 전에 확인을 받는다: `'모델' 카테고리를 삭제할까요? 이 카테고리의 뉴스는 미분류로 옮겨져요.`
- 입력창: `h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent`

## 10. 접근성 체크리스트

- 본문 글자와 배경의 명도 대비는 4.5:1 이상(토큰 색은 이를 만족하도록 골랐다).
- 아이콘만 있는 버튼에는 `aria-label`을 단다.
- 선택된 필터 칩(링크)은 `aria-current="page"`, 로딩 중인 영역은 `aria-busy`를 쓴다.
- 날짜는 `<time dateTime>`으로 감싼다.
- 모든 동작은 키보드(Tab, Enter, Esc)만으로 할 수 있어야 한다.
- `prefers-reduced-motion`을 존중한다: 애니메이션 클래스에 `motion-safe:`를 붙인다(예: `motion-safe:animate-spin`).

## 11. 문구 규칙

- 버튼은 동사로 끝낸다: '뉴스 가져오기', '저장하기', '원문보기', '카테고리 추가'.
- 안내·결과 문구는 해요체로 짧게 쓴다: `새 기사가 없어요.`
- 오류는 무엇이 실패했는지와 다음에 할 일을 함께 쓴다: `저장에 실패했어요. 다시 시도해 주세요.`
- 메타데이터 `title`은 'AI 뉴스 수집기'로 바꾼다(`app/layout.tsx`의 'Create Next App' 교체).
