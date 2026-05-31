"use client";

import { useMemo, useState } from "react";

import { MathFormula } from "@/components/content";
import { Button, Card } from "@/components/ui";
import type { FormulaRecordEntityType } from "@/lib/formula-records";

type SavedRecord = {
  id: string;
  entityType: FormulaRecordEntityType;
  entityId: string;
  field: string;
  latexSource: string;
  formulaHash: string;
  svgPath?: string;
  pngPath?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

const entityTypeOptions: FormulaRecordEntityType[] = [
  "question",
  "analysis",
  "lesson",
  "worksheet",
  "poster",
  "other",
];

const defaultLatex = String.raw`\text{若 } x > 3 \text{，则 } 2x+1 > 7`;

export function FormulaStudioClient() {
  const [entityType, setEntityType] = useState<FormulaRecordEntityType>("question");
  const [entityId, setEntityId] = useState("demo-question-001");
  const [field, setField] = useState("stemFormula");
  const [latex, setLatex] = useState(defaultLatex);
  const [note, setNote] = useState("题目题干中的核心公式");
  const [includePng, setIncludePng] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<SavedRecord | null>(null);

  const formats = useMemo(() => (includePng ? ["svg", "png"] : ["svg"]), [includePng]);

  async function handleSave() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/formula-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType,
          entityId,
          field,
          latex,
          note,
          formats,
        }),
      });

      const payload = (await response.json()) as
        | {
            record: SavedRecord;
          }
        | {
            error: string;
          };

      if (!response.ok || !("record" in payload)) {
        throw new Error("error" in payload ? payload.error : "保存失败。");
      }

      setSavedRecord(payload.record);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存失败。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
      <Card className="rounded-[2rem]">
        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Teacher Workflow
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              录入并保存公式资源
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
              编辑态使用 KaTeX 预览，点击保存后会调用后端生成稳定的 SVG/PNG，并写入本地记录仓储。
            </p>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">实体类型</span>
            <select
              value={entityType}
              onChange={(event) => setEntityType(event.target.value as FormulaRecordEntityType)}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
            >
              {entityTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">实体 ID</span>
              <input
                value={entityId}
                onChange={(event) => setEntityId(event.target.value)}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
                placeholder="例如 question-1001"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">字段名</span>
              <input
                value={field}
                onChange={(event) => setField(event.target.value)}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
                placeholder="例如 stemFormula"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">LaTeX</span>
            <textarea
              value={latex}
              onChange={(event) => setLatex(event.target.value)}
              className="min-h-36 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3 font-mono"
              placeholder={String.raw`\frac{1}{2} + \sqrt{x}`}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">备注</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
              placeholder="这条公式属于题干/解析/讲义哪里"
            />
          </label>

          <label className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3">
            <input
              type="checkbox"
              checked={includePng}
              onChange={(event) => setIncludePng(event.target.checked)}
            />
            <span className="text-sm">同时生成 PNG，适合题目卡片/海报/图片导出</span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave} loading={loading}>
              保存并生成资源
            </Button>
            <span className="text-sm text-[var(--color-text-muted)]">
              当前输出格式：{formats.join(", ")}
            </span>
          </div>

          {error ? (
            <div className="rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-danger),white_45%)] bg-[color-mix(in_oklch,var(--color-danger),white_92%)] px-4 py-3 text-sm text-[var(--color-text)]">
              {error}
            </div>
          ) : null}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-[2rem]">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Live Preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">编辑态 KaTeX 预览</h2>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-5">
              <MathFormula latex={latex} displayMode />
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem]">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-success)]">
                Stable Assets
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">保存后稳定资源</h2>
            </div>

            {savedRecord ? (
              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
                  <p><strong>记录 ID：</strong>{savedRecord.id}</p>
                  <p><strong>公式 Hash：</strong>{savedRecord.formulaHash}</p>
                  <p><strong>SVG：</strong>{savedRecord.svgPath ?? "未生成"}</p>
                  <p><strong>PNG：</strong>{savedRecord.pngPath ?? "未生成"}</p>
                </div>

                {savedRecord.svgPath ? (
                  <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-5">
                    <p className="mb-3 text-sm text-[var(--color-text-muted)]">稳定 SVG 预览</p>
                    <img
                      src={savedRecord.svgPath}
                      alt="保存后的 SVG 公式"
                      className="max-h-40 w-auto max-w-full"
                    />
                  </div>
                ) : null}

                {savedRecord.pngPath ? (
                  <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-5">
                    <p className="mb-3 text-sm text-[var(--color-text-muted)]">稳定 PNG 预览</p>
                    <img
                      src={savedRecord.pngPath}
                      alt="保存后的 PNG 公式"
                      className="max-h-40 w-auto max-w-full"
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--color-border)] px-4 py-8 text-sm text-[var(--color-text-muted)]">
                还没有保存记录。点击左侧“保存并生成资源”后，这里会显示稳定 SVG/PNG。
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
