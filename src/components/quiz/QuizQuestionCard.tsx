import type {
  QuizAnswerValue,
  QuizBlankAnswerMap,
  QuizMultipleChoiceAnswer,
  QuizQuestion,
} from "@/types/content";

import { Badge, Card } from "@/components/ui";
import { getQuizDifficultyLabel, getQuizQuestionTypeLabel } from "@/lib/quiz";
import { cn } from "@/lib/theme";
import { QuizFigureRenderer } from "./QuizFigureRenderer";

type QuizQuestionCardProps = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  answer?: QuizAnswerValue | null;
  onAnswerChange: (answer: QuizAnswerValue) => void;
  disabled?: boolean;
  className?: string;
};

export function QuizQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
  disabled = false,
  className,
}: QuizQuestionCardProps) {
  const difficultyVariant =
    question.difficulty === "basic"
      ? "primary"
      : question.difficulty === "advanced"
        ? "warning"
        : "danger";

  const fillBlankAnswer =
    (question.type === "fill-blank" || question.type === "step-by-step")
    && answer
    && typeof answer === "object"
    && !Array.isArray(answer)
      ? answer
      : {};
  const multipleChoiceAnswer =
    question.type === "multiple-choice" && Array.isArray(answer) ? answer : [];

  function handleBlankAnswerChange(blankId: string, nextValue: string) {
    if (question.type !== "fill-blank" && question.type !== "step-by-step") {
      return;
    }

    const nextAnswer: QuizBlankAnswerMap = {
      ...(fillBlankAnswer as QuizBlankAnswerMap),
      [blankId]: nextValue,
    };

    onAnswerChange(nextAnswer);
  }

  function handleMultipleChoiceToggle(optionId: string) {
    if (question.type !== "multiple-choice") {
      return;
    }

    const answerSet = new Set(multipleChoiceAnswer);
    if (answerSet.has(optionId)) {
      answerSet.delete(optionId);
    } else {
      answerSet.add(optionId);
    }

    onAnswerChange(Array.from(answerSet) as QuizMultipleChoiceAnswer);
  }

  return (
    <Card
      variant="elevated"
      padding="lg"
      className={cn("animate-fade-up relative overflow-visible rounded-[2rem]", className)}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="primary" size="md">
          第 {questionNumber} / {totalQuestions} 题
        </Badge>
        <Badge variant={difficultyVariant} size="md">
          {getQuizDifficultyLabel(question.difficulty)}
        </Badge>
        <span className="text-sm text-[var(--color-text-muted)]">
          {getQuizQuestionTypeLabel(question.type)}
        </span>
      </div>

      <h2 className="mt-5 text-xl font-semibold leading-8 text-[var(--color-text)]">
        {question.stem}
      </h2>

      {question.figure ? (
        <QuizFigureRenderer figure={question.figure} className="mt-6" />
      ) : null}

      {question.type === "single-choice" ? (
        <fieldset className="mt-6 space-y-3" disabled={disabled}>
          <legend className="sr-only">{question.stem}</legend>

          {question.options.map((option) => {
            const isSelected = option.id === answer;

            return (
              <label
                key={option.id}
                className={cn(
                  "interactive-lift interactive-press flex cursor-pointer items-start gap-4 rounded-[var(--radius-xl)] border p-4 transition duration-200",
                  isSelected
                    ? "animate-pop-in border-[var(--color-primary)] bg-[var(--color-primary-soft)] shadow-[var(--shadow-md)]"
                    : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]/40",
                  disabled && "cursor-not-allowed opacity-80",
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onAnswerChange(option.id)}
                  className="mt-1 h-4 w-4 border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--color-surface-strong)] px-2 text-sm font-semibold text-[var(--color-text)]">
                      {option.label}
                    </span>
                    <p className="text-base leading-7 text-[var(--color-text)]">{option.content}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </fieldset>
      ) : null}

      {question.type === "multiple-choice" ? (
        <fieldset className="mt-6 space-y-3" disabled={disabled}>
          <legend className="sr-only">{question.stem}</legend>

          {question.options.map((option) => {
            const isSelected = multipleChoiceAnswer.includes(option.id);

            return (
              <label
                key={option.id}
                className={cn(
                  "interactive-lift interactive-press flex cursor-pointer items-start gap-4 rounded-[var(--radius-xl)] border p-4 transition duration-200",
                  isSelected
                    ? "animate-pop-in border-[var(--color-primary)] bg-[var(--color-primary-soft)] shadow-[var(--shadow-md)]"
                    : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]/40",
                  disabled && "cursor-not-allowed opacity-80",
                )}
              >
                <input
                  type="checkbox"
                  name={`${question.id}-${option.id}`}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleMultipleChoiceToggle(option.id)}
                  className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--color-surface-strong)] px-2 text-sm font-semibold text-[var(--color-text)]">
                      {option.label}
                    </span>
                    <p className="text-base leading-7 text-[var(--color-text)]">{option.content}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </fieldset>
      ) : null}

      {question.type === "numeric" || question.type === "expression" ? (
        <div className="mt-6 rounded-[1.6rem] border border-[var(--color-border)] bg-white p-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            {question.type === "numeric"
              ? "填写数值结果，支持分数、小数等常见写法。"
              : "填写化简后的表达式，系统会做基础等价判断。"}
          </p>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[var(--color-text)]">{question.prompt}</span>
            <input
              type="text"
              value={typeof answer === "string" ? answer : ""}
              placeholder={question.placeholder ?? "请在此作答"}
              disabled={disabled}
              onChange={(event) => onAnswerChange(event.target.value)}
              className="mt-2 w-full rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
            />
          </label>
        </div>
      ) : null}

      {question.type === "fill-blank" ? (
        <div className="mt-6 rounded-[1.6rem] border border-[var(--color-border)] bg-white p-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            观察图形后，在对应输入框中完成看图列式或计算。
          </p>
          <div className="mt-4 grid gap-4">
            {question.blanks.map((blank) => (
              <label key={blank.id} className="block">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {blank.prompt}
                </span>
                <span className="mt-1 block text-sm leading-6 text-[var(--color-text-muted)]">
                  提示：{blank.hint}
                </span>
                <input
                  type="text"
                  value={(fillBlankAnswer as QuizBlankAnswerMap)[blank.id] ?? ""}
                  placeholder={blank.placeholder ?? "请在此作答"}
                  disabled={disabled}
                  onChange={(event) => handleBlankAnswerChange(blank.id, event.target.value)}
                  className="mt-2 w-full rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {question.type === "step-by-step" ? (
        <div className="mt-6 rounded-[1.6rem] border border-[var(--color-border)] bg-white p-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            按步骤填写关键中间结果，系统会按步骤给分。
          </p>
          <div className="mt-4 grid gap-4">
            {question.steps.map((step) => (
              <label key={step.id} className="block">
                {step.title ? (
                  <span className="mb-1 block text-sm font-semibold text-[var(--color-primary)]">
                    {step.title}
                  </span>
                ) : null}
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {step.prompt}
                </span>
                <span className="mt-1 block text-sm leading-6 text-[var(--color-text-muted)]">
                  提示：{step.hint}
                </span>
                <input
                  type="text"
                  value={(fillBlankAnswer as QuizBlankAnswerMap)[step.id] ?? ""}
                  placeholder={step.placeholder ?? "请在此作答"}
                  disabled={disabled}
                  onChange={(event) => handleBlankAnswerChange(step.id, event.target.value)}
                  className="mt-2 w-full rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
