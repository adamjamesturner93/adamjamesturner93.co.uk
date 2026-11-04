import { articleShareLinks } from '../lib/sharing.mjs';
import ShareActions from './share-actions';
export default function ArticleSharing({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const links = articleShareLinks(slug, title);
  return (
    <section className="article-sharing" aria-labelledby="share-heading">
      <p className="eyebrow">Keep the conversation going</p>
      <h2 id="share-heading">Know someone who’d find this interesting?</h2>
      <div className="share-controls">
        <a
          className="share-control"
          href={links.linkedin}
          data-analytics-event="article_share_click"
          data-method="linkedin"
          data-article-slug={slug}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn (opens in a new tab)"
        >
          LinkedIn <span aria-hidden="true">↗</span>
        </a>
        <a
          className="share-control"
          href={links.whatsapp}
          data-analytics-event="article_share_click"
          data-method="whatsapp"
          data-article-slug={slug}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp (opens in a new tab)"
        >
          WhatsApp <span aria-hidden="true">↗</span>
        </a>
        <a
          className="share-control"
          href={links.x}
          data-analytics-event="article_share_click"
          data-method="x"
          data-article-slug={slug}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X (opens in a new tab)"
        >
          X <span aria-hidden="true">↗</span>
        </a>
        <a
          className="share-control"
          href={links.email}
          data-analytics-event="article_share_click"
          data-method="email"
          data-article-slug={slug}
        >
          Email
        </a>
        <ShareActions url={links.url} title={title} slug={slug} />
      </div>
    </section>
  );
}
