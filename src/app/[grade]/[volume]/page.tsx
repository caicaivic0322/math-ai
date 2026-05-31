import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "../../../components/layout/Breadcrumbs";
import { Badge, EmptyState } from "../../../components/ui";
import { getChapterWithContent, getChaptersByGradeVolume } from "../../../lib/content";
import {
  getGradeLabel,
  getVolumeLabel,
  isGradeId,
  isVolumeId,
  routePaths,
} from "../../../lib/routes";

type GradeVolumePageProps = {
  params: Promise<{
    grade: string;
    volume: string;
  }>;
};

export default async function GradeVolumePage({ params }: GradeVolumePageProps) {
  const { grade, volume } = await params;

  if (!isGradeId(grade) || !isVolumeId(volume)) {
    notFound();
  }

  const chapters = getChaptersByGradeVolume(grade, volume);
  const featuredChapter = chapters[0];
  const featuredContent = featuredChapter
    ? getChapterWithContent(grade, volume, featuredChapter.id)
    : undefined;
  const featuredLesson = featuredContent?.lessons[0];
  const featuredQuiz = featuredContent?.quiz;

  return (
    <main className="flex-1 pb-12">
      <Breadcrumbs
        crumbs={[
          { label: "首页", href: routePaths.home() },
          { label: `${getGradeLabel(grade)} ${getVolumeLabel(volume)}` },
        ]}
      />

      <section className="poster-panel overflow-hidden rounded-[2.5rem] border border-[color-mix(in_oklch,var(--color-primary)_14%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_72%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_48%,white)_64%,color-mix(in_oklch,var(--color-accent)_14%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--color-text)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary-foreground)]">
                Volume Overview
              </span>
              <span className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text-muted)]">
                {chapters.length} 个章节已接入
              </span>
            </div>

            <h1 className="mt-6 text-[clamp(2.8rem,5.2vw,5.2rem)] font-semibold leading-[0.93] tracking-[-0.06em]">
              {getGradeLabel(grade)}
              <span className="mx-3 inline-block text-[0.82em] align-[0.02em] text-[var(--color-text)]/92">
                ·
              </span>
              {getVolumeLabel(volume)}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-muted)]">
              用一条清晰的路径把这册数学学扎实：先看目录，再拆知识点，接着过典型例题，最后用单元测验做反馈。
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <Badge variant="primary">推荐先看知识点，再刷例题</Badge>
              <Badge variant="warning">目录 / 知识点 / 例题 / 小测</Badge>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={routePaths.catalog(grade, volume)}
                className="rounded-full bg-[var(--color-text)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)] transition hover:-translate-y-0.5"
              >
                浏览完整目录
              </Link>
              <Link
                href={routePaths.home()}
                className="rounded-full border border-[var(--color-border)] bg-white/80 px-5 py-3 text-sm font-medium text-[var(--color-text)]"
              >
                返回首页
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rotate-[-3deg] rounded-[2rem] border border-[var(--color-border)] bg-white/90 p-5 shadow-[var(--shadow-md)]">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                学习节奏
              </p>
              <p className="mt-3 text-2xl font-semibold leading-tight">
                目录 / 知识点 / 例题 / 小测
              </p>
            </div>
            <div className="translate-x-3 rounded-[2rem] bg-[var(--color-text)] p-5 text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]">
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">Now Open</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                {featuredChapter?.title ?? "课程准备中"}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/75">
                先用推荐章节进入，会更快体验整套学习流程。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {chapters.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">
                    Chapter Track
                  </p>
                  <h2 className="mt-2 text-[clamp(1.8rem,3vw,2.9rem)] font-semibold tracking-[-0.05em]">
                    按章节进入这册数学
                  </h2>
                </div>
                <p className="hidden max-w-sm text-sm leading-7 text-[var(--color-text-muted)] md:block">
                  每一章都会继续拆成知识点、典型例题和单元测验，保持和首页一致的学习节奏。
                </p>
              </div>

              <div className="grid gap-4">
                {chapters.map((chapter, index) => (
                  <Link
                    key={chapter.id}
                    href={routePaths.chapter(grade, volume, chapter.id)}
                    className="group poster-panel rounded-[2.15rem] border border-[color-mix(in_oklch,var(--color-border)_88%,var(--color-primary))] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_88%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_20%,white)_100%)] p-5 shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-lg)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                          Chapter {index + 1}
                        </p>
                        <h3 className="mt-2 text-[clamp(1.7rem,2.6vw,2.4rem)] font-semibold tracking-[-0.05em] text-[var(--color-text)]">
                          {chapter.title}
                        </h3>
                      </div>
                      <span className="rounded-full border border-[var(--color-primary)]/18 bg-white/82 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-primary-foreground)]">
                        Start
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-[var(--color-accent)]" />
                      <span className="h-3 w-16 rounded-full bg-[color-mix(in_oklch,var(--color-primary)_18%,white)]" />
                      <span className="h-3 w-8 rounded-full bg-[color-mix(in_oklch,var(--color-accent)_22%,white)]" />
                    </div>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
                      {chapter.summary}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-[var(--color-text)]">
                        进入章节学习中心
                      </span>
                      <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--color-primary-foreground)]">
                        Open
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-5">
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  Quick Entry
                </p>
                <h2 className="mt-2 text-[clamp(1.8rem,2.8vw,2.7rem)] font-semibold tracking-[-0.05em]">
                  先学重点，再做反馈
                </h2>
              </div>

              <div className="grid gap-4">
                {featuredLesson ? (
                  <Link
                    href={routePaths.lesson(grade, volume, featuredChapter.id, featuredLesson.slug)}
                    className="group rotate-[-2deg] rounded-[2rem] border border-[color-mix(in_oklch,var(--color-accent)_28%,var(--color-border))] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--color-accent)_18%,white)_0%,white_100%)] p-5 shadow-[var(--shadow-md)] transition duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-[var(--shadow-lg)] sm:p-6"
                  >
                    <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
                      Featured Lesson
                    </p>
                    <h3 className="mt-3 text-[clamp(1.6rem,2.4vw,2.35rem)] font-semibold tracking-[-0.05em]">
                      {featuredLesson.title}
                    </h3>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-[var(--color-accent)]" />
                      <span className="h-3 w-14 rounded-full bg-[color-mix(in_oklch,var(--color-accent)_28%,white)]" />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">
                      {featuredLesson.summary}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--color-text)]">
                        先学这个知识点
                      </span>
                      <span className="rounded-full border border-[var(--color-accent)]/24 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        Learn
                      </span>
                    </div>
                  </Link>
                ) : null}

                {featuredQuiz ? (
                  <Link
                    href={routePaths.quiz(grade, volume, featuredChapter.id)}
                    className="group translate-x-2 rounded-[2rem] bg-[var(--color-text)] p-5 text-[var(--color-primary-foreground)] shadow-[var(--shadow-lg)] transition duration-300 hover:-translate-y-1 hover:translate-x-0 sm:p-6"
                  >
                    <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                      Checkpoint Quiz
                    </p>
                    <h3 className="mt-3 text-[clamp(1.8rem,2.8vw,2.55rem)] font-semibold tracking-[-0.05em]">
                      {featuredQuiz.title}
                    </h3>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-[var(--color-accent)]" />
                      <span className="h-3 w-16 rounded-full bg-white/18" />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/75">
                      {featuredQuiz.instructions}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        现在开始测一测
                      </span>
                      <span className="rounded-full bg-white/12 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white">
                        Quiz
                      </span>
                    </div>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="这个册次的正式内容还在整理中"
            description="第一版已经先接入了部分示例章节。你可以先返回首页，进入当前已开放的学习切片查看完整流程。"
            actions={
              <Link
                href={routePaths.home()}
                className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-[var(--color-primary-foreground)]"
              >
                返回首页
              </Link>
            }
          />
        )} 
      </section>
    </main>
  );
}
