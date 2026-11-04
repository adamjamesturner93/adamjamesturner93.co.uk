import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
const parser = unified().use(remarkParse).use(remarkMdx);
export function articleLinkSlugs(body) {
  const slugs = [];
  function visit(node) {
    if (node.type?.startsWith('mdxJsx') && node.name === 'ArticleLink') {
      const attrs = node.attributes || [];
      const slug = attrs.find((a) => a.name === 'slug')?.value;
      if (
        attrs.length !== 1 ||
        typeof slug !== 'string' ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
      )
        throw Error(
          'ArticleLink requires one literal lowercase kebab-case slug',
        );
      slugs.push(slug);
    }
    for (const child of node.children || []) visit(child);
  }
  visit(parser.parse(body));
  return slugs;
}
export function articleLinkHref(slug, visible) {
  return visible.some((entry) => entry.slug === slug) ? '/blog/' + slug : null;
}
