import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createElement, Fragment } from 'react';
import { renderToReadableStream, renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { isExternalLink, remarkContentLinks } from '../lib/links.mjs';
import { articleLinkHref } from '../lib/article-links.mjs';
import { site } from '../lib/site.mjs';

function component(file, imports) {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  new Function('exports', 'require', 'React', compiled)(
    exports,
    (name) => {
      assert.ok(name in imports, `Unexpected dependency: ${name}`);
      return { __esModule: true, ...imports[name] };
    },
    { createElement, Fragment },
  );
  return exports.default;
}

const ContentLink = component('components/content-link.tsx', {
  '../lib/links.mjs': { isExternalLink },
});
const ContentBody = component('components/content-body.tsx', {
  'next/link': {
    default: ({ children, ...props }) => createElement('a', props, children),
  },
  '../lib/content': { articles: () => [{ slug: 'visible' }] },
  '../lib/article-links.mjs': { articleLinkHref },
  'react-markdown': { default: Markdown },
  'next-mdx-remote/rsc': { MDXRemote },
  'remark-gfm': { default: remarkGfm },
  './content-link': { default: ContentLink },
  '../lib/links.mjs': { remarkContentLinks },
});

test('only external HTTP(S) destinations use a new tab', () => {
  for (const href of [
    'https://example.com',
    'http://example.com',
    '//example.com',
  ])
    assert.equal(isExternalLink(href), true, href);
  for (const href of [
    undefined,
    '',
    '/blog',
    '#references',
    '../about',
    site.origin + '/blog',
    'mailto:hello@example.com',
    'tel:0123456789',
    'https://[invalid',
  ])
    assert.equal(isExternalLink(href), false, String(href));
});

test('external links enforce a safe new tab and omit renderer metadata', () => {
  const html = renderToStaticMarkup(
    createElement(
      ContentLink,
      {
        href: 'https://example.com',
        target: '_self',
        node: { type: 'element' },
      },
      'Research',
    ),
  );
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /node=/);
});

for (const extension of ['.md', '.mdx']) {
  test(`${extension} prose and references share the external-link behaviour`, async () => {
    const body =
      '[Research][source]\n\n[Internal](/blog) and [Section](#section) and [Email](mailto:hello@example.com)\n\n[source]: https://example.com/research';
    const stream = await renderToReadableStream(
      await ContentBody({ body, extension }),
    );
    await stream.allReady;
    const html = await new Response(stream).text();
    assert.match(
      html,
      /href="https:\/\/example.com\/research"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/,
    );
    for (const href of ['/blog', '#section', 'mailto:hello@example.com']) {
      const anchor = html.match(new RegExp(`<a[^>]*href="${href}"[^>]*>`))[0];
      assert.doesNotMatch(anchor, /target="_blank"/);
    }
    assert.doesNotMatch(html, /node=/);
  });
}

test('explicit MDX JSX anchors also obey the shared link behaviour', async () => {
  const body =
    '<a href="https://example.com" target="_self">Research</a> and <a href="/blog">Internal</a>';
  const stream = await renderToReadableStream(
    await ContentBody({ body, extension: '.mdx' }),
  );
  await stream.allReady;
  const html = await new Response(stream).text();
  assert.match(
    html,
    /target="_blank"[^>]*href="https:\/\/example.com"[^>]*rel="noopener noreferrer"/,
  );
  assert.match(html, /<a href="\/blog">Internal<\/a>/);
});

test('MDX contextual links render visible destinations and preserve hidden target prose', async () => {
  const stream = await renderToReadableStream(
    await ContentBody({
      body: '<ArticleLink slug="visible">Published prose</ArticleLink> and <ArticleLink slug="draft">Draft prose</ArticleLink>',
      extension: '.mdx',
    }),
  );
  await stream.allReady;
  const html = await new Response(stream).text();
  assert.match(html, /href="\/blog\/visible">Published prose<\/a>/);
  assert.match(html, /Draft prose/);
  assert.doesNotMatch(html, /\/blog\/draft/);
});
