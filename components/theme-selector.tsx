'use client';
import { useEffect, useState } from 'react';
import { parseTheme, themeKey, type Theme } from '../lib/theme.mjs';
export default function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>('system');
  useEffect(() => {
    function read() {
      let next: Theme = 'system';
      try {
        next = parseTheme(localStorage.getItem(themeKey));
      } catch {}
      setTheme(next);
      if (next === 'system')
        document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', next);
    }
    read();
    function changed(event: StorageEvent) {
      if (event.key === themeKey || event.key === null) read();
    }
    function closePanel() {
      document.getElementById('theme-options')?.hidePopover();
    }
    window.addEventListener('storage', changed);
    window.addEventListener('resize', closePanel);
    window.addEventListener('scroll', closePanel, true);
    return () => {
      window.removeEventListener('storage', changed);
      window.removeEventListener('resize', closePanel);
      window.removeEventListener('scroll', closePanel, true);
    };
  }, []);
  function choose(next: Theme) {
    setTheme(next);
    if (next === 'system')
      document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', next);
    try {
      if (next === 'system') localStorage.removeItem(themeKey);
      else localStorage.setItem(themeKey, next);
    } catch {}
  }
  return (
    <div className="theme-selector">
      <button
        className="theme-trigger"
        type="button"
        popoverTarget="theme-options"
        onClick={(event) => {
          const button = event.currentTarget.getBoundingClientRect();
          const panel = document.getElementById('theme-options');
          if (panel) {
            panel.style.top = `${button.bottom + 8}px`;
            panel.style.right = `${window.innerWidth - button.right}px`;
          }
        }}
        aria-label={`Colour theme: ${theme}`}
        title={`Colour theme: ${theme}`}
      >
        <ThemeIcon theme={theme} />
      </button>
      <div id="theme-options" className="theme-options" popover="auto">
        <p>Appearance</p>
        <div role="group" aria-label="Colour theme">
          {(['system', 'light', 'dark'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={theme === option}
              onClick={() => choose(option)}
            >
              <ThemeIcon theme={option} />
              <span>{option[0].toUpperCase() + option.slice(1)}</span>
              <span className="theme-check" aria-hidden="true">
                {theme === option ? '✓' : ''}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
function ThemeIcon({ theme }: { theme: Theme }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {theme === 'system' ? (
        <>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </>
      ) : theme === 'light' ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </>
      ) : (
        <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />
      )}
    </svg>
  );
}
