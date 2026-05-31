import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentWorkflowPanel } from "@/app/admin/content/ContentWorkflowPanel";
import { QuizEditorClient } from "@/app/admin/content/quizzes/QuizEditorClient";
import { Card, SectionHeader } from "@/components/ui";
import { getSqliteContentWorkflowDetail, getSqliteQuizDetail } from "@/lib/content-store";
import { routePaths } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function AdminQuizEditorPage({
  params,
}: {
  params: Promise<{ gradeId: string; volumeId: string; quizId: string }>;
}) {
  const { gradeId, volumeId, quizId } = await params;
  const detail = getSqliteQuizDetail(gradeId, volumeId, quizId);
  const workflow = getSqliteContentWorkflowDetail({
    entityKind: "quiz",
    entityId: quizId,
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
          eyebrow="Quiz Editor"
          title={detail.title}
          description={`正在编辑 ${detail.chapterTitle} 下的测验。当前第十阶段支持修改标题、测验说明和及格线。`}
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
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">Context</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">测验上下文</h2>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p><strong>测验 ID：</strong>{detail.id}</p>
                <p><strong>年级 / 册次：</strong>{detail.gradeId} / {detail.volumeId}</p>
                <p><strong>所属章节：</strong>{detail.chapterTitle}</p>
                <p><strong>题目数：</strong>{detail.questionCount}</p>
                <p><strong>最近更新：</strong>{detail.updatedAt}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p className="font-medium text-[var(--color-text)]">当前说明</p>
                <p className="mt-2 text-[var(--color-text-muted)]">{detail.quiz.instructions}</p>
              </div>
            </div>
          </Card>

          <ContentWorkflowPanel
            entityKind="quiz"
            entityId={detail.id}
            gradeId={detail.gradeId}
            volumeId={detail.volumeId}
            initialWorkflow={workflow}
          />
        </div>

        <QuizEditorClient quiz={detail} />
      </section>
    </main>
  );
}
