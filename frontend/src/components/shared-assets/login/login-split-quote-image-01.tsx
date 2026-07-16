import type { ReactNode } from 'react';
import { OneSecLogo } from '@/components/foundations/logo/onesec-logo';

export type LoginReview = {
  quote: string;
  author: string;
  role: string;
};

export type LoginSplitQuoteImage01Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  reviews?: LoginReview[];
  imageSrc?: string;
  imageAlt?: string;
};

const defaultReviews: LoginReview[] = [
  {
    quote: 'OneSec — самый выгодный донат-магазин. Быстрые поставки и лучший сервис.',
    author: 'Команда OneSec',
    role: 'Моментальная доставка после оплаты',
  },
];

export function LoginSplitQuoteImage01({
  title,
  subtitle,
  children,
  footer,
  reviews = defaultReviews,
  imageSrc,
  imageAlt = 'OneSec',
}: LoginSplitQuoteImage01Props) {
  const review = reviews[0];

  return (
    <section className="grid min-h-screen bg-primary lg:grid-cols-2">
      <div className="relative flex w-full flex-1 flex-col bg-primary">
        <header className="absolute top-0 left-0 hidden p-8 lg:block">
          <OneSecLogo />
        </header>
        <div className="flex flex-1 justify-center px-4 py-12 md:items-center md:px-8 md:py-0">
          <div className="flex w-full flex-col gap-8 sm:max-w-90">
            <div className="flex flex-col gap-6">
              <OneSecLogo className="lg:hidden" />
              <div className="flex flex-col gap-2 lg:gap-3">
                <h1 className="text-xl font-semibold text-primary md:text-display-xs">{title}</h1>
                <p className="text-md text-tertiary">{subtitle}</p>
              </div>
            </div>
            {children}
            {footer && <div>{footer}</div>}
          </div>
        </div>
        <footer className="absolute bottom-0 left-0 hidden p-8 pt-11 lg:block">
          <p className="text-sm text-tertiary">&copy; {new Date().getFullYear()} OneSec</p>
        </footer>
      </div>

      <figure className="relative hidden flex-1 flex-col items-start justify-end gap-6 overflow-hidden rounded-l-[80px] bg-brand-section p-14 lg:flex">
        {imageSrc && (
          <>
            <img
              src={imageSrc}
              className="absolute inset-0 size-full rounded-l-[80px] object-cover brightness-95"
              alt={imageAlt}
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 from-20% to-transparent to-90%" />
          </>
        )}
        {!imageSrc && (
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 from-20% to-transparent to-90%" />
        )}
        <blockquote className="relative z-10 text-display-md font-medium text-fg-white">{review.quote}</blockquote>
        <figcaption className="relative z-10 flex w-full flex-col gap-1">
          <p className="text-xl font-semibold text-fg-white md:text-display-xs">{review.author}</p>
          <p className="text-md font-medium text-brand-secondary">{review.role}</p>
        </figcaption>
      </figure>
    </section>
  );
}
