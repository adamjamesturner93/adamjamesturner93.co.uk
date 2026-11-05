import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {
  analysePage,
  sitemapUrls,
  compareSitemap,
  localRoute,
  inspectImage,
} from '../scripts/seo/inspect.mjs';
import { publicationRoutes } from '../scripts/seo/pages.mjs';
import { site } from '../lib/site.mjs';
const url = site.origin + '/about';
const html = `<title>About | Adam Turner</title><meta name="description" content="Engineering and people"><link rel="canonical" href="${url}"><meta property="og:title" content="About"><meta property="og:description" content="Engineering and people"><meta property="og:type" content="website"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Adam Turner"><meta property="og:image" content="${site.origin}/opengraph-image"><meta property="og:image:alt" content="About"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><main><h1>About Adam</h1><p>Thoughtful words about engineering and people.</p></main>`;
test('parser extracts social metadata and Twitter fallbacks; static pages avoid article heuristics', () => {
  const r = analysePage(html, url);
  assert.deepEqual(r.errors, []);
  assert.equal(r.twitter.title, 'About');
  assert.equal(r.readability, null);
  assert.deepEqual(r.results, []);
});
test('wrong/missing OG URL, image and stale descriptions fail', () => {
  for (const broken of [
    html.replace(
      `property="og:url" content="${url}"`,
      'property="og:url" content="https://example.com"',
    ),
    html.replace('property="og:image"', 'property="missing"'),
    html.replace(
      'property="og:description" content="Engineering and people"',
      'property="og:description" content="Stale description"',
    ),
  ])
    assert.ok(analysePage(broken, url).errors.length);
});
test('preview requires noindex while production forbids it', () => {
  const preview = html + '<meta name="robots" content="noindex, nofollow">';
  assert.deepEqual(analysePage(preview, url, { preview: true }).errors, []);
  assert.ok(
    analysePage(preview, url).errors.some((e) => e.includes('noindex')),
  );
  assert.ok(
    analysePage(html, url, { preview: true }).errors.some((e) =>
      e.includes('noindex'),
    ),
  );
});
test('local mapping never requests remote origins and preserves route conventions', () => {
  assert.equal(localRoute(site.origin + '/blog/a?x=1'), '/blog/a?x=1');
  assert.equal(localRoute('/about'), '/about');
  assert.throws(() => localRoute('https://example.com/a'), /Non-site/);
  assert.throws(() => localRoute('//example.com/a'), /Non-site/);
  assert.ok(
    analysePage(html, url + '/').errors.some((e) => e.includes('Canonical')),
  );
});
test('sitemap comparison identifies missing, duplicate and unexpected draft pages', () => {
  assert.deepEqual(
    sitemapUrls(
      `<urlset><url><loc>${url}</loc></url><url><loc>${url}</loc></url></urlset>`,
    ),
    [url, url],
  );
  const issues = compareSitemap(
    [url, url, site.origin + '/draft'],
    [url, site.origin + '/'],
  );
  assert.equal(issues.length, 3);
  assert.throws(() => sitemapUrls('<loc>https://example.com</loc>'));
});
test('expected publication routes exclude drafts, scheduled articles and unconfirmed speaking', () => {
  const entry = { slug: 'draft', draft: true, collection: 'blog' };
  const future = {
    ...entry,
    slug: 'future',
    draft: false,
    publishedAt: '2999-01-01',
  };
  const talk = {
    ...entry,
    slug: 'talk',
    collection: 'speaking',
    draft: false,
    publishedAt: '2020-01-01',
    status: 'proposed',
  };
  const result = publicationRoutes([entry, future], [talk]);
  assert.deepEqual(result.routes, ['/', '/about', '/blog', '/privacy']);
  assert.ok(result.hidden.includes('/blog/draft'));
  assert.ok(result.hidden.includes('/speaking/talk'));
});
test('decoded social images require correct type, dimensions and opaque pixels', async () => {
  const image = await sharp({
    create: { width: 1200, height: 630, channels: 3, background: '#4255f4' },
  })
    .png()
    .toBuffer();
  assert.equal((await inspectImage(image, 'image/png')).width, 1200);
  await assert.rejects(
    inspectImage(Buffer.from('<html>404</html>'), 'text/html'),
  );
  await assert.rejects(
    inspectImage(image, 'image/jpeg').then((r) => {
      if (r.format !== 'jpeg') throw Error('mismatch');
    }),
  );
  const small = await sharp(image).resize(600, 315).toBuffer();
  await assert.rejects(inspectImage(small, 'image/png'));
  const transparent = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer();
  await assert.rejects(inspectImage(transparent, 'image/png'), /transparent/);
});
test('headings, canonical and H1 errors are technical; title length is advisory', () => {
  assert.ok(
    analysePage(
      html.replace('<h1>About Adam</h1>', '<h3>Bad hierarchy</h3>'),
      url,
    ).errors.length,
  );
  assert.equal(analysePage(html, url).errors.length, 0);
});

