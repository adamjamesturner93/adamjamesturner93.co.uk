'use client';
import { useRef, useState, useEffect, useSyncExternalStore } from 'react';
const subscribe = () => () => {};
export default function ShareActions({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [message, setMessage] = useState('');
  const [manual, setManual] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const native = useSyncExternalStore(
    subscribe,
    () => window.isSecureContext && typeof navigator.share === 'function',
    () => false,
  );
  useEffect(() => {
    if (manual) {
      input.current?.focus();
      input.current?.select();
    }
  }, [manual]);
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setManual(false);
      setMessage('Link copied.');
    } catch {
      setManual(true);
      setMessage('Select and copy the article link below.');
    }
  }
  async function share() {
    setBusy(true);
    setMessage('');
    try {
      await navigator.share({ title, url });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError'))
        setMessage(
          'Sharing is unavailable here. Try a share link or copy the URL.',
        );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button type="button" className="share-control" onClick={copy}>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M15 8V4H4v11h4" />
        </svg>
        Copy link
      </button>
      {native && (
        <button
          type="button"
          className="share-control"
          onClick={share}
          disabled={busy}
        >
          More options <span aria-hidden="true">↗</span>
        </button>
      )}
      <span className="share-status" role="status">
        {message}
      </span>
      {manual && (
        <label className="share-manual">
          Article link
          <input
            ref={input}
            value={url}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
    </>
  );
}
