import { cx } from '@/utils/cx';

export type HeaderCenteredProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function HeaderCentered({ eyebrow, title, description, className }: HeaderCenteredProps) {
  return (
    <section className={cx('bg-primary py-16 md:py-24', className)}>
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          {eyebrow && (
            <span className="text-sm font-semibold text-brand-secondary md:text-md">{eyebrow}</span>
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
