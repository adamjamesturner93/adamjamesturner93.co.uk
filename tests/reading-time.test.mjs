import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import matter from 'gray-matter';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readingMinutes } from '../lib/reading-time.mjs';

const words = (count) => Array(count).fill('word').join(' ');

test('reading time uses 225 words per minute, rounds up and has a one-minute minimum', () => {
  for (const extension of ['.md', '.mdx']) {
    for (const [count, minutes] of [
      [0, 1],
      [1, 1],
      [225, 1],
      [226, 2],
      [450, 2],
      [451, 3],
    ])
      assert.equal(readingMinutes(words(count), extension), minutes);
    assert.equal(readingMinutes('!? — …', extension), 1);
  }
});

test('formatting, link destinations, reference definitions and code syntax add no reading time', () => {
  for (const extension of ['.md', '.mdx']) {
    const body = `${words(220)}\n\n# A **useful** heading\n\n[Read this](https://example.com/${words(500).replaceAll(' ', '/')})\n\n[unused]: https://example.com/${words(500).replaceAll(' ', '/')}\n\n\`\`\`js\n${words(500)}\n\`\`\``;
    assert.equal(readingMinutes(body, extension), 1);
    assert.equal(readingMinutes(body + '\n\nAnother word.', extension), 2);
    assert.equal(readingMinutes(words(225) + ' `readable`', extension), 2);
  }
});

test('tables, headings and captions count; MDX metadata, comments, props and imports do not', () => {
  const body = `${words(221)}\n\n| Heading |\n| --- |\n| Text |\n\n<Figure src="/example.png" alt="${words(300)}" caption="A caption" />\n\n{/* ${words(500)} */}\n\nexport const metadata = { description: '${words(500)}' };\n\nimport Something from './${words(300)}';\n\n<div hidden>${words(500)}</div>\n\n<script>${words(500)}</script>`;
  assert.equal(readingMinutes(body), 1);
  assert.equal(readingMinutes(body + '\n\n<div>Visible prose</div>'), 2);
});

test('front matter never contributes to the article body estimate', () => {
  const { content } = matter(
    `---\ntitle: '${words(500)}'\ndescription: '${words(500)}'\ntags: [feedback]\n---\n${words(225)}`,
  );
  assert.equal(readingMinutes(content), 1);
});

test('article metadata renders an accessible estimate as plain text', () => {
  const source = fs.readFileSync('components/reading-time.tsx', 'utf8');
  const compiled = ts.transpileModule(
    source.replace(/import .* from .*;\n/, ''),
    {
      compilerOptions: {
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.CommonJS,
      },
    },
  ).outputText;
  const exports = {};
  new Function('exports', 'React', 'readingMinutes', compiled)(
    exports,
    { createElement },
    readingMinutes,
  );
  const html = renderToStaticMarkup(
    createElement(exports.default, { body: words(451), extension: '.mdx' }),
  );
  assert.match(html, /Estimated reading time:/);
  assert.match(html, /3 min read/);
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /<button|<a |tabindex|onclick/);
});
