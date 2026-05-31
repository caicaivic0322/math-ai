"use client";

import { useState } from "react";

import { Button, Card } from "@/components/ui";
import type { SqliteAdminChapterDetail } from "@/lib/content-store";

type ChapterEditorClientProps = {
  chapter: SqliteAdminChapterDetail;
};

type UpdateChapterResponse =
  | {
      chapter: SqliteAdminChapterDetail;
    }
  | {
      error: string;
    };

export function ChapterEditorClient({ chapter }: ChapterEditorClientProps) {
  const [title, setTitle] = useState(chapter.chapter.title);
  const [summary, setSummary] = useState(chapter.chapter.summary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/admin/content/chapters/${chapter.gradeId}/${chapter.volumeId}/${chapter.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            summary,
          }),
        },
      );
      const payload = (await response.json()) as UpdateChapterResponse;

      if (!response.ok || !("chapter" in payload)) {
        throw new Error("error" in payload ? payload.error : "保存失败。");
      }

      setSuccessMessage(`保存成功，更新时间：${payload.chapter.updatedAt}`);
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
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Edit Chapter
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">编辑并保存章节</h2>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">章节标题</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">章节摘要</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="min-h-32 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
          <p className="font-medium text-[var(--color-text)]">保存预览</p>
          <p className="mt-2"><strong>标题：</strong>{title || "未填写"}</p>
          <p><strong>摘要：</strong>{summary || "未填写"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} loading={loading}>
            保存章节
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
