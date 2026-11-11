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

## 3. 타이포그래피

한국어 본문은 줄 간격을 넉넉히 두고(`leading-relaxed` 이상), 한 줄이 너무 길어지지 않게 카드 폭으로 제한한다. 단어 중간에서 줄이 바뀌지 않도록 본문 요소에 `break-keep`을 쓴다.

| 용도 | 클래스 |
|---|---|
| 앱 이름(헤더) | `text-lg font-bold tracking-tight` |
| 화면 제목 | `text-2xl font-bold tracking-tight` |
| 카드 제목 | `text-base font-semibold leading-snug break-keep` (최대 2줄: `line-clamp-2`) |
| 카드 요약 | `text-sm leading-relaxed text-foreground/80 break-keep` (최대 4줄: `line-clamp-4`) |
| 출처·날짜·보조 문구 | `text-xs text-muted` |
| 버튼·칩 | `text-sm font-medium` |

- 날짜는 `2026. 11. 11.` 형식(`Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" })`)으로 표시한다.
- 숫자를 세로로 맞춰야 하는 곳에는 `tabular-nums`를 붙인다.

## 4. 레이아웃과 간격

- 콘텐츠 폭: `mx-auto w-full max-w-6xl px-4 sm:px-6`
- 간격은 4의 배수만 쓴다. 섹션 사이 `gap-6`~`gap-8`, 카드 안 요소 사이 `gap-3`, 칩 사이 `gap-2`.
- 모서리: 카드 `rounded-xl`, 버튼·입력창 `rounded-lg`, 칩·배지 `rounded-full`.
- 그림자는 쓰지 않거나 `shadow-sm`까지만 쓴다. 영역 구분은 테두리(`border border-line`)로 한다.
- 모바일(375px)에서도 가로 스크롤이 생기지 않아야 한다.

## 5. 메인 화면(`/`) 구조

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
- 컨테이너: `flex flex-wrap items-center gap-2`
- 항목이 많아도 줄바꿈으로 모두 보이게 한다(가로 스크롤 쓰지 않음).
- 필터 칩은 `<button>`이며 선택 상태를 `aria-pressed`로 알린다. 선택된 필터는 URL 검색 파라미터(`?category=<id>`, 미분류는 `?category=none`)에 담아 새로고침해도 유지한다.
- 칩에 해당 카테고리의 기사 수를 함께 보여줄 수 있다: `모델 12` (숫자는 `text-xs opacity-70 tabular-nums`).

| 요소 | 클래스 |
|---|---|
| 칩(기본) | `inline-flex h-8 items-center gap-1.5 rounded-full bg-subtle px-3.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-line` |
| 칩(선택) | `inline-flex h-8 items-center gap-1.5 rounded-full bg-accent px-3.5 text-sm font-medium text-white` |
| 카테고리 추가 버튼 | `inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-line px-3.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent` |

**카테고리 추가 폼**

카테고리 설명은 DB에서 필수 값(`categories.description`은 `notNull`)이고, Claude가 기사를 분류할 때 기준으로 쓴다(PRD 8.3). 그래서 메인 화면에서도 이름과 설명을 함께 받는다.

```
│ [전체] [모델] [정책] [미분류] [+ 카테고리 추가]            │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 새 카테고리                                            │ │
│ │ 이름  [예: 오픈소스 모델                         ]      │ │
│ │ 설명  [이 카테고리에 넣을 기사를 설명해 주세요     ]      │ │
│ │       [                                           ]   │ │
│ │ Claude가 기사를 분류할 때 이 설명을 기준으로 삼아요.      │ │
│ │ 이후 수집하는 뉴스부터 적용돼요.                          │ │
│ │                                     [취소] [추가하기]  │ │
│ └──────────────────────────────────────────────────────┘ │
```

1. '+ 카테고리 추가'를 누르면 카테고리 바 바로 아래(카드 그리드 위)에 추가 폼이 펼쳐지고, 이름 입력창에 포커스가 들어간다. 버튼에는 `aria-expanded`와 `aria-controls`를 단다.
   - 폼이 열린 동안 추가 버튼은 선택된 모양(`border-accent text-accent`)으로 둔다.
   - 팝오버나 모달 대신 펼침 영역을 쓰는 이유: 위치 계산이 필요 없고, 모바일에서도 폭이 넉넉하다.
2. 폼 구성(`<form>`, 서버 액션 또는 API로 제출):
   - 영역: `flex flex-col gap-4 rounded-xl border border-line bg-surface p-5`
   - 제목: `새 카테고리` (`text-sm font-semibold`)
   - 라벨: `text-sm font-medium`, 입력창과 `<label htmlFor>`로 연결한다.
   - 이름 입력창: `h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent`, placeholder `예: 오픈소스 모델`, `required`
   - 설명 입력창: `<textarea rows={3}>`, `w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-relaxed outline-none focus:border-accent`, placeholder `예: 공개 가중치로 배포된 모델의 출시, 성능 비교, 라이선스 소식`, `required`
   - 도움말(`text-xs text-muted`, 설명 입력창에 `aria-describedby`로 연결): `Claude가 기사를 분류할 때 이 설명을 기준으로 삼아요. 이후 수집하는 뉴스부터 적용돼요.`
   - 버튼(오른쪽 정렬 `flex justify-end gap-2`): '취소'(보조 버튼), '추가하기'(주요 버튼)
