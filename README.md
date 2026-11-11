# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 모아 한국어 요약 카드로 보여 주는 개인용 웹 앱입니다. 버튼을 누를 때만 새 기사를 가져오고, Claude가 번역·요약·카테고리 분류를 맡습니다. 다시 볼 기사는 버튼 하나로 노션 데이터베이스에 저장합니다.

로컬 PC에서 혼자 쓰는 것을 전제로 만들었습니다.

## 주요 기능

- **뉴스 가져오기:** TechCrunch AI와 The Verge AI의 RSS에서 새 기사를 가져옵니다. 이미 가져온 기사는 다시 번역하지 않습니다.
- **번역·요약·분류:** Claude가 제목을 한국어로 번역하고 2~3문장으로 요약하며 카테고리를 정합니다.
- **카테고리 필터:** 전체, 카테고리별, 미분류로 골라 봅니다. 카테고리는 직접 추가할 수도 있습니다.
- **뉴스 저장:** 카드의 '뉴스 저장'을 누르면 노션 데이터베이스에 페이지가 만들어지고, 버튼이 '저장됨 ✓'으로 바뀝니다.
- **로그인:** 로그인하지 않으면 화면과 API에 접근할 수 없습니다.

## 동작 흐름

```
RSS 피드 → URL 정규화·중복 제외 → Claude 번역·요약·분류 → Neon 기록 → 카드 표시 → (선택) 노션 저장
```

- 새 기사는 10건씩 묶어 순서대로 Claude에 보냅니다. 앞 묶음에서 만든 카테고리를 다음 묶음이 다시 쓰도록 하기 위해서입니다.
- 한 피드나 묶음이 실패해도 나머지는 계속 처리합니다. 실패한 기사는 기록하지 않으므로 다음 수집 때 다시 시도됩니다.
- 노션 저장은 Claude를 거치지 않고, Next.js 서버가 노션 MCP 서버를 실행해 페이지를 만듭니다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16(App Router, TypeScript), Tailwind CSS 4 |
| 로그인 | Clerk |
| 데이터베이스 | Neon(PostgreSQL), Drizzle ORM |
| RSS 파싱 | `rss-parser` |
| 번역·요약·분류 | Claude API(`@anthropic-ai/sdk`, `zod`) |
| 노션 저장 | `@notionhq/notion-mcp-server`, `@modelcontextprotocol/sdk` |

## 시작하기

### 1. 준비물

- Node.js 20 이상
- 계정: [Clerk](https://clerk.com), [Neon](https://neon.tech), [Anthropic](https://console.anthropic.com), [Notion](https://www.notion.so)

### 2. 설치

```bash
npm install
```

### 3. 환경 변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 넣습니다. 이 파일은 Git에 올라가지 않습니다.

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
ANTHROPIC_API_KEY=
NOTION_TOKEN=
NOTION_DATABASE_ID=
# 선택. 비워 두면 claude-opus-5-5를 씁니다.
CLAUDE_MODEL=
```

### 4. 데이터베이스 테이블 만들기

`drizzle/` 폴더의 마이그레이션을 Neon 데이터베이스에 적용합니다.

```bash
npx drizzle-kit migrate
```

### 5. 노션 데이터베이스 준비

1. [노션 통합 페이지](https://www.notion.so/profile/integrations)에서 내부 통합을 만들고, 콘텐츠 읽기·삽입 권한을 켭니다. 발급된 토큰을 `NOTION_TOKEN`에 넣습니다.
2. 저장용 데이터베이스를 만들고 아래 속성을 이름과 유형 그대로 추가합니다.

   | 속성 | 유형 | 저장되는 값 |
   |---|---|---|
   | 제목 | 제목 | 한국어 제목 |
   | 카테고리 | 선택 | 카테고리 이름. 미분류면 '미분류' |
   | 요약 | 텍스트 | 한국어 요약(페이지 본문에도 들어감) |
   | 날짜 | 날짜 | 발행일. 없으면 비워 둠 |
   | 출처 | URL | 원문 URL |

3. 데이터베이스 오른쪽 위 **⋯ → 연결**에서 1번의 통합을 추가합니다.
4. 데이터베이스 주소에서 `?v=` 앞의 32자리 값을 `NOTION_DATABASE_ID`에 넣습니다.

속성 이름을 바꾸려면 `lib/notion.ts`의 `PROPERTY`도 함께 바꿔야 합니다.

### 6. 실행

```bash
npm run dev
```

http://localhost:3000 에 접속해 로그인한 뒤 '뉴스 가져오기'를 누릅니다.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드한 앱 실행 |
| `npm run lint` | ESLint 검사 |

## 폴더 구조

```
app/dashboard/                     메인 화면(뉴스 카드, 카테고리 필터, 뉴스 가져오기)
app/api/articles/[id]/notion/      노션 저장 API
app/sign-in/                       Clerk 로그인
proxy.ts                           로그인 보호
db/schema.ts                       Drizzle 스키마
drizzle/                           마이그레이션
lib/rss.ts                         RSS 수집, URL 정규화
lib/claude.ts                      Claude 번역·요약·분류
lib/collect.ts                     수집 전체 흐름
lib/notion.ts                      노션 MCP 연결
```

## 문서

- [PRD.md](PRD.md): 요구사항, 데이터 모델, 구현 순서
- [ui.md](ui.md): 화면 스타일과 상호작용 규칙

## 제한 사항

- 로컬 실행 전용입니다. 노션 저장이 MCP 서버를 stdio로 실행하는 방식이라, Vercel 같은 곳에 배포하려면 `lib/notion.ts`를 HTTP 방식으로 바꿔야 합니다.
- RSS에 담긴 내용만 요약하며 기사 전문은 가져오지 않습니다.
