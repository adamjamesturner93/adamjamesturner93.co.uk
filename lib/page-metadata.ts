import type { Metadata } from 'next';
import { site } from './site.mjs';
export function pageMetadata(
  title: string,
  description: string,
  pathname: string,
  image = '/opengraph-image',
): Metadata {
  const images = [{ url: image, width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      title,
      description,
      type: 'website',
      url: site.origin + pathname,
      siteName: site.name,
      locale: 'en_GB',
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}
