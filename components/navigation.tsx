'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
export default function Navigation({ hasSpeaking }: { hasSpeaking: boolean }) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const links = (
    <>
      <Link
        href="/blog"
        aria-current={pathname.startsWith('/blog') ? 'page' : undefined}
      >
        Blog
      </Link>
      <Link
        href="/about"
        aria-current={pathname === '/about' ? 'page' : undefined}
      >
        About
      </Link>
      {hasSpeaking && (
        <Link
          href="/speaking"
          aria-current={pathname.startsWith('/speaking') ? 'page' : undefined}
        >
          Speaking
        </Link>
      )}
    </>
  );
  return (
    <>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links}
      </nav>
      <details
        ref={menu}
        className="mobile-menu"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            menu.current?.removeAttribute('open');
            menu.current?.querySelector('summary')?.focus();
          }
        }}
      >
        <summary>
          Menu <span aria-hidden="true">＋</span>
        </summary>
        <nav
          aria-label="Mobile navigation"
          onClick={() => menu.current?.removeAttribute('open')}
        >
          {links}
        </nav>
      </details>
    </>
  );
}
