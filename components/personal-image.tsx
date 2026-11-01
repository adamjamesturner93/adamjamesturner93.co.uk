import Image from 'next/image';
export default function PersonalImage({
  variant,
  caption,
  eager = false,
}: {
  variant: 'portrait' | 'landscape';
  caption: string;
  eager?: boolean;
}) {
  const portrait = variant === 'portrait';
  return (
    <figure className={`personal-image personal-image-${variant}`}>
      <div className="personal-image-frame">
        <Image
          src={`/images/personal/${variant}-placeholder.svg`}
          alt=""
          width={portrait ? 720 : 960}
          height={portrait ? 900 : 640}
          loading={eager ? 'eager' : 'lazy'}
          sizes={
            portrait
              ? '(max-width: 700px) 90vw, 480px'
              : '(max-width: 700px) 90vw, 440px'
          }
        />
        <div className="personal-photo-window">
          <Image
            src={
              portrait
                ? '/images/personal/adam-loch-lomond.webp'
                : '/images/personal/adam-winter-walk.webp'
            }
            alt={
              portrait
                ? 'Adam smiling beside Loch Lomond, with the loch and mountains behind him.'
                : 'Adam on a snowy walk, wearing a colourful woolly hat and winter jacket.'
            }
            fill
            sizes={
              portrait
                ? '(max-width: 700px) 75vw, 384px'
                : '(max-width: 700px) 75vw, 340px'
            }
            loading={eager ? 'eager' : 'lazy'}
          />
        </div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
