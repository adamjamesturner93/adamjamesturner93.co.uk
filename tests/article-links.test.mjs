import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { articleLinkSlugs, articleLinkHref } from '../lib/article-links.mjs';
import {
  loadCollection,
  visibleEntries,
  relatedEntries,
} from '../lib/content/core.mjs';
import { readingMinutes } from '../lib/reading-time.mjs';

test('contextual links require literal slugs and ignore code samples', () => {
  assert.deepEqual(
    articleLinkSlugs('<ArticleLink slug="feedback">Read this</ArticleLink>'),
    ['feedback'],
  );
  assert.deepEqual(
    articleLinkSlugs('`<ArticleLink slug="missing">Example</ArticleLink>`'),
    [],
  );
  for (const attributes of [
    'slug={target}',
    'slug="Bad"',
    '',
    'slug="valid" {...props}',
  ])
    assert.throws(
      () => articleLinkSlugs(`<ArticleLink ${attributes}>Text</ArticleLink>`),
      /literal/,
    );
  assert.equal(
    readingMinutes(
      '<ArticleLink slug="feedback">' + 'word '.repeat(226) + '</ArticleLink>',
      '.mdx',
    ),
    2,
  );
});

test('publication policy controls contextual links and related recommendations together', () => {
  const entries = loadCollection();
  const annual = entries.find(
    (e) => e.slug === 'making-annual-reviews-valuable',
  );
  const draft = entries.find(
    (e) => e.slug === 'feedback-isnt-a-gift-its-a-dance',
  );
  const options = { env: { VERCEL_ENV: 'production' }, today: '2026-11-04' };
  assert.equal(draft.draft, true);
  const visible = visibleEntries(entries, options);
  assert.equal(articleLinkHref(draft.slug, visible), null);
  assert.ok(
    !relatedEntries(annual, visible).some((e) => e.slug === draft.slug),
  );
  const published = { ...draft, draft: false, publishedAt: '2026-11-04' };
  const both = visibleEntries([annual, published], options);
  assert.equal(articleLinkHref(draft.slug, both), '/blog/' + draft.slug);
  assert.equal(relatedEntries(annual, both)[0].slug, draft.slug);
  assert.equal(relatedEntries(published, both)[0].slug, annual.slug);
  assert.equal(
    articleLinkHref(
      draft.slug,
      visibleEntries(
        [annual, { ...published, publishedAt: '2026-11-05' }],
        options,
      ),
    ),
    null,
  );
  assert.equal(
    articleLinkHref(
      draft.slug,
      visibleEntries(entries, {
        env: { VERCEL_ENV: 'preview', ENABLE_DRAFTS: 'true' },
      }),
    ),
    '/blog/' + draft.slug,
  );
});

test('content loading rejects unknown contextual destinations', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'article-link-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync('content', path.join(root, 'content'), { recursive: true });
  fs.cpSync('public/images', path.join(root, 'public/images'), {
    recursive: true,
  });
  fs.appendFileSync(
    path.join(root, 'content/blog/making-annual-reviews-valuable.mdx'),
    '\n<ArticleLink slug="does-not-exist">Missing</ArticleLink>',
  );
  assert.throws(
    () => loadCollection('blog', root),
    /unknown slug does-not-exist/,
  );
});
