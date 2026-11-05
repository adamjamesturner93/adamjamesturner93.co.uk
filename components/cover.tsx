import Image from 'next/image';
export default function Cover({
  src,
  alt = '',
  eager = false,
}: {
  src: string;
  alt?: string;
  eager?: boolean;
}) {
  return (
    <Image
      className={
        src === '/images/blog/data-migrations-moving-more-than-just-data.webp'
          ? 'cover cover-trim-edge'
          : 'cover'
      }
      src={src}
      alt={alt}
      width={960}
      height={540}
      sizes="(max-width: 700px) 100vw, (max-width: 1100px) 70vw, 800px"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
    />
  );
}
