import { load } from 'cheerio';
import sharp from 'sharp';
import {
  validateTitle,
  validateMetaDescription,
  getTextStatistics,
} from '@power-seo/core';
import { analyzeContent } from '@power-seo/content-analysis';
import { analyzeReadability } from '@power-seo/readability';
import { site } from '../../lib/site.mjs';
export function localRoute(value, base = site.origin) {
  const url = new URL(value, base);
  if (url.origin !== site.origin || url.username || url.password)
    throw Error(`Non-site URL cannot be fetched locally: ${value}`);
  return url.pathname + url.search;
}
export function sitemapUrls(xml) {
  const $ = load(xml, { xml: true });
  const urls = $('url > loc')
    .map((_, e) => $(e).text())
    .get();
  if (!urls.length) throw Error('Sitemap contains no pages');
  for (const url of urls) localRoute(url);
  return urls;
}
export function compareSitemap(actual, expected) {
  return [
    ...actual
      .filter((u, i) => actual.indexOf(u) !== i)
      .map((u) => `Duplicate sitemap URL: ${u}`),
    ...expected
      .filter((u) => !actual.includes(u))
      .map((u) => `Missing sitemap page: ${u}`),
    ...actual
      .filter((u) => !expected.includes(u))
      .map((u) => `Unexpected sitemap page (possibly draft): ${u}`),
  ];
}
export function analysePage(html, url, { entry, preview = false } = {}) {
  const $ = load(html);
  const meta = (name) =>
    $(`meta[property="${name}"],meta[name="${name}"]`)
      .first()
      .attr('content') || '';
  const title = $('title').text().trim(),
    description = meta('description'),
    canonical = $('link[rel="canonical"]').attr('href');
  const errors = [],
    warnings = [];
  const fail = (condition, message) => {
    if (!condition) errors.push(message);
  };
  fail(title.length > 0, 'Missing page title');
  fail(description.trim().length > 0, 'Missing meta description');
  fail(canonical === url, `Canonical must equal ${url}`);
  fail(
    $('link[rel="canonical"]').length === 1,
    'Expected exactly one canonical',
  );
  const noindex = /\bnoindex\b/i.test(meta('robots'));
  fail(
    preview ? noindex : !noindex,
    preview ? 'Preview must be noindex' : 'Public page is noindex',
  );
  const main = $('main').clone();
  main.find('script,style').remove();
  const h1 = main.find('h1');
  fail(h1.length === 1, `Expected one H1; found ${h1.length}`);
  let previous = 0;
  main.find('h1,h2,h3,h4,h5,h6').each((_, e) => {
    const level = Number(e.tagName[1]);
    if (level > previous + 1)
      errors.push(`Heading hierarchy jumps from H${previous} to H${level}`);
    previous = level;
  });
  fail(
    getTextStatistics(main.html() || '').wordCount > 0,
    'Missing readable main content',
  );
  const og = Object.fromEntries(
    [
      'title',
      'description',
      'type',
      'url',
      'site_name',
      'image',
      'image:alt',
      'image:width',
      'image:height',
    ].map((k) => [k, meta('og:' + k)]),
  );
  for (const key of [
    'title',
    'description',
    'type',
    'url',
    'site_name',
    'image',
    'image:alt',
    'image:width',
    'image:height',
  ])
    fail(Boolean(og[key]), `Missing og:${key}`);
  fail(og.url === url, 'og:url does not match canonical');
  fail(og.site_name === site.name, 'Incorrect og:site_name');
  fail(
    og.type === (entry?.collection === 'blog' ? 'article' : 'website'),
    'Incorrect og:type',
  );
  const expectedTitle = entry?.title || title.replace(/ \| Adam Turner$/, '');
  fail(og.title === expectedTitle, 'Stale or incorrect og:title');
  fail(
    og.description === (entry?.description || description),
    'Stale or incorrect og:description',
  );
  if (entry) {
    fail(description === entry.description, 'Stale meta description');
    fail(title === entry.title + ' | ' + site.name, 'Stale HTML title');
  }
  for (const key of ['title', 'description', 'image:alt'])
    if (/\bTODO\b|\bTBD\b|REPLACE ME|Illustrative draft/i.test(og[key]))
      errors.push(`Placeholder in og:${key}`);
  const twitter = {
    card: meta('twitter:card'),
    title: meta('twitter:title') || og.title,
    description: meta('twitter:description') || og.description,
    image: meta('twitter:image') || og.image,
    alt: meta('twitter:image:alt') || og['image:alt'],
  };
  fail(
    twitter.card === 'summary_large_image',
    'Expected summary_large_image Twitter card',
  );
  fail(
    twitter.title === og.title && twitter.description === og.description,
    'Twitter metadata differs from article metadata',
  );
  fail(
    twitter.image === og.image,
    'Twitter image differs from Open Graph image',
  );
  fail(Boolean(twitter.alt), 'Missing social image alternative text');
  try {
    fail(
      new URL(og.image).protocol === 'https:',
      'Social image must be absolute HTTPS',
    );
    localRoute(og.image);
    if (entry)
      fail(
        new URL(og.image).pathname ===
          `/${entry.collection}/${entry.slug}/opengraph-image`,
        'Article-specific image references another page or generic fallback',
      );
  } catch {
    errors.push('Invalid or external social image URL');
  }
  fail(
    Number(og['image:width']) === 1200 && Number(og['image:height']) === 630,
    'Expected 1200 × 630 social image metadata',
  );
  if (entry?.collection === 'blog') {
    fail(
      meta('article:author') === site.origin + '/about',
      'Incorrect article author',
    );
    for (const [field, key] of [
      ['publishedAt', 'article:published_time'],
      ['updatedAt', 'article:modified_time'],
    ]) {
      const actual = meta(key);
      if (entry[field])
        fail(
          actual && Date.parse(actual) === Date.parse(entry[field]),
          `Incorrect ${key}`,
        );
      else fail(!actual, `Unexpected ${key}`);
    }
  }
  const schemas = [];
  $('script[type="application/ld+json"]').each((_, e) => {
    try {
      schemas.push(JSON.parse($(e).text()));
    } catch {
      errors.push('Invalid JSON-LD');
    }
  });
  if (
    entry?.collection === 'blog' &&
    !entry.draft &&
    entry.publishedAt <= new Date().toISOString().slice(0, 10)
  ) {
    const schema = schemas.find((s) => s['@type'] === 'BlogPosting');
    fail(Boolean(schema), 'Missing BlogPosting JSON-LD');
    if (schema) {
      for (const [key, value] of Object.entries({
        headline: entry.title,
        description: entry.description,
        url,
        image: og.image,
        datePublished: entry.publishedAt,
      }))
        fail(schema[key] === value, `Incorrect JSON-LD ${key}`);
      fail(
        schema.author?.name === site.name &&
          schema.author?.url === site.origin + '/about',
        'Incorrect JSON-LD author',
      );
      if (entry.updatedAt)
        fail(
          schema.dateModified === entry.updatedAt,
          'Incorrect JSON-LD modification date',
        );
    }
  }
  for (const validation of [
    validateTitle(title),
    validateMetaDescription(description),
  ])
    if (!validation.valid) warnings.push(validation.message);
  const body = main.html() || '';
  let readability = null,
    results = [];
  if (entry?.collection === 'blog') {
    main.find('h1').remove();
    const analysis = analyzeContent({
      title: entry.title,
      metaDescription: description,
      content: main.html() || '',
      siteUrl: site.origin,
      canonicalUrl: url,
    });
    const useful = new Set([
      'heading-structure',
      'paragraph-length',
      'sentence-length',
      'subheading-distribution',
    ]);
    results = analysis.results.filter((r) => useful.has(r.id));
    readability = analyzeReadability({ content: body });
    warnings.push(
      ...[...results, ...readability.results]
        .filter(
          (r) =>
            ['ok', 'poor'].includes(r.status) && r.id !== 'transition-words',
        )
        .map((r) => r.description),
    );
  }
  const links = $('a[href]')
    .map((_, e) => $(e).attr('href'))
    .get();
  const assets = $('img[src],script[src],link[rel="stylesheet"]')
    .map((_, e) => $(e).attr('src') || $(e).attr('href'))
    .get();
  return {
    url,
    title,
    description,
    canonical,
    og,
    twitter,
    errors,
    warnings,
    words: getTextStatistics(body).wordCount,
    results,
    readability,
    links,
    assets,
    ids: $('[id]')
      .map((_, e) => $(e).attr('id'))
      .get(),
  };
}
export async function inspectImage(buffer, contentType) {
  if (!/^image\/(png|jpeg)(?:;|$)/i.test(contentType || ''))
    throw Error('Social image must be PNG or JPEG, not HTML/SVG');
  if (buffer.length < 1000 || buffer.length > 5 * 1024 * 1024)
    throw Error('Social image file size must be 1 KB–5 MB');
  const image = sharp(buffer, { failOn: 'warning' });
  const metadata = await image.metadata();
  if (!['png', 'jpeg'].includes(metadata.format))
    throw Error('Invalid image bytes');
  if (metadata.width !== 1200 || metadata.height !== 630)
    throw Error('Social image must be 1200 × 630');
  if (!contentType.toLowerCase().startsWith('image/' + metadata.format))
    throw Error('Image content type does not match decoded format');
  const stats = await image.stats();
  if (!stats.isOpaque) throw Error('Social image has transparent pixels');
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    bytes: buffer.length,
    opaque: stats.isOpaque,
  };
}

export function createResourceChecker(request) {
  const cache = new Map();
  return async (value, from, fragment = false) => {
    const url = new URL(value, from);
    if (url.origin !== site.origin) return; // never fetch external destinations
    let route = localRoute(url.href);
    let response;
    for (let i = 0; i < 6; i++) {
      if (cache.has(route)) {
        response = cache.get(route);
      } else {
        const r = await request(route);
        const bytes = Buffer.from(await r.arrayBuffer());
        response = {
          status: r.status,
          type: r.headers.get('content-type') || '',
          bytes,
          location: r.headers.get('location'),
        };
        cache.set(route, response);
      }
      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.location
      ) {
        route = localRoute(response.location, new URL(route, site.origin));
        response = null;
        continue;
      }
      break;
    }
    if (!response || response.status !== 200)
      throw Error(`Broken internal resource ${value}`);
    if (fragment && url.hash && response.type.includes('text/html')) {
      const $ = load(response.bytes.toString());
      if (
        !$('[id]')
          .toArray()
          .some(
            (e) => $(e).attr('id') === decodeURIComponent(url.hash.slice(1)),
          )
      )
        throw Error(`Missing anchor ${value}`);
    }
    return response;
  };
}
