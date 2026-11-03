import { test, expect } from '@playwright/test';
test('themes, responsive pages, system changes and navigation', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/blog');
      const articleLinks = page.locator('.story h2 a');
      const articlePath = (await articleLinks.count())
        ? await articleLinks.first().getAttribute('href')
        : null;
      for (const path of [
        '/',
        '/about',
        '/blog',
        ...(articlePath ? [articlePath] : []),
        '/privacy',
      ]) {
        await page.goto(path);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('html')).toHaveCSS('color-scheme', theme);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          animations: 'disabled',
          path: `test-results/${path.replaceAll('/', '-') || 'home'}-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
  }
  const selector = page.getByRole('button', { name: /^Colour theme:/ });
  async function choose(value: string) {
    await selector.click();
    await page.getByRole('button', { name: value, exact: true }).click();
    await page.keyboard.press('Escape');
  }
  await choose('Light');
  await page.reload();
  await expect(selector).toHaveAccessibleName('Colour theme: light');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  const other = await context.newPage();
  await other.goto('/');
  await other.getByRole('button', { name: /^Colour theme:/ }).click();
  await other.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(selector).toHaveAccessibleName('Colour theme: dark');
  await choose('System');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.setViewportSize({ width: 375, height: 900 });
  await page.locator('summary').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.mobile-menu')).not.toHaveAttribute('open');
  await expect(page.locator('summary')).toBeFocused();
  expect(errors).toEqual([]);
});
test('theme falls back when storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw Error('blocked');
      },
    });
  });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.getByRole('button', { name: /^Colour theme:/ }).click();
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
});
test('cookie consent gates requests and supports withdrawal', async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.TEST_ANALYTICS,
    'Requires production with GA ID, or local ANALYTICS_DEMO=true',
  );
  const requests: string[] = [];
  await context.route(
    /https:\/\/[^/]*(googletagmanager|google-analytics)\.com\//,
    (route) => {
      requests.push(route.request().url());
      return route.fulfill({
        contentType: 'text/javascript',
        body: '/* intercepted */',
      });
    },
  );
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'No thanks', exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(0);
  for (const width of [375, 1440]) {
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        animations: 'disabled',
        path: `test-results/cookies-${width}-${colorScheme}.png`,
      });
    }
  }
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  await page.reload();
  await expect(page.locator('.analytics-banner')).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await page
    .getByRole('button', { name: 'Cookie preferences', exact: true })
    .click();
  await expect(page.locator('.analytics-banner')).toBeFocused();
  await page
    .getByRole('button', { name: 'Allow analytics', exact: true })
    .click();
  if (process.env.TEST_ANALYTICS === 'demo') {
    await expect(page.locator('#ga4-library')).toHaveCount(0);
    expect(requests).toHaveLength(0);
    return;
  }
  await expect(page.locator('#ga4-library')).toHaveCount(1);
  const other = await context.newPage();
  await other.goto('/about');
  await expect(other.locator('#ga4-library')).toHaveCount(1);
  await context.addCookies([{ name: '_ga', value: 'test', url: page.url() }]);
  await page
    .getByRole('button', { name: 'Cookie preferences', exact: true })
    .click();
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  await expect(page.locator('#ga4-library')).toHaveCount(0);
  await expect(other.locator('#ga4-library')).toHaveCount(0);
  expect(
    (await context.cookies()).filter((c) => c.name === '_ga'),
  ).toHaveLength(0);
});

test('system theme works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await context.close();
});
