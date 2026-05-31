import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentWorkflowPanel } from "@/app/admin/content/ContentWorkflowPanel";
import { WorkedExampleEditorClient } from "@/app/admin/content/worked-examples/WorkedExampleEditorClient";
import { Card, SectionHeader } from "@/components/ui";
import { getSqliteContentWorkflowDetail, getSqliteWorkedExampleDetail } from "@/lib/content-store";
import { routePaths } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function AdminWorkedExampleEditorPage({
  params,
}: {
  params: Promise<{ gradeId: string; volumeId: string; exampleId: string }>;
}) {
  const { gradeId, volumeId, exampleId } = await params;
  const detail = getSqliteWorkedExampleDetail(gradeId, volumeId, exampleId);
  const workflow = getSqliteContentWorkflowDetail({
    entityKind: "worked-example",
    entityId: exampleId,
    gradeId,
    volumeId,
  });

  if (!detail) {
    notFound();
  }

  return (
    <main className="flex-1 pb-12">
      <section className="rounded-[2rem] border border-[color-mix(in_oklch,var(--color-success)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_92%,white)_0%,color-mix(in_oklch,var(--color-success)_18%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <SectionHeader
          eyebrow="Worked Example Editor"
          title={detail.title}
          description={`正在编辑 ${detail.chapterTitle} 下的例题内容。当前第九阶段支持修改题目、解答、步骤和易错点，并直接写回 SQLite。`}
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
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-success)]">
                  Context
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">例题上下文</h2>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p><strong>例题 ID：</strong>{detail.id}</p>
                <p><strong>年级 / 册次：</strong>{detail.gradeId} / {detail.volumeId}</p>
                <p><strong>所属章节：</strong>{detail.chapterTitle}</p>
                <p><strong>最近更新：</strong>{detail.updatedAt}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p className="font-medium text-[var(--color-text)]">当前摘要</p>
                <p className="mt-2 text-[var(--color-text-muted)]">{detail.summary}</p>
              </div>
            </div>
          </Card>

          <ContentWorkflowPanel
            entityKind="worked-example"
            entityId={detail.id}
            gradeId={detail.gradeId}
            volumeId={detail.volumeId}
            initialWorkflow={workflow}
          />
        </div>

        <WorkedExampleEditorClient workedExample={detail} />
      </section>
    </main>
  );
}
