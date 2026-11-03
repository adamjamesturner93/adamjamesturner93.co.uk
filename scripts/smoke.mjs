import assert from 'node:assert/strict';
import { loadCollection, visibleEntries } from '../lib/content/core.mjs';
import { site } from '../lib/site.mjs';
const base = process.argv[2] || 'http://localhost:3000';
const mode = process.env.SMOKE_MODE || 'local';
const index = mode === 'production';
const draftVisible = mode === 'local' || mode === 'preview';
const request = async (path) => {
  const response = await fetch(base + path, {
    redirect: 'manual',
    headers: { 'User-Agent': 'Googlebot' },
  });
  return { response, text: await response.text() };
};
for (const path of ['/', '/blog', '/about']) {
  const { response, text } = await request(path);
  assert.equal(response.status, 200, path);
  const canonical = text.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(canonical, `canonical missing for ${path}`);
  assert.equal(new URL(canonical[1]).origin, site.origin);
  assert.equal(new URL(canonical[1]).pathname, path);
  if (!index) {
    assert.match(response.headers.get('x-robots-tag') || '', /noindex/, path);
    assert.match(text, /name="robots" content="noindex/);
  } else assert.doesNotMatch(text, /name="robots" content="noindex/);
}
for (const path of [
  '/blog/definitely-missing-slug',
  '/speaking/definitely-missing-slug',
])
  assert.equal((await request(path)).response.status, 404, path);
for (const path of [
  '/writing',
  '/writing/data-migrations-moving-more-than-just-data',
]) {
  const { response } = await request(path);
  assert.equal(response.status, 308);
  assert.equal(
    new URL(response.headers.get('location'), base).pathname,
    path.replace('/writing', '/blog'),
  );
}
for (const collection of ['blog', 'speaking']) {
  const drafts = loadCollection(collection).filter((e) => e.draft);
  for (const e of drafts) {
    const path = `/${collection}/${e.slug}`;
    const { response, text } = await request(path);
    assert.equal(response.status, draftVisible ? 200 : 404, path);
    if (draftVisible) {
      assert.match(text, /Draft|draft/);
    }
    assert.equal(
      (await request(path + '/opengraph-image')).response.status,
      404,
    );
  }
}
const { text: rss } = await request('/rss.xml');
const { text: sitemap } = await request('/sitemap.xml');
for (const collection of ['blog', 'speaking'])
  for (const e of loadCollection(collection).filter((e) => e.draft)) {
    assert.ok(!rss.includes(e.slug));
    assert.ok(!sitemap.includes(e.slug));
  }
for (const e of visibleEntries(loadCollection('blog'), {
  publishedOnly: true,
})) {
  assert.ok(rss.includes(site.origin + '/blog/' + e.slug));
  assert.ok(sitemap.includes(site.origin + '/blog/' + e.slug));
  const { response, text } = await request('/blog/' + e.slug);
  assert.equal(response.status, 200);
  assert.ok(
    text.includes(site.origin + '/blog/' + e.slug + '/opengraph-image'),
  );
  const og = await fetch(base + '/blog/' + e.slug + '/opengraph-image');
  assert.equal(og.status, 200);
  assert.match(og.headers.get('content-type'), /image\/png/);
}
const publicTalks = visibleEntries(loadCollection('speaking'), {
  publishedOnly: true,
});
if (!publicTalks.length && !draftVisible)
  assert.equal((await request('/speaking')).response.status, 404);
const { text: robots } = await request('/robots.txt');
assert.match(robots, index ? /Allow: \// : /Disallow: \//);
console.log(
  `HTTP smoke passed: ${mode}, indexing ${index ? 'enabled' : 'disabled'}`,
);
