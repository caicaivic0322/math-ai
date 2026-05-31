import { describe, expect, it } from "vitest";

import {
  ADMIN_SESSION_TOKEN,
  buildLoginRedirect,
  canAccessAdminSurface,
  canAccessFormulaStudio,
  findAdminAccount,
  getAdminAccounts,
  getAdminAuthConfig,
  isAuthenticatedAdminSession,
  normalizeAdminRole,
  normalizeAdminUsername,
  verifyAdminCredentials,
} from "./auth";

describe("auth helpers", () => {
  it("支持最小管理员账号校验", () => {
    const config = getAdminAuthConfig();

    expect(
      verifyAdminCredentials({
        username: config.username,
        password: config.password,
      }),
    ).toBe(true);

    expect(
      verifyAdminCredentials({
        username: config.username,
        password: "wrong-password",
      }),
    ).toBe(false);
  });

  it("支持按账号匹配不同后台角色", () => {
    const accounts = getAdminAccounts();

    expect(accounts.map((account) => account.role)).toEqual([
      "admin",
      "editor",
      "reviewer",
      "publisher",
    ]);

    for (const account of accounts) {
      expect(
        findAdminAccount({
          username: account.username,
          password: account.password,
        }),
      ).toEqual(account);
    }
  });

  it("基于账户角色控制后台与公式工作台访问", () => {
    expect(canAccessAdminSurface("admin")).toBe(true);
    expect(canAccessAdminSurface("editor")).toBe(true);
    expect(canAccessAdminSurface("reviewer")).toBe(true);
    expect(canAccessAdminSurface("publisher")).toBe(true);

    expect(canAccessFormulaStudio("admin")).toBe(true);
    expect(canAccessFormulaStudio("editor")).toBe(false);
    expect(canAccessFormulaStudio("reviewer")).toBe(false);
    expect(canAccessFormulaStudio("publisher")).toBe(false);
  });

  it("只接受合法的站内跳转地址", () => {
    expect(buildLoginRedirect("/admin/content")).toBe("/admin/content");
    expect(buildLoginRedirect("https://evil.example")).toBe("/");
    expect(buildLoginRedirect("//evil.example")).toBe("/");
    expect(buildLoginRedirect(undefined)).toBe("/");
  });

  it("识别管理员会话并规范化用户名", () => {
    expect(isAuthenticatedAdminSession(ADMIN_SESSION_TOKEN)).toBe(true);
    expect(isAuthenticatedAdminSession("invalid")).toBe(false);
    expect(normalizeAdminUsername(" teacher-a ")).toBe("teacher-a");
    expect(normalizeAdminRole("publisher")).toBe("publisher");
    expect(normalizeAdminRole("unknown")).toBe("admin");
  });
});
