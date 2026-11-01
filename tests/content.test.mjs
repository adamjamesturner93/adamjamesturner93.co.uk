import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import {
  validateEntry,
  isoDate,
  loadCollection,
  visibleEntries,
  relatedEntries,
} from '../lib/content/core.mjs';
export function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'adam-content-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'public/images/blog'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'public/images/blog/cover.svg'),
    '<svg xmlns="http://www.w3.org/2000/svg"/>',
  );
  return root;
}
const base = {
  title: 'A real question',
  slug: 'a-real-question',
  description: 'A useful description.',
  date: '2026-10-31',
  category: 'general',
  draft: true,
  coverImage: '/images/blog/cover.svg',
};
const talk = {
  ...base,
  eventName: 'An engineering meetup',
  format: 'meetup',
  status: 'confirmed',
  eventDate: '2026-11-10',
};
const check = (
  root,
  data = base,
  collection = 'blog',
  body = 'A complete article.',
) =>
  validateEntry(data, { root, collection, filename: data.slug + '.mdx', body });
test('valid drafts and published blog metadata', (t) => {
  const root = fixture(t);
  assert.doesNotThrow(() => check(root));
  assert.doesNotThrow(() =>
    check(root, { ...base, draft: false, publishedAt: '2026-10-31' }),
  );
});
test('required fields, category, boolean and slug constraints', (t) => {
  const root = fixture(t);
  for (const patch of [
    { title: '' },
    { description: null },
    { date: undefined },
    { category: 'unknown' },
    { draft: 'true' },
    { slug: '../unsafe' },
    { slug: 'Has Capitals' },
    { coverImage: '' },
  ])
    assert.throws(() => check(root, { ...base, ...patch }));
});
test('ISO validation rejects impossible, unquoted, malformed and missing dates', (t) => {
  const root = fixture(t);
  for (const value of [
    '2026-02-30',
    '2025-02-29',
    '2026-13-01',
    'tomorrow',
    '2026-1-01',
    new Date(),
    undefined,
  ]) {
    assert.equal(isoDate(value), false);
    assert.throws(() => check(root, { ...base, date: value }));
  }
  assert.equal(isoDate('2024-02-29'), true);
  assert.throws(() => check(root, { ...base, draft: false }));
  assert.throws(() => check(root, { ...base, updatedAt: 'invalid' }));
});
test('filename consistency and local existing covers are enforced', (t) => {
  const root = fixture(t);
  assert.throws(
    () => validateEntry(base, { root, filename: 'different.md' }),
    /filename/,
  );
  for (const coverImage of [
    '/images/no.svg',
    'https://example.com/image.svg',
    '/images/../secret.svg',
    '/images/cover.svg?x',
  ])
    assert.throws(() => check(root, { ...base, coverImage }));
});
test('unfinished published metadata and body rejected; drafts may contain scaffolds', (t) => {
  const root = fixture(t);
  assert.doesNotThrow(() => check(root, { ...base, title: 'TODO: title' }));
  assert.throws(
    () =>
      check(root, {
        ...base,
        draft: false,
        publishedAt: '2026-10-31',
        title: 'TODO: title',
      }),
    /unfinished/,
  );
  assert.throws(
    () =>
      check(
        root,
        { ...base, draft: false, publishedAt: '2026-10-31' },
        'blog',
        'What prompted this article?',
      ),
    /unfinished/,
  );
});
test('speaking lifecycle and event fields validate separately from publication', (t) => {
  const root = fixture(t);
  assert.doesNotThrow(() =>
    check(root, { ...talk, status: 'proposed', eventDate: null }, 'speaking'),
  );
  for (const patch of [
    { format: 'podcast' },
    { status: 'accepted' },
    { draft: false, publishedAt: '2026-10-31', status: 'proposed' },
    { draft: false, publishedAt: '2026-10-31', status: 'submitted' },
    { draft: false, publishedAt: '2026-10-31', eventDate: null },
    { draft: false, publishedAt: '2026-10-31', eventName: 'TODO: event' },
  ])
    assert.throws(() => check(root, { ...talk, ...patch }, 'speaking'));
  for (const status of ['confirmed', 'delivered'])
    assert.doesNotThrow(() =>
      check(
        root,
        { ...talk, status, draft: false, publishedAt: '2026-10-31' },
        'speaking',
      ),
    );
  assert.throws(() =>
    check(root, { ...talk, eventUrl: 'javascript:alert(1)' }, 'speaking'),
  );
});
test('Markdown and MDX discovery, duplicate slugs and deterministic ordering', (t) => {
  const root = fixture(t);
  const dir = path.join(root, 'content/blog');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, base.slug + '.md'),
    matter.stringify('## Markdown body', base),
  );
  assert.equal(loadCollection('blog', root)[0].extension, '.md');
  fs.writeFileSync(
    path.join(dir, base.slug + '.mdx'),
    matter.stringify('## MDX body', base),
  );
  assert.throws(() => loadCollection('blog', root), /duplicate slug/);
  fs.unlinkSync(path.join(dir, base.slug + '.mdx'));
  fs.writeFileSync(
    path.join(dir, 'second.md'),
    matter.stringify('Another entry', {
      ...base,
      slug: 'second',
      date: '2026-11-01',
    }),
  );
  assert.equal(loadCollection('blog', root)[0].slug, 'second');
  assert.deepEqual(loadCollection('speaking', root), []);
});
test('visibility applies to related entries, feeds and all collections', () => {
  const entries = [
    { ...base, collection: 'blog' },
    {
      ...base,
      slug: 'published',
      draft: false,
      publishedAt: '2026-10-30',
      collection: 'blog',
    },
    { ...talk, slug: 'proposal', collection: 'speaking', status: 'proposed' },
    {
      ...base,
      slug: 'future',
      draft: false,
      publishedAt: '2099-01-01',
      collection: 'blog',
    },
  ];
  for (const env of [
    { NODE_ENV: 'development' },
    { VERCEL_ENV: 'preview', ENABLE_DRAFTS: 'true' },
    { VERCEL_ENV: 'production', ENABLE_DRAFTS: 'true' },
  ]) {
    const visible = visibleEntries(entries, { env, today: '2026-10-31' });
    assert.equal(
      visible.some((e) => e.draft),
      env.VERCEL_ENV !== 'production',
    );
    assert.deepEqual(
      visibleEntries(entries, {
        env,
        publishedOnly: true,
        today: '2026-10-31',
      }).map((e) => e.slug),
      ['published'],
    );
  }
  const current = { ...base, slug: 'current' };
  assert.deepEqual(
    relatedEntries(current, [
      current,
      {
        ...base,
        slug: 'other-category',
        category: 'technology-strategy',
        publishedAt: '2026-10-31',
      },
      { ...base, slug: 'older', publishedAt: '2026-10-29' },
      { ...base, slug: 'newer', publishedAt: '2026-10-30' },
    ]).map((e) => e.slug),
    ['newer', 'older'],
  );
});

