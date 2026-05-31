import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentWorkflowPanel } from "@/app/admin/content/ContentWorkflowPanel";
import { Card, SectionHeader } from "@/components/ui";
import { getSqliteContentWorkflowDetail, getSqliteLessonDetail } from "@/lib/content-store";
import { routePaths } from "@/lib/routes";
import { LessonEditorClient } from "./LessonEditorClient";

export const dynamic = "force-dynamic";

export default async function AdminLessonEditorPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const detail = getSqliteLessonDetail(lessonId);
  const workflow = getSqliteContentWorkflowDetail({
    entityKind: "lesson",
    entityId: lessonId,
    gradeId: detail?.gradeId,
    volumeId: detail?.volumeId,
  });

  if (!detail) {
    notFound();
  }

  return (
    <main className="flex-1 pb-12">
      <section className="rounded-[2rem] border border-[color-mix(in_oklch,var(--color-primary)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_92%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_32%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <SectionHeader
          eyebrow="Lesson Editor"
          title={detail.title}
          description={`正在编辑 ${detail.chapterTitle} 下的课时内容。当前第八阶段支持修改课时标题、摘要、学习目标和关键规则，并直接写回 SQLite。`}
          action={(
            <div className="flex flex-wrap gap-3">
              <Link
                href={routePaths.adminContent()}
                className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                返回内容后台
              </Link>
              <Link
                href={routePaths.formulaStudio()}
                className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                公式工作台
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
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  Context
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">课时上下文</h2>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p><strong>课时 ID：</strong>{detail.id}</p>
                <p><strong>年级 / 册次：</strong>{detail.gradeId} / {detail.volumeId}</p>
                <p><strong>章节：</strong>{detail.chapterTitle}</p>
                <p><strong>最近更新：</strong>{detail.updatedAt}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p className="font-medium text-[var(--color-text)]">当前摘要</p>
                <p className="mt-2 text-[var(--color-text-muted)]">{detail.summary}</p>
              </div>
            </div>
          </Card>

          <ContentWorkflowPanel
            entityKind="lesson"
            entityId={detail.id}
            gradeId={detail.gradeId}
            volumeId={detail.volumeId}
            initialWorkflow={workflow}
          />
        </div>

        <LessonEditorClient lesson={detail} />
      </section>
    </main>
  );
}
