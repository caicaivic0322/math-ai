import type { ReactNode } from "react";

import { cn } from "../../lib/theme";
import { Badge } from "./badge";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "start" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      <div className={cn("space-y-3", centered && "max-w-2xl")}>
        {eyebrow ? <Badge variant="neutral">{eyebrow}</Badge> : null}
        <div className="space-y-2">
          <h2 className="text-[clamp(1.5rem,2vw,2.25rem)] font-semibold tracking-[-0.03em] text-[var(--color-text)]">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-[1rem] text-[var(--color-text-muted)] sm:text-[1.0625rem]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className={cn(centered && "pt-1")}>{action}</div> : null}
    </header>
  );
}
