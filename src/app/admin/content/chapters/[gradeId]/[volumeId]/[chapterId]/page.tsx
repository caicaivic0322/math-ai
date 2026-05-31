import Link from "next/link";
import { notFound } from "next/navigation";

import { ChapterEditorClient } from "@/app/admin/content/chapters/ChapterEditorClient";
import { ContentWorkflowPanel } from "@/app/admin/content/ContentWorkflowPanel";
import { Card, SectionHeader } from "@/components/ui";
import { getSqliteChapterDetail, getSqliteContentWorkflowDetail } from "@/lib/content-store";
import { routePaths } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function AdminChapterEditorPage({
  params,
}: {
  params: Promise<{ gradeId: string; volumeId: string; chapterId: string }>;
}) {
  const { gradeId, volumeId, chapterId } = await params;
  const detail = getSqliteChapterDetail(gradeId, volumeId, chapterId);
  const workflow = getSqliteContentWorkflowDetail({
    entityKind: "chapter",
    entityId: chapterId,
    gradeId,
    volumeId,
  });

  if (!detail) {
    notFound();
  }

  return (
    <main className="flex-1 pb-12">
      <section className="rounded-[2rem] border border-[color-mix(in_oklch,var(--color-accent)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_92%,white)_0%,color-mix(in_oklch,var(--color-accent)_18%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <SectionHeader
          eyebrow="Chapter Editor"
          title={detail.title}
          description="当前第九阶段支持编辑章节标题与摘要，并直接写回 SQLite。"
          action={(
            <div className="flex flex-wrap gap-3">
              <Link
                href={routePaths.adminContent()}
                className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                返回内容后台
              </Link>
            </div>
          )}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem]">
            <div className="space-y-4 text-sm leading-7">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Context
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">章节上下文</h2>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p><strong>章节 ID：</strong>{detail.id}</p>
                <p><strong>年级 / 册次：</strong>{detail.gradeId} / {detail.volumeId}</p>
                <p><strong>课时数：</strong>{detail.lessonCount}</p>
                <p><strong>例题数：</strong>{detail.workedExampleCount}</p>
                <p><strong>最近更新：</strong>{detail.updatedAt}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p className="font-medium text-[var(--color-text)]">当前摘要</p>
                <p className="mt-2 text-[var(--color-text-muted)]">{detail.summary}</p>
              </div>
            </div>
          </Card>

          <ContentWorkflowPanel
            entityKind="chapter"
            entityId={detail.id}
            gradeId={detail.gradeId}
            volumeId={detail.volumeId}
            initialWorkflow={workflow}
          />
        </div>

        <ChapterEditorClient chapter={detail} />
      </section>
    </main>
  );
}
