import Image from 'next/image';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import { globSync } from 'glob';
import { Layout } from '../../templates/global';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import Link, { LinkProps } from 'next/link';
import Head from 'next/head';
import remarkGfm from 'remark-gfm';

function reformatDate(fullDate: string) {
  const date = new Date(fullDate);
  return date.toDateString().slice(4);
}

interface Params extends ParsedUrlQuery {
  slug: string;
}

interface BlogProps {
  frontmatter: {
    title: string;
    author: string;
    date: string;
    hero_image: string;
    hero_image_alt: string;
    summary: string;
  };
  markdownBody: string;
}

export default function BlogTemplate({ frontmatter, markdownBody }: BlogProps) {
  return (
    <>
      <Head>
        <title>{frontmatter.title} | Adam Turner</title>
        <meta name="description" content={frontmatter.summary} />
      </Head>
      <Layout className="flex-col gap-2">
        <Link
          className="text-sm text-zinc-600 hover:underline focus:underline hover:font-bold focus:font-bold"
          href="/mountaineering"
        >
          Back to all posts...
        </Link>

        <figure className="w-screen -ml-8 lg:-mx-24 xl:-mx-36 relative h-80 sm:h-96 md:h-[36rem] lg:h-[42rem] xl:h-[52rem] max-h-[80vh]">
          <Image
            fill
            src={frontmatter.hero_image}
            alt={frontmatter.hero_image_alt}
            className="object-scale-down"
          />
        </figure>
        <h1 className="text-2xl font-bold">{frontmatter.title}</h1>

        <time>{reformatDate(frontmatter.date)}</time>

        <ReactMarkdown
          className="pb-8 flex flex-col gap-2"
          remarkPlugins={[remarkGfm]}
          components={{
            h2: props => <h2 className="text-lg font-bold" {...props} />,
            a: props => (
              <Link
                target="_blank"
                className="underline"
                {...(props as LinkProps)}
              />
            ),
            // p: paragraph => {
            //   const { node } = paragraph;

            //   if (node.children.every(tag => tag?.tagName === 'img')) {
            //     const image = node.children[0];
            //     const metastring = image.properties.alt;

            //     const alt = metastring?.replace(/ *\{[^)]*\} */g, '');
            //     const width = '768';
            //     const height = '432';
            //     const isPriority = metastring
            //       ?.toLowerCase()
            //       .match('{priority}');

            //     const hasCaption = metastring
            //       ?.toLowerCase()
            //       .includes('{caption:');
            //     const caption = metastring?.match(/{caption: (.*?)}/)?.pop();

            //     return (
            //       <figure>
            //         <Image
            //           src={image.properties.src}
            //           width={width}
            //           height={height}
            //           className="postImg"
            //           alt={alt}
            //           priority={isPriority}
            //         />
            //         {hasCaption ? (
            //           <figcaption className="caption" aria-label={caption}>
            //             {caption}
            //           </figcaption>
            //         ) : null}
            //       </figure>
            //     );
            //   }
            //   return <p>{paragraph.children}</p>;
            // },
            table: props => {
              return (
                <div className="overflow-x-scroll">
                  <table className="flex text-left" {...props} />
                </div>
              );
            },
            tr: props => <tr className="flex flex-col" {...props} />
          }}
        >
          {markdownBody}
        </ReactMarkdown>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<
  BlogProps,
  Params
> = async context => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { slug } = context.params!;
  const content = await import(`src/posts/mountaineering/${slug}.md`);

  const data = matter(content.default);

  return {
    props: {
      frontmatter: data.data as BlogProps['frontmatter'],
      markdownBody: data.content
    }
  };
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const blogs = globSync(`src/posts/mountaineering/*.md`);

  // converting the file names to their slugs
  const blogSlugs = blogs.map(file =>
    file.split('/')[3].replace(/ /g, '-').slice(0, -3).trim()
  );

  // creating a path for each of the `slug` parameter
  const paths = blogSlugs.map(slug => {
    return { params: { slug } };
  });

  return {
    paths,
    fallback: false
  };
};
