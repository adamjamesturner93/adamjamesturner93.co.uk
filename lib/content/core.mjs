import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { policy } from '../site.mjs';
export const categories = Object.freeze({
  'engineering-leadership': 'Engineering leadership',
  'technology-strategy': 'Technology strategy',
  'responsible-change': 'Responsible change',
  'people-and-organisations': 'People & organisations',
  general: 'Ideas & questions',
});
export const formats = [
  'conference',
  'meetup',
  'webinar',
  'panel',
  'workshop',
  'other',
];
export const statuses = ['proposed', 'submitted', 'confirmed', 'delivered'];
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function isoDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
const unfinished =
  /\bDRAFT:|\bTODO\b|\bTBD\b|\bFIXME\b|\bREPLACE ME\b|\bWhat are the competing considerations\?|\bWhat changed in your understanding\?|\bAdd references, slides or recordings\.|\bWhat prompted this article\?|\bWhat should attendees learn\?|\bAdd event information when confirmed\.|\bAdd relevant, verifiable sources\.|\bWhat is the central argument\?/i;
export function validateEntry(
  data,
  { collection = 'blog', filename, root = process.cwd(), body = '' } = {},
) {
  const fail = (message) => {
    throw new Error(
      `${collection}/${filename || data.slug || '(unknown)'}: ${message}`,
    );
  };
  const required =
    collection === 'blog'
      ? ['title', 'slug', 'description', 'date', 'category', 'coverImage']
      : [
          'title',
          'slug',
          'eventName',
          'description',
          'date',
          'format',
          'status',
          'coverImage',
        ];
  for (const key of required)
    if (typeof data[key] !== 'string' || !data[key].trim())
      fail(`missing or invalid ${key}`);
  if (data.illustrative !== undefined && typeof data.illustrative !== 'boolean')
    fail('illustrative must be a boolean');
  if (typeof data.draft !== 'boolean') fail('draft must be a boolean');
  if (!slugPattern.test(data.slug)) fail('slug must be lowercase kebab-case');
  if (filename && path.basename(filename, path.extname(filename)) !== data.slug)
    fail('filename must match slug');
  if (collection === 'blog' && data.relatedArticles !== undefined) {
    if (
      !Array.isArray(data.relatedArticles) ||
      data.relatedArticles.some(
        (slug) => typeof slug !== 'string' || !slugPattern.test(slug),
      )
    )
      fail('relatedArticles must be a list of lowercase kebab-case slugs');
    if (new Set(data.relatedArticles).size !== data.relatedArticles.length)
      fail('relatedArticles contains duplicate slugs');
    if (data.relatedArticles.includes(data.slug))
      fail('relatedArticles cannot link to the current article');
  }
  if (!isoDate(data.date))
    fail('date must be a real ISO YYYY-MM-DD date (quote it in YAML)');
  for (const key of ['publishedAt', 'updatedAt', 'eventDate'])
    if (data[key] != null && !isoDate(data[key])) fail(`invalid ${key}`);
  if (collection === 'blog' && !Object.hasOwn(categories, data.category))
    fail('unknown category');
  if (
    collection === 'speaking' &&
    (!formats.includes(data.format) || !statuses.includes(data.status))
  )
    fail('unknown format or speaking status');
  for (const key of ['coverImageAlt', 'location'])
    if (data[key] != null && typeof data[key] !== 'string')
      fail(`invalid ${key}`);
  for (const key of ['eventUrl', 'slidesUrl', 'videoUrl'])
    if (data[key]) {
      try {
        const u = new URL(data[key]);
        if (!['https:', 'http:'].includes(u.protocol)) fail(`invalid ${key}`);
      } catch {
        fail(`invalid ${key}`);
      }
    }
  const image = data.coverImage;
  if (
    !/^\/images\/[a-zA-Z0-9/_-]+\.(svg|png|jpe?g|webp|avif)$/.test(image) ||
    image.includes('..')
  )
    fail('coverImage must be a local /images/ path');
  const publicRoot = path.join(root, 'public');
  const imageFile = path.join(publicRoot, image.slice(1));
  if (!fs.existsSync(imageFile) || !fs.statSync(imageFile).isFile())
    fail('coverImage file does not exist');
  if (
    !fs
      .realpathSync(imageFile)
      .startsWith(fs.realpathSync(publicRoot) + path.sep)
  )
    fail('coverImage must remain inside public/');
  if (!data.draft) {
    if (!isoDate(data.publishedAt))
      fail('published entries require publishedAt');
    if (
      Object.values(data).some(
        (v) => typeof v === 'string' && unfinished.test(v),
      ) ||
      unfinished.test(body)
    )
      fail('published content contains unfinished scaffold placeholders');
    if (
      collection === 'speaking' &&
      (!['confirmed', 'delivered'].includes(data.status) ||
        !isoDate(data.eventDate))
    )
      fail(
        'published speaking requires confirmed/delivered status and eventDate',
      );
  }
  return data;
}
export function loadCollection(collection = 'blog', root = process.cwd()) {
  if (!['blog', 'speaking'].includes(collection))
    throw Error('Unknown collection');
  const dirs = [
    path.join(root, 'content', collection),
    ...(collection === 'blog' ? [path.join(root, 'content')] : []),
  ];
  const files = dirs.flatMap((dir) =>
    fs.existsSync(dir)
      ? fs
          .readdirSync(dir, { withFileTypes: true })
          .filter((f) => f.isFile() && /\.mdx?$/.test(f.name))
          .map((f) => path.join(dir, f.name))
      : [],
  );
  const seen = new Set();
  const entries = files
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(file, 'utf8'));
      validateEntry(data, {
        collection,
        filename: path.basename(file),
        root,
        body: content,
      });
      if (seen.has(data.slug))
        throw Error(`${collection}: duplicate slug ${data.slug}`);
      seen.add(data.slug);
      return {
        ...data,
        body: content,
        extension: path.extname(file),
        collection,
      };
    })
    .sort(
      (a, b) =>
        (b.publishedAt || b.date).localeCompare(a.publishedAt || a.date) ||
        a.slug.localeCompare(b.slug),
    );
  if (collection === 'blog')
    for (const entry of entries)
      for (const slug of entry.relatedArticles || []) {
        if (!seen.has(slug))
          throw Error(
            `blog/${entry.slug}: relatedArticles refers to unknown slug ${slug}`,
          );
      }
  return entries;
}
export function visibleEntries(
  entries,
  {
    publishedOnly = false,
    env = process.env,
    today = new Date().toISOString().slice(0, 10),
  } = {},
) {
  return entries.filter((e) =>
    e.draft
      ? !publishedOnly && policy(env).drafts
      : (e.publishedAt <= today || (!publishedOnly && policy(env).drafts)) &&
        (e.collection !== 'speaking' ||
          ['confirmed', 'delivered'].includes(e.status)),
  );
}
export function relatedEntries(entry, entries) {
  const candidates = entries.filter((e) => e.slug !== entry.slug);
  const bySlug = new Map(candidates.map((e) => [e.slug, e]));
  const selected = (entry.relatedArticles || [])
    .map((slug) => bySlug.get(slug))
    .filter(Boolean);
  const selectedSlugs = new Set(selected.map((e) => e.slug));
  const fallback = candidates
    .filter((e) => !selectedSlugs.has(e.slug))
    .sort(
      (a, b) =>
        Number(b.category === entry.category) -
          Number(a.category === entry.category) ||
        (b.publishedAt || b.date).localeCompare(a.publishedAt || a.date),
    );
  return [...selected, ...fallback].slice(0, 2);
}
