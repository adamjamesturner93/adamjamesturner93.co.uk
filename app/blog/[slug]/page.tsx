import ArticleAuthor from '../../../components/article-author';
import TopicChips from '../../../components/topic-chips';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { articles, categories, relatedEntries } from '../../../lib/content';
import { site } from '../../../lib/site.mjs';
import List from '../../list';
import ArticleSharing from '../../../components/article-sharing';
import Cover from '../../../components/cover';
import ContentBody from '../../../components/content-body';
import ContentDate, { isScheduled } from '../../../components/content-date';
import ReadingTime from '../../../components/reading-time';
export function generateStaticParams() {
  return articles().map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles().find((a) => a.slug === slug);
  if (!a) notFound();
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: '/blog/' + slug },
    ...(a.draft || isScheduled(a.publishedAt)
      ? { robots: { index: false, follow: false } }
      : {}),
    ...{
      openGraph: {
        type: 'article',
        title: a.title,
        description: a.description,
        siteName: site.name,
        locale: 'en_GB',
        authors: [site.origin + '/about'],
        section: categories[a.category],
        url: site.origin + '/blog/' + slug,
        publishedTime: a.publishedAt,
        modifiedTime: a.updatedAt,
        images: [
          {
            url: `/blog/${slug}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: a.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: a.title,
        description: a.description,
        images: [{ url: `/blog/${slug}/opengraph-image`, alt: a.title }],
      },
    },
  };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = articles();
  const a = all.find((a) => a.slug === slug);
  if (!a) notFound();
  const related = relatedEntries(a, all);
  return (
    <>
      <article>
        <header className="article-header shell">
          <Link className="back-link" href="/blog">
            ← Back to the blog
          </Link>
          <div className="story-meta">
            <span className="category">{categories[a.category]}</span>
            {(a.draft || a.illustrative) && (
              <span className="badge">
                {a.draft ? 'Illustrative draft' : 'Illustrative article'}
              </span>
            )}
          </div>
          <h1>{a.title}</h1>
          <p className="article-standfirst">{a.description}</p>
          <div className="article-byline">
            <span>By Adam Turner</span>
            <ContentDate {...a} />
            <ReadingTime body={a.body} extension={a.extension} />
            {!a.draft && !isScheduled(a.publishedAt) && (
              <a className="article-share-jump" href="#share-heading">
                Share article ↓
              </a>
            )}
          </div>
        </header>
        <div className="article-art shell">
          <Cover src={a.coverImage} alt={a.coverImageAlt} eager />
        </div>
        <div className="reading-shell">
          {(a.draft || a.illustrative) && (
            <aside className="draft-notice">
              <strong>
                {a.draft
                  ? 'Illustrative draft — a starting point, not a finished position.'
                  : 'Illustrative article — for the author to develop and personalise.'}
              </strong>
              <p>
                This article is for author review and substantial
                personalisation. It does not describe specific workplace
                experiences.
              </p>
            </aside>
          )}
          <ContentBody body={a.body} extension={a.extension} />
          {!a.draft && !isScheduled(a.publishedAt) && (
            <>
              <ArticleAuthor slug={a.slug} />
              <ArticleSharing slug={a.slug} title={a.title} />
            </>
          )}
        </div>
      </article>
      {!a.draft && !isScheduled(a.publishedAt) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: a.title,
              description: a.description,
              datePublished: a.publishedAt,
              ...(a.updatedAt ? { dateModified: a.updatedAt } : {}),
              author: {
                '@type': 'Person',
                name: site.name,
                url: site.origin + '/about',
                sameAs: [site.linkedin],
              },
              url: site.origin + '/blog/' + slug,
              image: site.origin + '/blog/' + slug + '/opengraph-image',
              mainEntityOfPage: site.origin + '/blog/' + slug,
              inLanguage: 'en-GB',
              articleSection: categories[a.category],
            }).replaceAll('<', '\u003c'),
          }}
        />
      )}
      {a.tags.length > 0 && (
        <section
          className="reading-shell article-topics"
          aria-labelledby="topics-heading"
        >
          <h2 id="topics-heading" className="eyebrow">
            Explore more topics
          </h2>
          <TopicChips tags={a.tags} />
        </section>
      )}
      {related.length > 0 && (
        <section className="shell related-section">
          <div className="section-heading">
            <h2>Related articles</h2>
          </div>
          <List items={related} compact />
        </section>
      )}
    </>
  );
}
