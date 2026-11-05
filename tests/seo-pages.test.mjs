import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analysePage, sitemapUrls } from '../scripts/seo/pages.mjs';
import { site } from '../lib/site.mjs';
const html = `<title>About Adam</title><meta name="description" content="Engineering and people"><link rel="canonical" href="${site.origin}/about"><main><h1>About Adam</h1><p>Some thoughtful words about engineering, people and leadership.</p></main>`;
test('rendered static pages are checked without duplicating their H1', () => {
  const r = analysePage(html, site.origin + '/about');
  assert.deepEqual(r.errors, []);
  assert.equal(r.title, 'About Adam');
  assert.ok(r.words > 0);
  assert.equal(
    r.results.find((c) => c.id === 'heading-structure').status,
    'good',
  );
});
test('technical page issues fail independently of editorial scoring', () => {
  const r = analysePage(
    html
      .replace('<h1>About Adam</h1>', '')
      .replace('name="description"', 'name="other"') +
      '<meta name="robots" content="noindex">',
    site.origin + '/',
  );
  assert.ok(r.errors.some((e) => e.includes('Canonical')));
  assert.ok(r.errors.some((e) => e.includes('description')));
  assert.ok(r.errors.some((e) => e.includes('H1')));
  assert.ok(r.errors.some((e) => e.includes('noindex')));
});
test('page discovery follows sitemap and rejects external destinations', () => {
  assert.deepEqual(
    sitemapUrls(`<urlset><url><loc>${site.origin}/about</loc></url></urlset>`),
    [site.origin + '/about'],
  );
  assert.throws(
    () => sitemapUrls('<loc>https://example.com/</loc>'),
    /external/,
  );
  assert.throws(() => sitemapUrls(''), /no pages/);
});
