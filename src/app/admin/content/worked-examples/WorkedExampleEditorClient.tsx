"use client";

import { useMemo, useState } from "react";

import { Button, Card } from "@/components/ui";
import type { SqliteAdminWorkedExampleDetail } from "@/lib/content-store";

type WorkedExampleEditorClientProps = {
  workedExample: SqliteAdminWorkedExampleDetail;
};

type UpdateWorkedExampleResponse =
  | {
      workedExample: SqliteAdminWorkedExampleDetail;
    }
  | {
      error: string;
    };

export function WorkedExampleEditorClient({ workedExample }: WorkedExampleEditorClientProps) {
  const [title, setTitle] = useState(workedExample.workedExample.title);
  const [summary, setSummary] = useState(workedExample.workedExample.summary);
  const [problem, setProblem] = useState(workedExample.workedExample.problem);
  const [answer, setAnswer] = useState(workedExample.workedExample.answer);
  const [commonMistakesText, setCommonMistakesText] = useState(
    workedExample.workedExample.commonMistakes.join("\n"),
  );
  const [steps, setSteps] = useState(workedExample.workedExample.steps);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewMistakes = useMemo(
    () => splitTextLines(commonMistakesText),
    [commonMistakesText],
  );

  function updateStep(
    index: number,
    field: "title" | "content",
    value: string,
  ) {
    setSteps((current) => current.map((step, currentIndex) => (
      currentIndex === index
        ? {
            ...step,
            [field]: value,
          }
        : step
    )));
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/admin/content/worked-examples/${workedExample.gradeId}/${workedExample.volumeId}/${workedExample.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            summary,
            problem,
            answer,
            commonMistakes: splitTextLines(commonMistakesText),
            steps,
          }),
        },
      );
      const payload = (await response.json()) as UpdateWorkedExampleResponse;

      if (!response.ok || !("workedExample" in payload)) {
        throw new Error("error" in payload ? payload.error : "保存失败。");
      }

      setSuccessMessage(`保存成功，更新时间：${payload.workedExample.updatedAt}`);
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
            Edit Example
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">编辑并保存例题</h2>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">例题标题</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">例题摘要</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            className="min-h-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">题目描述</span>
          <textarea
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            className="min-h-32 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">答案</span>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="min-h-24 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <div className="space-y-4">
          <p className="text-sm font-medium">解题步骤</p>
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4"
            >
              <label className="grid gap-2">
                <span className="text-sm font-medium">步骤标题</span>
                <input
                  value={step.title}
                  onChange={(event) => updateStep(index, "title", event.target.value)}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
                />
              </label>
              <label className="mt-4 grid gap-2">
                <span className="text-sm font-medium">步骤内容</span>
                <textarea
                  value={step.content}
                  onChange={(event) => updateStep(index, "content", event.target.value)}
                  className="min-h-24 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
                />
              </label>
            </div>
          ))}
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">易错点</span>
          <textarea
            value={commonMistakesText}
            onChange={(event) => setCommonMistakesText(event.target.value)}
            className="min-h-28 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
          />
        </label>

        <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
          <p className="font-medium text-[var(--color-text)]">保存预览</p>
          <p className="mt-2"><strong>标题：</strong>{title || "未填写"}</p>
          <p><strong>摘要：</strong>{summary || "未填写"}</p>
          <p className="mt-3 font-medium">易错点</p>
          <div className="mt-2 space-y-1 text-[var(--color-text-muted)]">
            {previewMistakes.length > 0 ? previewMistakes.map((item) => (
              <p key={item}>- {item}</p>
            )) : <p>暂无</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} loading={loading}>
            保存例题
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
