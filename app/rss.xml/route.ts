import { articles } from '../../lib/content';
import { origin } from '../../lib/policy.mjs';
const esc = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function GET() {
  return new Response(
    `<?xml version="1.0"?><rss version="2.0"><channel><title>Adam Turner</title><link>${origin}</link><description>Engineering, people and change</description>${articles(
      true,
    )
      .map(
        (a) =>
          `<item><title>${esc(a.title)}</title><description>${esc(a.description)}</description><link>${origin}/blog/${a.slug}</link><guid>${origin}/blog/${a.slug}</guid><pubDate>${new Date(a.publishedAt!).toUTCString()}</pubDate></item>`,
      )
      .join('')}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml' } },
  );
}
