import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "../../../../../../../components/layout/Breadcrumbs";
import {
  QuizQuestionReviewList,
  QuizResultSummaryCard,
} from "../../../../../../../components/quiz";
import { Card } from "../../../../../../../components/ui";
import { getChapterWithContent, getQuizByChapter } from "../../../../../../../lib/content";
import { buildQuizResult, parseQuizAnswers } from "../../../../../../../lib/quiz";
import {
  getGradeLabel,
  getVolumeLabel,
  isGradeId,
  isVolumeId,
  routePaths,
} from "../../../../../../../lib/routes";

type QuizResultPageProps = {
  params: Promise<{
    grade: string;
    volume: string;
    chapterId: string;
  }>;
  searchParams: Promise<{
    answers?: string;
  }>;
};

export default async function QuizResultPage({
  params,
  searchParams,
}: QuizResultPageProps) {
  const { grade, volume, chapterId } = await params;
  const { answers } = await searchParams;

  if (!isGradeId(grade) || !isVolumeId(volume)) {
    notFound();
  }

  const chapterContent = getChapterWithContent(grade, volume, chapterId);
  const quiz = getQuizByChapter(grade, volume, chapterId);

  if (!chapterContent || !quiz) {
    notFound();
  }

  const answerMap = parseQuizAnswers(answers);
  const summary = buildQuizResult(quiz, answerMap);

  const lessonMetaById = Object.fromEntries(
    chapterContent.lessons.map((lesson) => [
      lesson.id,
      {
        title: lesson.title,
        href: routePaths.lesson(grade, volume, chapterId, lesson.slug),
      },
    ]),
  );
  const exampleMetaById = Object.fromEntries(
    chapterContent.workedExamples.map((example) => [
      example.id,
      {
        title: example.title,
        href: routePaths.example(grade, volume, chapterId, example.slug),
      },
    ]),
  );

  return (
    <main className="flex-1 pb-12">
      <Breadcrumbs
        crumbs={[
          { label: "首页", href: routePaths.home() },
          {
            label: `${getGradeLabel(grade)} ${getVolumeLabel(volume)}`,
            href: routePaths.gradeVolume(grade, volume),
          },
          { label: "教材目录", href: routePaths.catalog(grade, volume) },
          { label: chapterContent.chapter.title, href: routePaths.chapter(grade, volume, chapterId) },
          { label: "单元测验", href: routePaths.quiz(grade, volume, chapterId) },
          { label: "测验结果" },
        ]}
      />

      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[0.72fr,0.28fr]">
          <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-white/78 px-5 py-4 shadow-[var(--shadow-sm)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-success)]">
              Result Context
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
              {chapterContent.chapter.title}
            </p>
          </div>
          <div className="rounded-[1.8rem] bg-[var(--color-text)] px-5 py-4 text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]">
            <p className="text-sm uppercase tracking-[0.18em] text-white/68">Current View</p>
            <p className="mt-2 text-lg font-semibold">测验结果页</p>
          </div>
        </div>

        <QuizResultSummaryCard summary={summary} lessonMetaById={lessonMetaById} />

        <Card
          variant="outlined"
          padding="md"
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-base font-semibold text-[var(--color-text)]">逐题回看</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              每道题都保留了解析和回看入口，方便你从错题直接回到知识点或例题。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={routePaths.quiz(grade, volume, chapterId)}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-medium text-[var(--color-text)]"
            >
              再做一遍
            </Link>
            <Link
              href={routePaths.chapter(grade, volume, chapterId)}
              className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-[var(--color-primary-foreground)]"
            >
              返回章节
            </Link>
          </div>
        </Card>

        <QuizQuestionReviewList
          summary={summary}
          lessonMetaById={lessonMetaById}
          exampleMetaById={exampleMetaById}
        />
      </div>
    </main>
  );
}
