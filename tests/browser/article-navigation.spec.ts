import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark'] as const) {
  test(`article navigation supports keyboard and mobile in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.goto('/blog/data-migrations-moving-more-than-just-data');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip')).toBeFocused();
    expect(
      await page
        .locator('.skip')
        .evaluate((e) => e.getBoundingClientRect().top),
    ).toBeGreaterThanOrEqual(0);
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    const toc = page.getByRole('navigation', {
      name: 'On this page',
      exact: true,
    });
    await expect(toc).toBeVisible();
    const link = toc.getByRole('link').first();
    const href = await link.getAttribute('href');
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(href!)).toBeFocused();
    await page.evaluate(() => window.scrollTo(0, innerHeight + 500));
    const top = page.getByRole('button', { name: 'Back to top of article' });
    await expect(top).toBeVisible();
    await top.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#article-top')).toBeFocused();
    await expect(top).toBeHidden();
    expect(await page.evaluate(() => scrollY)).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto('/about');
    await expect(
      page.getByRole('button', { name: 'Back to top of article' }),
    ).toHaveCount(0);
  });
}
