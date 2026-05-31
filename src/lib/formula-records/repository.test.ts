import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { FormulaProcessInvocation } from "../formula-render";

import {
  createJsonFormulaRecordRepository,
  listFormulaRecords,
  saveFormulaRecord,
  type FormulaRecordRepositoryConfig,
} from "./repository";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("formula record repository", () => {
  it("保存记录时会生成资源信息并写入本地 JSON 仓储", async () => {
    const config = await createRepositoryConfig();
    const runner = vi.fn(async (invocation: FormulaProcessInvocation) => {
      await emitMockOutput(invocation);
      return { stdout: "OK", stderr: "" };
    });

    const record = await saveFormulaRecord(
      {
        entityType: "question",
        entityId: "question-001",
        field: "stemFormula",
        latex: String.raw`\frac{1}{2}`,
        formats: ["svg", "png"],
        note: "题干公式",
      },
      { config, runner },
    );

    expect(record.id).toBe("question:question-001:stemFormula");
    expect(record.svgPath).toMatch(/^\/generated\/formulas\/.+\.svg$/);
    expect(record.pngPath).toMatch(/^\/generated\/formulas\/.+\.png$/);

    const storeRaw = await readFile(config.storeFilePath, "utf8");
    expect(storeRaw).toContain('"entityId": "question-001"');
    expect(storeRaw).toContain('"field": "stemFormula"');
    expect(runner).toHaveBeenCalledTimes(2);
  });

  it("按实体过滤读取记录列表", async () => {
    const config = await createRepositoryConfig();
    const runner = vi.fn(async (invocation: FormulaProcessInvocation) => {
      await emitMockOutput(invocation);
      return { stdout: "OK", stderr: "" };
    });

    await saveFormulaRecord(
      {
        entityType: "question",
        entityId: "question-001",
        field: "stemFormula",
        latex: "x+1=2",
      },
      { config, runner },
    );

    await saveFormulaRecord(
      {
        entityType: "analysis",
        entityId: "analysis-001",
        field: "resultFormula",
        latex: "x=1",
      },
      { config, runner },
    );

    const questionRecords = await listFormulaRecords({
      config,
      entityType: "question",
    });

    expect(questionRecords).toHaveLength(1);
    expect(questionRecords[0]?.entityType).toBe("question");
    expect(questionRecords[0]?.entityId).toBe("question-001");
  });

  it("支持通过可替换仓储接口访问本地 JSON 实现", async () => {
    const config = await createRepositoryConfig();
    const repository = createJsonFormulaRecordRepository(config);
    const runner = vi.fn(async (invocation: FormulaProcessInvocation) => {
      await emitMockOutput(invocation);
      return { stdout: "OK", stderr: "" };
    });

    await repository.save(
      {
        entityType: "lesson",
        entityId: "lesson-001",
        field: "ruleFormula",
        latex: "x^2-1",
      },
      { runner },
    );

    const records = await repository.list({ entityType: "lesson" });

    expect(records).toHaveLength(1);
    expect(records[0]?.entityId).toBe("lesson-001");
  });
});

async function createRepositoryConfig(): Promise<FormulaRecordRepositoryConfig> {
  const root = await mkdtemp(path.join(os.tmpdir(), "formula-record-repository-"));
  tempDirs.push(root);
  const ratexRoot = path.join(root, "RaTeX");
  await mkdir(ratexRoot, { recursive: true });

  return {
    storeFilePath: path.join(root, "data", "formula-records.json"),
    assetStorageKind: "filesystem",
    renderConfig: {
      assetDir: path.join(root, "public", "generated", "formulas"),
      publicBasePath: "/generated/formulas",
      ratexRoot,
    },
  };
}

async function emitMockOutput({
  command,
  args,
  input,
}: FormulaProcessInvocation): Promise<void> {
  const format = command.includes("render-svg") || args.includes("ratex-svg") ? "svg" : "png";
  const outputIndex = args.findIndex((arg) => arg === "--output-dir");

  if (outputIndex === -1 || !args[outputIndex + 1]) {
    throw new Error("mock runner 未收到 --output-dir 参数。");
  }

  const outputDir = args[outputIndex + 1];
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, `0001.${format}`), input, "utf8");
}
