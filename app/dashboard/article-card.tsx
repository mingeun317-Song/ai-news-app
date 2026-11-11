import type { ArticleListItem } from "@/lib/articles";
import { categoryColor } from "@/lib/category-colors";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeZone: "Asia/Seoul",
});

// 원문 URL은 RSS에서 온 신뢰하지 않는 값이므로 http·https만 링크로 쓴다.
function isWebUrl(url: string) {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function ArticleCard({ article }: { article: ArticleListItem }) {
  const { titleKo, summaryKo, source, url, publishedAt, createdAt, notionSavedAt } =
    article;
  const color = categoryColor(article.categoryId, article.categoryColor);
  // RSS에 발행일이 없는 기사는 수집일을 대신 보여 준다.
  const date = publishedAt ?? createdAt;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-foreground/20">
      <span
        className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${color.soft}`}
        style={color.softStyle}
      >
        {article.categoryName ?? "미분류"}
      </span>

      {/* break-keep은 한글을 단어 단위로 줄바꿈하고, wrap-break-word는 긴 영어 단어(모델명 등)가 카드 밖으로 넘치지 않게 끊는다. */}
      <h2 className="line-clamp-2 text-base leading-snug font-semibold break-keep wrap-break-word">
        {titleKo}
      </h2>
      <p className="line-clamp-4 text-sm leading-relaxed break-keep wrap-break-word text-foreground/80">
        {summaryKo}
      </p>
      <p className="text-xs break-keep wrap-break-word text-muted">
        {source}
        {" · "}
        <time dateTime={date.toISOString()}>
          {publishedAt ? "" : "수집 "}
          {dateFormat.format(date)}
        </time>
      </p>

      <div className="mt-auto flex min-h-9 items-center justify-between border-t border-line pt-3">
        {isWebUrl(url) ? (
          // 모바일에서 누르기 쉽도록 글자 크기는 그대로 두고 누르는 영역만 h-9로 넓힌다.
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="-ml-1 inline-flex h-9 items-center rounded px-1 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            원문보기 ↗
            <span className="sr-only"> (새 탭에서 열림)</span>
          </a>
        ) : (
          <span />
        )}
        {/* '저장하기' 버튼은 노션 저장 API를 만들 때 이 자리에 넣는다. */}
        {notionSavedAt && (
          <span className="text-sm font-medium text-success">저장됨 ✓</span>
        )}
      </div>
    </article>
  );
}
