import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadCollection, visibleEntries } from '../../lib/content/core.mjs';
import { site } from '../../lib/site.mjs';
import { checkSocialImageTraces } from './traces.mjs';
import { socialCover } from '../../lib/social-cover.mjs';
import {
  analysePage,
  sitemapUrls,
  compareSitemap,
  localRoute,
  inspectImage,
  createResourceChecker,
} from './inspect.mjs';
export { analysePage, sitemapUrls } from './inspect.mjs';
const escape = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
export function publicationRoutes(blog, talks) {
  const env = { VERCEL_ENV: 'production', ENABLE_DRAFTS: 'false' };
  const articles = visibleEntries(blog, { publishedOnly: true, env });
  const speaking = visibleEntries(talks, { publishedOnly: true, env });
  const routes = [
    '/',
    '/about',
    '/blog',
    '/privacy',
    ...(speaking.length ? ['/speaking'] : []),
    ...articles.map((a) => '/blog/' + a.slug),
    ...speaking.map((a) => '/speaking/' + a.slug),
  ];
  const hidden = [
    ...blog.filter((a) => !articles.includes(a)).map((a) => '/blog/' + a.slug),
    ...talks
      .filter((a) => !speaking.includes(a))
      .map((a) => '/speaking/' + a.slug),
    ...(!speaking.length ? ['/speaking'] : []),
  ];
  return { routes, hidden };
}
export async function checkPages({ slug } = {}) {
  const root = process.cwd();
  const blog = loadCollection('blog'),
    talks = loadCollection('speaking');
  const target = slug ? blog.find((a) => a.slug === slug) : null;
  if (slug && !target) throw Error('Unknown article slug');
  const preview = Boolean(slug);
  const { routes, hidden } = publicationRoutes(blog, talks);
  const entries = [...blog, ...talks];
  const workspace = await fs.mkdtemp(path.join(root, '.seo-work-'));
  const children = new Set();
  let interrupted = false;
  const kill = (child) => {
    if (child.exitCode === null && child.signalCode === null) {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        child.kill('SIGTERM');
      }
    }
  };
  const interrupt = () => {
    interrupted = true;
    for (const child of children) kill(child);
  };
  process.on('SIGINT', interrupt);
  process.on('SIGTERM', interrupt);
  const launch = (cmd, args, env) => {
    const child = spawn(cmd, args, {
      cwd: workspace,
      env,
      detached: true,
      stdio: ['ignore', process.stderr, process.stderr],
    });
    children.add(child);
    return child;
  };
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    VERCEL_ENV: preview ? 'preview' : 'production',
    ENABLE_DRAFTS: preview ? 'true' : 'false',
    SITE_LIVE: 'true',
    GA_MEASUREMENT_ID: '',
    ANALYTICS_DEMO: 'false',
  };
  try {
    const files = execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { encoding: 'utf8' },
    )
      .split('\0')
      .filter(Boolean);
    for (const file of new Set(files)) {
      if (
        file.startsWith('.seo-work-') ||
        file.startsWith('reports/') ||
        file.startsWith('.env')
      )
        continue;
      try {
        await fs.mkdir(path.dirname(path.join(workspace, file)), {
          recursive: true,
        });
        await fs.copyFile(path.join(root, file), path.join(workspace, file));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    await fs.symlink(
      path.join(root, 'node_modules'),
      path.join(workspace, 'node_modules'),
      'dir',
    );
    // Reuse build cache where available without sharing mutable build outputs.
    try {
      await fs.cp(
        path.join(root, '.next/cache'),
        path.join(workspace, '.next/cache'),
        { recursive: true },
      );
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const build = launch('npm', ['run', 'build'], env);
    const [code] = await once(build, 'exit');
    if (code !== 0 || interrupted)
      throw Error('Audit build failed or interrupted');
    await checkSocialImageTraces(workspace);
    const socket = createServer();
    socket.listen(0, '127.0.0.1');
    await once(socket, 'listening');
    const port = socket.address().port;
    await new Promise((resolve) => socket.close(resolve));
    const server = launch(
      process.execPath,
      [
        'node_modules/next/dist/bin/next',
        'start',
        '-H',
        '127.0.0.1',
        '-p',
        String(port),
      ],
      env,
    );
    const base = `http://127.0.0.1:${port}`;
    const request = async (route) => {
      if (interrupted) throw Error('Audit interrupted');
      const mapped = localRoute(route);
      const parsed = new URL(mapped, site.origin);
      if (parsed.pathname === '/_next/image' && parsed.searchParams.has('url'))
        localRoute(parsed.searchParams.get('url'));
      return fetch(base + mapped, {
        redirect: 'manual',
        signal: AbortSignal.timeout(20000),
      });
    };
    for (let i = 0; i < 60; i++) {
      try {
        await request('/robots.txt');
        break;
      } catch (error) {
        if (
          interrupted ||
          server.exitCode !== null ||
          server.signalCode !== null ||
          i === 59
        )
          throw error;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    const errors = [],
      reports = [];
    const expected = routes.map((p) => site.origin + (p === '/' ? '' : p));
    const sitemap = await request('/sitemap.xml');
    if (sitemap.status !== 200) errors.push('Sitemap not HTTP 200');
    else {
      try {
        errors.push(
          ...compareSitemap(sitemapUrls(await sitemap.text()), expected),
        );
      } catch (error) {
        errors.push(error.message);
      }
    }
    const robotsResponse = await request('/robots.txt');
    const robots = await robotsResponse.text();
    if (robotsResponse.status !== 200) errors.push('robots.txt not HTTP 200');
    if (
      preview
        ? !/^Disallow: \/\s*$/m.test(robots)
        : !/^Allow: \/\s*$/m.test(robots) ||
          !robots.includes('Sitemap: ' + site.origin + '/sitemap.xml')
    )
      errors.push('Incorrect robots.txt publication policy');
    if (!preview)
      for (const route of hidden) {
        for (const testRoute of [
          route,
          ...(route.split('/').length === 3
            ? [route + '/opengraph-image']
            : []),
        ]) {
          const response = await request(testRoute);
          if (response.status !== 404)
            errors.push(
              `Draft/unpublished exposure: ${testRoute} returned ${response.status}`,
            );
        }
      }
    const checkResource = createResourceChecker(request);
    for (const route of preview ? ['/blog/' + slug] : routes) {
      const url = site.origin + (route === '/' ? '' : route);
      const entry = entries.find((e) => route === `/${e.collection}/${e.slug}`);
      const response = await request(route);
      if (response.status !== 200) {
        errors.push(`${route}: HTTP ${response.status}`);
        continue;
      }
      const report = analysePage(await response.text(), url, {
        entry,
        preview,
      });
      const headerNoindex = /noindex/i.test(
        response.headers.get('x-robots-tag') || '',
      );
      if ((preview && !headerNoindex) || (!preview && headerNoindex))
        report.errors.push('Incorrect X-Robots-Tag');
      for (const value of report.links) {
        if (/^(mailto:|tel:)/i.test(value)) continue;
        try {
          await checkResource(value, url, true);
        } catch (error) {
          report.errors.push(error.message);
        }
      }
      for (const value of report.assets) {
        try {
          const asset = await checkResource(value, url);
          if (asset?.type.includes('text/html'))
            throw Error(`Asset returned HTML: ${value}`);
        } catch (error) {
          report.errors.push(error.message);
        }
      }
      try {
        const asset = await checkResource(report.og.image, url);
        if (!asset)
          throw Error('Social image must use the configured site origin');
        report.image = await inspectImage(asset.bytes, asset.type);
        if (entry?.collection === 'blog') {
          const expected = await socialCover(entry.coverImage, workspace);
          if (!expected.equals(Buffer.from(asset.bytes)))
            throw Error('Social image does not match the MDX cover image');
        }
        if (preview) {
          const dir = path.join(root, 'reports/seo', slug);
          await fs.mkdir(dir, { recursive: true });
          const filename =
            'social-image.' + (report.image.format === 'jpeg' ? 'jpg' : 'png');
          await fs.writeFile(path.join(dir, filename), asset.bytes);
          report.image.file = filename;
        }
      } catch (error) {
        report.errors.push('Social image: ' + error.message);
      }
      if (preview) {
        report.status = entry.draft
          ? 'Draft'
          : entry.publishedAt > new Date().toISOString().slice(0, 10)
            ? 'Scheduled'
            : 'Published';
        report.warnings.push(
          'Inspect the image visually for typography, clipping and unintended placeholder text; metadata/pixel checks cannot establish visual correctness.',
        );
        if (entry.draft && /TODO|DRAFT:|TBD/.test(entry.body))
          report.warnings.push(
            'This draft contains editorial outline/placeholders and needs author review.',
          );
      }
      reports.push(report);
      errors.push(...report.errors.map((e) => `${url}: ${e}`));
    }
    const result = {
      mode: preview ? 'preview' : 'production',
      reports,
      errors,
    };
    if (preview && reports[0]) await writeReport(root, slug, result);
    return result;
  } finally {
    for (const child of children) {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = once(child, 'exit');
        kill(child);
        const timer = setTimeout(() => {
          try {
            process.kill(-child.pid, 'SIGKILL');
          } catch {}
        }, 3000);
        await exited;
        clearTimeout(timer);
      }
    }
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', interrupt);
    await fs.rm(workspace, { recursive: true, force: true });
  }
}
async function writeReport(root, slug, result) {
  const r = result.reports[0];
  const dir = path.join(root, 'reports/seo', slug);
  await fs.mkdir(dir, { recursive: true });
  const status = result.errors.length
    ? 'NOT READY — FIX TECHNICAL ERRORS'
    : 'READY FOR EDITORIAL REVIEW';
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Social preview — ${escape(r.title)}</title><style>body{margin:0;padding:32px;background:#121b2d;color:#f1f4fa;font:16px/1.6 system-ui}main{max-width:850px;margin:auto}article{background:#fafaf7;color:#18243b;border-radius:14px;overflow:hidden}img{width:100%;display:block}article div{padding:24px}h1{font-size:26px;line-height:1.2}small{color:#536471}.result{padding:20px;border:1px solid #506079;border-radius:12px;margin-top:24px}li{overflow-wrap:anywhere}</style><main><p>LOCAL SOCIAL PREVIEW · ${escape(r.status)}</p><p>LinkedIn-style approximation — not a verified LinkedIn rendering.</p><article>${r.image?.file ? `<img src="${escape(r.image.file)}" alt="${escape(r.og['image:alt'])}">` : ''}<div><small>${escape(new URL(site.origin).hostname)}</small><h1>${escape(r.og.title)}</h1><p>${escape(r.og.description)}</p></div></article><section class="result"><h2>${status}</h2><p>${r.image ? `${r.image.width} × ${r.image.height} · ${r.image.format} · ${r.image.bytes} bytes` : 'Image unavailable'}</p><h3>Errors</h3><ul>${result.errors.map((e) => `<li>${escape(e)}</li>`).join('') || '<li>None</li>'}</ul><h3>Editorial suggestions</h3><ul>${r.warnings.map((e) => `<li>${escape(e)}</li>`).join('')}</ul></section></main></html>`;
  await fs.writeFile(path.join(dir, 'report.html'), html);
  try {
    const { chromium } = await import('@playwright/test');
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({
        viewport: { width: 1000, height: 1100 },
      });
      await page.route('**/*', (route) =>
        route.request().url().startsWith('file:')
          ? route.continue()
          : route.abort(),
      );
      await page.goto(pathToFileURL(path.join(dir, 'report.html')).href);
      await page.screenshot({
        path: path.join(dir, 'social-preview.png'),
        fullPage: true,
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    r.warnings.push(
      'Screenshot unavailable: ' +
        error.message.split('\n')[0] +
        '. Open report.html to inspect the saved social image.',
    );
  }
  await fs.writeFile(
    path.join(dir, 'report.json'),
    JSON.stringify(result, null, 2),
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    const flags = process.argv.slice(2);
    let slug;
    for (let i = 0; i < flags.length; i++) {
      if (flags[i] === '--slug') {
        slug = flags[++i];
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || ''))
          throw Error('Provide a lowercase article slug');
      } else if (!['--preview', '--json', '--strict'].includes(flags[i]))
        throw Error('Use --slug, --json or --strict');
    }
    if (flags.includes('--preview') && !slug)
      throw Error('seo:preview requires --slug');
    const result = await checkPages({ slug });
    if (flags.includes('--json')) console.log(JSON.stringify(result, null, 2));
    else {
      for (const r of result.reports) {
        console.log(
          `\n${r.url}\n${r.title}${r.status ? '\nStatus: ' + r.status : ''}\nTechnical/social checks: ${r.errors.length ? 'FAIL' : 'PASS'}\nSocial image: ${r.image ? `${r.image.width} × ${r.image.height} ${r.image.format}` : 'FAIL'}\nEditorial suggestions: ${r.warnings.length}`,
        );
        for (const w of r.warnings) console.log('  Suggestion: ' + w);
      }
      for (const e of result.errors) console.error('ERROR: ' + e);
      console.log(
        `\n${result.errors.length ? 'NOT READY — FIX TECHNICAL ERRORS' : 'READY FOR EDITORIAL REVIEW'} · ${result.reports.length} pages`,
      );
      if (slug) console.log(`Report: reports/seo/${slug}/report.html`);
    }
    process.exitCode = result.errors.length ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
