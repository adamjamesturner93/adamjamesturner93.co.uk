import Markdown from 'react-markdown';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import type { ComponentProps } from 'react';
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
}: {
  body: string;
  extension: string;
}) {
  return (
    <div className="prose">
      {extension === '.mdx' ? (
        <MDXRemote
          source={body}
          components={{ table: Table, Figure }}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      ) : (
        <Markdown remarkPlugins={[remarkGfm]} components={{ table: Table }}>
          {body}
        </Markdown>
      )}
    </div>
  );
}
