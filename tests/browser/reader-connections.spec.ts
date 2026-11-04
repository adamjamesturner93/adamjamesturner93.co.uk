import { test, expect } from '@playwright/test';
const article = '/blog/making-annual-reviews-valuable';
const draft = '/blog/feedback-isnt-a-gift-its-a-dance';

test('author connections wrap in both themes and unpublished links stay plain text', async ({
  page,
  request,
}) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(article);
    const author = page.getByRole('complementary', {
      name: 'About the author',
    });
    await expect(
      author.getByRole('link', { name: /Connect with me/ }),
    ).toHaveAttribute('target', '_blank');
    await expect(
      author.getByRole('link', { name: /More about me/ }),
    ).toHaveAttribute('href', '/about');
    await expect(
      author.getByRole('link', { name: /subscribe via RSS/ }),
    ).toHaveAttribute('href', '/rss.xml');
    await expect(page.locator(`a[href="${draft}"]`)).toHaveCount(0);
    await expect(page.locator('.prose')).toContainText(
      'how can we make feedback a conversation',
    );
    await author.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/author-${theme}.png`,
      animations: 'disabled',
    });
  }
  expect((await request.get(draft)).status()).toBe(404);
  for (const url of ['/rss.xml', '/sitemap.xml'])
    expect(await (await request.get(url)).text()).not.toContain(
      'feedback-isnt-a-gift-its-a-dance',
    );
});

test('interaction events respect consent and distinguish successful sharing from attempts', async ({
  page,
  context,
}) => {
  test.skip(
    process.env.TEST_ANALYTICS !== 'production',
    'Requires production analytics test build',
  );
  await context.route(
    /https:\/\/[^/]*(googletagmanager|google-analytics)\.com\//,
    (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: '/* intercepted */',
      }),
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => {} },
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {},
    });
    document.addEventListener('click', (event) => {
      if ((event.target as Element).closest?.('a[data-analytics-event]'))
        event.preventDefault();
    });
  });
  await page.goto(article);
  const events = () =>
    page.evaluate(() => {
      const w = window as unknown as { dataLayer?: Array<ArrayLike<unknown>> };
      return (w.dataLayer || [])
        .map((value) => Array.from(value))
        .filter((value) => value[0] === 'event');
    });
  await page
    .locator('.article-author a[data-analytics-event="linkedin_connect_click"]')
    .click();
  expect(await events()).toEqual([]);
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  await page.getByRole('button', { name: 'Copy link', exact: true }).click();
  expect(await events()).toEqual([]);
  await page
    .getByRole('button', { name: 'Cookie preferences', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Allow analytics', exact: true })
    .click();
  await page.waitForFunction(
    () => typeof (window as unknown as { gtag?: unknown }).gtag === 'function',
  );
  expect(await events()).toEqual([]);
  await page
    .locator('.article-author a[data-analytics-event="linkedin_connect_click"]')
    .click();
  for (const method of ['linkedin', 'whatsapp', 'x', 'email'])
    await page.locator(`a[data-method="${method}"]`).click();
  await page.getByRole('button', { name: 'Copy link', exact: true }).click();
  await page.getByRole('button', { name: /More options/ }).click();
  await page
    .locator('.article-author a[data-analytics-event="rss_click"]')
    .click();
  const recorded = await events();
  expect(recorded).toHaveLength(8);
  expect(recorded[0]).toEqual([
    'event',
    'linkedin_connect_click',
    {
      placement: 'article_author',
      article_slug: 'making-annual-reviews-valuable',
    },
  ]);
  expect(recorded.slice(1, 5).map((event) => event[2])).toEqual(
    ['linkedin', 'whatsapp', 'x', 'email'].map((method) => ({
      method,
      article_slug: 'making-annual-reviews-valuable',
    })),
  );
  expect(recorded[5][1]).toBe('article_link_copy');
  expect(recorded[6][1]).toBe('article_native_share');
  expect(recorded[7][1]).toBe('rss_click');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => {
        throw new DOMException('Cancelled', 'AbortError');
      },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw Error('Denied');
        },
      },
    });
  });
  await page.getByRole('button', { name: /More options/ }).click();
  await page.getByRole('button', { name: 'Copy link', exact: true }).click();
  expect(await events()).toHaveLength(8);
  await page
    .getByRole('button', { name: 'Cookie preferences', exact: true })
    .click();
  await page.getByRole('button', { name: 'No thanks', exact: true }).click();
  await page.waitForFunction(
    () =>
      localStorage.getItem('adam-analytics-consent-v1') === 'rejected' &&
      !document.getElementById('ga4-library'),
  );
  await page
    .locator('.article-author a[data-analytics-event="rss_click"]')
    .click();
  expect(await events()).toEqual([]);
});

test('in-memory consent tracks connections when local storage is unavailable', async ({
  page,
  context,
}) => {
  test.skip(
    process.env.TEST_ANALYTICS !== 'production',
    'Requires production analytics test build',
  );
  await context.route(
    /https:\/\/[^/]*(googletagmanager|google-analytics)\.com\//,
    (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: '/* intercepted */',
      }),
  );
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    document.addEventListener('click', (event) => {
      if ((event.target as Element).closest?.('a[data-analytics-event]'))
        event.preventDefault();
    });
  });
  await page.goto('/about');
  await page
    .getByRole('button', { name: 'Allow analytics', exact: true })
    .click();
  await page.waitForFunction(
    () => typeof (window as unknown as { gtag?: unknown }).gtag === 'function',
  );
  await page.locator('a[data-placement="about"]').click();
  const events = await page.evaluate(() =>
    (window as unknown as { dataLayer: Array<ArrayLike<unknown>> }).dataLayer
      .map((value) => Array.from(value))
      .filter((value) => value[0] === 'event'),
  );
  expect(events).toEqual([
    ['event', 'linkedin_connect_click', { placement: 'about' }],
  ]);
});
