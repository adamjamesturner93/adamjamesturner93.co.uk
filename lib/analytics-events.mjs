const active = new WeakSet();
const methods = new Set(['linkedin', 'whatsapp', 'x', 'email']);
const placements = new Set(['article_author', 'about', 'footer']);
const names = new Set([
  'linkedin_connect_click',
  'article_share_click',
  'article_link_copy',
  'article_native_share',
  'rss_click',
]);
export function stopAnalyticsEvents(browser) {
  active.delete(browser);
}
export function trackAnalyticsEvent(browser, name, values = {}) {
  if (
    !active.has(browser) ||
    typeof browser.gtag !== 'function' ||
    !names.has(name)
  )
    return;
  const params = {};
  if (placements.has(values.placement)) params.placement = values.placement;
  if (methods.has(values.method)) params.method = values.method;
  if (
    typeof values.article_slug === 'string' &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.article_slug)
  )
    params.article_slug = values.article_slug;
  browser.gtag('event', name, params);
}
// Mounted only by the live, consented analytics UI. No pre-consent queue.
export function startAnalyticsEvents(browser) {
  active.add(browser);
  function clicked(event) {
    const link = event.target?.closest?.('a[data-analytics-event]');
    if (!link) return;
    trackAnalyticsEvent(browser, link.dataset.analyticsEvent, {
      placement: link.dataset.placement,
      article_slug: link.dataset.articleSlug,
      method: link.dataset.method,
    });
  }
  browser.document.addEventListener('click', clicked);
  return () => {
    stopAnalyticsEvents(browser);
    browser.document.removeEventListener('click', clicked);
  };
}
