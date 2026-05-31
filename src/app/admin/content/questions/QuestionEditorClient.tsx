"use client";

import { useMemo, useState } from "react";

import { Button, Card } from "@/components/ui";
import type { QuizQuestion } from "@/types/content";
import type { SqliteAdminQuizQuestionDetail } from "@/lib/content-store";

type QuestionEditorClientProps = {
  question: SqliteAdminQuizQuestionDetail;
};

type UpdateQuestionResponse =
  | { question: SqliteAdminQuizQuestionDetail }
  | { error: string };

export function QuestionEditorClient({ question }: QuestionEditorClientProps) {
  const [stem, setStem] = useState(question.question.stem);
  const [explanation, setExplanation] = useState(question.question.explanation);
  const [relatedLessonIdsText, setRelatedLessonIdsText] = useState(
    question.question.relatedLessonIds.join("\n"),
  );
  const [relatedExampleIdsText, setRelatedExampleIdsText] = useState(
    (question.question.relatedExampleIds ?? []).join("\n"),
  );
  const [payloadJson, setPayloadJson] = useState(
    JSON.stringify(createEditableQuestionPayload(question.question), null, 2),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const relatedLessonIdsPreview = useMemo(
    () => splitTextLines(relatedLessonIdsText),
    [relatedLessonIdsText],
  );

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/admin/content/questions/${question.gradeId}/${question.volumeId}/${question.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stem,
            explanation,
            relatedLessonIds: splitTextLines(relatedLessonIdsText),
            relatedExampleIds: splitTextLines(relatedExampleIdsText),
            payloadJson,
          }),
        },
      );
      const payload = (await response.json()) as UpdateQuestionResponse;

      if (!response.ok || !("question" in payload)) {
        throw new Error("error" in payload ? payload.error : "保存失败。");
      }

      setSuccessMessage(`保存成功，更新时间：${payload.question.updatedAt}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存失败。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[2rem]">
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">Edit Question</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">编辑并保存题目</h2>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">题干</span>
          <textarea
            value={stem}
            onChange={(event) => setStem(event.target.value)}
            className="min-h-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">解析</span>
          <textarea
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            className="min-h-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium">关联课时 ID</span>
            <textarea
              value={relatedLessonIdsText}
              onChange={(event) => setRelatedLessonIdsText(event.target.value)}
              className="min-h-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">关联例题 ID</span>
            <textarea
              value={relatedExampleIdsText}
              onChange={(event) => setRelatedExampleIdsText(event.target.value)}
              className="min-h-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">题型配置 JSON</span>
          <textarea
            value={payloadJson}
            onChange={(event) => setPayloadJson(event.target.value)}
            className="min-h-80 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3 font-mono text-sm"
          />
        </label>

        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
          <p className="font-medium text-[var(--color-text)]">保存预览</p>
          <p className="mt-2"><strong>题型：</strong>{question.type}</p>
          <p><strong>难度：</strong>{question.difficulty}</p>
          <p><strong>关联课时数：</strong>{relatedLessonIdsPreview.length}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} loading={loading}>
            保存题目
          </Button>
          {successMessage ? <span className="text-sm text-[var(--color-success)]">{successMessage}</span> : null}
        </div>

        {error ? (
          <div className="rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-danger),white_45%)] bg-[color-mix(in_oklch,var(--color-danger),white_92%)] px-4 py-3 text-sm text-[var(--color-text)]">
            {error}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function splitTextLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createEditableQuestionPayload(question: QuizQuestion) {
  const payload = { ...question } as Record<string, unknown>;

  delete payload.id;
  delete payload.quizId;
  delete payload.type;
  delete payload.stem;
  delete payload.explanation;
  delete payload.relatedLessonIds;
  delete payload.relatedExampleIds;

  return payload;
}
