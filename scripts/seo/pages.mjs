import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import {
  validateTitle,
  validateMetaDescription,
  stripHtml,
  getTextStatistics,
} from '@power-seo/core';
import { analyzeContent } from '@power-seo/content-analysis';
import { analyzeReadability } from '@power-seo/readability';
import { site } from '../../lib/site.mjs';
const decode = (text) =>
  text
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, value) =>
      String.fromCodePoint(
        value[0].toLowerCase() === 'x'
          ? parseInt(value.slice(1), 16)
          : Number(value),
      ),
    )
    .replace(
      /&(?:amp|quot|apos|lt|gt|#39);/g,
      (entity) =>
        ({
          '&amp;': '&',
          '&quot;': '"',
          '&apos;': "'",
          '&#39;': "'",
          '&lt;': '<',
          '&gt;': '>',
        })[entity],
    );
const attrs = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/g)].map((m) => [
      m[1].toLowerCase(),
      decode(m[3]),
    ]),
  );
export function analysePage(html, url) {
  const clean = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const title = decode(
    stripHtml(clean.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''),
  );
  const metas = [...clean.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const description =
    metas.find((m) => m.name === 'description')?.content || '';
  const robots = metas
    .filter((m) => m.name === 'robots')
    .map((m) => m.content)
    .join(',');
  const canonical = [...clean.matchAll(/<link\b[^>]*>/gi)]
    .map((m) => attrs(m[0]))
    .find((m) => m.rel === 'canonical')?.href;
  const main = clean.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const headings = [...main.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const errors = [];
  if (!title.trim()) errors.push('Missing page title');
  if (!description.trim()) errors.push('Missing meta description');
  if (canonical !== url)
    errors.push(
      `Canonical must equal ${url}; found ${canonical || '(missing)'}`,
    );
  if (/\bnoindex\b/i.test(robots))
    errors.push('Public sitemap page is marked noindex');
  if (headings.length !== 1)
    errors.push(`Expected one H1; found ${headings.length}`);
  if (!getTextStatistics(main).wordCount)
    errors.push('Missing readable main content');
  // Power SEO injects title as an H1; preserve the real H1 separately for validation.
  const body = main.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, '');
  const result = analyzeContent({
    title: decode(stripHtml(headings[0]?.[1] || title)),
    metaDescription: description,
    content: body,
    canonicalUrl: canonical,
    siteUrl: site.origin,
  });
  const included = new Set([
    'heading-structure',
    'internal-links',
    'external-links',
    'paragraph-length',
    'sentence-length',
    'subheading-distribution',
    'text-presence',
  ]);
  return {
    url,
    title,
    description,
    canonical,
    errors,
    words: getTextStatistics(main).wordCount,
    titleValidation: validateTitle(title),
    descriptionValidation: validateMetaDescription(description),
    results: result.results.filter((r) => included.has(r.id)),
    readability: analyzeReadability({ content: main }),
  };
}
export function sitemapUrls(xml) {
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1]));
  if (!urls.length) throw Error('Sitemap contains no pages');
  for (const url of urls)
    if (new URL(url).origin !== site.origin)
      throw Error('Unexpected external sitemap URL');
  return [...new Set(urls)];
}
export async function checkPages() {
  const env = {
    ...process.env,
    VERCEL_ENV: 'production',
    ENABLE_DRAFTS: 'false',
    GA_MEASUREMENT_ID: '',
  };
  const build = spawn('npm', ['run', 'build'], {
    env,
    stdio: ['ignore', process.stderr, process.stderr],
  });
  const [code] = await once(build, 'exit');
  if (code !== 0) throw Error('Production build failed');
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  const server = spawn(
    process.execPath,
    [
      'node_modules/next/dist/bin/next',
      'start',
      '-H',
      '127.0.0.1',
      '-p',
      String(port),
    ],
    { env, stdio: ['ignore', process.stderr, process.stderr] },
  );
  const base = `http://127.0.0.1:${port}`;
  const request = async (route) => {
    const response = await fetch(base + route, {
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });
    if (response.status !== 200)
      throw Error(`${route}: HTTP ${response.status}`);
    if (/noindex/i.test(response.headers.get('x-robots-tag') || ''))
      throw Error(`${route}: noindex response header`);
    return response.text();
  };
  try {
    let sitemap;
    for (let i = 0; i < 60; i++) {
      try {
        sitemap = await request('/sitemap.xml');
        break;
      } catch (error) {
        if (server.exitCode !== null || i === 59) throw error;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    const reports = [];
    for (const url of sitemapUrls(sitemap)) {
      const u = new URL(url);
      reports.push(analysePage(await request(u.pathname + u.search), url));
    }
    return {
      reports,
      errors: reports.flatMap((r) => r.errors.map((e) => `${r.url}: ${e}`)),
    };
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit');
      server.kill('SIGTERM');
      await exited;
    }
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const flags = process.argv.slice(2);
    if (flags.some((f) => !['--json', '--strict'].includes(f)))
      throw Error('Use --json or --strict');
    const result = await checkPages();
    if (flags.includes('--json')) console.log(JSON.stringify(result, null, 2));
    else {
      for (const r of result.reports) {
        console.log(
          `\n${r.url}\n  ${r.title}\n  ${r.words} words | Flesch ${r.readability.fleschReadingEase.toFixed(1)}`,
        );
        for (const v of [r.titleValidation, r.descriptionValidation])
          if (!v.valid) console.log('  Suggestion: ' + v.message);
        for (const c of [...r.results, ...r.readability.results])
          if (['poor', 'ok'].includes(c.status))
            console.log(`  ${c.id}: ${c.description}`);
      }
      for (const e of result.errors) console.error('ERROR: ' + e);
      console.log(
        `\nChecked ${result.reports.length} public sitemap pages. Editorial suggestions are advisory.`,
      );
    }
    process.exitCode =
      result.errors.length ||
      (flags.includes('--strict') &&
        result.reports.some(
          (r) =>
            !r.titleValidation.valid ||
            !r.descriptionValidation.valid ||
            [...r.results, ...r.readability.results].some(
              (c) => c.status === 'poor',
            ),
        ))
        ? 1
        : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
