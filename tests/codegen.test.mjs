import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { generate } from '../scripts/codegen/generate.mjs';
import { artwork } from '../scripts/codegen/artwork.mjs';
import { loadCollection } from '../lib/content/core.mjs';
import { serialize } from 'next-mdx-remote/serialize';
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'adam-codegen-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
for (const collection of ['blog', 'speaking'])
  test(`${collection} CLI creates valid MDX, SVG and automatically discovered drafts`, async (t) => {
    const root = fixture(t);
    const result = spawnSync(
      process.execPath,
      [
        path.resolve('scripts/codegen/generate.mjs'),
        collection,
        'an-interesting-question',
      ],
      { cwd: root, encoding: 'utf8' },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      new RegExp(`http://localhost:3000/${collection}/an-interesting-question`),
    );
    const [entry] = loadCollection(collection, root);
    assert.equal(entry.draft, true);
    assert.equal(entry.slug, 'an-interesting-question');
    assert.equal(
      entry.coverImage,
      `/images/${collection}/an-interesting-question.svg`,
    );
    assert.match(
      fs.readFileSync(path.join(root, 'public', entry.coverImage), 'utf8'),
      /viewBox="0 0 960 540"/,
    );
    await serialize(entry.body);
    if (collection === 'blog') assert.equal(entry.category, 'general');
    else assert.equal(entry.status, 'proposed');
  });
test('category option and local calendar date', (t) => {
  const root = fixture(t);
  generate('blog', ['valid-slug', '--category', 'technology-strategy'], {
    root,
    now: new Date(2026, 9, 31, 23, 59),
  });
  const [entry] = loadCollection('blog', root);
  assert.equal(entry.category, 'technology-strategy');
  assert.equal(entry.date, '2026-10-31');
});
test('invalid slugs and flags fail before any writes', (t) => {
  const root = fixture(t);
  for (const args of [
    [],
    ['../escape'],
    ['Upper'],
    ['double--dash'],
    ['a/b'],
    ['valid', '--unknown'],
    ['valid', '--category', 'unknown'],
  ])
    assert.throws(() => generate('blog', args, { root }));
  assert.equal(fs.readdirSync(root).length, 0);
  const result = spawnSync(
    process.execPath,
    [path.resolve('scripts/codegen/generate.mjs'), 'blog', '../escape'],
    { cwd: root, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /kebab-case/);
});
test('duplicate generation and asset collisions never overwrite', (t) => {
  const root = fixture(t);
  const first = generate('blog', ['repeat'], { root });
  const before = fs.readFileSync(first.contentFile, 'utf8');
  const image = fs.readFileSync(first.imageFile, 'utf8');
  assert.throws(() => generate('blog', ['repeat'], { root }), /overwrite/);
  assert.equal(fs.readFileSync(first.contentFile, 'utf8'), before);
  assert.equal(fs.readFileSync(first.imageFile, 'utf8'), image);
  fs.renameSync(first.contentFile, first.contentFile.replace('.mdx', '.md'));
  assert.throws(() => generate('blog', ['repeat'], { root }));
});
test('partial content write failure rolls back both new files', (t) => {
  const root = fixture(t);
  let calls = 0;
  assert.throws(
    () =>
      generate('blog', ['rollback'], {
        root,
        write: (file, data) => {
          fs.writeFileSync(file, data);
          if (++calls === 2) throw Error('Simulated disk failure');
        },
      }),
    /disk failure/,
  );
  assert.equal(
    fs.existsSync(path.join(root, 'content/blog/rollback.mdx')),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(root, 'public/images/blog/rollback.svg')),
    false,
  );
});
test('artwork is deterministic, varied, self-contained and not title based', () => {
  const covers = new Set();
  for (let i = 0; i < 6; i++) {
    const svg = artwork('example', i);
    assert.match(svg, /^<svg/);
    assert.match(svg, /<\/svg>/);
    assert.doesNotMatch(svg, /<script|<text|href=|<foreignObject/);
    covers.add(svg);
  }
  assert.equal(covers.size, 6);
  assert.equal(artwork('example'), artwork('example'));
});

test('blog tags default empty and support validated flags alongside category', (t) => {
  const root = fixture(t);
  generate('blog', ['empty-tags'], { root });
  assert.deepEqual(loadCollection('blog', root)[0].tags, []);
  generate(
    'blog',
    [
      'tagged',
      '--tags',
      'feedback,leadership',
      '--category',
      'engineering-leadership',
    ],
    { root },
  );
  assert.deepEqual(
    loadCollection('blog', root).find((e) => e.slug === 'tagged').tags,
    ['feedback', 'leadership'],
  );
  const before = fs.readdirSync(path.join(root, 'content/blog'));
  for (const value of ['unknown', 'Feedback', 'feedback,feedback'])
    assert.throws(() =>
      generate('blog', ['invalid', '--tags', value], { root }),
    );
  assert.deepEqual(fs.readdirSync(path.join(root, 'content/blog')), before);
});
