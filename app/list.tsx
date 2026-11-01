import Link from 'next/link';
import type { Article } from '../lib/content';
import { categories } from '../lib/content';
import Cover from '../components/cover';
import ContentDate, { isScheduled } from '../components/content-date';
export default function List({
  items,
  compact = false,
  eager = false,
}: {
  items: Article[];
  compact?: boolean;
  eager?: boolean;
}) {
  if (!items.length)
    return (
      <div className="empty-state">
        <span className="empty-mark" aria-hidden="true">
          ✳
        </span>
        <div>
          <h2>Good questions take a little time.</h2>
          <p>
            New articles are in progress. This is where they’ll land when
            they’re ready.
          </p>
        </div>
      </div>
    );
  return (
    <div className={compact ? 'compact-grid' : 'editorial-grid'}>
      {items.map((a, i) => (
        <article className="story" key={a.slug}>
          <Link
            href={'/blog/' + a.slug}
            className="story-image"
            aria-label={a.title}
            tabIndex={-1}
          >
            <Cover
              src={a.coverImage}
              alt={a.coverImageAlt}
              eager={eager && i === 0}
            />
            <span className="story-number" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
          </Link>
          <div className="story-copy">
            <div className="story-meta">
              <span className="category">{categories[a.category]}</span>
              {a.draft && <span className="badge">Draft</span>}
              {!a.draft && isScheduled(a.publishedAt) && (
                <span className="badge">Scheduled</span>
              )}
              {a.illustrative && !a.draft && (
                <span className="badge">Illustrative article</span>
              )}
            </div>
            <h2>
              <Link href={'/blog/' + a.slug}>
                {a.title}
                <span className="story-arrow" aria-hidden="true">
                  {' '}
                  ↗
                </span>
              </Link>
            </h2>
            <p>{a.description}</p>
            <ContentDate {...a} />
          </div>
        </article>
      ))}
    </div>
  );
}
