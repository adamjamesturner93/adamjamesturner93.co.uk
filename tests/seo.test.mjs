import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  analyseArticle,
  articleHtml,
  checkArticles,
} from '../scripts/seo/articles.mjs';
const source = (draft = false, title = 'A thoughtful engineering question') =>
  `---\ntitle: ${title}\nslug: example\ndescription: A practical explanation of engineering decisions and how teams can learn from their experiences.\ndraft: ${draft}\npublishedAt: '2026-01-01'\n---\n\n## Context\n\nA useful article with enough words to consider the practical consequences of engineering decisions.\n`;
test('static extraction includes reflection props, captions, links and excludes comments/code', () => {
  const html = articleHtml(
    '<QuestionsWorthAsking intro="Consider this" questions={["One?", "Two?", "Three?"]} />\n\n<Figure src="/image.svg" alt="Diagram" caption="Visible caption" />\n\n<ArticleLink slug="draft">Hidden destination</ArticleLink>\n\n{/* secret */}\n\n```js\nprivate code\n```',
    '.mdx',
  );
  assert.match(html, /One\?.*Two\?.*Three\?/);
  assert.match(html, /Visible caption/);
  assert.doesNotMatch(html, /secret|private code|href=/);
  assert.throws(
    () => articleHtml('{process.exit()}', '.mdx'),
    /does not execute/,
  );
  assert.throws(() => articleHtml('<Unknown />', '.mdx'), /Unsupported/);
});
test('drafts skip and non-drafts receive Power SEO reports without score gating', () => {
  assert.equal(analyseArticle(source(true), 'content/blog/example.mdx'), null);
  const r = analyseArticle(source(), 'content/blog/example.mdx');
  assert.ok(r.words > 0);
  assert.ok(Number.isFinite(r.readability.fleschReadingEase));
  assert.equal(r.focusKeyphrase, null);
  assert.throws(
    () =>
      analyseArticle(
        source().replace('title: A thoughtful engineering question', 'title:'),
        'example.mdx',
      ),
    /Missing title/,
  );
});
test('staged checks use index blobs and handle partial staging, drafts, deletion and spaces', (t) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-index-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd, stdio: 'pipe' });
  git('init');
  fs.mkdirSync(path.join(cwd, 'content/blog'), { recursive: true });
  const file = path.join(cwd, 'content/blog/article with spaces.mdx');
  fs.writeFileSync(file, source());
  git('add', '.');
  fs.writeFileSync(file, source(true));
  assert.equal(checkArticles({ cwd }).reports.length, 1);
  git('add', '.');
  fs.writeFileSync(file, source());
  assert.equal(checkArticles({ cwd }).skipped, 1);
  git('rm', '--cached', '-f', 'content/blog/article with spaces.mdx');
  assert.equal(checkArticles({ cwd }).reports.length, 0);
});
