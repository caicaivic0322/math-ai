import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rename, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const SUPPORTED_FORMATS = ["svg", "png"] as const;

export type FormulaAssetFormat = (typeof SUPPORTED_FORMATS)[number];

export interface FormulaRenderRequest {
  latex: string;
  formats?: FormulaAssetFormat[];
}

export interface FormulaRenderedAsset {
  format: FormulaAssetFormat;
  fileName: string;
  absolutePath: string;
  publicPath: string;
  mimeType: string;
  fromCache: boolean;
}

export interface FormulaRenderResult {
  latex: string;
  hash: string;
  storageKey: string;
  assets: Partial<Record<FormulaAssetFormat, FormulaRenderedAsset>>;
}

export interface FormulaRenderConfig {
  assetDir: string;
  publicBasePath: string;
  ratexRoot: string;
  unicodeFontPath?: string;
  renderBinaryPath?: string;
  svgBinaryPath?: string;
}

export interface FormulaProcessInvocation {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  input: string;
}

export interface FormulaProcessResult {
  stdout: string;
  stderr: string;
}

export type FormulaProcessRunner = (
  invocation: FormulaProcessInvocation,
) => Promise<FormulaProcessResult>;

export function normalizeFormulaLatex(latex: string): string {
  if (typeof latex !== "string") {
    throw new Error("LaTeX 必须是字符串。");
  }

  const normalized = latex.trim();
  if (!normalized) {
    throw new Error("LaTeX 不能为空。");
  }

  return normalized;
}

export function createFormulaHash(latex: string): string {
  return createHash("sha256").update(normalizeFormulaLatex(latex)).digest("hex");
}

export function resolveRequestedFormats(
  formats?: FormulaAssetFormat[],
): FormulaAssetFormat[] {
  if (!formats || formats.length === 0) {
    return ["svg"];
  }

  const uniqueFormats = Array.from(new Set(formats));
  for (const format of uniqueFormats) {
    if (!SUPPORTED_FORMATS.includes(format)) {
      throw new Error(`暂不支持的公式格式: ${format}`);
    }
  }

  return uniqueFormats;
}

export function resolveFormulaRenderConfig(
  env: NodeJS.ProcessEnv = process.env,
): FormulaRenderConfig {
  const projectRoot = process.cwd();
  const ratexRoot = resolveAbsolutePath(env.RATEX_ROOT, projectRoot)
    ?? path.join(projectRoot, ".cache", "RaTeX");
  const assetDir = resolveAbsolutePath(env.FORMULA_ASSET_DIR, projectRoot)
    ?? path.join(projectRoot, "public", "generated", "formulas");
  const publicBasePath = env.FORMULA_PUBLIC_BASE_PATH ?? "/generated/formulas";

  const explicitRenderBin = resolveAbsolutePath(env.RATEX_RENDER_BIN, projectRoot);
  const explicitSvgBin = resolveAbsolutePath(env.RATEX_SVG_BIN, projectRoot);
  const defaultRenderBin = path.join(ratexRoot, "target", "release", "render");
  const defaultSvgBin = path.join(ratexRoot, "target", "release", "render-svg");

  return {
    assetDir,
    publicBasePath,
    ratexRoot,
    unicodeFontPath: resolveAbsolutePath(env.RATEX_UNICODE_FONT, projectRoot),
    renderBinaryPath:
      explicitRenderBin ?? (existsSync(defaultRenderBin) ? defaultRenderBin : undefined),
    svgBinaryPath: explicitSvgBin ?? (existsSync(defaultSvgBin) ? defaultSvgBin : undefined),
  };
}

export async function ensureFormulaRendered(
  request: FormulaRenderRequest,
  options: {
    config?: FormulaRenderConfig;
    runner?: FormulaProcessRunner;
  } = {},
): Promise<FormulaRenderResult> {
  const config = options.config ?? resolveFormulaRenderConfig();
  const runner = options.runner ?? runFormulaProcess;
  const latex = normalizeFormulaLatex(request.latex);
  const formats = resolveRequestedFormats(request.formats);
  const hash = createFormulaHash(latex);

  await mkdir(config.assetDir, { recursive: true });

  const assets: FormulaRenderResult["assets"] = {};

  for (const format of formats) {
    const descriptor = describeFormulaAsset(hash, format, config);
    const alreadyExists = await pathExists(descriptor.absolutePath);

    if (!alreadyExists) {
      await renderFormulaAsset({
        latex,
        hash,
        format,
        config,
        runner,
        destinationPath: descriptor.absolutePath,
      });
    }

    assets[format] = {
      ...descriptor,
      fromCache: alreadyExists,
    };
  }

  return {
    latex,
    hash,
    storageKey: hash,
    assets,
  };
}

