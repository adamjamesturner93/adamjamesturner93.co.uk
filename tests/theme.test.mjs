import vm from 'node:vm';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTheme, resolveTheme, themeBootstrap } from '../lib/theme.mjs';
import { analyticsDemo } from '../lib/analytics.mjs';
import { policy } from '../lib/site.mjs';
test('theme defaults and explicit preferences', () => {
  for (const value of [null, undefined, 'unknown', 'system']) {
    assert.equal(parseTheme(value), 'system');
    assert.equal(resolveTheme(value, true), 'dark');
    assert.equal(resolveTheme(value, false), 'light');
  }
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});
test('demo is exclusively local and production is automatically indexable', () => {
  assert.equal(
    analyticsDemo({ NODE_ENV: 'development', ANALYTICS_DEMO: 'true' }),
    true,
  );
  for (const VERCEL_ENV of ['preview', 'production', 'development'])
    assert.equal(
      analyticsDemo({
        NODE_ENV: 'development',
        ANALYTICS_DEMO: 'true',
        VERCEL_ENV,
      }),
      false,
    );
  assert.equal(
    analyticsDemo({ NODE_ENV: 'production', ANALYTICS_DEMO: 'true' }),
    false,
  );
  assert.equal(policy({ NODE_ENV: 'production' }).index, true);
  assert.equal(
    policy({ NODE_ENV: 'production', VERCEL_ENV: 'development' }).index,
    false,
  );
});

test('bootstrap applies only valid explicit preferences before hydration', () => {
  for (const value of ['light', 'dark', null, 'invalid']) {
    const document = { documentElement: { dataset: {} } };
    vm.runInNewContext(themeBootstrap, {
      document,
      localStorage: { getItem: () => value },
    });
    assert.equal(
      document.documentElement.dataset.theme,
      ['light', 'dark'].includes(value) ? value : undefined,
    );
  }
  assert.doesNotThrow(() =>
    vm.runInNewContext(themeBootstrap, {
      localStorage: {
        getItem() {
          throw Error('blocked');
        },
      },
    }),
  );
});
