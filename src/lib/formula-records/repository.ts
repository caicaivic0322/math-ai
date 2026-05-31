import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ensureFormulaRendered,
  normalizeFormulaLatex,
  resolveFormulaRenderConfig,
  resolveRequestedFormats,
  type FormulaAssetFormat,
  type FormulaProcessRunner,
  type FormulaRenderConfig,
} from "../formula-render";
import type { AssetStorageKind } from "../storage";

export type FormulaRecordEntityType =
  | "question"
  | "analysis"
  | "lesson"
  | "worksheet"
  | "poster"
  | "other";

export interface SaveFormulaRecordInput {
  entityType: FormulaRecordEntityType;
  entityId: string;
  field: string;
  latex: string;
  formats?: FormulaAssetFormat[];
  note?: string;
}

export interface FormulaRecord {
  id: string;
  entityType: FormulaRecordEntityType;
  entityId: string;
  field: string;
  latexSource: string;
  formulaHash: string;
  storageKey: string;
  assetStorageKind: AssetStorageKind;
  svgPath?: string;
  pngPath?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormulaRecordStore {
  records: FormulaRecord[];
}

export interface FormulaRecordListQuery {
  entityType?: FormulaRecordEntityType;
  entityId?: string;
  limit?: number;
}

export interface FormulaRecordRepository {
  save(
    input: SaveFormulaRecordInput,
    options?: { runner?: FormulaProcessRunner },
  ): Promise<FormulaRecord>;
  list(query?: FormulaRecordListQuery): Promise<FormulaRecord[]>;
}

export interface FormulaRecordRepositoryConfig {
  storeFilePath: string;
  renderConfig: FormulaRenderConfig;
  assetStorageKind: AssetStorageKind;
}

export function resolveFormulaRecordRepositoryConfig(
  env: NodeJS.ProcessEnv = process.env,
): FormulaRecordRepositoryConfig {
  const projectRoot = process.cwd();

  return {
    storeFilePath: path.isAbsolute(env.FORMULA_RECORDS_FILE ?? "")
      ? (env.FORMULA_RECORDS_FILE as string)
      : path.join(projectRoot, env.FORMULA_RECORDS_FILE ?? "data/formula-records.json"),
    renderConfig: resolveFormulaRenderConfig(env),
    assetStorageKind: env.FORMULA_ASSET_STORAGE_KIND === "object-storage"
      ? "object-storage"
      : "filesystem",
  };
}

export function createJsonFormulaRecordRepository(
  config: FormulaRecordRepositoryConfig = resolveFormulaRecordRepositoryConfig(),
): FormulaRecordRepository {
  return {
    async save(input, options = {}) {
      return saveFormulaRecordWithConfig(input, {
        config,
        runner: options.runner,
      });
    },
    async list(query = {}) {
      return listFormulaRecordsWithConfig({
        config,
        ...query,
      });
    },
  };
}

export async function saveFormulaRecord(
  input: SaveFormulaRecordInput,
  options: {
    config?: FormulaRecordRepositoryConfig;
    runner?: FormulaProcessRunner;
  } = {},
): Promise<FormulaRecord> {
  const repository = createJsonFormulaRecordRepository(
    options.config ?? resolveFormulaRecordRepositoryConfig(),
  );

  return repository.save(input, { runner: options.runner });
}

async function saveFormulaRecordWithConfig(
  input: SaveFormulaRecordInput,
  options: {
    config: FormulaRecordRepositoryConfig;
    runner?: FormulaProcessRunner;
  },
): Promise<FormulaRecord> {
  const config = options.config;
  const normalizedInput = normalizeSaveInput(input);
  const renderResult = await ensureFormulaRendered(
    {
      latex: normalizedInput.latex,
      formats: normalizedInput.formats,
    },
    {
      config: config.renderConfig,
      runner: options.runner,
    },
  );

  const store = await readFormulaRecordStore(config.storeFilePath);
  const recordId = createFormulaRecordId(
    normalizedInput.entityType,
    normalizedInput.entityId,
    normalizedInput.field,
  );
  const now = new Date().toISOString();
  const existingRecord = store.records.find((record) => record.id === recordId);

  const nextRecord: FormulaRecord = {
    id: recordId,
    entityType: normalizedInput.entityType,
    entityId: normalizedInput.entityId,
    field: normalizedInput.field,
    latexSource: renderResult.latex,
    formulaHash: renderResult.hash,
    storageKey: renderResult.storageKey,
    assetStorageKind: config.assetStorageKind,
    svgPath: renderResult.assets.svg?.publicPath,
    pngPath: renderResult.assets.png?.publicPath,
    note: normalizedInput.note,
    createdAt: existingRecord?.createdAt ?? now,
    updatedAt: now,
  };

  const nextRecords = existingRecord
    ? store.records.map((record) => (record.id === recordId ? nextRecord : record))
    : [nextRecord, ...store.records];

  await writeFormulaRecordStore(config.storeFilePath, {
    records: nextRecords,
  });

  return nextRecord;
}

export async function listFormulaRecords(
  options: {
    config?: FormulaRecordRepositoryConfig;
    entityType?: FormulaRecordEntityType;
    entityId?: string;
    limit?: number;
  } = {},
): Promise<FormulaRecord[]> {
  const repository = createJsonFormulaRecordRepository(
    options.config ?? resolveFormulaRecordRepositoryConfig(),
  );

  return repository.list({
    entityType: options.entityType,
    entityId: options.entityId,
    limit: options.limit,
  });
}

async function listFormulaRecordsWithConfig(
  options: {
    config: FormulaRecordRepositoryConfig;
    entityType?: FormulaRecordEntityType;
    entityId?: string;
    limit?: number;
  },
): Promise<FormulaRecord[]> {
  const config = options.config;
  const store = await readFormulaRecordStore(config.storeFilePath);
  const filteredRecords = store.records.filter((record) => {
    if (options.entityType && record.entityType !== options.entityType) {
      return false;
    }

    if (options.entityId && record.entityId !== options.entityId) {
      return false;
    }

    return true;
  });

  return filteredRecords.slice(0, options.limit ?? 50);
}

function normalizeSaveInput(input: SaveFormulaRecordInput) {
  const entityType = input.entityType;
  const entityId = input.entityId.trim();
  const field = input.field.trim();
  const latex = normalizeFormulaLatex(input.latex);
  const note = input.note?.trim() || undefined;
  const formats = resolveRequestedFormats(input.formats);

  if (!entityId) {
    throw new Error("entityId 不能为空。");
  }

  if (!field) {
    throw new Error("field 不能为空。");
  }

  return {
    entityType,
    entityId,
    field,
    latex,
    note,
    formats,
  };
}

function createFormulaRecordId(
  entityType: FormulaRecordEntityType,
  entityId: string,
  field: string,
) {
  return `${entityType}:${entityId}:${field}`;
}

async function readFormulaRecordStore(storeFilePath: string): Promise<FormulaRecordStore> {
  if (!(await pathExists(storeFilePath))) {
    return { records: [] };
  }

  const raw = await readFile(storeFilePath, "utf8");
  if (!raw.trim()) {
    return { records: [] };
  }

  const parsed = JSON.parse(raw) as Partial<FormulaRecordStore>;

  return {
    records: Array.isArray(parsed.records) ? parsed.records : [],
  };
}

async function writeFormulaRecordStore(
  storeFilePath: string,
  store: FormulaRecordStore,
): Promise<void> {
  const directory = path.dirname(storeFilePath);
  await mkdir(directory, { recursive: true });

  const tempFilePath = `${storeFilePath}.tmp`;
  await writeFile(tempFilePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await rename(tempFilePath, storeFilePath);
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}