test('related article metadata rejects malformed, duplicate and self references', (t) => {
  const root = fixture(t);
  for (const relatedArticles of [
    'a-slug',
    [123],
    ['Bad Slug'],
    [base.slug],
    ['other', 'other'],
  ])
    assert.throws(
      () => check(root, { ...base, relatedArticles }),
      /relatedArticles/,
    );
  assert.doesNotThrow(() =>
    check(root, { ...base, relatedArticles: ['another-article'] }),
  );
});
test('collection validation catches unknown related article slugs', (t) => {
  const root = fixture(t);
  const dir = path.join(root, 'content/blog');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, base.slug + '.md'),
    matter.stringify('Article body', { ...base, relatedArticles: ['missing'] }),
  );
  assert.throws(() => loadCollection('blog', root), /unknown slug missing/);
  fs.writeFileSync(
    path.join(dir, 'missing.mdx'),
    matter.stringify('## Article body', { ...base, slug: 'missing' }),
  );
  assert.equal(loadCollection('blog', root).length, 2);
});
test('curated related articles preserve order and visibility, then fill with automatic suggestions', () => {
  const current = {
    ...base,
    slug: 'current',
    relatedArticles: ['older', 'hidden-draft', 'newer'],
  };
  const older = {
    ...base,
    slug: 'older',
    category: 'technology-strategy',
    draft: false,
    publishedAt: '2026-10-01',
    collection: 'blog',
  };
  const newer = { ...older, slug: 'newer', publishedAt: '2026-10-30' };
  const hidden = { ...base, slug: 'hidden-draft', collection: 'blog' };
  const automatic = {
    ...older,
    slug: 'automatic',
    category: base.category,
    publishedAt: '2026-10-31',
  };
  const visible = visibleEntries([older, newer, hidden, automatic], {
    env: { VERCEL_ENV: 'production', ENABLE_DRAFTS: 'true' },
    today: '2026-10-31',
  });
  assert.deepEqual(
    relatedEntries(current, visible).map((e) => e.slug),
    ['older', 'newer'],
  );
  assert.deepEqual(
    relatedEntries(
      { ...current, relatedArticles: ['hidden-draft', 'older'] },
      visible,
    ).map((e) => e.slug),
    ['older', 'automatic'],
  );
  assert.deepEqual(
    relatedEntries({ ...current, relatedArticles: [] }, visible).map(
      (e) => e.slug,
    ),
    ['automatic', 'newer'],
  );
});
