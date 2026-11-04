'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ThemeSelector from './theme-selector';
export default function Navigation({ hasSpeaking }: { hasSpeaking: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target))
        setOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
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
    <div
      ref={menu}
      className="header-controls"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          toggle.current?.focus({ preventScroll: true });
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={toggle}
        className="mobile-menu-toggle"
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="header-menu"
        onClick={() => setOpen(!open)}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="m6 6 12 12M6 18 18 6" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      <div id="header-menu" className={`header-menu${open ? ' is-open' : ''}`}>
        <nav
          className="main-nav"
          aria-label="Main navigation"
          onClick={() => setOpen(false)}
        >
          {links}
        </nav>
        <ThemeSelector />
      </div>
    </div>
  );
}
