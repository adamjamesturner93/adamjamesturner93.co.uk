import { site } from './site.mjs';
export function articleShareLinks(slug, title) {
  const url = new URL('/blog/' + encodeURIComponent(slug), site.origin).href;
  return {
    url,
    linkedin:
      'https://www.linkedin.com/sharing/share-offsite/?' +
      new URLSearchParams({ url }),
    whatsapp:
      'https://wa.me/?' + new URLSearchParams({ text: title + '\n' + url }),
    x:
      'https://twitter.com/intent/tweet?' +
      new URLSearchParams({ text: title, url }),
    email:
      'mailto:?' +
      new URLSearchParams({ subject: title, body: title + '\n\n' + url })
        .toString()
        .replaceAll('+', '%20'),
  };
}
