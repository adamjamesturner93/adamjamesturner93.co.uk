import { articles, speaking } from '../lib/content';
import { site } from '../lib/site.mjs';
import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const talks = speaking(true);
  return [
    ...[
      '',
      '/blog',
      '/about',
      '/privacy',
      ...(talks.length ? ['/speaking'] : []),
    ].map((path) => ({ url: site.origin + path })),
    ...articles(true).map((a) => ({
      url: site.origin + '/blog/' + a.slug,
      lastModified: a.updatedAt || a.publishedAt,
    })),
    ...talks.map((e) => ({
      url: site.origin + '/speaking/' + e.slug,
      lastModified: e.publishedAt,
    })),
  ];
}
