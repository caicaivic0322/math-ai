import type { ReactNode } from "react";

import { cn } from "@/lib/theme";
import { Badge, Card } from "@/components/ui";

type ContentSectionCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  accent?: "default" | "primary" | "warning" | "danger" | "success";
  children: ReactNode;
  className?: string;
};

const accentClasses: Record<NonNullable<ContentSectionCardProps["accent"]>, string> = {
  default: "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_88%,white)_0%,color-mix(in_oklch,var(--color-surface-strong)_30%,white)_100%)]",
  primary:
    "border-[color-mix(in_oklch,var(--color-primary),white_45%)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-primary-soft)_52%,white)_0%,white_100%)]",
  warning:
    "border-[color-mix(in_oklch,var(--color-warning),white_38%)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-warning)_16%,white)_0%,white_100%)]",
  danger:
    "border-[color-mix(in_oklch,var(--color-danger),white_48%)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-danger)_12%,white)_0%,white_100%)]",
  success:
    "border-[color-mix(in_oklch,var(--color-success),white_45%)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-success)_16%,white)_0%,white_100%)]",
};

export function ContentSectionCard({
  eyebrow,
  title,
  description,
  accent = "default",
  children,
  className,
}: ContentSectionCardProps) {
  return (
    <Card
      className={cn(
        "space-y-5 rounded-[1.9rem] border shadow-[var(--shadow-sm)]",
        accentClasses[accent],
        className,
      )}
      padding="md"
    >
      <header className="space-y-3">
        {eyebrow ? <Badge variant="neutral">{eyebrow}</Badge> : null}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{title}</h2>
          {description ? (
            <p className="text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      {children}
    </Card>
  );
}
