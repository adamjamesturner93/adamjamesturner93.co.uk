import { remarkArticleNavigation } from '../lib/article-navigation.mjs';
import QuestionsWorthAsking from './questions-worth-asking';
import Link from 'next/link';
import { articles } from '../lib/content';
import { articleLinkHref } from '../lib/article-links.mjs';
import Markdown from 'react-markdown';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import type { ComponentProps } from 'react';
import ContentLink from './content-link';
import { remarkContentLinks } from '../lib/links.mjs';
function Table(props: ComponentProps<'table'>) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Scrollable table"
    >
      <table {...props} />
    </div>
  );
}
function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
export default async function ContentBody({
  body,
  extension,
  navigation = false,
}: {
  body: string;
  extension: string;
  navigation?: boolean;
}) {
  function ArticleLink({
    slug,
    children,
  }: {
    slug: string;
    children: React.ReactNode;
  }) {
    const href = articleLinkHref(slug, articles());
    return href ? <Link href={href}>{children}</Link> : <>{children}</>;
  }
  return (
    <div className="prose">
      {extension === '.mdx' ? (
        <MDXRemote
          source={body}
          components={{
            a: ContentLink,
            ContentLink,
            ArticleLink,
            QuestionsWorthAsking,
            table: Table,
            Figure,
          }}
          options={{
            blockJS: false,
            mdxOptions: {
              remarkPlugins: [
                remarkGfm,
                remarkContentLinks,
                ...(navigation ? [remarkArticleNavigation] : []),
              ],
            },
          }}
        />
      ) : (
        <Markdown
          remarkPlugins={[
            remarkGfm,
            ...(navigation ? [remarkArticleNavigation] : []),
          ]}
          components={{ a: ContentLink, table: Table }}
        >
          {body}
        </Markdown>
      )}
    </div>
  );
}
