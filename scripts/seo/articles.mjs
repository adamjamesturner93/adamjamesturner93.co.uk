import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import {
  validateTitle,
  validateMetaDescription,
  getTextStatistics,
} from '@power-seo/core';
import { analyzeContent } from '@power-seo/content-analysis';
import { analyzeReadability } from '@power-seo/readability';
import { site } from '../../lib/site.mjs';
const articlePath = /^content\/(?:blog\/)?[^/]+\.mdx?$/;
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const parser = unified().use(remarkParse).use(remarkGfm);
const mdxParser = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
// Extract static prose without evaluating code from the Git index.
export function articleHtml(body, extension, visibleSlugs = new Set()) {
  const tree = (extension === '.mdx' ? mdxParser : parser).parse(body);
  const definitions = new Map();
  function collect(n) {
    if (n.type === 'definition') definitions.set(n.identifier, n.url);
    for (const c of n.children || []) collect(c);
  }
  collect(tree);
  function literal(attribute) {
    if (typeof attribute?.value === 'string') return attribute.value;
    const expression = attribute?.value?.data?.estree?.body?.[0]?.expression;
    if (expression?.type === 'Literal') return expression.value;
    if (
      expression?.type === 'ArrayExpression' &&
      expression.elements.every(
        (e) => e?.type === 'Literal' && typeof e.value === 'string',
      )
    )
      return expression.elements.map((e) => e.value);
    throw Error(
      'SEO analysis requires static literal MDX component properties',
    );
  }
  function render(n) {
    const children = () => (n.children || []).map(render).join('');
    const tag = (name, content = children()) => `<${name}>${content}</${name}>`;
    if (n.type === 'text') return escape(n.value);
    if (n.type === 'root') return children();
    if (n.type === 'paragraph') return tag('p');
    if (n.type === 'heading') return tag('h' + n.depth);
    if (n.type === 'list') return tag(n.ordered ? 'ol' : 'ul');
    if (n.type === 'listItem') return tag('li');
    if (n.type === 'blockquote') return tag('blockquote');
    if (n.type === 'strong' || n.type === 'emphasis')
      return tag(n.type === 'strong' ? 'strong' : 'em');
    if (n.type === 'inlineCode') return tag('code', escape(n.value));
    if (
      n.type === 'code' ||
      n.type === 'definition' ||
      n.type === 'thematicBreak'
    )
      return '';
    if (n.type === 'break') return '<br />';
    if (n.type === 'link' || n.type === 'linkReference')
      return `<a href="${escape(n.url || definitions.get(n.identifier) || '')}">${children()}</a>`;
    if (n.type === 'image' || n.type === 'imageReference')
      return `<img src="${escape(n.url || definitions.get(n.identifier) || '')}" alt="${escape(n.alt || '')}" />`;
    if (n.type === 'table') return tag('table');
    if (n.type === 'tableRow') return tag('tr');
    if (n.type === 'tableCell') return tag('td');
    if (n.type === 'delete') return tag('del');
    if (n.type === 'mdxFlowExpression' || n.type === 'mdxTextExpression') {
      if (!n.data?.estree?.body?.length) return ''; // MDX comments
      throw Error('SEO analysis does not execute MDX expressions');
    }
    if (n.type?.startsWith('mdxJsx')) {
      if (n.attributes.some((a) => a.type === 'mdxJsxExpressionAttribute'))
        throw Error('SEO analysis does not support spread properties');
      const attrs = Object.fromEntries(
        n.attributes.map((a) => [a.name, a.value === null ? true : literal(a)]),
      );
      if (n.name === 'QuestionsWorthAsking') {
        if (
          !Array.isArray(attrs.questions) ||
          attrs.questions.length !== 3 ||
          attrs.questions.some((q) => !q.trim())
        )
          throw Error('Expected three reflection questions');
        return (
          '<section><h2>Questions worth asking</h2>' +
          (attrs.intro ? `<p>${escape(attrs.intro)}</p>` : '') +
          '<ol>' +
          attrs.questions.map((q) => `<li>${escape(q)}</li>`).join('') +
          '</ol></section>'
        );
      }
      if (n.name === 'ArticleLink')
        return visibleSlugs.has(attrs.slug)
          ? `<a href="/blog/${escape(attrs.slug)}">${children()}</a>`
          : children();
      if (n.name === 'Figure')
        return `<figure><img src="${escape(attrs.src)}" alt="${escape(attrs.alt || '')}" />${attrs.caption ? `<figcaption>${escape(attrs.caption)}</figcaption>` : ''}</figure>`;
      if (n.name === 'a' || n.name === 'ContentLink')
        return `<a href="${escape(attrs.href || '')}">${children()}</a>`;
      throw Error(
        `Unsupported MDX component ${n.name}; add a static SEO adapter`,
      );
    }
    throw Error(
      `Unsupported article syntax ${n.type}; add a static SEO adapter`,
    );
  }
  return render(tree);
}
const usefulChecks = new Set([
  'heading-structure',
  'single-h1',
  'word-count',
  'internal-links',
  'external-links',
  'paragraph-length',
  'sentence-length',
  'subheading-distribution',
  'canonical-url',
  'url-length',
  'text-presence',
  'keyphrase-density',
  'title-keyphrase',
  'meta-description-keyphrase',
  'heading-keyphrase',
  'keyphrase-introduction',
  'keyphrase-slug',
]);
export function analyseArticle(source, filename, visibleSlugs) {
  const { data, content } = matter(source);
  if (data.draft === true) return null;
  if (data.draft !== false)
    throw Error('draft must explicitly be true or false');
  for (const name of ['title', 'description', 'slug'])
    if (typeof data[name] !== 'string' || !data[name].trim())
      throw Error(`Missing ${name}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug))
    throw Error('Invalid slug');
  if (
    data.focusKeyphrase !== undefined &&
    (typeof data.focusKeyphrase !== 'string' || !data.focusKeyphrase.trim())
  )
    throw Error('focusKeyphrase must be a non-empty string when supplied');
  const body = articleHtml(content, path.extname(filename), visibleSlugs);
  const statistics = getTextStatistics(body);
  if (!statistics.wordCount) throw Error('Article has no readable body');
  // Power SEO treats title as the page H1. Include the shared author link,
  // but keep boilerplate out of readability and word-count calculations.
  const html = body + '<a href="/about">More about me</a>';
  const analysis = analyzeContent({
    title: data.title,
    metaDescription: data.description,
    content: html,
    slug: data.slug,
    focusKeyphrase: data.focusKeyphrase,
    canonicalUrl: site.origin + '/blog/' + data.slug,
    siteUrl: site.origin,
  });
  const results = analysis.results.filter(
    (r) => usefulChecks.has(r.id) && r.status !== 'na',
  );
  return {
    filename,
    title: data.title,
    focusKeyphrase: data.focusKeyphrase || null,
    words: statistics.wordCount,
    titleValidation: validateTitle(data.title + ' | ' + site.name),
    descriptionValidation: validateMetaDescription(data.description),
    results,
    readability: analyzeReadability({ content: body }),
    errors: /<h1[ >]/i.test(body)
      ? ['Article body must not introduce another h1']
      : [],
  };
}
export function checkArticles({ cwd = process.cwd(), staged = true } = {}) {
  const git = (args) =>
    execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  const paths = git(
    staged
      ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']
      : ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  )
    .split('\0')
    .filter((p) => articlePath.test(p));
  if (!paths.length) return { reports: [], errors: [], skipped: 0 };
  const all = git(
    staged
      ? ['ls-files', '-z']
      : ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  )
    .split('\0')
    .filter((p) => articlePath.test(p));
  const read = (p) =>
    staged
      ? git(['show', ':' + p])
      : fs.readFileSync(path.join(cwd, p), 'utf8');
  const visible = new Set();
  for (const p of all) {
    const { data } = matter(read(p));
    if (
      data.draft === false &&
      data.publishedAt <= new Date().toISOString().slice(0, 10)
    )
      visible.add(data.slug);
  }
  const reports = [];
  const errors = [];
  let skipped = 0;
  for (const p of paths) {
    try {
      const report = analyseArticle(read(p), p, visible);
      if (report) {
        reports.push(report);
        errors.push(...report.errors.map((e) => `${p}: ${e}`));
      } else skipped++;
    } catch (error) {
      errors.push(`${p}: ${error.message}`);
    }
  }
  return { reports, errors, skipped };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const flags = process.argv.slice(2);
    if (flags.some((f) => !['--all', '--json', '--strict'].includes(f)))
      throw Error('Use --all, --json or --strict');
    const result = checkArticles({ staged: !flags.includes('--all') });
    if (flags.includes('--json')) console.log(JSON.stringify(result, null, 2));
    else {
      for (const r of result.reports) {
        console.log(
          `\n${r.filename}\n  ${r.words} words | Flesch reading ease ${r.readability.fleschReadingEase.toFixed(1)}`,
        );
        if (!r.focusKeyphrase)
          console.log(
            '  No focusKeyphrase supplied; keyword targeting is optional.',
          );
        for (const v of [r.titleValidation, r.descriptionValidation])
          if (!v.valid) console.log('  Suggestion: ' + v.message);
        for (const check of [...r.results, ...r.readability.results])
          if (['poor', 'ok'].includes(check.status))
            console.log(`  ${check.id}: ${check.description}`);
      }
      for (const error of result.errors) console.error('ERROR: ' + error);
      console.log(
        `\nSEO checked ${result.reports.length} non-draft article(s); skipped ${result.skipped} draft(s). Suggestions are editorial heuristics, not Google ranking scores.`,
      );
    }
    process.exitCode = result.errors.length ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
