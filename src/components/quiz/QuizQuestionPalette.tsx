import type { QuizAnswerMap, QuizQuestion } from "@/types/content";

import { Badge, Button, Card } from "@/components/ui";
import {
  getQuizDifficultyLabel,
  getQuizQuestionTypeLabel,
  isQuizAnswerFilled,
} from "@/lib/quiz";
import { cn } from "@/lib/theme";

type QuizQuestionPaletteProps = {
  questions: QuizQuestion[];
  answers: QuizAnswerMap;
  currentQuestionId: string;
  onSelectQuestion: (questionIndex: number) => void;
  disabled?: boolean;
  className?: string;
};

export function QuizQuestionPalette({
  questions,
  answers,
  currentQuestionId,
  onSelectQuestion,
  disabled = false,
  className,
}: QuizQuestionPaletteProps) {
  const answeredCount = questions.filter((question) =>
    isQuizAnswerFilled(answers[question.id]),
  ).length;
  const difficultyMeta = [
    { id: "basic", label: getQuizDifficultyLabel("basic"), variant: "primary" as const },
    { id: "advanced", label: getQuizDifficultyLabel("advanced"), variant: "warning" as const },
    { id: "challenge", label: getQuizDifficultyLabel("challenge"), variant: "danger" as const },
  ];
  const fillBlankCount = questions.filter((question) => question.type === "fill-blank").length;

  return (
    <Card
      variant="soft"
      padding="md"
      className={cn("animate-fade-up rounded-[2rem] border border-[var(--color-border)]", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">答题进度</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            已完成 {answeredCount} / {questions.length} 题
          </p>
        </div>
        <Badge variant="primary" size="md">
          {fillBlankCount > 0 ? "混合题型" : getQuizQuestionTypeLabel("single-choice")}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {fillBlankCount > 0 ? (
          <Badge variant="neutral" size="md">
            图形填空 · {fillBlankCount} 题
          </Badge>
        ) : null}
        {difficultyMeta.map((item) => (
          <Badge key={item.id} variant={item.variant} size="md">
            {item.label} · {questions.filter((question) => question.difficulty === item.id).length} 题
          </Badge>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {questions.map((question, index) => {
          const isCurrent = question.id === currentQuestionId;
          const isAnswered = isQuizAnswerFilled(answers[question.id]);

          return (
            <Button
              key={question.id}
              type="button"
              size="sm"
              variant={isCurrent ? "primary" : "secondary"}
              disabled={disabled}
              onClick={() => onSelectQuestion(index)}
              className={cn(
                "min-w-0 rounded-2xl px-0 font-semibold",
                !isCurrent && isAnswered && "border-[var(--color-primary)] bg-white",
              )}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
