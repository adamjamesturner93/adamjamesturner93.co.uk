import ContentLink from '../../../components/content-link';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { speaking } from '../../../lib/content';
import Cover from '../../../components/cover';
import ContentBody from '../../../components/content-body';
import ContentDate, {
  displayDate,
  isScheduled,
} from '../../../components/content-date';
export function generateStaticParams() {
  return speaking().map((e) => ({ slug: e.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = speaking().find((e) => e.slug === slug);
  if (!e) notFound();
  return {
    title: e.title,
    description: e.description,
    alternates: { canonical: '/speaking/' + slug },
    ...(e.draft || isScheduled(e.publishedAt)
      ? { robots: { index: false, follow: false } }
      : { openGraph: { images: [`/speaking/${slug}/opengraph-image`] } }),
  };
}
export default async function Talk({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = speaking().find((e) => e.slug === slug);
  if (!e) notFound();
  return (
    <article>
      <header className="article-header shell">
        <Link className="back-link" href="/speaking">
          ← Speaking
        </Link>
        <div className="story-meta">
          <span className="category">{e.format}</span>
          <span className="badge">
            {e.draft ? 'Draft · ' : ''}
            {e.status}
          </span>
        </div>
        <h1>{e.title}</h1>
        <p className="article-standfirst">{e.description}</p>
        <ContentDate {...e} />
      </header>
      <div className="article-art shell">
        <Cover src={e.coverImage} alt={e.coverImageAlt} eager />
      </div>
      <div className="reading-shell">
        {e.draft && (
          <aside className="draft-notice">
            <strong>Draft talk — {e.status}.</strong>
            <p>
              A proposal or submission is not an accepted speaking engagement.
            </p>
          </aside>
        )}
        <dl className="event-details">
          <div>
            <dt>Event</dt>
            <dd>{e.eventName}</dd>
          </div>
          {e.eventDate && (
            <div>
              <dt>When</dt>
              <dd>
                <time dateTime={e.eventDate}>{displayDate(e.eventDate)}</time>
              </dd>
            </div>
          )}
          {e.location && (
            <div>
              <dt>Where</dt>
              <dd>{e.location}</dd>
            </div>
          )}
          <div>
            <dt>Format</dt>
            <dd>{e.format}</dd>
          </div>
        </dl>
        <ContentBody body={e.body} extension={e.extension} />
        {(e.eventUrl || e.slidesUrl || e.videoUrl) && (
          <nav className="resource-links" aria-label="Talk resources">
            {e.eventUrl && (
              <ContentLink href={e.eventUrl}>Event website ↗</ContentLink>
            )}
            {e.slidesUrl && (
              <ContentLink href={e.slidesUrl}>Slides ↗</ContentLink>
            )}
            {e.videoUrl && (
              <ContentLink href={e.videoUrl}>Recording ↗</ContentLink>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
