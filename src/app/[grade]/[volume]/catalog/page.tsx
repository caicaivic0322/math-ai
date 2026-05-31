import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "../../../../components/layout/Breadcrumbs";
import { EmptyState, SectionHeader } from "../../../../components/ui";
import { getChaptersByGradeVolume } from "../../../../lib/content";
import {
  getGradeLabel,
  getVolumeLabel,
  isGradeId,
  isVolumeId,
  routePaths,
} from "../../../../lib/routes";

type CatalogPageProps = {
  params: Promise<{
    grade: string;
    volume: string;
  }>;
};

export default async function CatalogPage({ params }: CatalogPageProps) {
  const { grade, volume } = await params;

  if (!isGradeId(grade) || !isVolumeId(volume)) {
    notFound();
  }

  const chapters = getChaptersByGradeVolume(grade, volume);

  return (
    <main className="flex-1 pb-10">
      <Breadcrumbs
        crumbs={[
          { label: "首页", href: routePaths.home() },
          {
            label: `${getGradeLabel(grade)} ${getVolumeLabel(volume)}`,
            href: routePaths.gradeVolume(grade, volume),
          },
          { label: "教材目录" },
        ]}
      />

      <section className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <SectionHeader
          eyebrow="教材目录"
          title={`${getGradeLabel(grade)} · ${getVolumeLabel(volume)} 教材目录`}
          description="第一版优先接入一个完整学习切片，目录页会逐步扩展到更多章节。"
        />

        <div className="mt-6">
          {chapters.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={routePaths.chapter(grade, volume, chapter.id)}
                  className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-background)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-md)]"
                >
                  <p className="text-sm text-[var(--color-primary)]">章节入口</p>
                  <h2 className="mt-2 text-xl font-semibold">{chapter.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                    {chapter.summary}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="当前还没有章节内容"
              description="这个册次的目录结构已经预留好，后续会按教材章节逐步补齐。"
            />
          )}
        </div>
      </section>
    </main>
  );
}
