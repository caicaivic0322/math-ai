import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentWorkflowPanel } from "@/app/admin/content/ContentWorkflowPanel";
import { QuestionEditorClient } from "@/app/admin/content/questions/QuestionEditorClient";
import { Card, SectionHeader } from "@/components/ui";
import { getSqliteContentWorkflowDetail, getSqliteQuizQuestionDetail } from "@/lib/content-store";
import { routePaths } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function AdminQuestionEditorPage({
  params,
}: {
  params: Promise<{ gradeId: string; volumeId: string; questionId: string }>;
}) {
  const { gradeId, volumeId, questionId } = await params;
  const detail = getSqliteQuizQuestionDetail(gradeId, volumeId, questionId);
  const workflow = getSqliteContentWorkflowDetail({
    entityKind: "quiz-question",
    entityId: questionId,
    gradeId,
    volumeId,
  });

  if (!detail) {
    notFound();
  }

  return (
    <main className="flex-1 pb-12">
      <section className="rounded-[2rem] border border-[color-mix(in_oklch,var(--color-primary)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_92%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_32%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <SectionHeader
          eyebrow="Question Editor"
          title={detail.stem}
          description={`正在编辑 ${detail.chapterTitle} 下的 ${detail.type} 题目。当前第十阶段支持修改通用字段与题型配置 JSON。`}
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
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">Context</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">题目上下文</h2>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p><strong>题目 ID：</strong>{detail.id}</p>
                <p><strong>年级 / 册次：</strong>{detail.gradeId} / {detail.volumeId}</p>
                <p><strong>所属章节：</strong>{detail.chapterTitle}</p>
                <p><strong>题型 / 难度：</strong>{detail.type} / {detail.difficulty}</p>
                <p><strong>最近更新：</strong>{detail.updatedAt}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
                <p className="font-medium text-[var(--color-text)]">当前解析</p>
                <p className="mt-2 text-[var(--color-text-muted)]">{detail.question.explanation}</p>
              </div>
            </div>
          </Card>

          <ContentWorkflowPanel
            entityKind="quiz-question"
            entityId={detail.id}
            gradeId={detail.gradeId}
            volumeId={detail.volumeId}
            initialWorkflow={workflow}
          />
        </div>

        <QuestionEditorClient question={detail} />
      </section>
    </main>
  );
}
