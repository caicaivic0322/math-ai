"use client";

import { useState } from "react";

import { Button, Card } from "@/components/ui";

type ImportResponse =
  | {
      imported: true;
      target: "json-store" | "sqlite";
      snapshotPath: string;
      importedCounts: {
        grades: number;
        volumes: number;
        chapters: number;
        lessons: number;
        workedExamples: number;
        quizzes: number;
        questions: number;
      };
      store: {
        importedAt?: string;
        storeFilePath: string;
      };
    }
  | {
      error: string;
    };

type AdminContentClientProps = {
  defaultSnapshotPath: string;
  defaultStorePath: string;
  defaultDatabasePath: string;
  jsonStoreExists: boolean;
  sqliteExists: boolean;
  jsonStoreImportedAt?: string;
  sqliteImportedAt?: string;
};

export function AdminContentClient({
  defaultSnapshotPath,
  defaultStorePath,
  defaultDatabasePath,
  jsonStoreExists,
  sqliteExists,
  jsonStoreImportedAt,
  sqliteImportedAt,
}: AdminContentClientProps) {
  const [snapshotPath, setSnapshotPath] = useState(defaultSnapshotPath);
  const [target, setTarget] = useState<"json-store" | "sqlite">("sqlite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(
    [
      jsonStoreExists && jsonStoreImportedAt ? `JSON 仓储最近导入：${jsonStoreImportedAt}` : null,
      sqliteExists && sqliteImportedAt ? `SQLite 最近导入：${sqliteImportedAt}` : null,
    ].filter(Boolean).join("\n") || null,
  );

  async function handleImport() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/content-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snapshotPath,
          target,
        }),
      });

      const payload = (await response.json()) as ImportResponse;
      if (!response.ok || !("imported" in payload)) {
        throw new Error("error" in payload ? payload.error : "导入失败。");
      }

      setResultMessage(
        [
          `导入完成：${payload.snapshotPath}`,
          `目标：${payload.target === "sqlite" ? "SQLite 数据库" : "JSON 仓储"}`,
          `写入仓储：${payload.store.storeFilePath}`,
          `章节 ${payload.importedCounts.chapters} / 课时 ${payload.importedCounts.lessons} / 题目 ${payload.importedCounts.questions}`,
          payload.store.importedAt ? `导入时间：${payload.store.importedAt}` : null,
        ].filter(Boolean).join("\n"),
      );

      window.location.reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "导入失败。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-[2rem]">
      <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-success)]">
              Import Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              导入课程快照到仓储
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
              同一份课程快照现在可以导入 `content-store.json`，也可以导入 SQLite，随后用 `CURRICULUM_SOURCE_KIND=database` 配合 `CONTENT_DATABASE_BACKEND` 切换读取后端。
            </p>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">课程快照路径</span>
            <input
              value={snapshotPath}
              onChange={(event) => setSnapshotPath(event.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
              placeholder={defaultSnapshotPath}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">导入目标</span>
            <select
              value={target}
              onChange={(event) => setTarget(event.target.value as "json-store" | "sqlite")}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3"
            >
              <option value="sqlite">SQLite 数据库</option>
              <option value="json-store">content-store.json</option>
            </select>
          </label>

          <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
            <p><strong>目标仓储：</strong>{defaultStorePath}</p>
            <p><strong>SQLite 路径：</strong>{defaultDatabasePath}</p>
            <p><strong>JSON 状态：</strong>{jsonStoreExists ? "已存在，可覆盖更新" : "尚未初始化，将首次写入"}</p>
            <p><strong>SQLite 状态：</strong>{sqliteExists ? "已存在，可覆盖更新" : "尚未初始化，将首次写入"}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleImport} loading={loading}>
              {target === "sqlite" ? "导入到 SQLite" : "导入到 content-store"}
            </Button>
            <span className="text-sm text-[var(--color-text-muted)]">
              API: `/api/admin/content-import`
            </span>
          </div>

          {error ? (
            <div className="rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-danger),white_45%)] bg-[color-mix(in_oklch,var(--color-danger),white_92%)] px-4 py-3 text-sm text-[var(--color-text)]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Latest Result
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">导入结果</h2>
          </div>

          <div className="rounded-[1.5rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 text-sm leading-7 text-[var(--color-text-muted)] whitespace-pre-line">
            {resultMessage ?? "还没有执行导入。点击左侧按钮后，这里会显示最新的写入结果。"}
          </div>
        </div>
      </div>
    </Card>
  );
}
