"use client";

import { useEffect, useState } from "react";

import { Button, Card } from "@/components/ui";
import {
  canPublishWorkflow,
  canRollbackWorkflow,
  canSwitchWorkflowToDraft,
  getPublishPermissionMessage,
  getRollbackPermissionMessage,
  type AdminWorkflowRole,
  readStoredWorkflowActor,
  writeStoredWorkflowActor,
} from "@/app/admin/content/workflow-actor";
import type {
  SqliteContentEntityKind,
  SqliteContentWorkflowDetail,
} from "@/lib/content-store";

type ContentWorkflowPanelProps = {
  entityKind: SqliteContentEntityKind;
  entityId: string;
  gradeId?: string;
  volumeId?: string;
  initialWorkflow?: SqliteContentWorkflowDetail;
};

type WorkflowResponse =
  | { workflow: SqliteContentWorkflowDetail }
  | { error: string };

export function ContentWorkflowPanel({
  entityKind,
  entityId,
  gradeId,
  volumeId,
  initialWorkflow,
}: ContentWorkflowPanelProps) {
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actor, setActor] = useState("admin-console");
  const [role, setRole] = useState<AdminWorkflowRole>("editor");
  const [reason, setReason] = useState("");
  const [loadingActor, setLoadingActor] = useState(true);
  const canPublish = canPublishWorkflow(role);
  const canRollback = canRollbackWorkflow(role);
  const canSwitchToDraft = canSwitchWorkflowToDraft(role);
  const publishPermissionMessage = getPublishPermissionMessage(role);
  const rollbackPermissionMessage = getRollbackPermissionMessage(role);

  useEffect(() => {
    let cancelled = false;

    async function loadActor() {
      try {
        const storedActor = await readStoredWorkflowActor();
        if (!cancelled) {
          setActor(storedActor.actor);
          setRole(storedActor.role);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "读取后台会话失败。");
        }
      } finally {
        if (!cancelled) {
          setLoadingActor(false);
        }
      }
    }

    void loadActor();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStatusChange(status: "draft" | "published") {
    if (status === "published" && !canPublish) {
      setError(publishPermissionMessage ?? "当前角色无权发布内容。");
      return;
    }
    await submitWorkflowAction("PATCH", { status }, `状态已切换为 ${status === "published" ? "已发布" : "草稿"}`);
  }

  async function handleRollback(version: number) {
    if (!canRollback) {
      setError(rollbackPermissionMessage ?? "当前角色无权回滚内容。");
      return;
    }
    await submitWorkflowAction("POST", { version }, `已回滚到版本 ${version}`);
  }

  async function submitWorkflowAction(
    method: "PATCH" | "POST",
    extraBody: Record<string, unknown>,
    successText: string,
  ) {
    setLoadingAction(method === "PATCH" ? String(extraBody.status) : `rollback-${String(extraBody.version)}`);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/content/workflow", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityKind,
          entityId,
          gradeId,
          volumeId,
          actor: actor.trim() || undefined,
          role,
          reason: reason.trim() || undefined,
          ...extraBody,
        }),
      });
      const payload = (await response.json()) as WorkflowResponse;

      if (!response.ok || !("workflow" in payload)) {
        throw new Error("error" in payload ? payload.error : "工作流操作失败。");
      }

      setWorkflow(payload.workflow);
      await writeStoredWorkflowActor({ actor, role });
      setSuccessMessage(successText);
      setReason("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "工作流操作失败。");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <Card className="rounded-[2rem]">
      <div className="space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">Workflow</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">状态与变更历史</h2>
        </div>

        {workflow ? (
          <>
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7">
              <p><strong>当前状态：</strong>{workflow.metadata.status}</p>
              <p><strong>当前版本：</strong>{workflow.metadata.currentVersion}</p>
              <p><strong>创建时间：</strong>{workflow.metadata.createdAt}</p>
              <p><strong>创建人：</strong>{workflow.metadata.createdBy} · {workflow.metadata.createdByRole}</p>
              <p><strong>最后更新：</strong>{workflow.metadata.updatedAt}</p>
              <p><strong>最后更新人：</strong>{workflow.metadata.updatedBy} · {workflow.metadata.updatedByRole}</p>
              <p><strong>最近操作人：</strong>{workflow.metadata.lastActionBy} · {workflow.metadata.lastActionByRole}</p>
              <p><strong>最后发布：</strong>{workflow.metadata.lastPublishedAt ?? "尚未发布"}</p>
              <p><strong>导入批次：</strong>{workflow.metadata.importBatchId ?? "未记录"}</p>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4">
              <p className="text-sm font-medium">工作流提交信息</p>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2 text-sm">
                  <span>操作者</span>
                  <input
                    value={actor}
                    onChange={(event) => setActor(event.target.value)}
                    placeholder="例如：admin-console / teacher-a"
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 outline-none transition focus:border-[var(--color-primary)]"
                    disabled={loadingActor}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>登录角色</span>
                  <input
                    value={role}
                    disabled
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text-muted)] outline-none"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>变更原因</span>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={3}
                    placeholder="可填写发布说明、回滚原因或审核结论"
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 outline-none transition focus:border-[var(--color-primary)]"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={workflow.metadata.status === "published" ? "secondary" : "primary"}
                loading={loadingAction === "published"}
                disabled={loadingActor || !canPublish}
                onClick={() => handleStatusChange("published")}
              >
                发布当前版本
              </Button>
              <Button
                variant={workflow.metadata.status === "draft" ? "secondary" : "ghost"}
                loading={loadingAction === "draft"}
                disabled={loadingActor || !canSwitchToDraft}
                onClick={() => handleStatusChange("draft")}
              >
                切换为草稿
              </Button>
            </div>
            {publishPermissionMessage ? (
              <p className="text-sm text-[var(--color-text-muted)]">{publishPermissionMessage}</p>
            ) : null}
            {rollbackPermissionMessage ? (
              <p className="text-sm text-[var(--color-text-muted)]">{rollbackPermissionMessage}</p>
            ) : null}

            <div className="space-y-3">
              <p className="text-sm font-medium">最近历史</p>
              {workflow.history.map((entry) => (
                <div
                  key={`${entry.entityKind}-${entry.entityId}-${entry.version}`}
                  className="rounded-[1.25rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm leading-7"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p><strong>版本 {entry.version}</strong> · {entry.action} · {entry.status}</p>
                      <p className="text-[var(--color-text-muted)]">{entry.summary}</p>
                      <p className="text-[var(--color-text-muted)]">
                        操作者 {entry.actor}
                        {" · "}
                        {entry.role ?? "editor"}
                        {entry.reason ? ` · ${entry.reason}` : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={loadingAction === `rollback-${entry.version}`}
                      disabled={!canRollback}
                      onClick={() => handleRollback(entry.version)}
                    >
                      回滚到此版本
                    </Button>
                  </div>
                  <p className="mt-2 text-[var(--color-text-muted)]">{entry.changedAt}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 text-sm text-[var(--color-text-muted)]">
            当前记录还没有 workflow 数据，请先重新导入 SQLite 或执行一次保存。
          </div>
        )}

        {successMessage ? (
          <div className="rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-success),white_45%)] bg-[color-mix(in_oklch,var(--color-success),white_92%)] px-4 py-3 text-sm text-[var(--color-text)]">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[var(--radius-md)] border border-[color-mix(in_oklch,var(--color-danger),white_45%)] bg-[color-mix(in_oklch,var(--color-danger),white_92%)] px-4 py-3 text-sm text-[var(--color-text)]">
            {error}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
