import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import type { AdminWorkflowRole } from "@/app/admin/content/workflow-actor";

import { getAdminAccounts, type AdminAuthAccount } from "./auth";

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (path: string) => SqliteDatabase;
};

type SqliteStatement = {
  run(...values: unknown[]): unknown;
  get(...values: unknown[]): unknown;
  all(...values: unknown[]): unknown[];
};

type SqliteDatabase = {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
  close(): void;
};

type AdminAccountRow = {
  username: string;
  password: string;
  role: AdminWorkflowRole;
  created_at: string;
  updated_at: string;
};

export interface AdminAccountStoreConfig {
  databasePath: string;
}

export interface StoredAdminAccount extends AdminAuthAccount {
  createdAt: string;
  updatedAt: string;
}

export function resolveAdminAccountStoreConfig(
  env: NodeJS.ProcessEnv = process.env,
): AdminAccountStoreConfig {
  const projectRoot = process.cwd();
  const databasePath = env.ADMIN_ACCOUNT_DATABASE_PATH?.trim()
    ? resolveAbsolutePath(env.ADMIN_ACCOUNT_DATABASE_PATH, projectRoot)
    : path.join(projectRoot, "data", "admin-auth.sqlite");

  return { databasePath };
}

export function listStoredAdminAccounts(
  config: AdminAccountStoreConfig = resolveAdminAccountStoreConfig(),
  env: NodeJS.ProcessEnv = process.env,
): StoredAdminAccount[] {
  const database = openAdminAccountDatabase(config, { ensureDirectory: true });

  try {
    ensureAdminAccountSchema(database);
    seedAdminAccounts(database, getAdminAccounts(env));
    const rows = database
      .prepare(`
        SELECT username, password, role, created_at, updated_at
        FROM admin_accounts
        ORDER BY
          CASE role
            WHEN 'admin' THEN 1
            WHEN 'editor' THEN 2
            WHEN 'reviewer' THEN 3
            WHEN 'publisher' THEN 4
            ELSE 99
          END,
          username
      `)
      .all() as AdminAccountRow[];

    return rows.map((row) => ({
      username: row.username,
      password: row.password,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } finally {
    database.close();
  }
}

export function findStoredAdminAccount(
  input: { username: string; password: string },
  config: AdminAccountStoreConfig = resolveAdminAccountStoreConfig(),
  env: NodeJS.ProcessEnv = process.env,
): StoredAdminAccount | undefined {
  const normalizedUsername = input.username.trim();
  if (!normalizedUsername || !input.password) {
    return undefined;
  }

  return listStoredAdminAccounts(config, env).find((account) => (
    account.username === normalizedUsername && account.password === input.password
  ));
}

export function getPrimaryStoredAdminAccount(
  config: AdminAccountStoreConfig = resolveAdminAccountStoreConfig(),
  env: NodeJS.ProcessEnv = process.env,
): StoredAdminAccount {
  const accounts = listStoredAdminAccounts(config, env);
  return accounts.find((account) => account.role === "admin") ?? accounts[0]!;
}

function openAdminAccountDatabase(
  config: AdminAccountStoreConfig,
  options: { ensureDirectory?: boolean } = {},
) {
  if (options.ensureDirectory) {
    mkdirSync(path.dirname(config.databasePath), { recursive: true });
  }

  return new DatabaseSync(config.databasePath);
}

function ensureAdminAccountSchema(database: SqliteDatabase) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS admin_accounts (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function seedAdminAccounts(database: SqliteDatabase, accounts: AdminAuthAccount[]) {
  const existingCount = database
    .prepare("SELECT COUNT(*) AS count FROM admin_accounts")
    .get() as { count: number } | undefined;

  if ((existingCount?.count ?? 0) > 0) {
    return;
  }

  const now = new Date().toISOString();
  const statement = database.prepare(`
    INSERT INTO admin_accounts (username, password, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const account of accounts) {
    statement.run(account.username, account.password, account.role, now, now);
  }
}

function resolveAbsolutePath(value: string, baseDir: string) {
  return path.isAbsolute(value) ? value : path.join(baseDir, value);
}
