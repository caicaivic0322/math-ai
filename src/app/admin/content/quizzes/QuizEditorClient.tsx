"use client";

import { useState } from "react";

import { Button, Card } from "@/components/ui";
import type { SqliteAdminQuizDetail } from "@/lib/content-store";

type QuizEditorClientProps = {
  quiz: SqliteAdminQuizDetail;
};

type UpdateQuizResponse =
  | { quiz: SqliteAdminQuizDetail }
  | { error: string };

export function QuizEditorClient({ quiz }: QuizEditorClientProps) {
  const [title, setTitle] = useState(quiz.quiz.title);
  const [instructions, setInstructions] = useState(quiz.quiz.instructions);
  const [passingScore, setPassingScore] = useState(String(quiz.quiz.passingScore));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/admin/content/quizzes/${quiz.gradeId}/${quiz.volumeId}/${quiz.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            instructions,
            passingScore: Number(passingScore),
          }),
        },
      );
      const payload = (await response.json()) as UpdateQuizResponse;

      if (!response.ok || !("quiz" in payload)) {
        throw new Error("error" in payload ? payload.error : "保存失败。");
      }

      setSuccessMessage(`保存成功，更新时间：${payload.quiz.updatedAt}`);
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
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">Edit Quiz</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">编辑并保存测验</h2>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">测验标题</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">测验说明</span>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            className="min-h-36 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">及格线</span>
          <input
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(event) => setPassingScore(event.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
          <p className="font-medium text-[var(--color-text)]">保存预览</p>
          <p className="mt-2"><strong>标题：</strong>{title || "未填写"}</p>
          <p><strong>及格线：</strong>{passingScore || "未填写"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} loading={loading}>
            保存测验
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
