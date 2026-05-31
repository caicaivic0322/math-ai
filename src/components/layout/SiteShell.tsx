import type { ReactNode } from "react";

type SiteShellProps = {
  children: ReactNode;
  className?: string;
};

export function SiteShell({ children, className = "" }: SiteShellProps) {
  return (
    <div
      className={[
        "min-h-screen bg-[var(--color-background)] text-[var(--color-text)]",
        "bg-[radial-gradient(circle_at_top,_color-mix(in_oklch,var(--color-primary)_12%,transparent),_transparent_30%),radial-gradient(circle_at_left,_color-mix(in_oklch,var(--color-accent)_14%,transparent),_transparent_24%)]",
        className,
      ].join(" ")}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
