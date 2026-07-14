import { Button } from '@/components/base/buttons/button';
import { cx } from '@/utils/cx';

export type HeroGameCover = {
  src: string;
  alt: string;
};

export type HeroSplitImage02Props = {
  eyebrow?: string;
  title: string;
  titleHighlight?: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  imageSrc?: string;
  imageAlt?: string;
  decorGameCovers?: HeroGameCover[];
};

const clipPanelClass =
  'size-full xl:absolute xl:inset-0 xl:-left-10 xl:w-[calc(100%+40px)] xl:max-w-none xl:[clip-path:polygon(10%_0%,_100%_0%,_100%_100%,_0%_100%)]';

function HeroDecorativeSvg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      fill="none"
      className={cx('h-full w-full', className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="320" cy="80" r="120" className="stroke-brand-secondary/20" strokeWidth="1" />
      <circle cx="60" cy="340" r="90" className="stroke-brand-secondary/15" strokeWidth="1" />
      <path
        d="M0 200 Q100 120 200 200 T400 200"
        className="stroke-brand-secondary/10"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M40 60 L80 60 L80 100 M60 40 L60 80"
        className="stroke-brand-secondary/25"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M340 300 L380 300 L380 340 M360 280 L360 320"
        className="stroke-brand-secondary/20"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polygon
        points="200,40 210,65 235,65 215,80 222,105 200,90 178,105 185,80 165,65 190,65"
        className="fill-brand-secondary/15"
      />
      <polygon
        points="100,180 108,198 128,198 112,210 118,228 100,216 82,228 88,210 72,198 92,198"
        className="fill-brand-secondary/10"
      />
    </svg>
  );
}

function HeroGamepadSvg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 80"
      fill="none"
      className={className}
    >
      <rect
        x="4"
        y="16"
        width="112"
        height="48"
        rx="24"
        className="fill-brand-solid/20 stroke-brand-secondary/40"
        strokeWidth="2"
      />
      <path
        d="M36 40 H48 M42 34 V46"
        className="stroke-brand-secondary"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="76" cy="34" r="5" className="fill-brand-secondary/80" />
      <circle cx="88" cy="46" r="5" className="fill-brand-secondary/60" />
      <circle cx="88" cy="34" r="5" className="fill-brand-secondary/40" />
    </svg>
  );
}

function HeroVisualPanel({
  imageSrc,
  imageAlt,
  decorGameCovers = [],
}: {
  imageSrc?: string;
  imageAlt?: string;
  decorGameCovers?: HeroGameCover[];
}) {
  const [cardA, cardB] = decorGameCovers;

  return (
    <div className={cx('relative overflow-hidden', clipPanelClass)}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-section to-brand-700/30" />
      <HeroDecorativeSvg className="pointer-events-none absolute inset-0 opacity-60" />

      {imageSrc && (
        <div className="absolute inset-0">
          <img
            src={imageSrc}
            alt={imageAlt ?? ''}
            
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-section/90 via-brand-section/40 to-brand-700/20" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-brand-solid/10 blur-2xl" />
          <HeroGamepadSvg className="relative h-16 w-24 md:h-20 md:w-28" />
        </div>
      </div>

      {cardA && (
        <div className="absolute left-[8%] top-[12%] z-10 w-[28%] max-w-[120px] -rotate-6 shadow-lg md:left-[10%] md:top-[14%] md:max-w-[140px]">
          <div className="overflow-hidden rounded-xl border border-white/20 ring-1 ring-black/10">
            <img
              src={cardA.src}
              alt={cardA.alt}
              width={400}
              height={560}
              className="aspect-3/4 w-full object-cover"
            />
          </div>
        </div>
      )}

      {cardB && (
        <div className="absolute bottom-[12%] right-[8%] z-10 w-[28%] max-w-[120px] rotate-6 shadow-lg md:bottom-[14%] md:right-[10%] md:max-w-[140px]">
          <div className="overflow-hidden rounded-xl border border-white/20 ring-1 ring-black/10">
            <img
              src={cardB.src}
              alt={cardB.alt}
              width={400}
              height={560}
              className="aspect-3/4 w-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 backdrop-blur-sm">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 text-brand-secondary" fill="currentColor">
          <circle cx="6" cy="12" r="4" opacity="0.7" />
          <circle cx="14" cy="12" r="4" opacity="0.5" />
          <circle cx="20" cy="12" r="3" opacity="0.35" />
        </svg>
        <span className="text-xs font-medium text-fg-white/90">Игровой донат</span>
      </div>
    </div>
  );
}

export function HeroSplitImage02({
  eyebrow,
  title,
  titleHighlight,
  description,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt = '',
  decorGameCovers,
}: HeroSplitImage02Props) {
  return (
    <section className="relative bg-primary py-16 lg:flex lg:min-h-160 lg:items-center lg:py-24">
      <div className="mx-auto w-full max-w-container px-4 md:px-8">
        <div className="flex flex-col items-start lg:w-1/2 lg:pr-8">
          {eyebrow && (
            <span className="text-sm font-semibold text-brand-secondary md:text-md">{eyebrow}</span>
          )}
          <h1 className="mt-4 text-display-md font-semibold text-primary md:text-display-lg lg:text-display-xl">
            {titleHighlight ? (
              <>
                {title}{' '}
                <span className="text-brand-secondary">{titleHighlight}</span>
              </>
            ) : (
              title
            )}
          </h1>
          <p className="mt-4 text-lg text-balance text-tertiary md:mt-6 md:text-xl">{description}</p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row md:mt-12">
            <Button color="primary" size="xl" href={primaryCta.href}>
              {primaryCta.label}
            </Button>
            <Button color="secondary" size="xl" href={secondaryCta.href}>
              {secondaryCta.label}
            </Button>
          </div>
        </div>
      </div>
      <div className="relative mt-16 h-70 w-full px-4 md:h-96 md:px-8 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-full lg:w-1/2 lg:px-0">
        <HeroVisualPanel imageSrc={imageSrc} imageAlt={imageAlt} decorGameCovers={decorGameCovers} />
      </div>
    </section>
  );
}
