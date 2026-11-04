import Link from 'next/link';
import ContentLink from './content-link';
import { site } from '../lib/site.mjs';
export default function ArticleAuthor({ slug }: { slug: string }) {
  return (
    <aside className="article-author" aria-label="About the author">
      <p>
        I’m Adam, a software engineering leader in financial services. I write
        about technology, people and change.
      </p>
      <p>
        <Link href="/about">More about me →</Link>
      </p>
      <p>
        Have a different experience?{' '}
        <ContentLink
          href={site.linkedin}
          data-analytics-event="linkedin_connect_click"
          data-placement="article_author"
          data-article-slug={slug}
        >
          Connect with me on LinkedIn ↗
        </ContentLink>
      </p>
      <p className="meta">
        Follow me on LinkedIn for future articles, or{' '}
        <a
          href="/rss.xml"
          data-analytics-event="rss_click"
          data-placement="article_author"
          data-article-slug={slug}
        >
          subscribe via RSS
        </a>
        .
      </p>
    </aside>
  );
}
