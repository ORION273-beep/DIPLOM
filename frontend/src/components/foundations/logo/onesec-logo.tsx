import { Link } from 'react-router-dom';
import { cx } from '@/utils/cx';

type OneSecLogoProps = {
  className?: string;
  href?: string;
  showTagline?: boolean;
};

export function OneSecLogo({ className, href = '/', showTagline = false }: OneSecLogoProps) {
  const content = (
    <span className={cx('inline-flex flex-col', className)}>
      <span className="text-xl font-bold tracking-tight text-primary">
        One<span className="text-brand-secondary">Sec</span>
      </span>
      {showTagline && (
        <span className="text-xs font-normal text-tertiary">Пополнение сервисов</span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link to={href} className="shrink-0 outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}
