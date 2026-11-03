import { validateTags } from '../../lib/content/tags.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import {
  categories,
  loadCollection,
  slugPattern,
  validateEntry,
} from '../../lib/content/core.mjs';
import { artwork } from './artwork.mjs';
export function generate(
  collection,
  args,
  { root = process.cwd(), now = new Date(), write = fs.writeFileSync } = {},
) {
  if (!['blog', 'speaking'].includes(collection))
    throw Error('Unknown content collection');
  const [slug, ...flags] = args;
  if (!slug || !slugPattern.test(slug))
    throw Error(
      'Provide a lowercase kebab-case slug, e.g. interesting-problems',
    );
  let category = 'general';
  let tags = [];
  const seenFlags = new Set();
  for (let i = 0; i < flags.length; i += 2) {
    const flag = flags[i];
    const value = flags[i + 1];
    if (collection !== 'blog' || !value || seenFlags.has(flag))
      throw Error('Use --category or --tags once each with a value');
    seenFlags.add(flag);
    if (flag === '--category' && Object.hasOwn(categories, value))
      category = value;
    else if (flag === '--tags') tags = validateTags(value.split(','));
    else
      throw Error(
        'Use --category with a registered blog category or --tags with registered tags',
      );
  }
  const contentFile = path.join(root, 'content', collection, slug + '.mdx');
  const coverImage = `/images/${collection}/${slug}.svg`;
  const imageFile = path.join(root, 'public', coverImage.slice(1));
  if (
    fs.existsSync(contentFile) ||
    fs.existsSync(contentFile.replace(/\.mdx$/, '.md')) ||
    fs.existsSync(imageFile) ||
    loadCollection(collection, root).some((e) => e.slug === slug)
  )
    throw Error(
      `Refusing to overwrite existing content or artwork for ${slug}`,
    );
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const title = slug
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
  const data = {
    title,
    slug,
    description: 'TODO: Add a short description',
    date,
    ...(collection === 'blog'
      ? { category, tags, relatedArticles: [] }
      : {
          eventName: 'TODO: Event name',
          eventDate: null,
          location: '',
          format: 'conference',
          status: 'proposed',
        }),
    draft: true,
    coverImage,
    coverImageAlt: '',
  };
  const body =
    collection === 'blog'
      ? `{/* DRAFT: Replace with your own article. */}\n\n## The question\n\nWhat prompted this article?\n\n## Why it matters\n\nWhat are the competing considerations?\n\n## What I've learned\n\nWhat changed in your understanding?\n\n## References\n\nAdd relevant, verifiable sources.\n`
      : `{/* DRAFT: Not an accepted speaking engagement. */}\n\n## Talk overview\n\nWhat is the central argument?\n\n## Key takeaways\n\nWhat should attendees learn?\n\n## Event details\n\nAdd event information when confirmed.\n\n## Resources\n\nAdd references, slides or recordings.\n`;
  const created = [];
  try {
    for (const f of [imageFile, contentFile])
      fs.mkdirSync(path.dirname(f), { recursive: true });
    // Exclusive writes and rollback keep pre-existing files intact, including on partial failure.
    const imageFd = fs.openSync(imageFile, 'wx');
    created.push(imageFile);
    try {
      write(imageFd, artwork(slug));
    } finally {
      fs.closeSync(imageFd);
    }
    validateEntry(data, {
      collection,
      filename: path.basename(contentFile),
      root,
      body,
    });
    const contentFd = fs.openSync(contentFile, 'wx');
    created.push(contentFile);
    try {
      write(contentFd, matter.stringify(body, data));
    } finally {
      fs.closeSync(contentFd);
    }
  } catch (error) {
    for (const f of created.reverse()) fs.unlinkSync(f);
    throw error;
  }
  return {
    contentFile,
    imageFile,
    url: `http://localhost:3000/${collection}/${slug}`,
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const [collection, ...args] = process.argv.slice(2);
    const r = generate(collection, args);
    console.log(
      `✓ Created ${collection} draft\n\nContent:\n${path.relative(process.cwd(), r.contentFile)}\n\nArtwork:\n${path.relative(process.cwd(), r.imageFile)}\n\nPreview:\n${r.url}\n\nNext:\n1. Write and edit the ${collection === 'blog' ? 'article' : 'talk'}\n2. Review the artwork\n3. Complete metadata\n4. Publish when ready`,
    );
  } catch (error) {
    console.error(`Generation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
