import Link from "next/link";
import { cookies } from "next/headers";

import { routePaths } from "../../lib/routes";
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_ROLE_COOKIE_NAME,
  ADMIN_USERNAME_COOKIE_NAME,
  canAccessFormulaStudio,
  isAuthenticatedAdminSession,
  normalizeAdminRole,
} from "../../lib/auth";

export async function TopBar() {
  const cookieStore = await cookies();
  const isAdminAuthenticated = isAuthenticatedAdminSession(
    cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value,
  );
  const adminUsername = cookieStore.get(ADMIN_USERNAME_COOKIE_NAME)?.value;
  const adminRole = normalizeAdminRole(cookieStore.get(ADMIN_AUTH_ROLE_COOKIE_NAME)?.value);

  return (
    <header className="mb-6 flex items-center justify-between rounded-[1.75rem] border border-[color-mix(in_oklch,var(--color-primary)_16%,var(--color-border))] bg-[color-mix(in_oklch,var(--color-surface)_84%,white)] px-4 py-3 shadow-[var(--shadow-sm)] sm:px-5">
      <Link href={routePaths.home()} className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_oklch,var(--color-accent)_65%,var(--color-primary)))] text-sm font-bold text-[var(--color-primary-foreground)] shadow-[var(--shadow-sm)]">
          数
        </span>
        <span className="block">
          <span className="block text-[0.72rem] uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Math Sprint
          </span>
          <span className="block font-semibold tracking-[0.02em]">人教版初中数学</span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        {isAdminAuthenticated ? (
          <>
            <Link
              href={routePaths.adminContent()}
              className="hidden rounded-full border border-[var(--color-border)] bg-white/90 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] lg:block"
            >
              内容后台
            </Link>
            {canAccessFormulaStudio(adminRole) ? (
              <Link
                href={routePaths.formulaStudio()}
                className="hidden rounded-full border border-[var(--color-border)] bg-white/90 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:block"
              >
                公式工作台
              </Link>
            ) : null}
            <div className="hidden rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-sm text-[var(--color-text-muted)] lg:block">
              {adminUsername ?? "admin"} · {adminRole}
            </div>
            <form action="/api/auth/logout?redirectTo=/" method="post">
              <button
                type="submit"
                className="rounded-full border border-[var(--color-border)] bg-white/90 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                退出登录
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="hidden rounded-full bg-[var(--color-primary-soft)] px-4 py-2 text-sm text-[var(--color-text-muted)] lg:block">
              知识点 · 例题 · 单元测验
            </div>
            <Link
              href={routePaths.login()}
              className="rounded-full border border-[var(--color-border)] bg-white/90 px-4 py-2 text-sm text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              管理员登录
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
