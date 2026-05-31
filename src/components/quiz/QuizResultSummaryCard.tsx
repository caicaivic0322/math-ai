import type { QuizResultSummary } from "@/types/content";

import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/theme";

export type QuizLessonMeta = {
  title: string;
  href?: string;
};

export type QuizExampleMeta = {
  title: string;
  href?: string;
};

type QuizResultSummaryCardProps = {
  summary: QuizResultSummary;
  lessonMetaById?: Record<string, QuizLessonMeta>;
  className?: string;
};

export function QuizResultSummaryCard({
  summary,
  lessonMetaById,
  className,
}: QuizResultSummaryCardProps) {
  const metrics = [
    { label: "得分", value: `${summary.score}` },
    { label: "答对", value: `${summary.correctCount} / ${summary.totalQuestions}` },
    { label: "得点", value: `${summary.earnedPoints.toFixed(1)} / ${summary.totalQuestions}` },
  ];

  return (
    <Card
      variant="elevated"
      padding="lg"
      className={cn("animate-fade-up overflow-visible rounded-[2.2rem]", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={summary.passed ? "success" : "warning"} size="md">
              {summary.passed ? "闯关成功" : "继续加油"}
            </Badge>
            <span className="text-sm text-[var(--color-text-muted)]">
              提交后已生成逐题解析与复习建议
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--color-text)]">
            本次小测得分 {summary.score} 分
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            {summary.passed
              ? "你已经掌握了本章的核心基础，可以继续练习巩固速度和稳定性。"
              : "先把错题对应的知识点回顾一遍，再回来重做一次，进步会非常明显。"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
            多选题、分步题和多空填空题都支持细粒度计分，答对一部分也会计入本次得分。
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="animate-pop-in rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4"
          >
            <p className="text-sm text-[var(--color-text-muted)]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{metric.value}</p>
          </div>
        ))}
      </div>

      {summary.suggestedLessonIds.length > 0 ? (
        <div className="mt-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-primary-soft)]/60 p-5">
          <h3 className="text-base font-semibold text-[var(--color-text)]">建议先复习这些内容</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-text-muted)]">
            {summary.suggestedLessonIds.map((lessonId) => {
              const lessonMeta = lessonMetaById?.[lessonId];
              const label = lessonMeta?.title ?? lessonId;

              return (
                <li key={lessonId}>
                  {lessonMeta?.href ? (
                    <a
                      href={lessonMeta.href}
                      className="font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
                    >
                      {label}
                    </a>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