3. 이름과 설명은 앞뒤 공백을 지운 뒤 둘 다 비어 있지 않아야 한다. 둘 중 하나라도 비어 있으면 '추가하기'를 비활성화한다.
4. `Esc`나 '취소'를 누르면 폼을 닫고 입력값을 지운 뒤 포커스를 '+ 카테고리 추가' 버튼으로 돌려준다. 설명 입력창에서 `Enter`는 줄바꿈이며 제출하지 않는다.
5. 제출하는 동안 입력창과 버튼을 비활성화하고 '추가하기'를 `추가하는 중…`으로 바꾼다.
6. 성공하면 폼을 닫고 새 칩이 목록에 나타난다.
7. 실패하면 폼을 연 채로 입력값을 유지하고, 해당 입력창 아래에 `text-xs text-danger`로 이유를 표시한다(입력창에는 `aria-invalid`).
   - 이름이 이미 있을 때(`name` 고유 제약): `이미 있는 카테고리예요.`
   - 그 밖의 오류: 폼 아래에 `카테고리를 추가하지 못했어요. 다시 시도해 주세요.`
8. 이름·설명 수정과 삭제는 카테고리 관리 화면(`/categories`)에서 한다.

### 5.3 카드 그리드

- `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`
- 최신순으로 표시한다.

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
  <span className="w-fit rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-soft-fg">
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

- 미분류 기사는 배지를 `bg-subtle text-muted`로 표시하고 문구는 `미분류`로 쓴다.
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

## 8. 빈 상태와 로딩

- **기사가 하나도 없을 때:** 카드 그리드 자리에 가운데 정렬로 안내한다.
  - 영역: `flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-16 text-center`
  - 문구: `아직 수집한 뉴스가 없어요.` / 보조 문구(`text-sm text-muted`): `오른쪽 위 '뉴스 가져오기'를 눌러 시작하세요.`
- **필터 결과가 없을 때:** `이 카테고리에는 아직 뉴스가 없어요.`
- **목록 로딩:** 카드와 같은 크기의 스켈레톤 카드 6개를 보여준다. 스켈레톤 줄은 `h-4 rounded bg-subtle animate-pulse`.

## 9. 카테고리 관리 화면(`/categories`)

- 화면 제목 '카테고리 관리'와 메인으로 돌아가는 링크(`← 뉴스로 돌아가기`)를 위에 둔다.
- 목록은 카드 하나 안에 행으로 나열한다: `divide-y divide-line rounded-xl border border-line bg-surface`
- 각 행: 이름(`font-medium`), 설명(`text-sm text-muted`), 오른쪽에 '수정'·'삭제' 보조 버튼.
- 목록 위에 메인 화면과 같은 카테고리 추가 폼(5.2)을 둔다. 두 화면이 같은 컴포넌트를 쓴다.
- 수정은 행 안에서 이름·설명 입력창으로 바꿔 처리한다. 추가할 때와 같이 이름과 설명 모두 비울 수 없다.
- 삭제 전에 확인을 받는다: `'모델' 카테고리를 삭제할까요? 이 카테고리의 뉴스는 미분류로 옮겨져요.`
- 입력창: `h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent`

## 10. 접근성 체크리스트

- 본문 글자와 배경의 명도 대비는 4.5:1 이상(토큰 색은 이를 만족하도록 골랐다).
- 아이콘만 있는 버튼에는 `aria-label`을 단다.
- 필터 칩은 `aria-pressed`, 로딩 중인 버튼은 `aria-busy`를 쓴다.
- 날짜는 `<time dateTime>`으로 감싼다.
- 모든 동작은 키보드(Tab, Enter, Esc)만으로 할 수 있어야 한다.
- `prefers-reduced-motion`을 존중한다: 애니메이션 클래스에 `motion-safe:`를 붙인다(예: `motion-safe:animate-spin`).

## 11. 문구 규칙

- 버튼은 동사로 끝낸다: '뉴스 가져오기', '저장하기', '원문보기', '카테고리 추가'.
- 안내·결과 문구는 해요체로 짧게 쓴다: `새 기사가 없어요.`
- 오류는 무엇이 실패했는지와 다음에 할 일을 함께 쓴다: `저장에 실패했어요. 다시 시도해 주세요.`
- 메타데이터 `title`은 'AI 뉴스 수집기'로 바꾼다(`app/layout.tsx`의 'Create Next App' 교체).
