import { notFound } from "next/navigation";

import { Breadcrumbs } from "../../../../../../components/layout/Breadcrumbs";
import { QuizExperience } from "../../../../../../features/quiz";
import { getChapterWithContent, getQuizByChapter } from "../../../../../../lib/content";
import {
  getGradeLabel,
  getVolumeLabel,
  isGradeId,
  isVolumeId,
  routePaths,
} from "../../../../../../lib/routes";

type QuizPageProps = {
  params: Promise<{
    grade: string;
    volume: string;
    chapterId: string;
  }>;
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { grade, volume, chapterId } = await params;

  if (!isGradeId(grade) || !isVolumeId(volume)) {
    notFound();
  }

  const chapterContent = getChapterWithContent(grade, volume, chapterId);
  const quiz = getQuizByChapter(grade, volume, chapterId);

  if (!chapterContent || !quiz) {
    notFound();
  }

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
          { label: "单元测验" },
        ]}
      />

      <section className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[0.72fr,0.28fr]">
          <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-white/78 px-5 py-4 shadow-[var(--shadow-sm)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Quiz Context
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
              {chapterContent.chapter.title}
            </p>
          </div>
          <div className="rounded-[1.8rem] bg-[var(--color-text)] px-5 py-4 text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]">
            <p className="text-sm uppercase tracking-[0.18em] text-white/68">Current View</p>
            <p className="mt-2 text-lg font-semibold">单元测验页</p>
          </div>
        </div>

        <QuizExperience
          quiz={quiz}
          lessonMetaById={lessonMetaById}
          exampleMetaById={exampleMetaById}
          resultHref={routePaths.quizResult(grade, volume, chapterId)}
        />
      </section>
    </main>
  );
}
