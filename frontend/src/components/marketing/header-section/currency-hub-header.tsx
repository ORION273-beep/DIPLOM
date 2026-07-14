import { cx } from '@/utils/cx';

export type CurrencyHubHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

function CurrencyDecorSvg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 400"
      fill="none"
      className={cx('h-full w-full', className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="150" cy="100" r="130" className="stroke-brand-secondary/15" strokeWidth="1" />
      <circle cx="1050" cy="280" r="150" className="stroke-brand-secondary/12" strokeWidth="1" />
      <circle cx="580" cy="190" r="200" className="stroke-brand-secondary/8" strokeWidth="1" strokeDasharray="6 10" />

      <path
        d="M0 300 C220 200 380 360 580 280 S920 120 1200 200"
        className="stroke-brand-secondary/10"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M0 100 C180 200 420 40 640 120 S980 280 1200 60"
        className="stroke-brand-solid/15"
        strokeWidth="1"
        fill="none"
      />

      {/* coin stack */}
      <ellipse cx="110" cy="310" rx="28" ry="8" className="fill-brand-secondary/20" />
      <ellipse cx="110" cy="298" rx="28" ry="8" className="fill-brand-secondary/25" />
      <ellipse cx="110" cy="286" rx="28" ry="8" className="fill-brand-secondary/30" />
      <circle cx="110" cy="292" r="6" className="fill-brand-secondary/40" />

      {/* gem / crystal */}
      <polygon points="980,80 1000,110 980,150 960,110" className="fill-brand-solid/20 stroke-brand-secondary/30" strokeWidth="1.5" />
      <path d="M980 80 L980 150 M960 110 H1000" className="stroke-brand-secondary/20" strokeWidth="1" />

      {/* plus pack */}
      <rect x="460" y="60" width="72" height="48" rx="10" className="stroke-brand-secondary/25" strokeWidth="1.5" fill="none" />
      <path d="M496 76 V92 M488 84 H504" className="stroke-brand-secondary/40" strokeWidth="3" strokeLinecap="round" />
      <path d="M472 100 H520" className="stroke-brand-secondary/20" strokeWidth="1.5" strokeLinecap="round" />

      {/* lightning — fast delivery */}
      <path
        d="M1080 300 L1068 328 H1088 L1076 360 L1104 318 H1084 L1096 300 Z"
        className="fill-brand-secondary/25 stroke-brand-secondary/30"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* d-pad */}
      <rect x="200" y="70" width="48" height="48" rx="12" className="stroke-brand-secondary/20" strokeWidth="1.5" fill="none" />
      <path d="M224 82 V106 M212 94 H236" className="stroke-brand-secondary/35" strokeWidth="2.5" strokeLinecap="round" />

      {/* robux-style hex */}
      <polygon
        points="720,300 748,316 748,348 720,364 692,348 692,316"
        className="fill-brand-solid/10 stroke-brand-secondary/25"
        strokeWidth="1.5"
      />

      {/* stars / loot */}
      <polygon points="340,320 344,330 355,330 346,337 350,348 340,341 330,348 334,337 325,330 336,330" className="fill-brand-secondary/20" />
      <polygon points="840,48 843,55 851,55 845,60 848,68 840,63 832,68 835,60 829,55 837,55" className="fill-brand-solid/25" />
    </svg>
  );
}

function CoinBadgeSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="32" r="24" className="fill-brand-solid/15 stroke-brand-secondary/30" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="16" className="stroke-brand-secondary/25" strokeWidth="1.5" />
      <path d="M32 22 V42 M26 28 H38 M26 36 H38" className="stroke-brand-secondary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GemBadgeSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={className}>
      <polygon points="32,8 52,24 44,56 20,56 12,24" className="fill-brand-solid/12 stroke-brand-secondary/30" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 24 H52 M32 8 V56 M20 56 L32 24 L44 56" className="stroke-brand-secondary/25" strokeWidth="1" />
    </svg>
  );
}

function GamepadBadgeSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="8" y="20" width="48" height="28" rx="14" className="fill-brand-solid/12 stroke-brand-secondary/30" strokeWidth="1.5" />
      <path d="M24 34 H30 M27 31 V37" className="stroke-brand-secondary" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="30" r="3" className="fill-brand-secondary/70" />
      <circle cx="46" cy="36" r="3" className="fill-brand-secondary/50" />
    </svg>
  );
}

