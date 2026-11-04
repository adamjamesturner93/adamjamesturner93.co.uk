export type AnalyticsEvent =
  | 'linkedin_connect_click'
  | 'article_share_click'
  | 'article_link_copy'
  | 'article_native_share'
  | 'rss_click';
export function trackAnalyticsEvent(
  browser: Window,
  name: AnalyticsEvent,
  values?: { placement?: string; method?: string; article_slug?: string },
): void;
export function startAnalyticsEvents(browser: Window): () => void;
export function stopAnalyticsEvents(browser: Window): void;
