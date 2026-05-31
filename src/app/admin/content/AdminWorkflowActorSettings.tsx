"use client";

import { useEffect, useState } from "react";

import { type AdminWorkflowRole, readStoredWorkflowActor, writeStoredWorkflowActor } from "@/app/admin/content/workflow-actor";

export function AdminWorkflowActorSettings() {
  const [actor, setActor] = useState("");
  const [role, setRole] = useState<AdminWorkflowRole>("editor");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setLoading(false);
        }
      }
    }

    void loadActor();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timer = window.setTimeout(() => setSaved(false), 1600);
    return () => window.clearTimeout(timer);
  }, [saved]);

  async function handleSave() {
    setError(null);
    try {
      const nextActor = await writeStoredWorkflowActor({ actor, role });
      setActor(nextActor.actor);
      setRole(nextActor.role);
      setSaved(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存后台会话失败。");
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white px-4 py-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="grid min-w-0 flex-1 gap-2 text-sm">
          <span className="font-medium">后台默认编辑者</span>
          <input
            value={actor}
            onChange={(event) => setActor(event.target.value)}
            placeholder="例如：admin-console / teacher-a"
            className="rounded-full border border-[var(--color-border)] px-4 py-2 outline-none transition focus:border-[var(--color-primary)]"
            disabled={loading}
          />
        </label>
        <label className="grid gap-2 text-sm lg:w-48">
          <span className="font-medium">登录角色</span>
          <input
            value={role}
            disabled
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-[var(--color-text-muted)] outline-none"
          />
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white transition hover:opacity-90"
        >
          {loading ? "加载中..." : "保存会话身份"}
        </button>
      </div>
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
        角色由登录账户决定，所有内容编辑页的 workflow 面板都会自动继承当前登录角色。
        {saved ? " 已保存。" : ""}
      </p>
      {error ? (
        <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>
      ) : null}
    </div>
  );
}
