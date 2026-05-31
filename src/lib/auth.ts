import type { AdminWorkflowRole } from "@/app/admin/content/workflow-actor";

export const ADMIN_AUTH_COOKIE_NAME = "admin-authenticated";
export const ADMIN_USERNAME_COOKIE_NAME = "admin-username";
export const ADMIN_AUTH_ROLE_COOKIE_NAME = "admin-account-role";
export const ADMIN_SESSION_TOKEN = "math-admin-session";

export interface AdminAuthAccount {
  username: string;
  password: string;
  role: AdminWorkflowRole;
}

export function getAdminAccounts(env: NodeJS.ProcessEnv = process.env): AdminAuthAccount[] {
  return [
    {
      username: env.ADMIN_LOGIN_USERNAME?.trim() || "admin",
      password: env.ADMIN_LOGIN_PASSWORD?.trim() || "admin123456",
      role: "admin",
    },
    {
      username: env.EDITOR_LOGIN_USERNAME?.trim() || "editor",
      password: env.EDITOR_LOGIN_PASSWORD?.trim() || "editor123456",
      role: "editor",
    },
    {
      username: env.REVIEWER_LOGIN_USERNAME?.trim() || "reviewer",
      password: env.REVIEWER_LOGIN_PASSWORD?.trim() || "reviewer123456",
      role: "reviewer",
    },
    {
      username: env.PUBLISHER_LOGIN_USERNAME?.trim() || "publisher",
      password: env.PUBLISHER_LOGIN_PASSWORD?.trim() || "publisher123456",
      role: "publisher",
    },
  ];
}

export function getAdminAuthConfig(env: NodeJS.ProcessEnv = process.env) {
  return getAdminAccounts(env).find((account) => account.role === "admin") ?? getAdminAccounts(env)[0]!;
}

export function findAdminAccount(input: { username: string; password: string }) {
  return getAdminAccounts().find(
    (account) =>
      input.username.trim() === account.username
      && input.password === account.password,
  );
}

export function verifyAdminCredentials(input: { username: string; password: string }) {
  return Boolean(findAdminAccount(input));
}

export function isAuthenticatedAdminSession(value: string | undefined) {
  return value === ADMIN_SESSION_TOKEN;
}

export function normalizeAdminUsername(value: string | undefined) {
  return value?.trim() || getAdminAuthConfig().username;
}

export function normalizeAdminRole(value: string | undefined): AdminWorkflowRole {
  return value === "admin" || value === "editor" || value === "reviewer" || value === "publisher"
    ? value
    : "admin";
}

export function canAccessFormulaStudio(role: AdminWorkflowRole) {
  return role === "admin";
}

export function canAccessAdminSurface(role: AdminWorkflowRole) {
  return role === "admin" || role === "editor" || role === "reviewer" || role === "publisher";
}

export function buildLoginRedirect(target: string | undefined) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return "/";
  }

  return target;
}
