import type { HTMLAttributes } from "react";

import { cn } from "../../lib/theme";

type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger";
type BadgeSize = "sm" | "md";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral:
    "bg-[var(--color-surface-strong)] text-[var(--color-text)] border border-[var(--color-border)]",
  primary:
    "bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-transparent",
  success:
    "bg-[color-mix(in_oklch,var(--color-success),white_82%)] text-[var(--color-success)] border border-transparent",
  warning:
    "bg-[color-mix(in_oklch,var(--color-warning),white_82%)] text-[var(--color-warning)] border border-transparent",
  danger:
    "bg-[color-mix(in_oklch,var(--color-danger),white_86%)] text-[var(--color-danger)] border border-transparent",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-6 px-2 text-[0.75rem]",
  md: "h-7 px-2.5 text-sm",
};

export function Badge({
  variant = "neutral",
  size = "sm",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-pill)] font-medium leading-none",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
