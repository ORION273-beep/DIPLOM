import { cx } from '@/utils/cx';

type IconCountBadgeProps = {
  count: number;
  color?: 'brand' | 'error';
  className?: string;
};

export function IconCountBadge({ count, color = 'brand', className }: IconCountBadgeProps) {
  if (count <= 0) return null;

  const display = count > 9 ? '9+' : String(count);

  return (
    <span
      aria-hidden="true"
      className={cx(
        'pointer-events-none absolute right-0 top-0 flex h-4 min-w-4 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full px-0.5 text-[10px] font-semibold leading-none text-white tabular-nums',
        color === 'brand' ? 'bg-brand-solid' : 'bg-error-solid',
        className,
      )}
    >
      {display}
    </span>
  );
}
