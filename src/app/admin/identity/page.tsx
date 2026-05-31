import Link from "next/link";

import { AdminWorkflowActorSettings } from "@/app/admin/content/AdminWorkflowActorSettings";
import { Card, SectionHeader } from "@/components/ui";
import { routePaths } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default function AdminIdentityPage() {
  return (
    <main className="flex-1 pb-12">
      <section className="rounded-[2rem] border border-[color-mix(in_oklch,var(--color-primary)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_90%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_38%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <SectionHeader
          eyebrow="Admin Identity"
          title="后台身份设置"
          description="维护当前后台会话的编辑者名称，供内容发布、回滚和历史记录自动引用。"
          action={(
            <div className="flex flex-wrap gap-3">
              <Link
                href={routePaths.adminContent()}
                className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                返回内容后台
              </Link>
              <Link
                href={routePaths.home()}
                className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                返回首页
              </Link>
            </div>
          )}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="rounded-[2rem]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-primary)]">Session Identity</p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">当前会话编辑者</h2>
            <p className="text-sm leading-7 text-[var(--color-text-muted)]">
              这里保存的是后台会话级身份。设置后，所有内容编辑页的 workflow 面板都会自动带入该名称。
            </p>
            <AdminWorkflowActorSettings />
          </div>
        </Card>

        <Card className="rounded-[2rem]">
          <div className="space-y-4 text-sm leading-7 text-[var(--color-text-muted)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">Usage Notes</p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">最小身份页说明</h2>
            <p>当前版本不做完整账号系统，只先提供一个最小登录名和角色切换入口。</p>
            <p>该身份通过 cookie 保存在当前浏览器会话中，适合现阶段单后台或轻量协作场景。</p>
            <p>角色目前支持 editor、reviewer、publisher，并会写入 workflow 审计历史。</p>
            <p>后续如果接入真实管理账号，可以把这里替换成正式登录态和权限模型。</p>
          </div>
        </Card>
      </section>
    </main>
  );
}
