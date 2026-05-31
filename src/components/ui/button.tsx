import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "../../lib/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "sm" | "md" | "lg";

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLink = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)] hover:opacity-95 hover:shadow-[var(--shadow-lg)]",
  secondary:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-none hover:bg-[var(--color-surface-strong)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-strong)]",
  destructive:
    "border border-transparent bg-[var(--color-danger)] text-white shadow-[var(--shadow-md)] hover:opacity-95 hover:shadow-[var(--shadow-lg)]",
  link: "border border-transparent bg-transparent px-0 text-[var(--color-primary)] underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const baseClasses =
  "interactive-lift interactive-press inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50";

function renderSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    iconLeft,
    iconRight,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    variant !== "link" && sizeClasses[size],
    loading && "cursor-wait",
    className,
  );

  if ("href" in props) {
    const { href, onClick, target, rel, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        href={href}
        aria-disabled={loading || anchorProps["aria-disabled"]}
        data-loading={loading || undefined}
        className={classes}
        onClick={loading ? (event) => event.preventDefault() : onClick}
        target={target}
        rel={rel}
        {...anchorProps}
      >
        {loading ? renderSpinner() : iconLeft}
        <span>{children}</span>
        {!loading && iconRight}
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={buttonProps.type ?? "button"}
      data-loading={loading || undefined}
      className={classes}
      disabled={buttonProps.disabled || loading}
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      {loading ? renderSpinner() : iconLeft}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
}