type FloatingCurrencyCardProps = {
  src: string;
  alt: string;
  className?: string;
  rotate?: string;
  objectFit?: 'cover' | 'contain';
};

function FloatingCurrencyCard({
  src,
  alt,
  className,
  rotate = 'rotate-0',
  objectFit = 'cover',
}: FloatingCurrencyCardProps) {
  return (
    <div
      className={cx(
        'absolute overflow-hidden rounded-2xl border border-white/10 bg-primary/40 p-1.5 shadow-lg ring-1 ring-brand-secondary/10 backdrop-blur-sm',
        rotate,
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        width={160}
        height={120}
        className={cx(
          'aspect-4/3 w-24 md:w-32',
          objectFit === 'contain' ? 'object-contain opacity-90' : 'object-cover opacity-80',
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-section/50 to-transparent" />
    </div>
  );
}

export function CurrencyHubHeader({ eyebrow, title, description, className }: CurrencyHubHeaderProps) {
  return (
    <section className={cx('relative overflow-hidden bg-primary py-16 md:py-24', className)}>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-solid/10 via-primary to-brand-secondary/5" />
        <div className="absolute -left-28 top-4 size-96 rounded-full bg-brand-solid/12 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-80 rounded-full bg-brand-secondary/10 blur-3xl" />

        <CurrencyDecorSvg className="absolute inset-0 opacity-70" />

        <FloatingCurrencyCard
          src="/images/pubg-uc.png"
          alt=""
          className="left-[4%] top-[16%] hidden sm:block"
          rotate="-rotate-12"
          objectFit="contain"
        />
        <FloatingCurrencyCard
          src="/products/roblox-400-robux.png"
          alt=""
          className="right-[5%] top-[10%] hidden md:block"
          rotate="rotate-6"
        />
        <FloatingCurrencyCard
          src="https://upload-os-bbs.hoyolab.com/upload/2022/07/11/27897384/4cce82216bdc35b5265387fb34beffaa_1590857787713958622.png"
          alt=""
          className="bottom-[8%] left-[7%] hidden lg:block"
          rotate="rotate-3"
        />
        <FloatingCurrencyCard
          src="https://cdn-www.bluestacks.com/bs-images/%D0%9A%D0%B0%D0%BA-%D1%83%D0%BB%D1%83%D1%87%D1%88%D0%B8%D1%82%D1%8C-%D1%82%D0%BE%D1%87%D0%BD%D0%BE%D1%81%D1%82%D1%8C-%D0%B8-%D0%B4%D0%B5%D0%BB%D0%B0%D1%82%D1%8C-%D0%B1%D0%BE%D0%BB%D1%8C%D1%88%D0%B5-%D1%85%D0%B5%D0%B4%D1%88%D0%BE%D1%82%D0%BE%D0%B2-%D0%B2-Free-Fire.png"
          alt=""
          className="bottom-[12%] right-[4%] hidden sm:block"
          rotate="-rotate-6"
        />

        <CoinBadgeSvg className="absolute left-[16%] top-[10%] size-12 opacity-60 md:size-16" />
        <GemBadgeSvg className="absolute right-[18%] bottom-[14%] size-11 opacity-50 md:size-14" />
        <GamepadBadgeSvg className="absolute left-[44%] bottom-[8%] size-10 opacity-40 md:size-12" />
        <GemBadgeSvg className="absolute right-[10%] top-[24%] size-9 opacity-35" />
        <GamepadBadgeSvg className="absolute left-[52%] top-[12%] size-10 opacity-30 max-md:hidden" />
      </div>

      <div className="relative z-10 mx-auto max-w-container px-4 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-primary/60 px-3 py-1 text-sm font-semibold text-brand-secondary backdrop-blur-sm md:text-md">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 2a6 6 0 110 12 6 6 0 010-12zm-1 3h2v2h-2V7zm0 4h2v2H9v-2z" />
              </svg>
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">{title}</h1>
          {description && (
            <p className="mt-4 text-lg text-tertiary md:mt-6 md:text-xl">{description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
