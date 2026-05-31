import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import {
  createJsonLearningContentRepository,
  createSqliteLearningContentRepository,
  resolveLearningContentRepositoryConfig,
  resolveLearningContentSqliteConfig,
} from "@/lib/content-store";
import type {
  CurriculumContentSnapshot,
  ResolvedCurriculumContentSourceConfig,
} from "@/lib/content/source";
import {
  buildCurriculumContentSnapshot,
  resolveCurriculumContentSourceConfig,
} from "@/lib/content/source";

export const runtime = "nodejs";

type ImportContentBody = {
  snapshotPath?: unknown;
  target?: unknown;
};

type ImportTarget = "json-store" | "sqlite";

export async function GET() {
  try {
    const sourceConfig = resolveCurriculumContentSourceConfig();
    const jsonRepository = createJsonLearningContentRepository(
      resolveLearningContentRepositoryConfig(),
    );
    const sqliteRepository = createSqliteLearningContentRepository(
      resolveLearningContentSqliteConfig(),
    );

    return NextResponse.json({
      source: serializeSourceConfig(sourceConfig),
      targets: {
        jsonStore: jsonRepository.getSummary(),
        sqlite: sqliteRepository.getSummary(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取内容导入状态失败。";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await parseOptionalJsonBody(request)) as ImportContentBody | undefined;
    const sourceConfig = resolveCurriculumContentSourceConfig();
    const snapshotPath = resolveRequestedSnapshotPath(body?.snapshotPath, sourceConfig);
    const target = parseImportTarget(body?.target);
    const snapshot = loadSnapshotFromFile(snapshotPath);
    const repository = target === "sqlite"
      ? createSqliteLearningContentRepository(resolveLearningContentSqliteConfig())
      : createJsonLearningContentRepository(resolveLearningContentRepositoryConfig());
    const store = repository.replace({
      curriculumSlices: snapshot.curriculumSlices,
      sourceSnapshotPath: snapshotPath,
    });

    return NextResponse.json({
      imported: true,
      target,
      snapshotPath,
      source: serializeSourceConfig(sourceConfig),
      store: repository.getSummary(),
      importedCounts: {
        grades: store.grades.length,
        volumes: store.volumes.length,
        chapters: store.chapters.length,
        lessons: store.lessons.length,
        workedExamples: store.workedExamples.length,
        quizzes: store.quizzes.length,
        questions: store.quizQuestions.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "导入课程内容失败。";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}

async function parseOptionalJsonBody(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined;
  }

  return request.json();
}

function loadSnapshotFromFile(snapshotPath: string) {
  if (!existsSync(snapshotPath)) {
    throw new Error(`未找到课程快照文件: ${snapshotPath}`);
  }

  const raw = readFileSync(snapshotPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<CurriculumContentSnapshot>;

  return buildCurriculumContentSnapshot(parsed.curriculumSlices ?? []);
}

function resolveRequestedSnapshotPath(
  value: unknown,
  sourceConfig: ResolvedCurriculumContentSourceConfig,
) {
  if (value === undefined || value === null || value === "") {
    return sourceConfig.jsonPath;
  }

  if (typeof value !== "string") {
    throw new Error("snapshotPath 必须是字符串。");
  }

  return path.isAbsolute(value) ? value : path.join(sourceConfig.projectRoot, value);
}

function serializeSourceConfig(sourceConfig: ResolvedCurriculumContentSourceConfig) {
  return {
    sourceKind: sourceConfig.sourceKind,
    databaseBackendKind: sourceConfig.databaseBackendKind,
    jsonPath: sourceConfig.jsonPath,
    contentStorePath: sourceConfig.contentStorePath,
    contentDatabasePath: sourceConfig.contentDatabasePath,
  };
}

function parseImportTarget(value: unknown): ImportTarget {
  if (value === undefined || value === null || value === "") {
    return "json-store";
  }

  if (value === "json-store" || value === "sqlite") {
    return value;
  }

  throw new Error("target 必须是 json-store 或 sqlite。");
}
