import type { FC } from 'react';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { Button } from '@/components/base/buttons/button';

type OneSecEmptyStateProps = {
  icon?: FC<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export function OneSecEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: OneSecEmptyStateProps) {
  return (
    <EmptyState className="py-12">
      {icon && (
        <EmptyState.Header>
          <EmptyState.FeaturedIcon icon={icon} color="brand" theme="modern" />
        </EmptyState.Header>
      )}
      <EmptyState.Content>
        <EmptyState.Title>{title}</EmptyState.Title>
        {description && <EmptyState.Description>{description}</EmptyState.Description>}
      </EmptyState.Content>
      {actionLabel && (actionHref || onAction) && (
        <EmptyState.Footer>
          {actionHref ? (
            <Button color="primary" size="md" href={actionHref}>
              {actionLabel}
            </Button>
          ) : (
            <Button color="primary" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </EmptyState.Footer>
      )}
    </EmptyState>
  );
}