test('article metadata rejects wrong titles, dates, authors and generic social images', () => {
  const entry = {
    collection: 'blog',
    slug: 'example',
    title: 'Example article',
    description: 'An article description',
    draft: false,
    publishedAt: '2026-01-01',
  };
  const articleUrl = site.origin + '/blog/example';
  const schema = {
    '@type': 'BlogPosting',
    headline: entry.title,
    description: entry.description,
    url: articleUrl,
    image: articleUrl + '/opengraph-image',
    datePublished: entry.publishedAt,
    author: { name: site.name, url: site.origin + '/about' },
  };
  const article =
    html
      .replaceAll(url, articleUrl)
      .replaceAll('About | Adam Turner', 'Example article | Adam Turner')
      .replaceAll('content="About"', 'content="Example article"')
      .replaceAll('Engineering and people', entry.description)
      .replaceAll('content="website"', 'content="article"')
      .replace(
        `${site.origin}/opengraph-image`,
        articleUrl + '/opengraph-image',
      ) +
    `<meta property="article:author" content="${site.origin}/about"><meta property="article:published_time" content="2026-01-01"><script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  assert.deepEqual(analysePage(article, articleUrl, { entry }).errors, []);
  for (const invalid of [
    article.replace('content="2026-01-01"', 'content="2025-01-01"'),
    article.replace('content="Example article"', 'content="Other article"'),
    article.replace('property="article:author"', 'property="missing-author"'),
    article.replace(
      `content="${articleUrl}/opengraph-image"`,
      `content="${site.origin}/opengraph-image"`,
    ),
  ])
    assert.ok(analysePage(invalid, articleUrl, { entry }).errors.length);
});

test('internal link checker detects broken routes/fragments and never fetches external URLs', async () => {
  const { createResourceChecker } = await import('../scripts/seo/inspect.mjs');
  const calls = [];
  const check = createResourceChecker(async (route) => {
    calls.push(route);
    if (route === '/old')
      return new Response('', { status: 308, headers: { location: '/about' } });
    if (route === '/about')
      return new Response('<main id="main">About</main>', {
        headers: { 'content-type': 'text/html' },
      });
    return new Response('Not found', { status: 404 });
  });
  await check('/old', site.origin);
  await check('/old', site.origin);
  await check('/about#main', site.origin, true);
  await assert.rejects(
    check('/about#missing', site.origin, true),
    /Missing anchor/,
  );
  await assert.rejects(check('/missing', site.origin), /Broken internal/);
  const before = calls.length;
  assert.equal(
    await check('https://external.example/', site.origin),
    undefined,
  );
  assert.equal(calls.length, before);
});

test('deployment traces reject missing runtime content even when local HTML works', async () => {
  const { missingTraceFiles } = await import('../scripts/seo/traces.mjs');
  const trace =
    '/project/.next/server/app/blog/[slug]/opengraph-image/route.js.nft.json';
  const required = [
    '/project/content/blog/article.mdx',
    '/project/public/images/blog/cover.webp',
  ];
  assert.deepEqual(missingTraceFiles(trace, [], required), required);
  assert.deepEqual(
    missingTraceFiles(
      trace,
      [
        '../../../../../../content/blog/article.mdx',
        '../../../../../../public/images/blog/cover.webp',
      ],
      required,
    ),
    [],
  );
});
