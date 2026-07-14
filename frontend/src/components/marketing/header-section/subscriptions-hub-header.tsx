import { cx } from '@/utils/cx';

export type SubscriptionsHubHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

function SubscriptionDecorSvg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 400"
      fill="none"
      className={cx('h-full w-full', className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="180" cy="80" r="140" className="stroke-brand-secondary/15" strokeWidth="1" />
      <circle cx="1020" cy="320" r="160" className="stroke-brand-secondary/12" strokeWidth="1" />
      <circle cx="600" cy="200" r="220" className="stroke-brand-secondary/8" strokeWidth="1" strokeDasharray="8 12" />

      <path
        d="M0 280 C200 180 400 380 600 280 S1000 120 1200 220"
        className="stroke-brand-secondary/10"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M0 120 C250 220 450 40 700 140 S1050 300 1200 80"
        className="stroke-brand-solid/15"
        strokeWidth="1"
        fill="none"
      />

      {/* renewal arrows */}
      <path
        d="M920 60 A40 40 0 1 1 880 100"
        className="stroke-brand-secondary/25"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M878 94 L880 104 L890 100" className="stroke-brand-secondary/25" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path
        d="M1000 140 A40 40 0 1 0 1040 100"
        className="stroke-brand-secondary/20"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M1042 106 L1040 96 L1030 100" className="stroke-brand-secondary/20" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* calendar */}
      <rect x="90" y="260" width="56" height="52" rx="8" className="stroke-brand-secondary/25" strokeWidth="1.5" fill="none" />
      <path d="M90 276 H146" className="stroke-brand-secondary/25" strokeWidth="1.5" />
      <path d="M108 260 V268 M128 260 V268" className="stroke-brand-secondary/25" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M108 296 L118 306 L132 288" className="stroke-brand-secondary/35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* play / stream */}
      <polygon points="1080,250 1080,290 1118,270" className="fill-brand-secondary/20" />
      <rect x="1068" y="238" width="60" height="64" rx="10" className="stroke-brand-secondary/20" strokeWidth="1.5" fill="none" />

      {/* music note */}
      <ellipse cx="220" cy="300" rx="10" ry="8" className="fill-brand-secondary/25" />
      <path
        d="M230 300 V258 C230 248 248 246 252 254 C256 262 244 268 236 264"
        className="stroke-brand-secondary/30"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* premium stars */}
      <polygon points="540,48 544,58 555,58 546,65 550,76 540,69 530,76 534,65 525,58 536,58" className="fill-brand-secondary/20" />
      <polygon points="720,340 723,347 731,347 725,352 728,360 720,355 712,360 715,352 709,347 717,347" className="fill-brand-solid/25" />

      {/* signal waves */}
      <path d="M480 90 C500 70 520 70 540 90" className="stroke-brand-secondary/20" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M468 90 C496 58 524 58 552 90" className="stroke-brand-secondary/15" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M456 90 C492 46 528 46 564 90" className="stroke-brand-secondary/10" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function StreamingBadgeSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={className}>
      <rect x="8" y="14" width="48" height="36" rx="8" className="fill-brand-solid/15 stroke-brand-secondary/30" strokeWidth="1.5" />
      <polygon points="28,24 28,40 44,32" className="fill-brand-secondary/70" />
      <circle cx="50" cy="18" r="6" className="fill-brand-solid/40 stroke-brand-secondary/40" strokeWidth="1" />
    </svg>
  );
}

function MusicBadgeSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="32" r="24" className="fill-brand-solid/12 stroke-brand-secondary/25" strokeWidth="1.5" />
      <ellipse cx="22" cy="40" rx="8" ry="6" className="fill-brand-secondary/50" />
      <path d="M30 40 V22 C30 14 46 12 48 20 C50 28 38 32 30 28" className="stroke-brand-secondary" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function TicketBadgeSvg({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className={className}>
      <path
        d="M12 20 H52 C54 20 56 22 56 24 V30 C52 30 50 32 50 36 C50 40 52 42 56 42 V48 C56 50 54 52 52 52 H12 C10 52 8 50 8 48 V42 C12 42 14 40 14 36 C14 32 12 30 8 30 V24 C8 22 10 20 12 20 Z"
        className="fill-brand-solid/10 stroke-brand-secondary/30"
        strokeWidth="1.5"
      />
      <path d="M24 28 H40 M24 36 H36" className="stroke-brand-secondary/40" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type FloatingServiceCardProps = {
  src: string;
  alt: string;
  className?: string;
  rotate?: string;
};

function FloatingServiceCard({ src, alt, className, rotate = 'rotate-0' }: FloatingServiceCardProps) {
  return (
    <div
      className={cx(
        'absolute overflow-hidden rounded-2xl border border-white/10 bg-primary/40 shadow-lg ring-1 ring-brand-secondary/10 backdrop-blur-sm',
        rotate,
        className,
      )}
    >
      <img src={src} alt={alt} width={160} height={120} className="aspect-4/3 w-24 object-cover opacity-80 md:w-32" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-section/50 to-transparent" />
    </div>
  );
}

export function SubscriptionsHubHeader({ eyebrow, title, description, className }: SubscriptionsHubHeaderProps) {
  return (
    <section className={cx('relative overflow-hidden bg-primary py-16 md:py-24', className)}>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-solid/8 via-primary to-brand-secondary/5" />
        <div className="absolute -left-32 top-0 size-96 rounded-full bg-brand-solid/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-80 rounded-full bg-brand-secondary/10 blur-3xl" />

        <SubscriptionDecorSvg className="absolute inset-0 opacity-70" />

        <FloatingServiceCard
          src="/products/netflix-premium.png"
          alt=""
          className="left-[4%] top-[18%] hidden sm:block"
          rotate="-rotate-12"
        />
        <FloatingServiceCard
          src="/products/spotify-premium.png"
          alt=""
          className="right-[6%] top-[12%] hidden md:block"
          rotate="rotate-6"
        />
        <FloatingServiceCard
          src="/products/youtube-premium.png"
          alt=""
          className="bottom-[10%] left-[8%] hidden lg:block"
          rotate="rotate-3"
        />
        <FloatingServiceCard
          src="/products/netflix-premium.png"
          alt=""
          className="bottom-[14%] right-[5%] hidden sm:block"
          rotate="-rotate-6"
        />

        <StreamingBadgeSvg className="absolute left-[18%] top-[8%] size-12 opacity-60 md:size-16" />
        <MusicBadgeSvg className="absolute right-[20%] bottom-[12%] size-11 opacity-50 md:size-14" />
        <TicketBadgeSvg className="absolute left-[42%] bottom-[6%] size-10 opacity-40 md:size-12" />
        <MusicBadgeSvg className="absolute right-[12%] top-[22%] size-9 opacity-35" />
        <StreamingBadgeSvg className="absolute left-[55%] top-[10%] size-10 opacity-30 max-md:hidden" />
      </div>

      <div className="relative z-10 mx-auto max-w-container px-4 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-primary/60 px-3 py-1 text-sm font-semibold text-brand-secondary backdrop-blur-sm md:text-md">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
                <path d="M4 6a2 2 0 012-2h8a2 2 0 012 2v1H4V6zm0 3h12v5a2 2 0 01-2 2H6a2 2 0 01-2-2V9zm3 2v4h2v-4H7zm4 0v4h2v-4h-2z" />
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
