import type { QuizResultSummary } from "@/types/content";

import { Badge, Card } from "@/components/ui";
import { getQuizDifficultyLabel, getQuizQuestionTypeLabel } from "@/lib/quiz";
import { cn } from "@/lib/theme";
import type { QuizExampleMeta, QuizLessonMeta } from "./QuizResultSummaryCard";
import { QuizFigureRenderer } from "./QuizFigureRenderer";

type QuizQuestionReviewListProps = {
  summary: QuizResultSummary;
  lessonMetaById?: Record<string, QuizLessonMeta>;
  exampleMetaById?: Record<string, QuizExampleMeta>;
  className?: string;
};

export function QuizQuestionReviewList({
  summary,
  lessonMetaById,
  exampleMetaById,
  className,
}: QuizQuestionReviewListProps) {
  return (
    <div className={cn("stagger-children space-y-4", className)}>
      {summary.questionResults.map((result, index) => {
        const difficultyVariant =
          result.difficulty === "basic"
            ? "primary"
            : result.difficulty === "advanced"
              ? "warning"
              : "danger";
        const statusVariant = result.isCorrect
          ? "success"
          : result.earnedFraction > 0
            ? "warning"
            : "danger";
        const statusLabel = result.isCorrect
          ? "回答正确"
          : result.earnedFraction > 0
            ? `部分得分 ${Math.round(result.earnedFraction * 100)}%`
            : "需要订正";

        return (
          <Card key={result.questionId} variant="default" padding="lg" className="rounded-[2rem]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">第 {index + 1} 题</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant={difficultyVariant} size="md">
                    {getQuizDifficultyLabel(result.difficulty)}
                  </Badge>
                  <Badge variant="neutral" size="md">
                    {getQuizQuestionTypeLabel(result.type)}
                  </Badge>
                  <h3 className="text-lg font-semibold leading-7 text-[var(--color-text)]">
                    {result.stem}
                  </h3>
                </div>
              </div>
              <Badge variant={statusVariant} size="md">
                {statusLabel}
              </Badge>
            </div>

            {result.figure ? (
              <QuizFigureRenderer figure={result.figure} className="mt-5" />
            ) : null}

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <p className="text-sm text-[var(--color-text-muted)]">你的答案</p>
                <p className="mt-2 text-base font-medium text-[var(--color-text)]">
                  {result.learnerAnswer ?? "未作答"}
                </p>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-primary-soft)]/60 p-4">
                <p className="text-sm text-[var(--color-text-muted)]">正确答案</p>
                <p className="mt-2 text-base font-medium text-[var(--color-text)]">
                  {result.correctAnswer}
                </p>
              </div>
            </div>

            {result.answerBreakdown && result.answerBreakdown.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {result.answerBreakdown.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {item.prompt}
                      </p>
                      <Badge variant={item.isCorrect ? "success" : "warning"} size="sm">
                        {item.isCorrect ? "正确" : "待改"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                      你的填写：{item.learnerAnswer ?? "未作答"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      标准答案：{item.correctAnswer}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4">
              <p className="text-sm font-semibold text-[var(--color-text)]">解析</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                {result.explanation}
              </p>

              {result.relatedLessonIds.length > 0 || result.relatedExampleIds.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {result.relatedLessonIds.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        相关知识点
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.relatedLessonIds.map((lessonId) => {
                          const lessonMeta = lessonMetaById?.[lessonId];
                          const label = lessonMeta?.title ?? lessonId;

                          return lessonMeta?.href ? (
                            <a
                              key={lessonId}
                              href={lessonMeta.href}
                              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-primary)]"
                            >
                              {label}
                            </a>
                          ) : (
                            <span
                              key={lessonId}
                              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-text)]"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {result.relatedExampleIds.length > 0 ? (
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        相关例题
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.relatedExampleIds.map((exampleId) => {
                          const exampleMeta = exampleMetaById?.[exampleId];
                          const label = exampleMeta?.title ?? exampleId;

                          return exampleMeta?.href ? (
                            <a
                              key={exampleId}
                              href={exampleMeta.href}
                              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-accent)]"
                            >
                              {label}
                            </a>
                          ) : (
                            <span
                              key={exampleId}
                              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-text)]"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
