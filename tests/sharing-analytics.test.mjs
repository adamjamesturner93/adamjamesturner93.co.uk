import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleShareLinks } from '../lib/sharing.mjs';
import { analyticsId, parseConsent } from '../lib/analytics.mjs';
import { site } from '../lib/site.mjs';
test('sharing preserves article titles and uses canonical URLs on all services', () => {
  const title = 'People & change: why “fast” isn’t always simple?';
  const links = articleShareLinks('people-and-change', title);
  assert.equal(links.url, site.origin + '/blog/people-and-change');
  assert.equal(new URL(links.linkedin).searchParams.get('url'), links.url);
  assert.equal(
    new URL(links.whatsapp).searchParams.get('text'),
    title + '\n' + links.url,
  );
  assert.equal(new URL(links.x).searchParams.get('url'), links.url);
  assert.equal(new URL(links.x).searchParams.get('text'), title);
  assert.equal(new URL(links.email).searchParams.get('subject'), title);
  assert.equal(
    new URL(links.email).searchParams.get('body'),
    title + '\n\n' + links.url,
  );
  assert.ok(!JSON.stringify(links).includes('localhost'));
});
test('GA4 requires a valid ID and live production; development and preview stay off', () => {
  const config = { GA_MEASUREMENT_ID: 'G-TEST123456', NODE_ENV: 'production' };
  assert.equal(
    analyticsId({ ...config, VERCEL_ENV: 'production' }),
    config.GA_MEASUREMENT_ID,
  );
  assert.equal(analyticsId({ ...config, NODE_ENV: 'development' }), null);
  assert.equal(
    analyticsId({ ...config, VERCEL_ENV: 'preview', ENABLE_DRAFTS: 'true' }),
    null,
  );
  assert.equal(
    analyticsId({ NODE_ENV: 'production', VERCEL_ENV: 'production' }),
    null,
  );
  assert.throws(
    () => analyticsId({ ...config, GA_MEASUREMENT_ID: 'G-<script>' }),
    /GA_MEASUREMENT_ID/,
  );
  assert.throws(() => analyticsId({ ...config, GA_MEASUREMENT_ID: 'UA-123' }));
});
test('analytics consent only recognises deliberate stored choices', () => {
  assert.equal(parseConsent('accepted'), 'accepted');
  assert.equal(parseConsent('rejected'), 'rejected');
  for (const value of [null, undefined, 'true', 'yes', '', true, 'unknown'])
    assert.equal(parseConsent(value), null);
});
