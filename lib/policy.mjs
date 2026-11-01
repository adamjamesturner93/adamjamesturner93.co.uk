// Compatibility exports for existing imports. Shared settings live in site.mjs.
export { policy } from './site.mjs';
export { validateEntry as validate, categories } from './content/core.mjs';
import { site } from './site.mjs';
export const origin = site.origin;
