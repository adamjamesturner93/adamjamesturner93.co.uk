import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  startAnalyticsEvents,
  stopAnalyticsEvents,
  trackAnalyticsEvent,
} from '../lib/analytics-events.mjs';
function fixture() {
  const calls = [];
  const listeners = new Set();
  const browser = {
    document: {
      addEventListener: (_, fn) => listeners.add(fn),
      removeEventListener: (_, fn) => listeners.delete(fn),
    },
    gtag: (...args) => calls.push(args),
  };
  return { browser, calls, listeners };
}
test('events are dropped before activation, GA readiness and after revocation', () => {
  const { browser, calls } = fixture();
  trackAnalyticsEvent(browser, 'rss_click');
  assert.equal(calls.length, 0);
  const ready = browser.gtag;
  delete browser.gtag;
  const stop = startAnalyticsEvents(browser);
  trackAnalyticsEvent(browser, 'rss_click');
  browser.gtag = ready;
  assert.equal(calls.length, 0);
  trackAnalyticsEvent(browser, 'rss_click');
  assert.equal(calls.length, 1);
  stopAnalyticsEvents(browser);
  trackAnalyticsEvent(browser, 'rss_click');
  assert.equal(calls.length, 1);
  stop();
});
test('delegated events include only bounded metadata and clean up their listener', () => {
  const { browser, calls, listeners } = fixture();
  const stop = startAnalyticsEvents(browser);
  const click = [...listeners][0];
  click({
    target: {
      closest: () => ({
        dataset: {
          analyticsEvent: 'article_share_click',
          method: 'linkedin',
          articleSlug: 'annual-reviews',
          placement: 'article_author',
        },
      }),
    },
  });
  assert.deepEqual(calls, [
    [
      'event',
      'article_share_click',
      {
        placement: 'article_author',
        method: 'linkedin',
        article_slug: 'annual-reviews',
      },
    ],
  ]);
  for (const name of [
    'linkedin_connect_click',
    'rss_click',
    'article_link_copy',
    'article_native_share',
  ])
    trackAnalyticsEvent(browser, name, {
      placement: 'private value',
      method: 'arbitrary',
      article_slug: 'slug?secret=1',
      extra: 'secret',
    });
  assert.ok(calls.slice(1).every((call) => Object.keys(call[2]).length === 0));
  trackAnalyticsEvent(browser, 'unregistered');
  assert.equal(calls.length, 5);
  stop();
  assert.equal(listeners.size, 0);
});
