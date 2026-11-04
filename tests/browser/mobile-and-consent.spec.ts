import { test, expect } from '@playwright/test';
import { site } from '../../lib/site.mjs';

test('hamburger contains navigation and appearance controls on mobile', async ({
  page,
}) => {
  for (const width of [320, 375, 700]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Open menu', exact: true });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.theme-trigger')).toBeHidden();
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeHidden();
    await toggle.click();
    await expect(
      page.getByRole('button', { name: 'Close menu', exact: true }),
    ).toHaveAttribute('aria-expanded', 'true');
    const navigation = page.getByRole('navigation', {
      name: 'Main navigation',
    });
    await expect(
      navigation.getByRole('link', { name: 'Blog', exact: true }),
    ).toBeVisible();
    await expect(
      navigation.getByRole('link', { name: 'About', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'Colour theme' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
    await expect(
      page.getByRole('button', { name: 'Dark', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      animations: 'disabled',
      path: `test-results/hamburger-${width}-dark.png`,
    });
    await page.getByRole('button', { name: 'Light', exact: true }).click();
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
    await expect(
      navigation.getByRole('link', { name: 'About', exact: true }),
    ).toHaveCSS('color', 'rgb(24, 36, 59)');
    await page.screenshot({
      animations: 'disabled',
      path: `test-results/hamburger-${width}-light.png`,
    });
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.press('Enter');
    await page.keyboard.press('Tab');
    await expect(
      navigation.getByRole('link', { name: 'Blog', exact: true }),
    ).toBeFocused();
    await navigation.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await page.mouse.click(5, 140);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.mobile-menu-toggle')).toBeHidden();
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /^Colour theme:/ }),
  ).toBeVisible();
});

for (const choice of ['Allow analytics', 'No thanks']) {
  for (const width of [375, 1440]) {
    test(`${choice} preserves scroll position at ${width}px`, async ({
      page,
      context,
    }) => {
      test.skip(
        !process.env.TEST_ANALYTICS,
        'Requires analytics or local demo mode',
      );
      await context.route(
        /https:\/\/[^/]*(googletagmanager|google-analytics)\.com\//,
        (route) =>
          route.fulfill({
            contentType: 'text/javascript',
            body: '/* intercepted */',
          }),
      );
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/about');
      await expect(page.locator('.analytics-banner')).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 350));
      const before = await page.evaluate(() => scrollY);
      expect(before).toBeGreaterThan(0);
      await page.getByRole('button', { name: choice, exact: true }).click();
      await expect(page.locator('.analytics-banner')).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(before);
      const expectedScripts =
        process.env.TEST_ANALYTICS === 'production' &&
        choice === 'Allow analytics'
          ? 1
          : 0;
      await expect(page.locator('#ga4-library')).toHaveCount(expectedScripts);
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(before);
    });
  }
}

test('external web links open a new tab while internal links stay in the site', async ({
  page,
  context,
}) => {
  await context.route('https://www.linkedin.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<h1>External destination</h1>',
    }),
  );
  await page.goto('/blog');
  const articlePath = await page
    .locator('.story h2 a')
    .first()
    .getAttribute('href');
  let externalCount = 0;
  for (const path of [
    '/',
    '/about',
    '/privacy',
    ...(articlePath ? [articlePath] : []),
  ]) {
    await page.goto(path);
    const links = await page.locator('a[href]').evaluateAll(
      (anchors, origin) =>
        anchors.map((anchor) => {
          const href = anchor.getAttribute('href')!;
          const url = new URL(href, origin);
          return {
            href,
            external:
              ['http:', 'https:'].includes(url.protocol) &&
              url.origin !== origin,
            target: anchor.getAttribute('target'),
            rel: anchor.getAttribute('rel'),
          };
        }),
      site.origin,
    );
    for (const link of links) {
      if (link.external) {
        externalCount++;
        expect(link.target, link.href).toBe('_blank');
        expect(link.rel?.split(/\s+/), link.href).toEqual(
          expect.arrayContaining(['noopener', 'noreferrer']),
        );
      } else {
        expect(link.target, link.href).not.toBe('_blank');
      }
    }
  }
  expect(externalCount).toBeGreaterThan(0);
  const original = page.url();
  const popupPromise = page.waitForEvent('popup');
  await page
    .locator('.site-footer')
    .getByRole('link', { name: 'LinkedIn' })
    .click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  expect(await popup.evaluate(() => window.opener === null)).toBe(true);
  expect(page.url()).toBe(original);
  await popup.close();
});
