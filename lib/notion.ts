import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * 노션 MCP 서버(`@notionhq/notion-mcp-server`)와의 연결은 이 파일에만 둔다.
 * 지금은 로컬 실행 기준이라 stdio로 서버를 띄우고, 배포할 때는 이 파일만 HTTP 방식으로 바꾼다.
 *
 * 도구 이름과 입력 형식은 MCP listTools로 확인한 값이다(notion-mcp-server 2.6).
 * 이 버전은 노션 API의 데이터 소스 방식을 쓰므로, 페이지의 부모는 데이터베이스가 아니라
 * 그 안의 데이터 소스여야 한다.
 */

const TOOL_RETRIEVE_DATABASE = "API-retrieve-a-database";
const TOOL_CREATE_PAGE = "API-post-page";

/** 노션 저장용 데이터베이스의 속성 이름. 노션에서 이름을 바꾸면 여기도 바꾼다. */
const PROPERTY = {
  title: "제목",
  category: "카테고리",
  summary: "요약",
  date: "날짜",
  url: "출처",
} as const;

/** 노션 rich_text 한 덩어리의 최대 글자 수 */
const TEXT_LIMIT = 2000;

export type NotionArticle = {
  titleKo: string;
  summaryKo: string;
  /** 카테고리 이름. 미분류면 `null` */
  categoryName: string | null;
  url: string;
  publishedAt: Date | null;
};

function requireEnv(name: "NOTION_TOKEN" | "NOTION_DATABASE_ID") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 환경 변수가 없습니다.`);
  return value;
}

/** 노션 MCP 서버를 띄우고 연결한 뒤 작업이 끝나면 닫는다. */
async function withNotion<T>(task: (client: Client) => Promise<T>): Promise<T> {
  const transport = new StdioClientTransport({
    // npx로 매번 내려받지 않도록 프로젝트에 설치한 서버를 지금 Node로 실행한다.
    command: process.execPath,
    args: [
      path.join(process.cwd(), "node_modules/@notionhq/notion-mcp-server/bin/cli.mjs"),
    ],
    // 기본으로 넘어가는 안전한 환경 변수(PATH 등)에 노션 토큰만 더한다. DB·Anthropic 키는 넘기지 않는다.
    env: { NOTION_TOKEN: requireEnv("NOTION_TOKEN") },
    stderr: "ignore",
  });
  const client = new Client({ name: "ai-news-collector", version: "0.1.0" });

  await client.connect(transport);
  try {
    return await task(client);
  } finally {
    await client.close();
  }
}

/** 도구를 호출하고 결과(JSON 문자열)를 객체로 돌려준다. 노션이 오류를 돌려주면 예외를 던진다. */
async function callTool(client: Client, name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args });
  const content = Array.isArray(result.content) ? result.content : [];
  const text = content.find((c) => c.type === "text")?.text;
  if (result.isError || typeof text !== "string") {
    throw new Error(`노션 도구 ${name} 호출 실패: ${String(text ?? "응답 없음").slice(0, 500)}`);
  }

  const data = JSON.parse(text);
  // 노션 API 오류는 isError 없이 { object: "error" }로 오기도 한다.
  if (data?.object === "error") {
    throw new Error(`노션 도구 ${name} 호출 실패: ${data.code} ${data.message}`);
  }
  return data;
}

// 데이터베이스의 데이터 소스 ID는 바뀌지 않으므로 한 번 찾으면 기억해 둔다.
let dataSourceId: string | null = null;

async function getDataSourceId(client: Client) {
  if (dataSourceId) return dataSourceId;
  const database = await callTool(client, TOOL_RETRIEVE_DATABASE, {
    database_id: requireEnv("NOTION_DATABASE_ID"),
  });
  const id = database?.data_sources?.[0]?.id;
  if (typeof id !== "string") {
    throw new Error("노션 데이터베이스에서 데이터 소스를 찾지 못했습니다.");
  }
  dataSourceId = id;
  return id;
}

function richText(content: string) {
  return [{ type: "text", text: { content: content.slice(0, TEXT_LIMIT) } }];
}

const seoulDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 기사를 노션 데이터베이스에 페이지로 저장하고 새 페이지 ID를 돌려준다. */
export async function saveArticleToNotion(article: NotionArticle): Promise<string> {
  return withNotion(async (client) => {
    const properties: Record<string, unknown> = {
      [PROPERTY.title]: { title: richText(article.titleKo) },
      [PROPERTY.category]: { select: { name: article.categoryName ?? "미분류" } },
      [PROPERTY.summary]: { rich_text: richText(article.summaryKo) },
      [PROPERTY.url]: { url: article.url },
    };
    // 발행일이 없는 기사는 날짜를 비워 둔다. 카드와 같이 한국 날짜로 넣는다.
    if (article.publishedAt) {
      properties[PROPERTY.date] = { date: { start: seoulDate.format(article.publishedAt) } };
    }

    const page = await callTool(client, TOOL_CREATE_PAGE, {
      parent: { type: "data_source_id", data_source_id: await getDataSourceId(client) },
      properties,
      // 페이지 본문에도 요약을 넣는다.
      children: [{ type: "paragraph", paragraph: { rich_text: richText(article.summaryKo) } }],
    });
    if (typeof page?.id !== "string") throw new Error("노션 페이지 ID를 받지 못했습니다.");
    return page.id;
  });
}
