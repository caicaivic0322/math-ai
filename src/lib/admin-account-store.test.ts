import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  findStoredAdminAccount,
  getPrimaryStoredAdminAccount,
  listStoredAdminAccounts,
} from "./admin-account-store";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("admin account store", () => {
  it("会把默认后台账户初始化到 SQLite", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "admin-account-store-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "admin-auth.sqlite");

    const accounts = listStoredAdminAccounts(
      { databasePath },
      {
        ...process.env,
        ADMIN_LOGIN_USERNAME: "chief-admin",
        ADMIN_LOGIN_PASSWORD: "admin-pass",
        EDITOR_LOGIN_USERNAME: "content-editor",
        EDITOR_LOGIN_PASSWORD: "editor-pass",
        REVIEWER_LOGIN_USERNAME: "quality-reviewer",
        REVIEWER_LOGIN_PASSWORD: "reviewer-pass",
        PUBLISHER_LOGIN_USERNAME: "release-publisher",
        PUBLISHER_LOGIN_PASSWORD: "publisher-pass",
      },
    );

    expect(accounts.map((account) => account.role)).toEqual([
      "admin",
      "editor",
      "reviewer",
      "publisher",
    ]);
    expect(accounts[0]?.username).toBe("chief-admin");
    expect(getPrimaryStoredAdminAccount({ databasePath }).role).toBe("admin");
    expect(
      findStoredAdminAccount(
        { username: "content-editor", password: "editor-pass" },
        { databasePath },
      )?.role,
    ).toBe("editor");
  });

  it("账户库初始化后不会被新的环境变量覆盖", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "admin-account-store-persist-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "admin-auth.sqlite");

    listStoredAdminAccounts(
      { databasePath },
      {
        ...process.env,
        ADMIN_LOGIN_USERNAME: "seed-admin",
        ADMIN_LOGIN_PASSWORD: "seed-pass",
      },
    );

    const accounts = listStoredAdminAccounts(
      { databasePath },
      {
        ...process.env,
        ADMIN_LOGIN_USERNAME: "changed-admin",
        ADMIN_LOGIN_PASSWORD: "changed-pass",
      },
    );

    expect(accounts.find((account) => account.role === "admin")?.username).toBe("seed-admin");
    expect(
      findStoredAdminAccount(
        { username: "changed-admin", password: "changed-pass" },
        { databasePath },
      ),
    ).toBeUndefined();
  });
});
