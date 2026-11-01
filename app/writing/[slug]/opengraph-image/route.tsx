import { permanentRedirect } from 'next/navigation';
export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  permanentRedirect('/blog/' + slug + '/opengraph-image');
}
