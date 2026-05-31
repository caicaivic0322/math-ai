import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createFormulaHash,
  ensureFormulaRendered,
  type FormulaAssetFormat,
  type FormulaProcessInvocation,
  type FormulaRenderConfig,
} from "./service";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("formula-render service", () => {
  it("对首尾空白稳定归一化后生成相同 hash", () => {
    expect(createFormulaHash("  \\frac{1}{2}  ")).toBe(createFormulaHash("\\frac{1}{2}"));
  });

  it("首次渲染写入文件，二次请求直接命中缓存", async () => {
    const config = await createTestConfig();
    const runner = vi.fn(async (invocation: FormulaProcessInvocation) => {
      await emitMockOutput(invocation);
      return {
        stdout: "OK",
        stderr: "",
      };
    });

    const firstResult = await ensureFormulaRendered(
      {
        latex: "\\frac{1}{2}",
        formats: ["svg", "png"],
      },
      { config, runner },
    );

    expect(runner).toHaveBeenCalledTimes(2);
    expect(firstResult.assets.svg?.fromCache).toBe(false);
    expect(firstResult.assets.png?.fromCache).toBe(false);

    const secondResult = await ensureFormulaRendered(
      {
        latex: "  \\frac{1}{2} ",
        formats: ["svg", "png"],
      },
      { config, runner },
    );

    expect(runner).toHaveBeenCalledTimes(2);
    expect(secondResult.assets.svg?.fromCache).toBe(true);
    expect(secondResult.assets.png?.fromCache).toBe(true);
    expect(secondResult.assets.svg?.publicPath).toMatch(/^\/generated\/formulas\/.+\.svg$/);
    expect(secondResult.assets.png?.publicPath).toMatch(/^\/generated\/formulas\/.+\.png$/);
  });
});

async function createTestConfig(): Promise<FormulaRenderConfig> {
  const root = await mkdtemp(path.join(os.tmpdir(), "formula-render-test-"));
  tempDirs.push(root);
  const ratexRoot = path.join(root, "RaTeX");
  await mkdir(ratexRoot, { recursive: true });

  return {
    assetDir: path.join(root, "public", "generated", "formulas"),
    publicBasePath: "/generated/formulas",
    ratexRoot,
  };
}

async function emitMockOutput({
  command,
  args,
  input,
}: FormulaProcessInvocation): Promise<void> {
  const format = resolveFormat(command, args);
  const outputDir = extractOutputDir(args);

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, `0001.${format}`), input, "utf8");
}

function resolveFormat(command: string, args: string[]): FormulaAssetFormat {
  if (command.includes("render-svg") || args.includes("ratex-svg")) {
    return "svg";
  }

  return "png";
}

function extractOutputDir(args: string[]): string {
  const outputIndex = args.findIndex((arg) => arg === "--output-dir");

  if (outputIndex === -1 || !args[outputIndex + 1]) {
    throw new Error("mock runner 未收到 --output-dir 参数。");
  }

  return args[outputIndex + 1];
}
