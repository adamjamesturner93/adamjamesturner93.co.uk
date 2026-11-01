import { site, policy } from '../lib/site.mjs';
export default function robots() {
  return {
    rules: policy().index
      ? { userAgent: '*', allow: '/' }
      : { userAgent: '*', disallow: '/' },
    ...(policy().index ? { sitemap: site.origin + '/sitemap.xml' } : {}),
  };
}
