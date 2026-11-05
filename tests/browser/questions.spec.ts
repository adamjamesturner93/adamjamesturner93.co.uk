import { test, expect } from '@playwright/test';
test('reflection questions fit the reading column in both themes', async ({
  page,
}) => {
  for (const width of [320, 768, 1440])
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme });
      await page.goto('/blog/making-annual-reviews-valuable');
      const section = page.getByRole('region', {
        name: 'Questions worth asking',
      });
      await expect(section.getByRole('heading', { level: 2 })).toHaveCount(1);
      await expect(section.getByRole('listitem')).toHaveCount(3);
      await expect(page.locator('h1')).toHaveText(
        'What makes an annual review valuable?',
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await section.screenshot({
        path: `test-results/questions-${width}-${colorScheme}.png`,
      });
    }
});
