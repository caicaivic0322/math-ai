import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type {
  CurriculumChapter,
  CurriculumSlice,
  GradeDefinition,
  GradeId,
  KnowledgePointLesson,
  UnitQuiz,
  VolumeDefinition,
  VolumeId,
  WorkedExample,
} from "@/types/content";
import {
  buildCurriculumSlicesFromStore,
  createSqliteLearningContentRepository,
  readLearningContentStore,
} from "../content-store";
import { curriculumSlices as localCurriculumSlices } from "../../content";

const GRADE_ORDER: GradeId[] = ["g7", "g8", "g9", "g10", "g11", "g12"];
const VOLUME_ORDER: VolumeId[] = [
  "shang",
  "xia",
  "required-1",
  "required-2",
  "required-3",
  "elective-1",
  "elective-2",
  "elective-3",
  "choice-required-1",
  "choice-required-2",
  "choice-required-3",
];

export interface CurriculumContentSnapshot {
  curriculumSlices: CurriculumSlice[];
  grades: GradeDefinition[];
  volumes: VolumeDefinition[];
  chapters: CurriculumChapter[];
  lessons: KnowledgePointLesson[];
  workedExamples: WorkedExample[];
  quizzes: UnitQuiz[];
}

export interface CurriculumContentSource {
  getSnapshot(): CurriculumContentSnapshot;
}

export type CurriculumContentSourceKind = "local-static" | "json-file" | "database";

export interface ResolvedCurriculumContentSourceConfig {
  sourceKind: CurriculumContentSourceKind;
  projectRoot: string;
  jsonPath: string;
  contentStorePath: string;
  contentDatabasePath: string;
  databaseBackendKind: "json-store" | "sqlite";
}

export function buildCurriculumContentSnapshot(
  slices: CurriculumSlice[],
): CurriculumContentSnapshot {
  const curriculumSlices = [...slices].sort(compareCurriculumSlices);
  const grades = dedupeBy(
    curriculumSlices.map((slice) => slice.grade),
    (grade) => grade.id,
  ).sort((left, right) => compareGradeIds(left.id, right.id));
  const volumes = dedupeBy(
    curriculumSlices.map((slice) => slice.volume),
    (volume) => `${volume.gradeId}:${volume.id}`,
  ).sort(compareVolumes);
  const chapters = curriculumSlices.map((slice) => slice.chapter);
  const lessons = curriculumSlices.flatMap((slice) => slice.lessons);
  const workedExamples = curriculumSlices.flatMap((slice) => slice.workedExamples);
  const quizzes = curriculumSlices.map((slice) => slice.quiz);

  return {
    curriculumSlices,
    grades,
    volumes,
    chapters,
    lessons,
    workedExamples,
    quizzes,
  };
}

