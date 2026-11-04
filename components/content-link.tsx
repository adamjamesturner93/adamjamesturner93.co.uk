import type { ComponentProps } from 'react';
import { isExternalLink } from '../lib/links.mjs';

export default function ContentLink({
  href,
  ...props
}: ComponentProps<'a'> & { node?: unknown }) {
  // ReactMarkdown supplies an AST node that must not become an HTML attribute.
  delete props.node;
  return (
    <a
      {...props}
      href={href}
      {...(isExternalLink(href)
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
          }
        : {})}
    />
  );
}
