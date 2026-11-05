import { pageMetadata } from '../../lib/page-metadata';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { speaking } from '../../lib/content';
import { policy } from '../../lib/site.mjs';
import Cover from '../../components/cover';
import { displayDate } from '../../components/content-date';
export const metadata = pageMetadata(
  'Speaking',
  'Talks, discussions and ideas shared with engineering communities.',
  '/speaking',
);
export default function Speaking() {
  const entries = speaking();
  if (!entries.length && !policy().drafts) notFound();
  return (
    <div className="shell section-space">
      <section className="page-intro">
        <p className="eyebrow">Speaking</p>
        <h1>
          Ideas are better
          <br />
          in <span className="text-blue">conversation.</span>
        </h1>
        <p className="intro">
          Talks, discussions and questions to explore together.
        </p>
      </section>
      {entries.length ? (
        <div className="compact-grid">
          {entries.map((e) => (
            <article className="story" key={e.slug}>
              <Cover src={e.coverImage} alt={e.coverImageAlt} />
              <div className="story-copy">
                <div className="story-meta">
                  <span className="category">{e.format}</span>
                  <span className="badge">
                    {e.draft ? 'Draft · ' : ''}
                    {e.status}
                  </span>
                </div>
                <h2>
                  <Link href={'/speaking/' + e.slug}>{e.title} ↗</Link>
                </h2>
                <p>{e.description}</p>
                <p className="meta">
                  {e.eventName}
                  {e.eventDate && (
                    <>
                      {' '}
                      ·{' '}
                      <time dateTime={e.eventDate}>
                        {displayDate(e.eventDate)}
                      </time>
                    </>
                  )}
                  {e.location && <> · {e.location}</>}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true" className="empty-mark">
            ↗
          </span>
          <div>
            <h2>A space for future conversations.</h2>
            <p>
              No speaking entries yet. This page is visible only in draft
              preview; it is hidden publicly until a genuine engagement is
              published.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
