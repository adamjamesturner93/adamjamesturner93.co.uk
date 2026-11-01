import { loadCollection, visibleEntries } from './content/core.mjs';
export { categories, relatedEntries } from './content/core.mjs';
export type { BlogEntry as Article, SpeakingEntry } from './content/core.mjs';
export function articles(publishedOnly = false) {
  return visibleEntries(loadCollection('blog'), { publishedOnly });
}
export function speaking(publishedOnly = false) {
  return visibleEntries(loadCollection('speaking'), { publishedOnly });
}
