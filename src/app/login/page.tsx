import Link from "next/link";

import {
  getPrimaryStoredAdminAccount,
  listStoredAdminAccounts,
} from "@/lib/admin-account-store";
import { routePaths } from "@/lib/routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const redirectTo = resolvedSearchParams?.redirectTo || routePaths.adminContent();
  const hasInvalidCredentials = resolvedSearchParams?.error === "invalid-credentials";
  const defaultAdmin = getPrimaryStoredAdminAccount();
  const adminAccounts = listStoredAdminAccounts();

  return (
    <main className="flex-1 pb-12">
      <section className="mx-auto max-w-5xl rounded-[2.4rem] border border-[color-mix(in_oklch,var(--color-primary)_16%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--color-surface)_88%,white)_0%,color-mix(in_oklch,var(--color-primary-soft)_38%,white)_58%,color-mix(in_oklch,var(--color-accent)_12%,white)_100%)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]">Admin Login</p>
            <h1 className="text-[clamp(2.3rem,4.6vw,4.6rem)] font-semibold tracking-[-0.06em]">
              先登录
              <br />
              再进入后台
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--color-text-muted)]">
              普通用户只浏览学习内容；后台账户登录后才可进入 `内容后台`，其中只有 `admin`
              账户可以访问 `公式工作台`。
            </p>
            <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-white/82 px-5 py-4 text-sm leading-7 text-[var(--color-text-muted)] shadow-[var(--shadow-sm)]">
              <p>当前后台账户已持久化到本地 SQLite 账户库，首次启动会自动初始化以下默认账号：</p>
              <div className="mt-3 space-y-2">
                {adminAccounts.map((account) => (
                  <div
                    key={`${account.role}-${account.username}`}
                    className="rounded-[1rem] border border-[var(--color-border)] bg-white/80 px-4 py-3"
                  >
                    <p>
                      <strong>{account.role}</strong> · {account.username}
                    </p>
                    <p>密码：{account.password}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3">
                默认建议先使用 <strong>{defaultAdmin.username}</strong> 登录；如需替换，可设置对应的
                `ADMIN_*`、`EDITOR_*`、`REVIEWER_*`、`PUBLISHER_*` 环境变量后，删除当前账户库重新初始化。
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--color-border)] bg-white/88 p-6 shadow-[var(--shadow-md)]">
            <form action="/api/auth/login" method="post" className="space-y-5">
              <input type="hidden" name="redirectTo" value={redirectTo} />

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  后台账户用户名
                </label>
                <input
                  id="username"
                  name="username"
                  defaultValue={defaultAdmin.username}
                  className="w-full rounded-[1rem] border border-[var(--color-border)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  密码
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  defaultValue={defaultAdmin.password}
                  className="w-full rounded-[1rem] border border-[var(--color-border)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]"
                />
              </div>

              {hasInvalidCredentials ? (
                <div className="rounded-[1rem] border border-[color-mix(in_oklch,var(--color-danger),white_45%)] bg-[color-mix(in_oklch,var(--color-danger),white_92%)] px-4 py-3 text-sm text-[var(--color-text)]">
                  用户名或密码错误，请重新登录。
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-full bg-[var(--color-text)] px-6 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-md)] transition hover:-translate-y-0.5"
              >
                登录后台
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
              <Link
                href={routePaths.home()}
                className="rounded-full border border-[var(--color-border)] px-4 py-2 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                返回首页
              </Link>
              <Link
                href={routePaths.register()}
                className="rounded-full border border-[var(--color-border)] px-4 py-2 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                注册说明
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
