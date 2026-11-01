import { test } from 'node:test';
import assert from 'node:assert/strict';
import { policy, site } from '../lib/site.mjs';
test('local drafts are visible, indexing remains disabled', () =>
  assert.deepEqual(policy({ NODE_ENV: 'development' }), {
    drafts: true,
    index: false,
  }));
test('preview drafts require explicit environment and enable setting', () => {
  assert.deepEqual(policy({ VERCEL_ENV: 'preview', NODE_ENV: 'production' }), {
    drafts: false,
    index: false,
  });
  assert.deepEqual(
    policy({
      VERCEL_ENV: 'preview',
      ENABLE_DRAFTS: 'true',
      NODE_ENV: 'production',
    }),
    { drafts: true, index: false },
  );
});
test('production is indexable and never enables drafts', () => {
  assert.deepEqual(
    policy({ VERCEL_ENV: 'production', ENABLE_DRAFTS: 'true' }),
    { drafts: false, index: true },
  );
  assert.deepEqual(
    policy({
      VERCEL_ENV: 'production',
      ENABLE_DRAFTS: 'true',
      NODE_ENV: 'production',
    }),
    { drafts: false, index: true },
  );
  assert.equal(policy({ NODE_ENV: 'development' }).index, false);
  assert.equal(site.origin, 'https://adamjamesturner93.co.uk');
});
