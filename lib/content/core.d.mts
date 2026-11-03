import type { TagId } from './tags.mjs';
export type Category =
  | 'engineering-leadership'
  | 'technology-strategy'
  | 'responsible-change'
  | 'people-and-organisations'
  | 'general';
export type BaseEntry = {
  title: string;
  slug: string;
  description: string;
  date: string;
  draft: boolean;
  illustrative?: boolean;
  publishedAt?: string;
  coverImage: string;
  coverImageAlt?: string;
  body: string;
  extension: string;
};
export type BlogEntry = BaseEntry & {
  collection: 'blog';
  tags: TagId[];
  category: Category;
  updatedAt?: string;
  relatedArticles?: string[];
};
export type SpeakingEntry = BaseEntry & {
  collection: 'speaking';
  eventName: string;
  format: 'conference' | 'meetup' | 'webinar' | 'panel' | 'workshop' | 'other';
  status: 'proposed' | 'submitted' | 'confirmed' | 'delivered';
  eventDate?: string;
  location?: string;
  eventUrl?: string;
  slidesUrl?: string;
  videoUrl?: string;
};
export const categories: Record<Category, string>;
export const formats: string[];
export const statuses: string[];
export const slugPattern: RegExp;
export function isoDate(value: unknown): boolean;
export function validateEntry(
  data: Record<string, unknown>,
  options?: {
    collection?: 'blog' | 'speaking';
    filename?: string;
    root?: string;
    body?: string;
  },
): Record<string, unknown>;
export function loadCollection(collection: 'blog', root?: string): BlogEntry[];
export function loadCollection(
  collection: 'speaking',
  root?: string,
): SpeakingEntry[];
export function visibleEntries<T extends BaseEntry>(
  entries: T[],
  options?: {
    publishedOnly?: boolean;
    env?: NodeJS.ProcessEnv;
    today?: string;
  },
): T[];
export function relatedEntries(
  entry: BlogEntry,
  entries: BlogEntry[],
): BlogEntry[];
