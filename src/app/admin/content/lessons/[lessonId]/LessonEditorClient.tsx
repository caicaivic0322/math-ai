"use client";

import { useMemo, useState } from "react";

import { Button, Card } from "@/components/ui";
import type { SqliteAdminLessonDetail } from "@/lib/content-store";

type LessonEditorClientProps = {
  lesson: SqliteAdminLessonDetail;
};

type UpdateLessonResponse =
  | {
      lesson: SqliteAdminLessonDetail;
    }
  | {
      error: string;
    };

export function LessonEditorClient({ lesson }: LessonEditorClientProps) {
  const [title, setTitle] = useState(lesson.lesson.title);
  const [summary, setSummary] = useState(lesson.lesson.summary);
  const [learningObjectivesText, setLearningObjectivesText] = useState(
    lesson.lesson.learningObjectives.join("\n"),
  );
  const [keyRulesText, setKeyRulesText] = useState(
    lesson.lesson.keyRules.join("\n"),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewObjectives = useMemo(
    () => splitTextLines(learningObjectivesText),
    [learningObjectivesText],
  );
  const previewRules = useMemo(() => splitTextLines(keyRulesText), [keyRulesText]);

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/content/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          summary,
          learningObjectives: splitTextLines(learningObjectivesText),
          keyRules: splitTextLines(keyRulesText),
        }),
      });
      const payload = (await response.json()) as UpdateLessonResponse;

      if (!response.ok || !("lesson" in payload)) {
        throw new Error("error" in payload ? payload.error : "保存失败。");
      }

      setSuccessMessage(`保存成功，更新时间：${payload.lesson.updatedAt}`);
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
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-success)]">
            Edit Lesson
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">编辑并保存到 SQLite</h2>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">课时标题</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">课时摘要</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="min-h-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium">学习目标</span>
            <textarea
              value={learningObjectivesText}
              onChange={(event) => setLearningObjectivesText(event.target.value)}
              className="min-h-40 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">关键规则</span>
            <textarea
              value={keyRulesText}
              onChange={(event) => setKeyRulesText(event.target.value)}
              className="min-h-40 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
            />
          </label>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
          <p className="font-medium text-[var(--color-text)]">保存预览</p>
          <p className="mt-2"><strong>标题：</strong>{title || "未填写"}</p>
          <p><strong>摘要：</strong>{summary || "未填写"}</p>
          <p className="mt-3 font-medium">学习目标</p>
          <div className="mt-2 space-y-1 text-[var(--color-text-muted)]">
            {previewObjectives.length > 0 ? previewObjectives.map((item) => (
              <p key={item}>- {item}</p>
            )) : <p>暂无</p>}
          </div>
          <p className="mt-3 font-medium">关键规则</p>
          <div className="mt-2 space-y-1 text-[var(--color-text-muted)]">
            {previewRules.length > 0 ? previewRules.map((item) => (
              <p key={item}>- {item}</p>
            )) : <p>暂无</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} loading={loading}>
            保存到 SQLite
          </Button>
          {successMessage ? (
            <span className="text-sm text-[var(--color-success)]">{successMessage}</span>
          ) : null}
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
