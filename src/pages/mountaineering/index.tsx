import clsx from 'clsx';
import { globSync } from 'glob';
import matter from 'gray-matter';
import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Layout } from '../../templates/global';

function reformatDate(fullDate: string) {
  const date = new Date(fullDate);
  return date.toDateString().slice(4);
}

interface BlogProps {
  frontmatter: {
    title: string;
    tags: string[];
    date: string;
    hero_image: string;
    hero_image_alt: string;
    summary: string;
  };
  slug: string;
}

interface BlogListProps {
  blogList: BlogProps[];
}

const Home: NextPage<BlogListProps> = ({ blogList }) => {
  // const [isFilterPanelVisible, setIsFIlterPanelVisible] = useState(false);
  // const tags = Array.from(
  //   new Set([...blogList.flatMap(blog => blog.frontmatter.tags)])
  // );
  return (
    <>
      <Head>
        <title>All mountaineering posts | Adam Turner</title>
        <meta
          name="description"
          content="Adam Turners blog and logbook for his mountaineering and climbing experiences"
        />
      </Head>
      <Layout className="flex-col gap-3">
        <h1 className="font-bold text-xl">All posts</h1>
        {/*<div className="flex justify-between">
           <button
            onClick={() => setIsFIlterPanelVisible(true)}
            className="px-2 py-0.5 rounded-full bg-zinc-300 border border-zinc-700 hover:zinc-500"
          >
            Filter
          </button>
          <button className="px-2 py-0.5 rounded-full bg-zinc-200 border border-zinc-600 hover:bg-zinc-400 active:bg-zinc-500">
            Sort
          </button>
        </div> */}
        <div className="grid gap-3 md:grid-cols-2 mg:grid-cols-3">
          {blogList.map(blog => (
            <article key={blog.slug}>
              <figure>
                <Image
                  width="1920"
                  height="1080"
                  src={blog.frontmatter.hero_image}
                  alt={blog.frontmatter.hero_image_alt}
                />
              </figure>
              <h2 className="font-bold">{blog.frontmatter.title}</h2>
              <p className="text-zinc-600">{blog.frontmatter.summary}</p>
              <div className="flex justify-between font-semibold text-zinc-600 text-sm">
                <time>{reformatDate(blog.frontmatter.date)}</time>
                <Link
                  className="hover:underline focus:underline hover:font-bold focus:font-bold"
                  aria-label={`Read blog post ${blog.frontmatter.title}`}
                  href={`/mountaineering/${blog.slug}`}
                >
                  Read post...
                </Link>
              </div>
            </article>
          ))}
          {/* <aside
          aria-hidden={!isFilterPanelVisible}
          className={clsx('z-10 transition-all absolute inset-0', {
            'left-0 right-0': isFilterPanelVisible,
            '-left-full right-full': !isFilterPanelVisible
          })}
        >
          <div className="flex flex-col mr-12 py-4 px-8 items-center absolute inset-0 bg-zinc-500 text-white bg-opacity-95">
            <Link className="font-bold text-2xl" href="/">
              Adam Turner
            </Link>
            <button
              onClick={() => setIsFIlterPanelVisible(false)}
              className="px-2 py-1 mb-4 font-semibold"
            >
              <span aria-label="">↩</span> Close filters
            </button>
            <h2 className="font-bold text-xl mt-4">Filter posts</h2>
            <form className="flex flex-col gap-4">
              {tags.map(tag => (
                <span key={tag}>{tag}</span>
              ))}
            </form>
          </div>
        </aside> */}
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const blogs = globSync(`src/posts/mountaineering/*.md`);

  // converting the file names to their slugs
  const blogList = await Promise.all(
    blogs.map(async file => {
      const slug = file.split('/')[3].replace(/ /g, '-').slice(0, -3).trim();
      const content = await import(`src/posts/mountaineering/${slug}.md`);
      const { data } = matter(content.default);

      return {
        slug,
        frontmatter: data as BlogProps['frontmatter']
      };
    })
  );

  return {
    props: { blogList }
  };
};

export default Home;
