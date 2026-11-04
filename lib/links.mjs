import { site } from './site.mjs';

export function isExternalLink(href) {
  if (!href) return false;
  try {
    const url = new URL(href, site.origin);
    return (
      ['http:', 'https:'].includes(url.protocol) && url.origin !== site.origin
    );
  } catch {
    return false;
  }
}

// Explicit JSX anchors in MDX should use the same renderer as Markdown links.
export function remarkContentLinks() {
  return function transform(node) {
    if (node.type?.startsWith('mdxJsx') && node.name === 'a')
      node.name = 'ContentLink';
    for (const child of node.children || []) transform(child);
  };
}
