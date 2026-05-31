import Link from "next/link";

import { cn } from "@/lib/theme";
import { Badge, Card } from "@/components/ui";

export type RelatedContentItem = {
  id: string;
  title: string;
  summary: string;
  label?: string;
  href?: string;
};

type RelatedContentListProps = {
  title: string;
  items: RelatedContentItem[];
  emptyMessage?: string;
  className?: string;
};

export function RelatedContentList({
  title,
  items,
  emptyMessage = "暂时还没有关联内容。",
  className,
}: RelatedContentListProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-[-0.02em]">{title}</h3>
        <span className="text-sm text-[var(--color-text-muted)]">{items.length} 条</span>
      </div>

      {items.length === 0 ? (
        <Card variant="outlined" className="rounded-[1.5rem] text-sm text-[var(--color-text-muted)]">
          {emptyMessage}
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => {
            const content = (
              <article className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {item.label ? <Badge variant="primary">{item.label}</Badge> : null}
                  <h4 className="text-base font-semibold tracking-[-0.02em] text-[var(--color-text)]">
                    {item.title}
                  </h4>
                </div>
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">{item.summary}</p>
              </article>
            );

            return (
              <Card
                key={item.id}
                variant="outlined"
                className="rounded-[1.5rem] transition hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-surface)]"
              >
                {item.href ? (
                  <Link href={item.href} className="block">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
