import type { LessonContentBlock } from "@/types/content";

import { cn } from "@/lib/theme";
import { Badge, Card } from "@/components/ui";
import { QuizFigureRenderer } from "@/components/quiz";
import { MathFormula } from "./MathFormula";

type ContentBlockRendererProps = {
  blocks: LessonContentBlock[];
  className?: string;
};

export function ContentBlockRenderer({
  blocks,
  className,
}: ContentBlockRendererProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block) => {
        if (block.type === "richText") {
          return (
            <Card key={block.id} className="rounded-[1.75rem]">
              <div className="space-y-4">
                {block.title ? (
                  <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                    {block.title}
                  </h3>
                ) : null}
                <div className="space-y-3 text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
                  {block.content.map((paragraph, index) => (
                    <p key={`${block.id}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </Card>
          );
        }

        if (block.type === "formula") {
          return (
            <Card
              key={block.id}
              className="rounded-[1.75rem] bg-[linear-gradient(180deg,var(--color-surface)_0%,color-mix(in_oklch,var(--color-primary-soft),white_56%)_100%)]"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary">{block.label ?? "方法归纳"}</Badge>
                  {block.title ? (
                    <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                      {block.title}
                    </h3>
                  ) : null}
                </div>

                <ul className="grid gap-3">
                  {block.formulas.map((formula, index) => (
                    <li
                      key={`${block.id}-${index}`}
                      className="rounded-[1.25rem] border border-white/50 bg-white/65 px-4 py-3 text-sm text-[var(--color-text)] shadow-[var(--shadow-sm)] sm:text-[0.95rem]"
                    >
                      <MathFormula latex={formula} displayMode className="min-h-8" />
                    </li>
                  ))}
                </ul>

                {block.note ? (
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                    {block.note}
                  </p>
                ) : null}
              </div>
            </Card>
          );
        }

        if (block.type === "derivation") {
          return (
            <Card
              key={block.id}
              className="rounded-[1.75rem] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_90%,white)_0%,color-mix(in_oklch,var(--color-accent)_10%,white)_100%)]"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">推导过程</Badge>
                  {block.title ? (
                    <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                      {block.title}
                    </h3>
                  ) : null}
                </div>

                <ol className="space-y-3">
                  {block.steps.map((step, index) => (
                    <li
                      key={step.id}
                      className="rounded-[1.25rem] border border-white/50 bg-white/72 px-4 py-4 shadow-[var(--shadow-sm)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-primary-foreground)]">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          {step.title ? (
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {step.title}
                            </p>
                          ) : null}
                          {step.expression ? (
                            <div className="rounded-[1rem] bg-[var(--color-surface)] px-3 py-3">
                              <MathFormula latex={step.expression} displayMode />
                            </div>
                          ) : null}
                          <p className="text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
                            {step.explanation}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>

                {block.note ? (
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                    {block.note}
                  </p>
                ) : null}
              </div>
            </Card>
          );
        }

        if (block.type === "table") {
          return (
            <Card key={block.id} className="rounded-[1.75rem] overflow-hidden">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">对照表</Badge>
                  {block.title ? (
                    <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                      {block.title}
                    </h3>
                  ) : null}
                </div>

                <div className="overflow-x-auto rounded-[1.25rem] border border-[var(--color-border)]">
                  <table className="min-w-full border-collapse text-left text-sm sm:text-base">
                    <thead className="bg-[color-mix(in_oklch,var(--color-primary-soft),white_35%)]">
                      <tr>
                        {block.columns.map((column) => (
                          <th
                            key={column}
                            className="px-4 py-3 font-semibold text-[var(--color-text)]"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row) => (
                        <tr
                          key={row.id}
                          className={cn(
                            "border-t border-[var(--color-border)]",
                            row.emphasis && "bg-[color-mix(in_oklch,var(--color-accent),white_92%)]",
                          )}
                        >
                          {row.cells.map((cell, index) => (
                            <td
                              key={`${row.id}-${index}`}
                              className="px-4 py-3 leading-7 text-[var(--color-text-muted)]"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {block.note ? (
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                    {block.note}
                  </p>
                ) : null}
              </div>
            </Card>
          );
        }

        if (block.type === "tip") {
          return (
            <Card
              key={block.id}
              className="rounded-[1.75rem] border-[color-mix(in_oklch,var(--color-warning),white_38%)] bg-[color-mix(in_oklch,var(--color-warning),white_92%)]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning">常见失分点</Badge>
                  <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                    {block.title}
                  </h3>
                </div>
                <p className="text-sm leading-7 text-[var(--color-text)] sm:text-base">
                  {block.content}
                </p>
              </div>
            </Card>
          );
        }

        if (block.type === "figure") {
          return (
            <Card
              key={block.id}
              className="rounded-[1.75rem] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_90%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_12%,white)_100%)]"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary">{block.label ?? "图形理解"}</Badge>
                  {block.title ? (
                    <h3 className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                      {block.title}
                    </h3>
                  ) : null}
                </div>

                <QuizFigureRenderer figure={block.figure} />

                {block.note ? (
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                    {block.note}
                  </p>
                ) : null}
              </div>
            </Card>
          );
        }

        return (
          <Card key={block.id} padding="none" className="rounded-[1.75rem]">
            <figure className="space-y-0">
              <img
                src={block.src}
                alt={block.alt}
                className="h-auto w-full rounded-t-[1.75rem] object-cover"
              />
              {block.caption ? (
                <figcaption className="px-5 py-4 text-sm leading-6 text-[var(--color-text-muted)]">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          </Card>
        );
      })}
    </div>
  );
}
