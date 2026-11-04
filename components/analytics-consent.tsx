'use client';
import Script from 'next/script';
import Link from 'next/link';
import { useState, useSyncExternalStore, useRef, useEffect } from 'react';
import { consentKey, parseConsent } from '../lib/analytics.mjs';
type Consent = 'accepted' | 'rejected' | null;
function createConsentStore(storageKey: string) {
  let memory: Consent = null;
  function snapshot(): Consent {
    try {
      return memory ?? parseConsent(localStorage.getItem(storageKey));
    } catch {
      return memory;
    }
  }
  function subscribe(callback: () => void) {
    function changed(event: StorageEvent) {
      if (event.key !== null && event.key !== storageKey) return;
      memory = null;
      if (snapshot() !== 'accepted' && document.getElementById('ga4-library')) {
        clearAnalyticsCookies();
        location.reload();
        return;
      }
      callback();
    }
    window.addEventListener('storage', changed);
    window.addEventListener('analytics-consent-change', callback);
    return () => {
      window.removeEventListener('storage', changed);
      window.removeEventListener('analytics-consent-change', callback);
    };
  }
  return {
    snapshot,
    subscribe,
    save(value: Exclude<Consent, null>) {
      memory = value;
      try {
        localStorage.setItem(storageKey, value);
      } catch {}
      window.dispatchEvent(new Event('analytics-consent-change'));
    },
  };
}
const liveStore = createConsentStore(consentKey);
const demoStore = createConsentStore('adam-analytics-demo-v1');
function clearAnalyticsCookies() {
  for (const pair of document.cookie.split(';')) {
    const name = pair.trim().split('=')[0];
    if (name !== '_ga' && !name.startsWith('_ga_')) continue;
    const prefix = `${name}=; Max-Age=0; path=/`;
    document.cookie = prefix;
    const labels = location.hostname.split('.');
    for (let i = 0; i < labels.length - 1; i++) {
      const domain = labels.slice(i).join('.');
      document.cookie = prefix + '; domain=' + domain;
      document.cookie = prefix + '; domain=.' + domain;
    }
  }
}
export default function AnalyticsConsent({
  measurementId,
  demo = false,
}: {
  measurementId: string | null;
  demo?: boolean;
}) {
  const store = demo ? demoStore : liveStore;
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const consent = useSyncExternalStore(
    store.subscribe,
    store.snapshot,
    () => null,
  );
  const [open, setOpen] = useState(false);
  const visible = consent === null || open;
  useEffect(() => {
    if (open) panel.current?.focus({ preventScroll: true });
  }, [open]);
  function choose(value: Exclude<Consent, null>) {
    const revoke = consent === 'accepted' && value === 'rejected';
    store.save(value);
    setOpen(false);
    if (open) trigger.current?.focus({ preventScroll: true });
    if (revoke && !demo) {
      clearAnalyticsCookies();
      location.reload();
    }
  }
  return (
    <>
      <div className="analytics-preferences">
        <button
          ref={trigger}
          type="button"
          aria-expanded={visible}
          aria-controls={visible ? 'analytics-choice' : undefined}
          onClick={() => setOpen(!open)}
        >
          Cookie preferences
        </button>
      </div>
      {visible && (
        <section
          ref={panel}
          tabIndex={-1}
          id="analytics-choice"
          className="analytics-banner"
          aria-labelledby="analytics-heading"
        >
          <div>
            <h2 id="analytics-heading">Optional analytics cookies</h2>
            <p>
              With your permission, Google Analytics uses cookies to help me
              understand which articles people read. It’s optional.{' '}
              <Link href="/privacy">Privacy &amp; analytics</Link>
            </p>
          </div>
          {demo && (
            <p>
              <strong>Local demonstration:</strong> no information is sent to
              Google.
            </p>
          )}
          <div className="analytics-buttons">
            <button type="button" onClick={() => choose('rejected')}>
              No thanks
            </button>
            <button type="button" onClick={() => choose('accepted')}>
              Allow analytics
            </button>
            {open && consent !== null && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  trigger.current?.focus({ preventScroll: true });
                }}
              >
                Close preferences
              </button>
            )}
          </div>
        </section>
      )}
      {consent === 'accepted' && !demo && measurementId && (
        <>
          <Script
            id="ga4-initialise"
            strategy="afterInteractive"
          >{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('consent', 'default', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'}); gtag('js', new Date()); gtag('config', ${JSON.stringify(measurementId)}, {allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 63072000, cookie_update: true});`}</Script>
          <Script
            id="ga4-library"
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
        </>
      )}
    </>
  );
}
