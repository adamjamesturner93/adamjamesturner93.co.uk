import { loadCollection } from '../lib/content/core.mjs';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
for (const collection of ['blog', 'speaking']) {
  const entries = loadCollection(collection);
  for (const entry of entries)
    if (entry.extension === '.mdx')
      await serialize(entry.body, {
        mdxOptions: { remarkPlugins: [remarkGfm] },
      });
  console.log(`Validated ${entries.length} ${collection} entries`);
}
