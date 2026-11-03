import { test, expect } from '@playwright/test';
import {
  loadCollection,
  visibleEntries,
  relatedEntries,
} from '../../lib/content/core.mjs';
import { tagRegistry } from '../../lib/content/tags.mjs';
import { readingMinutes } from '../../lib/reading-time.mjs';

const published = visibleEntries(loadCollection('blog'), {
  env: { NODE_ENV: 'production', VERCEL_ENV: 'production' },
});

test('published topics and reading time wrap in both themes and respect publication controls', async ({
  page,
}) => {
  test.skip(published.length === 0, 'No published articles to inspect');
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/blog');
      for (const article of published) {
        const card = page.locator('.story').filter({
          has: page.locator(`h2 a[href="/blog/${article.slug}"]`),
        });
        await expect(card.locator('.topic-chip')).toHaveText(
          article.tags.slice(0, 3).map((tag) => tagRegistry[tag].label),
        );
      }
      const article =
        published.find((entry) => entry.tags.length > 3) || published[0];
      await page.goto('/blog/' + article.slug);
      await expect(page.locator('.article-topics .topic-chip')).toHaveText(
        article.tags.map((tag) => tagRegistry[tag].label),
      );
      await expect(page.locator('.article-topics')).toHaveCount(
        article.tags.length ? 1 : 0,
      );
      await expect(
        page.locator('.article-byline .article-reading-time'),
      ).toHaveText(
        `Estimated reading time: ${readingMinutes(article.body, article.extension)} min read`,
      );
      await expect(
        page.locator('.article-topics a, .article-topics button'),
      ).toHaveCount(0);
      const related = relatedEntries(article, published);
      await expect(page.locator('.related-section')).toHaveCount(
        related.length ? 1 : 0,
      );
      await expect(page.locator('.related-section .story h2 a')).toHaveCount(
        related.length,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator('.article-header').screenshot({
        path: `test-results/article-metadata-${width}-${theme}.png`,
      });
      if (article.tags.length)
        await page.locator('.article-topics').screenshot({
          path: `test-results/article-topics-${width}-${theme}.png`,
        });
    }
  }
});
