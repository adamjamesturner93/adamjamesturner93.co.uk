import { articles } from '../../../../lib/content';
import { socialCover } from '../../../../lib/social-cover.mjs';
export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const entry = articles().find((e) => e.slug === slug);
  if (!entry) return new Response('Not found', { status: 404 });
  const image = await socialCover(entry.coverImage);
  return new Response(new Uint8Array(image), {
    headers: { 'Content-Type': 'image/png' },
  });
}
