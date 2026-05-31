"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  QuizExampleMeta,
  QuizQuestionCard,
  QuizQuestionPalette,
  QuizQuestionReviewList,
  QuizResultSummaryCard,
  type QuizLessonMeta,
} from "@/components/quiz";
import { Button, Card, EmptyState } from "@/components/ui";
import {
  buildQuizResult,
  getQuizDifficultyLabel,
  isQuizAnswerFilled,
  serializeQuizAnswers,
} from "@/lib/quiz";
import { cn } from "@/lib/theme";
import type {
  QuizAnswerMap,
  QuizAnswerValue,
  QuizResultSummary,
  UnitQuiz,
} from "@/types/content";

type QuizExperienceProps = {
  quiz: UnitQuiz;
  initialAnswers?: QuizAnswerMap;
  lessonMetaById?: Record<string, QuizLessonMeta>;
  exampleMetaById?: Record<string, QuizExampleMeta>;
  resultHref?: string;
  onSubmit?: (result: QuizResultSummary, answers: QuizAnswerMap) => void;
  className?: string;
};

export function QuizExperience({
  quiz,
  initialAnswers,
  lessonMetaById,
  exampleMetaById,
  resultHref,
  onSubmit,
  className,
}: QuizExperienceProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuizAnswerMap>(initialAnswers ?? {});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<QuizResultSummary | null>(null);

  const currentQuestion = quiz.questions[currentIndex];
  const answeredCount = useMemo(
    () =>
      quiz.questions.filter((question) => isQuizAnswerFilled(answers[question.id])).length,
    [answers, quiz.questions],
  );
  const unansweredCount = quiz.questions.length - answeredCount;
  const difficultySummary = useMemo(
    () =>
      [
        { id: "basic" as const, label: getQuizDifficultyLabel("basic") },
        { id: "advanced" as const, label: getQuizDifficultyLabel("advanced") },
        { id: "challenge" as const, label: getQuizDifficultyLabel("challenge") },
      ]
        .map((item) => ({
          ...item,
          count: quiz.questions.filter((question) => question.difficulty === item.id).length,
        }))
        .filter((item) => item.count > 0),
    [quiz.questions],
  );

  function handleAnswerChange(nextAnswer: QuizAnswerValue) {
    if (!currentQuestion) {
      return;
    }

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: nextAnswer,
    }));
  }

  function handleSubmit() {
    const nextResult = buildQuizResult(quiz, answers);

    if (resultHref) {
      const serializedAnswers = serializeQuizAnswers(answers);
      router.push(`${resultHref}?answers=${encodeURIComponent(serializedAnswers)}`);
      return;
    }

    setResult(nextResult);
    onSubmit?.(nextResult, answers);
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
  }

  if (!currentQuestion) {
    return (
      <EmptyState
        title="这套测验暂时还不能开始"
        description="当前章节的小测还没有题目，稍后补齐后就可以在这里直接作答并查看解析。"
      />
    );
  }

  return (
    <section className={cn("space-y-6", className)}>
      <Card
        variant="soft"
        padding="lg"
        className="poster-panel animate-fade-up overflow-visible rounded-[2.4rem] border-[color-mix(in_oklch,var(--color-primary)_18%,var(--color-border))] bg-[linear-gradient(145deg,color-mix(in_oklch,var(--color-primary-soft)_62%,white)_0%,color-mix(in_oklch,var(--color-accent)_14%,white)_100%)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">
              Chapter Quiz
            </p>
            <h1 className="mt-3 text-[clamp(2.2rem,4vw,4rem)] font-semibold tracking-[-0.06em] text-[var(--color-text)]">
              {quiz.title}
            </h1>
            <p className="mt-4 text-base leading-8 text-[var(--color-text-muted)]">
              {quiz.instructions}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--color-text-muted)]">
              {difficultySummary.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1"
                >
                  {item.label} {item.count} 题
                </span>
              ))}
            </div>
          </div>
          <div className="animate-pop-in rounded-[1.8rem] border border-[var(--color-border)] bg-white/84 px-5 py-4 text-right shadow-[var(--shadow-md)]">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">当前进度</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">
              {answeredCount} / {quiz.questions.length}
            </p>
          </div>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/80">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-300"
            style={{
              width: `${quiz.questions.length === 0 ? 0 : (answeredCount / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
      </Card>

      {result ? (
        <>
          <QuizResultSummaryCard summary={result} lessonMetaById={lessonMetaById} />
          <Card
            variant="outlined"
            padding="md"
            className="animate-fade-up rounded-[2rem] border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_90%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_10%,white)_100%)] flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <p className="text-base font-semibold text-[var(--color-text)]">逐题回看</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                看看每题为什么对，为什么错，再决定要不要重做一次。
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={handleRetry}>
              再做一遍
            </Button>
          </Card>
          <QuizQuestionReviewList
            summary={result}
            lessonMetaById={lessonMetaById}
            exampleMetaById={exampleMetaById}
          />
        </>
      ) : (
        <>
          <QuizQuestionPalette
            questions={quiz.questions}
            answers={answers}
            currentQuestionId={currentQuestion.id}
            onSelectQuestion={setCurrentIndex}
          />

          <QuizQuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={quiz.questions.length}
            answer={answers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
          />

          <Card
            variant="outlined"
            padding="md"
            className="animate-fade-up rounded-[2rem] border-[var(--color-border)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_90%,white)_0%,color-mix(in_oklch,var(--color-accent)_10%,white)_100%)] flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-base font-semibold text-[var(--color-text)]">
                {unansweredCount === 0
                  ? "已经全部答完，可以提交查看解析。"
                  : `还有 ${unansweredCount} 题未作答，也可以直接交卷。`}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                提交后会立即显示分数、每题解析和建议复习内容。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              >
                上一题
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={currentIndex === quiz.questions.length - 1}
                onClick={() =>
                  setCurrentIndex((index) =>
                    Math.min(quiz.questions.length - 1, index + 1),
                  )
                }
              >
                下一题
              </Button>
              <Button type="button" onClick={handleSubmit}>
                提交并查看结果
              </Button>
            </div>
          </Card>
        </>
      )}
    </section>
  );
}
