import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';

type ProductMediaContext = {
  gameSlug?: string | null;
  category?: string | null;
  image?: string;
};

export function isPubgMobileProduct(product: ProductMediaContext): boolean {
  const slug = (product.gameSlug ?? product.category ?? '').toLowerCase();
  return slug === 'pubg-mobile' || Boolean(product.image?.includes('pubg-uc'));
}

export function PubgUcBackdrop({ className }: { className?: string }) {
  return (
    <div className={cx('absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute inset-0 bg-[#120c06]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgba(251,191,36,0.42)_0%,transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_75%,rgba(234,88,12,0.35)_0%,transparent_48%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.55)_0%,transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.18] bg-[repeating-linear-gradient(-48deg,transparent,transparent_14px,rgba(251,191,36,0.22)_14px,rgba(251,191,36,0.22)_15px)]" />
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-6 size-36 rounded-full bg-orange-600/25 blur-3xl" />
    </div>
  );
}

export function ProductMediaFrame({
  product,
  children,
  className,
  aspectClassName = 'aspect-4/3',
}: {
  product: ProductMediaContext;
  children: ReactNode;
  className?: string;
  aspectClassName?: string;
}) {
  const isPubg = isPubgMobileProduct(product);

  return (
    <div className={cx('relative overflow-hidden', aspectClassName, className)}>
      {isPubg ? (
        <>
          <PubgUcBackdrop />
          <div className="relative z-10 flex h-full items-center justify-center p-1.5 sm:p-2">
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
