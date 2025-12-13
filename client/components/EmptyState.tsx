import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  actionHref,
  onAction
}: EmptyStateProps) {
  const actionButton = actionLabel && (
    actionHref ? (
      <Link href={actionHref} className="empty-button">
        {actionLabel}
      </Link>
    ) : onAction ? (
      <button onClick={onAction} className="empty-button">
        {actionLabel}
      </button>
    ) : null
  );

  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h2 className="empty-title">{title}</h2>
      <p className="empty-description">{description}</p>
      {actionButton}
    </div>
  );
}

