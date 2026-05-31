import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "../../../../../../../components/layout/Breadcrumbs";
import { Card, SectionHeader } from "../../../../../../../components/ui";
import { WorkedExampleView } from "../../../../../../../features/example";
import {
  getChapterWithContent,
  getRelatedLessons,
  getWorkedExampleBySlug,
} from "../../../../../../../lib/content";
import {
  getGradeLabel,
  getVolumeLabel,
  isGradeId,
  isVolumeId,
  routePaths,
} from "../../../../../../../lib/routes";

type ExamplePageProps = {
  params: Promise<{
    grade: string;
    volume: string;
    chapterId: string;
    exampleSlug: string;
  }>;
};

export default async function ExamplePage({ params }: ExamplePageProps) {
  const { grade, volume, chapterId, exampleSlug } = await params;

  if (!isGradeId(grade) || !isVolumeId(volume)) {
    notFound();
  }

  const chapterContent = getChapterWithContent(grade, volume, chapterId);
  const example = getWorkedExampleBySlug(grade, volume, chapterId, exampleSlug);

  if (!chapterContent || !example) {
    notFound();
  }

  const relatedLessons = getRelatedLessons(example.relatedLessonIds);
  const relatedLessonItems = relatedLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    label: "相关知识点",
    href: routePaths.lesson(grade, volume, chapterId, lesson.slug),
  }));

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
          { label: example.title },
        ]}
      />

      <section className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[0.72fr,0.28fr]">
          <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-white/78 px-5 py-4 shadow-[var(--shadow-sm)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Chapter Context
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
              {chapterContent.chapter.title}
            </p>
          </div>
          <div className="rounded-[1.8rem] bg-[var(--color-text)] px-5 py-4 text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]">
            <p className="text-sm uppercase tracking-[0.18em] text-white/68">Current View</p>
            <p className="mt-2 text-lg font-semibold">例题精讲页</p>
          </div>
        </div>

        <WorkedExampleView example={example} relatedLessonItems={relatedLessonItems} />

        <Card
          variant="soft"
          className="rounded-[2.2rem] border border-[color-mix(in_oklch,var(--color-accent)_18%,var(--color-border))] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_88%,white)_0%,color-mix(in_oklch,var(--color-accent)_16%,white)_100%)]"
        >
          <SectionHeader
            eyebrow="课后检测"
            title="例题看懂后，立刻去测"
            description={`本章小测共 ${chapterContent.quiz.questions.length} 题，适合在看完例题后马上做一次巩固。`}
          />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[1.6rem] bg-white/84 px-5 py-5 shadow-[var(--shadow-sm)]">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">对应章节</p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                {chapterContent.chapter.title}
              </p>
            </div>
            <Link
              href={routePaths.quiz(grade, volume, chapterId)}
              className="rounded-full bg-[var(--color-text)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]"
            >
              去做课后测试
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
