import { cn } from "@/lib/theme";

type ContentChecklistProps = {
  items: string[];
  tone?: "primary" | "warning" | "success";
  dense?: boolean;
  className?: string;
};

const dotClasses: Record<NonNullable<ContentChecklistProps["tone"]>, string> = {
  primary: "bg-[var(--color-primary)]",
  warning: "bg-[var(--color-warning)]",
  success: "bg-[var(--color-success)]",
};

export function ContentChecklist({
  items,
  tone = "primary",
  dense = false,
  className,
}: ContentChecklistProps) {
  return (
    <ul className={cn("grid gap-3", dense ? "gap-2" : "sm:grid-cols-2", className)}>
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex min-h-14 items-start gap-3 rounded-[1.25rem] bg-[var(--color-background)] px-4 py-3"
        >
          <span
            aria-hidden="true"
            className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", dotClasses[tone])}
          />
          <span className="text-sm leading-7 text-[var(--color-text)] sm:text-[0.95rem]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
