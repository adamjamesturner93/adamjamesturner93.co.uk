import { articles } from '../../../../lib/content';
import { socialImage } from '../../../../components/social-image';
export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const entry = articles(true).find((e) => e.slug === slug);
  if (!entry) return new Response('Not found', { status: 404 });
  return socialImage(entry.title, 'ENGINEERING / LEADERSHIP / IDEAS');
}
