import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <div className={cx('rounded-xl border border-secondary bg-primary p-6 shadow-xs', className)}>
      {children}
    </div>
  );
}

export function SectionCardHeader({ children, className }: SectionCardProps) {
  return <div className={cx('mb-4 flex flex-col gap-1.5', className)}>{children}</div>;
}

export function SectionCardTitle({ children, className }: SectionCardProps) {
  return <h3 className={cx('text-lg font-semibold text-primary', className)}>{children}</h3>;
}

export function SectionCardDescription({ children, className }: SectionCardProps) {
  return <p className={cx('text-sm text-tertiary', className)}>{children}</p>;
}

export function SectionCardContent({ children, className }: SectionCardProps) {
  return <div className={cx('text-secondary', className)}>{children}</div>;
}
