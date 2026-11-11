import Parser from "rss-parser";

export const FEEDS = [
  {
    source: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    source: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
] as const;

export type Feed = (typeof FEEDS)[number];

export type FeedItem = {
  source: string;
  /** 정규화된 URL */
  url: string;
  title: string;
  author: string | null;
  publishedAt: Date | null;
  /** HTML을 제거한 RSS 본문 요약 */
  snippet: string;
};

const FETCH_TIMEOUT_MS = 10_000;
const SNIPPET_MAX_LENGTH = 500;

// 쿼리 파라미터 중 기사 내용과 무관한 추적용 값. utm_*는 접두어로 따로 거른다.
const TRACKING_PARAMS = new Set([
  "fbclid",
  "gclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "igshid",
  "_hsenc",
  "_hsmi",
]);

/**
 * 중복 판단에 쓰는 URL로 바꾼다. 추적 파라미터와 `#` 이하를 지운다.
 * `http`·`https`가 아니거나 URL로 읽을 수 없으면 `null`을 돌려준다.
 */
export function normalizeUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || TRACKING_PARAMS.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }
  return url.toString();
}

function cleanText(value: string | undefined, maxLength?: number) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (maxLength === undefined || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function parseDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// RSS는 dc:creator(creator), Atom은 author에 작성자를 담는다.
type RawItem = Parser.Item & { author?: string };

const parser = new Parser<Record<string, never>, RawItem>();

/**
 * 피드 하나를 가져와 기사 목록으로 바꾼다. 네트워크·파싱 오류는 그대로 던진다.
 * RSS 내용은 신뢰하지 않는 입력이므로 텍스트로만 다루고, 링크가 올바르지 않은 기사는 버린다.
 */
export async function fetchFeed(feed: Feed): Promise<FeedItem[]> {
  const res = await fetch(feed.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ai-news-collector)" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`${feed.source} 피드 응답 오류: ${res.status}`);
  }

  const parsed = await parser.parseString(await res.text());
  const items: FeedItem[] = [];

  for (const item of parsed.items) {
    const url = item.link ? normalizeUrl(item.link) : null;
    const title = cleanText(item.title);
    if (!url || !title) continue;

    items.push({
      source: feed.source,
      url,
      title,
      author: cleanText(item.creator ?? item.author) || null,
      publishedAt: parseDate(item.isoDate ?? item.pubDate),
      snippet: cleanText(item.contentSnippet ?? item.summary, SNIPPET_MAX_LENGTH),
    });
  }

  return items;
}
