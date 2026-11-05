import path from 'node:path';
import sharp from 'sharp';

// Use the authored artwork, converting WebP/SVG covers for social crawlers.
export async function socialCover(coverImage, root = process.cwd()) {
  const publicRoot = path.resolve(root, 'public');
  const file = path.resolve(publicRoot, '.' + coverImage);
  if (!coverImage.startsWith('/') || !file.startsWith(publicRoot + path.sep))
    throw Error('Social cover must be a local public image');
  return sharp(file)
    .rotate()
    .resize(1200, 630, { fit: 'cover' })
    .flatten({ background: '#FAFAF7' })
    .png()
    .toBuffer();
}
