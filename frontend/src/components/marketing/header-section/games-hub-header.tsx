import { cx } from '@/utils/cx';

export type GamesHubHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  decorCovers?: { src: string; alt: string }[];
};

function GamesDecorSvg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 400"
      fill="none"
      className={cx('h-full w-full', className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="160" cy="90" r="135" className="stroke-brand-secondary/15" strokeWidth="1" />
      <circle cx="1040" cy="300" r="155" className="stroke-brand-secondary/12" strokeWidth="1" />
      <circle cx="600" cy="200" r="210" className="stroke-brand-secondary/8" strokeWidth="1" strokeDasharray="7 11" />

      <path
        d="M0 290 C210 190 390 370 600 270 S950 130 1200 210"
        className="stroke-brand-secondary/10"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M0 110 C240 210 430 50 670 130 S1010 290 1200 70"
        className="stroke-brand-solid/15"
        strokeWidth="1"
        fill="none"
      />

      {/* gamepad outline */}
      <rect x="88" y="268" width="96" height="56" rx="28" className="stroke-brand-secondary/25" strokeWidth="1.5" fill="none" />
      <path d="M120 296 H136 M128 288 V304" className="stroke-brand-secondary/35" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="158" cy="288" r="5" className="fill-brand-secondary/50" />
      <circle cx="170" cy="300" r="5" className="fill-brand-secondary/35" />
      <circle cx="170" cy="288" r="5" className="fill-brand-secondary/25" />

      {/* trophy */}
      <path
        d="M1010 250 H1050 V268 C1050 282 1038 292 1024 292 H1036 C1022 292 1010 282 1010 268 V250 Z"
        className="fill-brand-solid/15 stroke-brand-secondary/30"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M1010 258 H990 C990 270 998 278 1008 278 M1050 258 H1070 C1070 270 1062 278 1052 278" className="stroke-brand-secondary/25" strokeWidth="1.5" fill="none" />
      <path d="M1024 292 V304 H1036 V292 M1018 304 H1042" className="stroke-brand-secondary/30" strokeWidth="1.5" strokeLinecap="round" />

      {/* pixel blocks */}
      <rect x="470" y="72" width="14" height="14" className="fill-brand-secondary/25" />
      <rect x="488" y="72" width="14" height="14" className="fill-brand-secondary/15" />
      <rect x="470" y="90" width="14" height="14" className="fill-brand-secondary/15" />
      <rect x="488" y="90" width="14" height="14" className="fill-brand-secondary/30" />

      {/* joystick */}
      <rect x="700" y="300" width="40" height="52" rx="8" className="stroke-brand-secondary/20" strokeWidth="1.5" fill="none" />
      <circle cx="720" cy="318" r="10" className="fill-brand-solid/20 stroke-brand-secondary/30" strokeWidth="1.5" />
      <path d="M720 328 V340" className="stroke-brand-secondary/25" strokeWidth="2" strokeLinecap="round" />

      {/* star rating */}
      <polygon points="320,60 324,70 335,70 326,77 330,88 320,81 310,88 314,77 305,70 316,70" className="fill-brand-secondary/20" />
      <polygon points="350,48 352,54 359,54 354,58 356,64 350,60 344,64 346,58 341,54 348,54" className="fill-brand-solid/25" />

      {/* crosshair */}
      <circle cx="860" cy="90" r="18" className="stroke-brand-secondary/20" strokeWidth="1.5" fill="none" />
      <path d="M860 68 V80 M860 100 V112 M838 90 H850 M870 90 H882" className="stroke-brand-secondary/25" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GamepadBadgeSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="6" y="18" width="52" height="32" rx="16" className="fill-brand-solid/12 stroke-brand-secondary/30" strokeWidth="1.5" />
      <path d="M24 34 H30 M27 31 V37" className="stroke-brand-secondary" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="42" cy="30" r="3.5" className="fill-brand-secondary/70" />
      <circle cx="48" cy="36" r="3.5" className="fill-brand-secondary/50" />
      <circle cx="48" cy="30" r="3.5" className="fill-brand-secondary/35" />
    </svg>
  );
}

function TrophyBadgeSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={className}>
      <path
        d="M20 16 H44 V28 C44 36 38 42 32 42 C26 42 20 36 20 28 V16 Z"
        className="fill-brand-solid/15 stroke-brand-secondary/30"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M20 22 H14 C14 28 18 32 22 32 M44 22 H50 C50 28 46 32 42 32" className="stroke-brand-secondary/30" strokeWidth="1.5" fill="none" />
      <path d="M32 42 V48 M26 48 H38" className="stroke-brand-secondary/35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function JoystickBadgeSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="18" y="28" width="28" height="24" rx="6" className="fill-brand-solid/10 stroke-brand-secondary/25" strokeWidth="1.5" />
      <circle cx="32" cy="22" r="10" className="fill-brand-solid/15 stroke-brand-secondary/30" strokeWidth="1.5" />
      <path d="M32 32 V40" className="stroke-brand-secondary/30" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type FloatingGameCoverProps = {
  src: string;
  alt: string;
  className?: string;
  rotate?: string;
};

function FloatingGameCover({ src, alt, className, rotate = 'rotate-0' }: FloatingGameCoverProps) {
  return (
    <div
      className={cx(
        'absolute overflow-hidden rounded-2xl border border-white/10 bg-primary/40 shadow-lg ring-1 ring-brand-secondary/10 backdrop-blur-sm',
        rotate,
        className,
      )}
    >
      <img src={src} alt={alt} width={200} height={112} className="aspect-video w-28 object-cover opacity-85 md:w-36" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-section/55 to-transparent" />
    </div>
  );
}

const defaultCovers = [
  {
    src: 'https://assets.change.org/photos/9/ke/af/TUKeAFYXebNFXDc-1600x900-noPad.jpg?1560182562',
    alt: 'PUBG Mobile',
  },
  {
    src: 'https://upload-os-bbs.hoyolab.com/upload/2022/07/11/27897384/4cce82216bdc35b5265387fb34beffaa_1590857787713958622.png',
    alt: 'Genshin Impact',
  },
  {
    src: 'https://d1lss44hh2trtw.cloudfront.net/assets/article/2021/11/08/roblox-rblx-q3-2021-earnings-release-beat-revenue-growth_feature.png',
    alt: 'Roblox',
  },
  {
    src: 'https://ir.ozone.ru/s3/multimedia-1-o/7256266008.jpg',
    alt: 'Minecraft',
  },
];

export function GamesHubHeader({ eyebrow, title, description, className, decorCovers }: GamesHubHeaderProps) {
  const covers = (decorCovers?.length ? decorCovers : defaultCovers).slice(0, 4);
  const [coverA, coverB, coverC, coverD] = covers;

  return (
    <section className={cx('relative overflow-hidden bg-primary py-16 md:py-24', className)}>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-solid/9 via-primary to-brand-secondary/5" />
        <div className="absolute -left-32 top-2 size-96 rounded-full bg-brand-solid/11 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-80 rounded-full bg-brand-secondary/10 blur-3xl" />

        <GamesDecorSvg className="absolute inset-0 opacity-70" />

        {coverA && (
          <FloatingGameCover
            src={coverA.src}
            alt=""
            className="left-[4%] top-[14%] hidden sm:block"
            rotate="-rotate-12"
          />
        )}
        {coverB && (
          <FloatingGameCover
            src={coverB.src}
            alt=""
            className="right-[5%] top-[10%] hidden md:block"
            rotate="rotate-6"
          />
        )}
        {coverC && (
          <FloatingGameCover
            src={coverC.src}
            alt=""
            className="bottom-[8%] left-[7%] hidden lg:block"
            rotate="rotate-3"
          />
        )}
        {coverD && (
          <FloatingGameCover
            src={coverD.src}
            alt=""
            className="bottom-[12%] right-[4%] hidden sm:block"
            rotate="-rotate-6"
          />
        )}

        <GamepadBadgeSvg className="absolute left-[17%] top-[9%] size-12 opacity-60 md:size-16" />
        <TrophyBadgeSvg className="absolute right-[19%] bottom-[13%] size-11 opacity-50 md:size-14" />
        <JoystickBadgeSvg className="absolute left-[43%] bottom-[7%] size-10 opacity-40 md:size-12" />
        <TrophyBadgeSvg className="absolute right-[11%] top-[22%] size-9 opacity-35" />
        <GamepadBadgeSvg className="absolute left-[54%] top-[11%] size-10 opacity-30 max-md:hidden" />
      </div>

      <div className="relative z-10 mx-auto max-w-container px-4 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-primary/60 px-3 py-1 text-sm font-semibold text-brand-secondary backdrop-blur-sm md:text-md">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
                <path d="M6 4a2 2 0 00-2 2v3.5a3.5 3.5 0 007 0V6a2 2 0 00-2-2H6zm8 0a2 2 0 00-2 2v3.5a3.5 3.5 0 007 0V6a2 2 0 00-2-2h-3zM4 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm10 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
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