function describeFormulaAsset(
  hash: string,
  format: FormulaAssetFormat,
  config: FormulaRenderConfig,
): Omit<FormulaRenderedAsset, "fromCache"> {
  const fileName = `${hash}.${format}`;

  return {
    format,
    fileName,
    absolutePath: path.join(config.assetDir, fileName),
    publicPath: joinPublicPath(config.publicBasePath, fileName),
    mimeType: format === "svg" ? "image/svg+xml" : "image/png",
  };
}

async function renderFormulaAsset({
  latex,
  hash,
  format,
  config,
  runner,
  destinationPath,
}: {
  latex: string;
  hash: string;
  format: FormulaAssetFormat;
  config: FormulaRenderConfig;
  runner: FormulaProcessRunner;
  destinationPath: string;
}) {
  if (!(await pathExists(config.ratexRoot))) {
    throw new Error(
      `未找到 RaTeX 目录: ${config.ratexRoot}。请先 clone 仓库并设置 RATEX_ROOT。`,
    );
  }

  const tempRoot = path.join(config.assetDir, ".tmp");
  await mkdir(tempRoot, { recursive: true });
  const tempDir = await mkdtemp(path.join(tempRoot, `${hash}-${format}-`));

  try {
    const invocation = buildFormulaInvocation({
      latex,
      format,
      outputDir: tempDir,
      config,
    });

    const result = await runner(invocation);
    const generatedPath = path.join(tempDir, format === "svg" ? "0001.svg" : "0001.png");

    if (!(await pathExists(generatedPath))) {
      const logs = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
      throw new Error(
        `RaTeX 未生成 ${format.toUpperCase()} 文件。${logs ? `日志: ${logs}` : ""}`,
      );
    }

    await moveGeneratedAsset(generatedPath, destinationPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function buildFormulaInvocation({
  latex,
  format,
  outputDir,
  config,
}: {
  latex: string;
  format: FormulaAssetFormat;
  outputDir: string;
  config: FormulaRenderConfig;
}): FormulaProcessInvocation {
  const env = {
    ...process.env,
    ...(config.unicodeFontPath
      ? {
          RATEX_UNICODE_FONT: config.unicodeFontPath,
        }
      : {}),
  };

  if (format === "png") {
    if (config.renderBinaryPath) {
      return {
        command: config.renderBinaryPath,
        args: ["--output-dir", outputDir],
        cwd: config.ratexRoot,
        env,
        input: `${latex}${os.EOL}`,
      };
    }

    return {
      command: "cargo",
      args: ["run", "--release", "-p", "ratex-render", "--", "--output-dir", outputDir],
      cwd: config.ratexRoot,
      env,
      input: `${latex}${os.EOL}`,
    };
  }

  if (config.svgBinaryPath) {
    return {
      command: config.svgBinaryPath,
      args: ["--output-dir", outputDir],
      cwd: config.ratexRoot,
      env,
      input: `${latex}${os.EOL}`,
    };
  }

  return {
    command: "cargo",
    args: [
      "run",
      "--release",
      "-p",
      "ratex-svg",
      "--features",
      "cli standalone",
      "--",
      "--output-dir",
      outputDir,
    ],
    cwd: config.ratexRoot,
    env,
    input: `${latex}${os.EOL}`,
  };
}

async function moveGeneratedAsset(sourcePath: string, destinationPath: string) {
  if (await pathExists(destinationPath)) {
    return;
  }

  await mkdir(path.dirname(destinationPath), { recursive: true });

  try {
    await rename(sourcePath, destinationPath);
  } catch (error) {
    if (await pathExists(destinationPath)) {
      return;
    }

    throw error;
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

function joinPublicPath(basePath: string, fileName: string): string {
  const sanitizedBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  return `${sanitizedBasePath}/${fileName}`;
}

function resolveAbsolutePath(
  rawPath: string | undefined,
  projectRoot: string,
): string | undefined {
  if (!rawPath) {
    return undefined;
  }

  return path.isAbsolute(rawPath) ? rawPath : path.join(projectRoot, rawPath);
}

async function runFormulaProcess({
  command,
  args,
  cwd,
  env,
  input,
}: FormulaProcessInvocation): Promise<FormulaProcessResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `RaTeX 命令执行失败 (${code ?? "unknown"}): ${command} ${args.join(" ")}\n${stderr || stdout}`,
        ),
      );
    });

    child.stdin.end(input);
  });
}
