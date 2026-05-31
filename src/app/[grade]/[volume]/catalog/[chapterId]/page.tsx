import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "../../../../../components/layout/Breadcrumbs";
import { Badge, Card, SectionHeader } from "../../../../../components/ui";
import { getChapterWithContent } from "../../../../../lib/content";
import {
  getGradeLabel,
  getVolumeLabel,
  isGradeId,
  isVolumeId,
  routePaths,
} from "../../../../../lib/routes";

type ChapterPageProps = {
  params: Promise<{
    grade: string;
    volume: string;
    chapterId: string;
  }>;
};

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { grade, volume, chapterId } = await params;

  if (!isGradeId(grade) || !isVolumeId(volume)) {
    notFound();
  }

  const chapterContent = getChapterWithContent(grade, volume, chapterId);

  if (!chapterContent) {
    notFound();
  }

  const { chapter, lessons, workedExamples, quiz } = chapterContent;

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
          { label: "章节学习中心" },
        ]}
      />

      <section className="poster-panel overflow-hidden rounded-[2.5rem] border border-[color-mix(in_oklch,var(--color-primary)_15%,var(--color-border))] bg-[linear-gradient(140deg,color-mix(in_oklch,var(--color-surface)_80%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_44%,white)_62%,color-mix(in_oklch,var(--color-accent)_12%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
          <div>
            <SectionHeader
              eyebrow="章节学习中心"
              title={chapter.title}
              description={chapter.summary}
            />

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="primary">{lessons.length} 个知识点</Badge>
              <Badge variant="warning">{workedExamples.length} 个例题</Badge>
              <Badge variant="success">{quiz.questions.length} 题小测</Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/85 p-4 shadow-[var(--shadow-sm)]">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Step 1</p>
              <p className="mt-2 text-lg font-semibold">先懂概念</p>
            </div>
            <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/78 p-4 shadow-[var(--shadow-sm)]">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Step 2</p>
              <p className="mt-2 text-lg font-semibold">再看例题</p>
            </div>
            <div className="rounded-[1.6rem] bg-[var(--color-text)] p-4 text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]">
              <p className="text-sm uppercase tracking-[0.18em] text-white/68">Step 3</p>
              <p className="mt-2 text-lg font-semibold">最后小测</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
        <Card variant="elevated" className="rounded-[2.2rem] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_88%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_16%,white)_100%)]">
          <SectionHeader
            eyebrow="先学概念"
            title="知识点精讲"
            description="建议先学规则和方法，再去看例题，最后做单元测验。"
          />
          <div className="mt-5 grid gap-4">
            {lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={routePaths.lesson(grade, volume, chapterId, lesson.slug)}
                className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/84 p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    知识点 {index + 1}
                  </p>
                  <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    Learn
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{lesson.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                  {lesson.summary}
                </p>
              </Link>
            ))}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card variant="elevated" className="rounded-[2.2rem] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_90%,white)_0%,color-mix(in_oklch,var(--color-accent)_12%,white)_100%)]">
            <SectionHeader
              eyebrow="再看会做"
              title="典型例题"
              description="围绕考试高频场景做步骤拆解和失分提醒。"
            />
            <div className="mt-5 grid gap-3">
              {workedExamples.map((example, index) => (
                <Link
                  key={example.id}
                  href={routePaths.example(grade, volume, chapterId, example.slug)}
                  className="rounded-[1.4rem] border border-[var(--color-border)] bg-white/84 px-4 py-4 transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
                >
                  <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
                    例题 {index + 1}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{example.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                    {example.summary}
                  </p>
                </Link>
              ))}
            </div>
          </Card>

          <Card variant="soft" className="rounded-[2.2rem] border border-[color-mix(in_oklch,var(--color-primary)_15%,var(--color-border))] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-primary-soft)_66%,white)_0%,color-mix(in_oklch,var(--color-accent)_14%,white)_100%)]">
            <SectionHeader
              eyebrow="最后检测"
              title="单元测验"
              description="完成本章小测，立即查看分数、解析和建议复习的知识点。"
            />
            <div className="mt-5 flex items-center justify-between gap-4 rounded-[1.6rem] bg-white/82 px-5 py-5 shadow-[var(--shadow-sm)]">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">题量</p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{quiz.questions.length} 题</p>
              </div>
              <Link
                href={routePaths.quiz(grade, volume, chapterId)}
                className="rounded-full bg-[var(--color-text)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]"
              >
                开始测验
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
