import type { ReactNode } from "react";

import { cn } from "../../lib/theme";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center shadow-[var(--shadow-sm)] sm:px-8",
        className,
      )}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
        {icon ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            {icon}
          </div>
        ) : null}
        <div className="space-y-2">
          <h3 className="text-[1.25rem] font-semibold tracking-[-0.02em] text-[var(--color-text)]">
            {title}
          </h3>
          <p className="text-[1rem] text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap justify-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
