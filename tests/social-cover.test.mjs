import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { socialCover } from '../lib/social-cover.mjs';

test('social images use authored WebP and SVG artwork as opaque 1200 × 630 PNGs', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'social-cover-'));
  try {
    await fs.mkdir(path.join(root, 'public'));
    await sharp({
      create: { width: 600, height: 400, channels: 3, background: '#ff0000' },
    })
      .webp()
      .toFile(path.join(root, 'public/cover.webp'));
    await fs.writeFile(
      path.join(root, 'public/cover.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="red"/></svg>',
    );
    for (const cover of ['/cover.webp', '/cover.svg']) {
      const image = await socialCover(cover, root);
      const metadata = await sharp(image).metadata();
      assert.equal(metadata.format, 'png');
      assert.equal(metadata.width, 1200);
      assert.equal(metadata.height, 630);
      const stats = await sharp(image).stats();
      assert.equal(stats.isOpaque, true);
      assert.ok(stats.channels[0].mean > 250);
      assert.ok(stats.channels[1].mean < 5);
    }
    await assert.rejects(socialCover('/../outside.png', root));
    await assert.rejects(socialCover('/missing.png', root));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