export function serializeCurriculumContentSnapshot(snapshot: CurriculumContentSnapshot) {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

export function createStaticCurriculumContentSource(
  slices: CurriculumSlice[],
): CurriculumContentSource {
  const snapshot = buildCurriculumContentSnapshot(slices);

  return {
    getSnapshot() {
      return snapshot;
    },
  };
}

export function createJsonCurriculumContentSource(filePath: string): CurriculumContentSource {
  return {
    getSnapshot() {
      const raw = readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<CurriculumContentSnapshot>;

      return buildCurriculumContentSnapshot(parsed.curriculumSlices ?? []);
    },
  };
}

export function createDatabaseCurriculumContentSource(
  storeFilePath: string,
): CurriculumContentSource {
  return {
    getSnapshot() {
      const store = readLearningContentStore({
        storeFilePath,
      });

      return buildCurriculumContentSnapshot(buildCurriculumSlicesFromStore(store));
    },
  };
}

export function createSqliteCurriculumContentSource(
  databasePath: string,
): CurriculumContentSource {
  return {
    getSnapshot() {
      const store = createSqliteLearningContentRepository({
        databasePath,
        storeFilePath: databasePath,
      }).getStore();

      return buildCurriculumContentSnapshot(buildCurriculumSlicesFromStore(store));
    },
  };
}

export function resolveCurriculumContentSourceConfig(
  env: NodeJS.ProcessEnv = process.env,
): ResolvedCurriculumContentSourceConfig {
  const projectRoot = process.cwd();

  return {
    projectRoot,
    sourceKind: normalizeCurriculumContentSourceKind(env.CURRICULUM_SOURCE_KIND),
    databaseBackendKind: normalizeDatabaseBackendKind(env.CONTENT_DATABASE_BACKEND),
    jsonPath: resolveOptionalAbsolutePath(env.CURRICULUM_JSON_PATH, projectRoot)
      ?? path.join(projectRoot, "data", "curriculum.snapshot.json"),
    contentStorePath: resolveOptionalAbsolutePath(env.CONTENT_STORE_PATH, projectRoot)
      ?? path.join(projectRoot, "data", "content-store.json"),
    contentDatabasePath: resolveOptionalAbsolutePath(env.CONTENT_DATABASE_PATH, projectRoot)
      ?? path.join(projectRoot, "data", "content-store.sqlite"),
  };
}

export function resolveCurriculumContentSource(
  env: NodeJS.ProcessEnv = process.env,
): CurriculumContentSource {
  const config = resolveCurriculumContentSourceConfig(env);

  if (config.sourceKind === "json-file") {
    if (!existsSync(config.jsonPath)) {
      throw new Error(
        `未找到课程 JSON 快照: ${config.jsonPath}。请先执行 export:curriculum-json 或调整 CURRICULUM_JSON_PATH。`,
      );
    }

    return createJsonCurriculumContentSource(config.jsonPath);
  }

  if (config.sourceKind === "database") {
    if (config.databaseBackendKind === "sqlite") {
      if (!existsSync(config.contentDatabasePath)) {
        throw new Error(
          `未找到 SQLite 内容数据库: ${config.contentDatabasePath}。请先执行 import:curriculum-sqlite 或通过后台导入 SQLite。`,
        );
      }

      return createSqliteCurriculumContentSource(config.contentDatabasePath);
    }

    if (!existsSync(config.contentStorePath)) {
      throw new Error(
        `未找到内容仓储文件: ${config.contentStorePath}。请先执行 import:curriculum-store 或调用后台导入 API。`,
      );
    }

    return createDatabaseCurriculumContentSource(config.contentStorePath);
  }

  return createStaticCurriculumContentSource(localCurriculumSlices);
}

let activeCurriculumContentSource: CurriculumContentSource = resolveCurriculumContentSource();

export function getCurriculumContentSource() {
  return activeCurriculumContentSource;
}

export function setCurriculumContentSource(source: CurriculumContentSource) {
  activeCurriculumContentSource = source;
}

function compareCurriculumSlices(left: CurriculumSlice, right: CurriculumSlice) {
  return (
    compareGradeIds(left.grade.id, right.grade.id)
    || compareVolumeIds(left.volume.id, right.volume.id)
    || left.chapter.order - right.chapter.order
    || left.chapter.title.localeCompare(right.chapter.title, "zh-CN")
  );
}

function compareGradeIds(left: GradeId, right: GradeId) {
  return rankOf(GRADE_ORDER, left) - rankOf(GRADE_ORDER, right);
}

function compareVolumeIds(left: VolumeId, right: VolumeId) {
  return rankOf(VOLUME_ORDER, left) - rankOf(VOLUME_ORDER, right);
}

function compareVolumes(left: VolumeDefinition, right: VolumeDefinition) {
  return (
    compareGradeIds(left.gradeId, right.gradeId)
    || compareVolumeIds(left.id, right.id)
    || left.label.localeCompare(right.label, "zh-CN")
  );
}

function rankOf<T extends string>(orderedValues: readonly T[], value: T) {
  const index = orderedValues.indexOf(value);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function dedupeBy<T>(items: T[], getKey: (item: T) => string) {
  return Array.from(new Map(items.map((item) => [getKey(item), item])).values());
}

function normalizeCurriculumContentSourceKind(
  value: string | undefined,
): CurriculumContentSourceKind {
  if (value === "json-file" || value === "database") {
    return value;
  }

  return "local-static";
}

function normalizeDatabaseBackendKind(value: string | undefined) {
  return value === "sqlite" ? "sqlite" : "json-store";
}

function resolveOptionalAbsolutePath(value: string | undefined, baseDir: string) {
  if (!value) {
    return undefined;
  }

  return path.isAbsolute(value) ? value : path.join(baseDir, value);
}
