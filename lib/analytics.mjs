import { policy } from './site.mjs';
export function analyticsDemo(env = process.env) {
  return (
    !env.VERCEL_ENV &&
    env.NODE_ENV === 'development' &&
    env.ANALYTICS_DEMO === 'true'
  );
}
export const consentKey = 'adam-analytics-consent-v1';
export function parseConsent(value) {
  return value === 'accepted' || value === 'rejected' ? value : null;
}
export function analyticsId(env = process.env) {
  const id = env.GA_MEASUREMENT_ID?.trim();
  if (id && !/^G-[A-Z0-9]+$/.test(id))
    throw Error('GA_MEASUREMENT_ID must be a GA4 identifier beginning G-');
  return policy(env).index && id ? id : null;
}
