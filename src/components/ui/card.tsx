import type { HTMLAttributes } from "react";

import { cn } from "../../lib/theme";

type CardVariant = "default" | "soft" | "outlined" | "elevated";
type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = HTMLAttributes<HTMLElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: "div" | "section" | "article";
};

const variantClasses: Record<CardVariant, string> = {
  default:
    "border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]",
  soft: "border border-transparent bg-[var(--color-primary-soft)] shadow-none",
  outlined: "border border-[var(--color-border)] bg-transparent shadow-none",
  elevated:
    "border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  as: Component = "section",
  variant = "default",
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "overflow-hidden rounded-[var(--radius-xl)] text-[var(--color-text)]",
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  );
}
