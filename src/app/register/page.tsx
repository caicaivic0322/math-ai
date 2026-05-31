import Link from "next/link";

import { routePaths } from "@/lib/routes";

export default function RegisterPage() {
  return (
    <main className="flex-1 pb-12">
      <section className="mx-auto max-w-4xl rounded-[2.4rem] border border-[color-mix(in_oklch,var(--color-primary)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_90%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_34%,white)_62%,color-mix(in_oklch,var(--color-accent)_10%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Register</p>
        <h1 className="mt-3 text-[clamp(2.1rem,4.4vw,4.2rem)] font-semibold tracking-[-0.06em]">
          当前版本暂不开放
          <br />
          学生自助注册
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-muted)]">
          学习内容当前对普通访问者直接开放，后台功能使用预置账户登录，不开放学生或教师自助注册。
          后续如果接入班级、作业、错题本和学习档案，再补完整注册、找回密码与身份管理。
        </p>
        <div className="mt-6 rounded-[1.4rem] border border-[var(--color-border)] bg-white/75 px-5 py-4 text-sm leading-7 text-[var(--color-text-muted)] shadow-[var(--shadow-sm)]">
          当前阶段的重点是先把内容生产后台、公式渲染和权限边界稳定下来；
          面向学生与教师的正式账号体系会在后续阶段单独建设。
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={routePaths.home()}
            className="rounded-full bg-[var(--color-text)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)]"
          >
            返回首页
          </Link>
          <Link
            href={routePaths.login()}
            className="rounded-full border border-[var(--color-border)] bg-white/80 px-6 py-3 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            管理员登录
          </Link>
        </div>
      </section>
    </main>
  );
}
