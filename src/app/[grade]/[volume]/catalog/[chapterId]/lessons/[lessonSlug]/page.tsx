import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "../../../../../../../components/layout/Breadcrumbs";
import { Card, SectionHeader } from "../../../../../../../components/ui";
import { LessonContentView } from "../../../../../../../features/lesson";
import {
  getChapterWithContent,
  getLessonBySlug,
  getRelatedWorkedExamples,
} from "../../../../../../../lib/content";
import {
  getGradeLabel,
  getVolumeLabel,
  isGradeId,
  isVolumeId,
  routePaths,
} from "../../../../../../../lib/routes";

type LessonPageProps = {
  params: Promise<{
    grade: string;
    volume: string;
    chapterId: string;
    lessonSlug: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { grade, volume, chapterId, lessonSlug } = await params;

  if (!isGradeId(grade) || !isVolumeId(volume)) {
    notFound();
  }

  const chapterContent = getChapterWithContent(grade, volume, chapterId);
  const lesson = getLessonBySlug(grade, volume, chapterId, lessonSlug);

  if (!chapterContent || !lesson) {
    notFound();
  }

  const relatedExamples = getRelatedWorkedExamples(lesson.relatedExampleIds);
  const relatedExampleItems = relatedExamples.map((example) => ({
    id: example.id,
    title: example.title,
    summary: example.summary,
    label: "关联例题",
    href: routePaths.example(grade, volume, chapterId, example.slug),
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
          { label: lesson.title },
        ]}
      />

      <section className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[0.72fr,0.28fr]">
          <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-white/78 px-5 py-4 shadow-[var(--shadow-sm)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Chapter Context
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
              {chapterContent.chapter.title}
            </p>
          </div>
          <div className="rounded-[1.8rem] bg-[var(--color-text)] px-5 py-4 text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]">
            <p className="text-sm uppercase tracking-[0.18em] text-white/68">Current View</p>
            <p className="mt-2 text-lg font-semibold">知识点详情页</p>
          </div>
        </div>

        <LessonContentView lesson={lesson} relatedExampleItems={relatedExampleItems} />

        <Card
          variant="soft"
          className="rounded-[2.2rem] border border-[color-mix(in_oklch,var(--color-primary)_15%,var(--color-border))] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-primary-soft)_68%,white)_0%,color-mix(in_oklch,var(--color-accent)_12%,white)_100%)]"
        >
          <SectionHeader
            eyebrow="课后检测"
            title="学完这节，马上做小测"
            description={`本章已配置 ${chapterContent.quiz.questions.length} 道测验题，建议学完当前知识点后立即检测。`}
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
