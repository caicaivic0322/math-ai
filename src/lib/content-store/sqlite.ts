import { existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import type {
  CurriculumChapter,
  KnowledgePointLesson,
  QuizQuestion,
  QuizQuestionType,
  UnitQuiz,
  WorkedExample,
  WorkedExampleStep,
} from "../../types/content";
import {
  buildLearningContentStore,
  createEmptyLearningContentStore,
  type LearningContentRepository,
  type LearningContentRepositoryConfig,
  type LearningContentStore,
  type LearningContentStoreManifest,
  type LearningContentStoreSummary,
  type ReplaceLearningContentInput,
} from "./repository";
import type {
  StoredChapterRecord,
  StoredLessonRecord,
  StoredQuizQuestionRecord,
  StoredQuizRecord,
  StoredWorkedExampleRecord,
} from "../storage";

const SQLITE_SCHEMA_VERSION = "phase7-sqlite-v1";
const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (path: string) => SqliteDatabase;
};

type StoredManifestRow = {
  manifest_json: string;
};

type StoredRecordRow = {
  record_json: string;
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

export interface LearningContentSqliteConfig extends LearningContentRepositoryConfig {
  databasePath: string;
}

export interface SqliteAdminLessonSummary {
  id: string;
  gradeId: string;
  volumeId: string;
  chapterId: string;
  chapterTitle: string;
  title: string;
  summary: string;
  updatedAt: string;
}

export interface SqliteAdminLessonDetail extends SqliteAdminLessonSummary {
  lesson: KnowledgePointLesson;
}

export interface SqliteAdminChapterSummary {
  id: string;
  gradeId: string;
  volumeId: string;
  title: string;
  summary: string;
  lessonCount: number;
  workedExampleCount: number;
  updatedAt: string;
}

export interface SqliteAdminChapterDetail extends SqliteAdminChapterSummary {
  chapter: CurriculumChapter;
}

export interface SqliteAdminWorkedExampleSummary {
  id: string;
  gradeId: string;
  volumeId: string;
  chapterId: string;
  chapterTitle: string;
  title: string;
  summary: string;
  updatedAt: string;
}

export interface SqliteAdminWorkedExampleDetail extends SqliteAdminWorkedExampleSummary {
  workedExample: WorkedExample;
}

export interface SqliteAdminQuizSummary {
  id: string;
  gradeId: string;
  volumeId: string;
  chapterId: string;
  chapterTitle: string;
  title: string;
  passingScore: number;
  questionCount: number;
  updatedAt: string;
}

export interface SqliteAdminQuizDetail extends SqliteAdminQuizSummary {
  quiz: UnitQuiz;
}

export interface SqliteAdminQuizQuestionSummary {
  id: string;
  quizId: string;
  gradeId: string;
  volumeId: string;
  chapterId: string;
  chapterTitle: string;
  type: QuizQuestionType;
  stem: string;
  difficulty: QuizQuestion["difficulty"];
  updatedAt: string;
}

export interface SqliteAdminQuizQuestionDetail extends SqliteAdminQuizQuestionSummary {
  question: QuizQuestion;
}

export type SqliteContentEntityKind =
  | "chapter"
  | "lesson"
  | "worked-example"
  | "quiz"
  | "quiz-question";

export type SqliteContentRecordStatus = "draft" | "published";

export type SqliteContentHistoryAction = "import" | "update" | "status-change" | "rollback";

export type SqliteContentWorkflowActor = string;
export type SqliteContentWorkflowRole = "admin" | "editor" | "reviewer" | "publisher";

export interface SqliteContentWorkflowAuditFields {
  actor?: SqliteContentWorkflowActor;
  role?: SqliteContentWorkflowRole;
  reason?: string;
}

export interface SqliteContentWorkflowMetadata {
  entityKind: SqliteContentEntityKind;
  entityId: string;
  gradeId?: string;
  volumeId?: string;
  status: SqliteContentRecordStatus;
  currentVersion: number;
  createdAt: string;
  createdBy: SqliteContentWorkflowActor;
  createdByRole: SqliteContentWorkflowRole;
  updatedAt: string;
  updatedBy: SqliteContentWorkflowActor;
  updatedByRole: SqliteContentWorkflowRole;
  lastActionBy: SqliteContentWorkflowActor;
  lastActionByRole: SqliteContentWorkflowRole;
  lastPublishedAt?: string;
  importBatchId?: string;
}

export interface SqliteContentHistoryEntry {
  entityKind: SqliteContentEntityKind;
  entityId: string;
  gradeId?: string;
  volumeId?: string;
  version: number;
  action: SqliteContentHistoryAction;
  status: SqliteContentRecordStatus;
  changedAt: string;
  summary: string;
  actor: SqliteContentWorkflowActor;
  role: SqliteContentWorkflowRole;
  reason?: string;
  importBatchId?: string;
}

export interface SqliteContentWorkflowDetail {
  metadata: SqliteContentWorkflowMetadata;
  history: SqliteContentHistoryEntry[];
}

export interface SqliteContentWorkflowStatusBucket {
  entityKind: SqliteContentEntityKind;
  totalCount: number;
  draftCount: number;
  publishedCount: number;
}

export interface SqliteContentWorkflowStatusSummary {
  totalCount: number;
  draftCount: number;
  publishedCount: number;
  updatedAt?: string;
  byEntityKind: SqliteContentWorkflowStatusBucket[];
}

export interface SqliteRecentWorkflowEntry extends SqliteContentHistoryEntry {
  title: string;
}

export interface ListSqliteRecentWorkflowEntriesOptions {
  limit?: number;
  offset?: number;
  entityKind?: SqliteContentEntityKind;
  status?: SqliteContentRecordStatus;
  query?: string;
}

export interface SqliteRecentWorkflowFeed {
  items: SqliteRecentWorkflowEntry[];
  totalCount: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SqliteAdminSearchResult {
  entityKind: SqliteContentEntityKind;
  entityId: string;
  gradeId?: string;
  volumeId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  updatedAt: string;
  matchSources: string[];
  workflowStatus: SqliteContentRecordStatus;
  workflowVersion: number;
  lastPublishedAt?: string;
  updatedBy?: SqliteContentWorkflowActor;
  updatedByRole?: SqliteContentWorkflowRole;
  importBatchId?: string;
  latestAction?: SqliteContentHistoryAction;
  latestActionSummary?: string;
  latestActionActor?: SqliteContentWorkflowActor;
  latestActionRole?: SqliteContentWorkflowRole;
  latestActionReason?: string;
}

export interface SqliteAdminSearchGroup {
  entityKind: SqliteContentEntityKind;
  totalCount: number;
  results: SqliteAdminSearchResult[];
}

export interface SqliteAdminSearchResponse {
  query: string;
  totalCount: number;
  groups: SqliteAdminSearchGroup[];
}

export interface UpdateSqliteLessonInput extends SqliteContentWorkflowAuditFields {
  lessonId: string;
  title: string;
  summary: string;
  learningObjectives: string[];
  keyRules: string[];
}

export interface UpdateSqliteChapterInput extends SqliteContentWorkflowAuditFields {
  gradeId: string;
  volumeId: string;
  chapterId: string;
  title: string;
  summary: string;
}

export interface UpdateSqliteWorkedExampleInput extends SqliteContentWorkflowAuditFields {
  gradeId: string;
  volumeId: string;
  exampleId: string;
  title: string;
  summary: string;
  problem: string;
  answer: string;
  commonMistakes: string[];
  steps: WorkedExampleStep[];
}

export interface UpdateSqliteQuizInput extends SqliteContentWorkflowAuditFields {
  gradeId: string;
  volumeId: string;
  quizId: string;
  title: string;
  instructions: string;
  passingScore: number;
}

export interface UpdateSqliteQuizQuestionInput extends SqliteContentWorkflowAuditFields {
  gradeId: string;
  volumeId: string;
  questionId: string;
  stem: string;
  explanation: string;
  relatedLessonIds: string[];
  relatedExampleIds: string[];
  payloadJson: string;
}

export interface UpdateSqliteContentStatusInput extends SqliteContentWorkflowAuditFields {
  entityKind: SqliteContentEntityKind;
  entityId: string;
  gradeId?: string;
  volumeId?: string;
  status: SqliteContentRecordStatus;
}

export interface RollbackSqliteContentRecordInput extends SqliteContentWorkflowAuditFields {
  entityKind: SqliteContentEntityKind;
  entityId: string;
  gradeId?: string;
  volumeId?: string;
  version: number;
}

export function createSqliteLearningContentRepository(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): LearningContentRepository {
  return {
    getStore() {
      return readLearningContentDatabase(config);
    },
    replace(input) {
      return saveLearningContentDatabase(input, config);
    },
    getSummary() {
      return getLearningContentDatabaseSummary(config);
    },
  };
}

export function resolveLearningContentSqliteConfig(
  env: NodeJS.ProcessEnv = process.env,
): LearningContentSqliteConfig {
  const projectRoot = process.cwd();
  const databasePath = resolveAbsolutePath(env.CONTENT_DATABASE_PATH, projectRoot)
    ?? path.join(projectRoot, "data", "content-store.sqlite");

  return {
    databasePath,
    storeFilePath: databasePath,
    assetStorageKind: env.CONTENT_STORE_ASSET_STORAGE_KIND === "object-storage"
      ? "object-storage"
      : "filesystem",
  };
}

export function readLearningContentDatabase(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): LearningContentStore {
  if (!existsSync(config.databasePath)) {
    return createEmptyLearningContentStore({
      storeFilePath: config.databasePath,
      assetStorageKind: config.assetStorageKind,
    });
  }

  const database = openDatabase(config);

  try {
    ensureSqliteSchema(database);

    const manifestRow = database
      .prepare("SELECT manifest_json FROM content_manifest WHERE id = 1")
      .get() as StoredManifestRow | undefined;
    const manifest = manifestRow
      ? (JSON.parse(manifestRow.manifest_json) as Partial<LearningContentStoreManifest>)
      : undefined;

    return {
      manifest: {
        ...createEmptyLearningContentStore({
          storeFilePath: config.databasePath,
          assetStorageKind: config.assetStorageKind,
        }).manifest,
        ...manifest,
      },
      grades: readRecordTable(database, "content_grades"),
      volumes: readRecordTable(database, "content_volumes"),
      chapters: readRecordTable(database, "content_chapters"),
      lessons: readRecordTable(database, "content_lessons"),
      workedExamples: readRecordTable(database, "content_worked_examples"),
      quizzes: readRecordTable(database, "content_quizzes"),
      quizQuestions: readRecordTable(database, "content_quiz_questions"),
    };
  } finally {
    database.close();
  }
}

export function saveLearningContentDatabase(
  input: ReplaceLearningContentInput,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): LearningContentStore {
  const store = buildLearningContentStore(input, {
    storeFilePath: config.databasePath,
    assetStorageKind: config.assetStorageKind,
  });
  const database = openDatabase(config, { ensureDirectory: true });

  try {
    resetSqliteSchema(database);
    database.exec("BEGIN");

    try {
      database
        .prepare("INSERT INTO content_manifest (id, manifest_json) VALUES (1, ?)")
        .run(JSON.stringify(store.manifest));

      writeRecordTable(database, "content_grades", store.grades);
      writeRecordTable(database, "content_volumes", store.volumes);
      writeRecordTable(database, "content_chapters", store.chapters);
      writeRecordTable(database, "content_lessons", store.lessons);
      writeRecordTable(database, "content_worked_examples", store.workedExamples);
      writeRecordTable(database, "content_quizzes", store.quizzes);
      writeRecordTable(database, "content_quiz_questions", store.quizQuestions);
      initializeWorkflowEntriesFromStore(
        database,
        store,
        store.manifest.importedAt ?? new Date().toISOString(),
        createImportBatchId(store.manifest.importedAt, store.manifest.sourceSnapshotPath),
      );

      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }

    return store;
  } finally {
    database.close();
  }
}

export function getLearningContentDatabaseSummary(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): LearningContentStoreSummary {
  if (!existsSync(config.databasePath)) {
    return {
      exists: false,
      backendKind: "sqlite",
      locationPath: config.databasePath,
      storeFilePath: config.databasePath,
      sourceKind: "database",
      schemaVersion: "phase6-v1",
      gradeCount: 0,
      volumeCount: 0,
      chapterCount: 0,
      lessonCount: 0,
      workedExampleCount: 0,
      quizCount: 0,
      questionCount: 0,
    };
  }

  const database = openDatabase(config);

  try {
    ensureSqliteSchema(database);

    const manifestRow = database
      .prepare("SELECT manifest_json FROM content_manifest WHERE id = 1")
      .get() as StoredManifestRow | undefined;
    const manifest = manifestRow
      ? (JSON.parse(manifestRow.manifest_json) as LearningContentStore["manifest"])
      : createEmptyLearningContentStore({
        storeFilePath: config.databasePath,
        assetStorageKind: config.assetStorageKind,
      }).manifest;

    return {
      exists: true,
      backendKind: "sqlite",
      locationPath: config.databasePath,
      storeFilePath: config.databasePath,
      sourceKind: manifest.contentSourceKind,
      schemaVersion: manifest.schemaVersion,
      importedAt: manifest.importedAt,
      sourceSnapshotPath: manifest.sourceSnapshotPath,
      gradeCount: countRows(database, "content_grades"),
      volumeCount: countRows(database, "content_volumes"),
      chapterCount: countRows(database, "content_chapters"),
      lessonCount: countRows(database, "content_lessons"),
      workedExampleCount: countRows(database, "content_worked_examples"),
      quizCount: countRows(database, "content_quizzes"),
      questionCount: countRows(database, "content_quiz_questions"),
    };
  } finally {
    database.close();
  }
}

export function listSqliteLessonSummaries(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
  options: { limit?: number; query?: string } = {},
): SqliteAdminLessonSummary[] {
  const store = readLearningContentDatabase(config);
  const limit = options.limit ?? store.lessons.length;
  const query = normalizeSearchQuery(options.query);

  return store.lessons
    .map((record) => createLessonSummary(record, store.chapters))
    .filter((record) => matchesSearchQuery(query, [
      record.title,
      record.summary,
      record.chapterTitle,
    ]))
    .sort((left, right) => {
      return (
        left.gradeId.localeCompare(right.gradeId)
        || left.volumeId.localeCompare(right.volumeId)
        || left.chapterTitle.localeCompare(right.chapterTitle, "zh-CN")
        || left.title.localeCompare(right.title, "zh-CN")
      );
    })
    .slice(0, limit);
}

export function listSqliteChapterSummaries(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
  options: { limit?: number; query?: string } = {},
): SqliteAdminChapterSummary[] {
  const store = readLearningContentDatabase(config);
  const limit = options.limit ?? store.chapters.length;
  const query = normalizeSearchQuery(options.query);

  return store.chapters
    .map((record) => createChapterSummary(record))
    .filter((record) => matchesSearchQuery(query, [record.title, record.summary]))
    .sort((left, right) => {
      return (
        left.gradeId.localeCompare(right.gradeId)
        || left.volumeId.localeCompare(right.volumeId)
        || left.title.localeCompare(right.title, "zh-CN")
      );
    })
    .slice(0, limit);
}

export function listSqliteWorkedExampleSummaries(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
  options: { limit?: number; query?: string } = {},
): SqliteAdminWorkedExampleSummary[] {
  const store = readLearningContentDatabase(config);
  const limit = options.limit ?? store.workedExamples.length;
  const query = normalizeSearchQuery(options.query);

  return store.workedExamples
    .map((record) => createWorkedExampleSummary(record, store.chapters))
    .filter((record) => matchesSearchQuery(query, [
      record.title,
      record.summary,
      record.chapterTitle,
    ]))
    .sort((left, right) => {
      return (
        left.gradeId.localeCompare(right.gradeId)
        || left.volumeId.localeCompare(right.volumeId)
        || left.chapterTitle.localeCompare(right.chapterTitle, "zh-CN")
        || left.title.localeCompare(right.title, "zh-CN")
      );
    })
    .slice(0, limit);
}

export function listSqliteQuizSummaries(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
  options: { limit?: number; query?: string } = {},
): SqliteAdminQuizSummary[] {
  const store = readLearningContentDatabase(config);
  const limit = options.limit ?? store.quizzes.length;
  const query = normalizeSearchQuery(options.query);

  return store.quizzes
    .map((record) => createQuizSummary(record, store.chapters, store.quizQuestions))
    .filter((record) => matchesSearchQuery(query, [record.title, record.chapterTitle]))
    .sort((left, right) => {
      return (
        left.gradeId.localeCompare(right.gradeId)
        || left.volumeId.localeCompare(right.volumeId)
        || left.chapterTitle.localeCompare(right.chapterTitle, "zh-CN")
        || left.title.localeCompare(right.title, "zh-CN")
      );
    })
    .slice(0, limit);
}

export function listSqliteQuizQuestionSummaries(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
  options: { limit?: number; query?: string } = {},
): SqliteAdminQuizQuestionSummary[] {
  const store = readLearningContentDatabase(config);
  const limit = options.limit ?? store.quizQuestions.length;
  const query = normalizeSearchQuery(options.query);

  return store.quizQuestions
    .map((record) => createQuizQuestionSummary(record, store.chapters))
    .filter((record) => matchesSearchQuery(query, [
      record.stem,
      record.chapterTitle,
      record.type,
    ]))
    .sort((left, right) => {
      return (
        left.gradeId.localeCompare(right.gradeId)
        || left.volumeId.localeCompare(right.volumeId)
        || left.chapterTitle.localeCompare(right.chapterTitle, "zh-CN")
        || left.stem.localeCompare(right.stem, "zh-CN")
      );
    })
    .slice(0, limit);
}

export function searchSqliteAdminContent(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
  options: {
    query: string;
    perEntityLimit?: number;
  },
): SqliteAdminSearchResponse {
  const query = normalizeSearchQuery(options.query);
  if (!query) {
    return {
      query: "",
      totalCount: 0,
      groups: [],
    };
  }

  const store = readLearningContentDatabase(config);
  const perEntityLimit = Math.max(1, options.perEntityLimit ?? 4);
  const database = openDatabase(config);

  try {
    ensureSqliteSchema(database);

    const chapterResults = store.chapters
      .map((record) => {
        const summary = createChapterSummary(record);
        const matchSources = collectSearchMatches(query, [
          ["标题", summary.title],
          ["摘要", summary.summary],
        ]);
        if (matchSources.length === 0) {
          return undefined;
        }

        return createSearchResultWithWorkflow(database, {
          entityKind: "chapter",
          entityId: summary.id,
          gradeId: summary.gradeId,
          volumeId: summary.volumeId,
          title: summary.title,
          description: summary.summary,
          updatedAt: summary.updatedAt,
          matchSources,
        });
      })
      .filter(Boolean) as SqliteAdminSearchResult[];

    const lessonResults = store.lessons
      .map((record) => {
        const summary = createLessonSummary(record, store.chapters);
        const matchSources = collectSearchMatches(query, [
          ["标题", summary.title],
          ["摘要", summary.summary],
          ["章节", summary.chapterTitle],
        ]);
        if (matchSources.length === 0) {
          return undefined;
        }

        return createSearchResultWithWorkflow(database, {
          entityKind: "lesson",
          entityId: summary.id,
          gradeId: summary.gradeId,
          volumeId: summary.volumeId,
          title: summary.title,
          subtitle: summary.chapterTitle,
          description: summary.summary,
          updatedAt: summary.updatedAt,
          matchSources,
        });
      })
      .filter(Boolean) as SqliteAdminSearchResult[];

    const workedExampleResults = store.workedExamples
      .map((record) => {
        const summary = createWorkedExampleSummary(record, store.chapters);
        const matchSources = collectSearchMatches(query, [
          ["标题", summary.title],
          ["摘要", summary.summary],
          ["章节", summary.chapterTitle],
        ]);
        if (matchSources.length === 0) {
          return undefined;
        }

        return createSearchResultWithWorkflow(database, {
          entityKind: "worked-example",
          entityId: summary.id,
          gradeId: summary.gradeId,
          volumeId: summary.volumeId,
          title: summary.title,
          subtitle: summary.chapterTitle,
          description: summary.summary,
          updatedAt: summary.updatedAt,
          matchSources,
        });
      })
      .filter(Boolean) as SqliteAdminSearchResult[];

    const quizResults = store.quizzes
      .map((record) => {
        const summary = createQuizSummary(record, store.chapters, store.quizQuestions);
        const matchSources = collectSearchMatches(query, [
          ["标题", summary.title],
          ["章节", summary.chapterTitle],
        ]);
        if (matchSources.length === 0) {
          return undefined;
        }

        return createSearchResultWithWorkflow(database, {
          entityKind: "quiz",
          entityId: summary.id,
          gradeId: summary.gradeId,
          volumeId: summary.volumeId,
          title: summary.title,
          subtitle: summary.chapterTitle,
          description: `共 ${summary.questionCount} 题，及格线 ${summary.passingScore}`,
          updatedAt: summary.updatedAt,
          matchSources,
        });
      })
      .filter(Boolean) as SqliteAdminSearchResult[];

    const questionResults = store.quizQuestions
      .map((record) => {
        const summary = createQuizQuestionSummary(record, store.chapters);
        const matchSources = collectSearchMatches(query, [
          ["题干", summary.stem],
          ["章节", summary.chapterTitle],
          ["题型", summary.type],
        ]);
        if (matchSources.length === 0) {
          return undefined;
        }

        return createSearchResultWithWorkflow(database, {
          entityKind: "quiz-question",
          entityId: summary.id,
          gradeId: summary.gradeId,
          volumeId: summary.volumeId,
          title: summary.stem,
          subtitle: `${summary.chapterTitle} · ${summary.type}`,
          description: `难度 ${summary.difficulty}`,
          updatedAt: summary.updatedAt,
          matchSources,
        });
      })
      .filter(Boolean) as SqliteAdminSearchResult[];

    const groups = [
      createSearchGroup("chapter", chapterResults, perEntityLimit),
      createSearchGroup("lesson", lessonResults, perEntityLimit),
      createSearchGroup("worked-example", workedExampleResults, perEntityLimit),
      createSearchGroup("quiz", quizResults, perEntityLimit),
      createSearchGroup("quiz-question", questionResults, perEntityLimit),
    ].filter((group) => group.totalCount > 0);

    return {
      query,
      totalCount: groups.reduce((sum, group) => sum + group.totalCount, 0),
      groups,
    };
  } finally {
    database.close();
  }
}

export function getSqliteChapterDetail(
  gradeId: string,
  volumeId: string,
  chapterId: string,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminChapterDetail | undefined {
  const store = readLearningContentDatabase(config);
  const chapterRecord = store.chapters.find((record) => (
    record.id === chapterId
    && record.gradeId === gradeId
    && record.volumeId === volumeId
  ));

  if (!chapterRecord) {
    return undefined;
  }

  return {
    ...createChapterSummary(chapterRecord),
    chapter: chapterRecord.chapter,
  };
}

export function getSqliteLessonDetail(
  lessonId: string,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminLessonDetail | undefined {
  const store = readLearningContentDatabase(config);
  const lessonRecord = store.lessons.find((record) => record.id === lessonId);

  if (!lessonRecord) {
    return undefined;
  }

  return {
    ...createLessonSummary(lessonRecord, store.chapters),
    lesson: lessonRecord.lesson,
  };
}

export function getSqliteWorkedExampleDetail(
  gradeId: string,
  volumeId: string,
  exampleId: string,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminWorkedExampleDetail | undefined {
  const store = readLearningContentDatabase(config);
  const exampleRecord = store.workedExamples.find((record) => (
    record.id === exampleId
    && record.gradeId === gradeId
    && record.volumeId === volumeId
  ));

  if (!exampleRecord) {
    return undefined;
  }

  return {
    ...createWorkedExampleSummary(exampleRecord, store.chapters),
    workedExample: exampleRecord.workedExample,
  };
}

export function getSqliteQuizDetail(
  gradeId: string,
  volumeId: string,
  quizId: string,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminQuizDetail | undefined {
  const store = readLearningContentDatabase(config);
  const quizRecord = store.quizzes.find((record) => (
    record.id === quizId
    && record.gradeId === gradeId
    && record.volumeId === volumeId
  ));

  if (!quizRecord) {
    return undefined;
  }

  return {
    ...createQuizSummary(quizRecord, store.chapters, store.quizQuestions),
    quiz: {
      ...quizRecord.quiz,
      questions: store.quizQuestions
        .filter((record) => (
          record.quizId === quizRecord.id
          && record.gradeId === gradeId
          && record.volumeId === volumeId
        ))
        .map((record) => record.question),
    },
  };
}

export function getSqliteQuizQuestionDetail(
  gradeId: string,
  volumeId: string,
  questionId: string,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminQuizQuestionDetail | undefined {
  const store = readLearningContentDatabase(config);
  const questionRecord = store.quizQuestions.find((record) => (
    record.id === questionId
    && record.gradeId === gradeId
    && record.volumeId === volumeId
  ));

  if (!questionRecord) {
    return undefined;
  }

  return {
    ...createQuizQuestionSummary(questionRecord, store.chapters),
    question: questionRecord.question,
  };
}

export function getSqliteContentWorkflowDetail(
  input: {
    entityKind: SqliteContentEntityKind;
    entityId: string;
    gradeId?: string;
    volumeId?: string;
    historyLimit?: number;
  },
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteContentWorkflowDetail | undefined {
  const database = openDatabase(config);

  try {
    ensureSqliteSchema(database);
    const rowKey = createScopedEntityKey(
      input.entityKind,
      input.entityId,
      input.gradeId,
      input.volumeId,
    );
    const metadata = readWorkflowMetadata(database, rowKey);

    if (!metadata) {
      return undefined;
    }

    return {
      metadata,
      history: readWorkflowHistory(database, rowKey, input.historyLimit ?? 8),
    };
  } finally {
    database.close();
  }
}

export function getSqliteContentWorkflowStatusSummary(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteContentWorkflowStatusSummary {
  if (!existsSync(config.databasePath)) {
    return {
      totalCount: 0,
      draftCount: 0,
      publishedCount: 0,
      byEntityKind: [],
    };
  }

  const database = openDatabase(config);

  try {
    ensureSqliteSchema(database);
    const rows = database
      .prepare("SELECT metadata_json FROM content_record_metadata")
      .all() as Array<{ metadata_json: string }>;
    const metadataEntries = rows.map((row) => JSON.parse(row.metadata_json) as SqliteContentWorkflowMetadata);
    const byEntityKind = ([
      "chapter",
      "lesson",
      "worked-example",
      "quiz",
      "quiz-question",
    ] as const).map((entityKind) => {
      const scopedEntries = metadataEntries.filter((entry) => entry.entityKind === entityKind);
      return {
        entityKind,
        totalCount: scopedEntries.length,
        draftCount: scopedEntries.filter((entry) => entry.status === "draft").length,
        publishedCount: scopedEntries.filter((entry) => entry.status === "published").length,
      } satisfies SqliteContentWorkflowStatusBucket;
    });

    return {
      totalCount: metadataEntries.length,
      draftCount: metadataEntries.filter((entry) => entry.status === "draft").length,
      publishedCount: metadataEntries.filter((entry) => entry.status === "published").length,
      updatedAt: metadataEntries
        .map((entry) => entry.updatedAt)
        .sort((left, right) => right.localeCompare(left))[0],
      byEntityKind,
    };
  } finally {
    database.close();
  }
}

export function getSqliteRecentWorkflowFeed(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
  options: ListSqliteRecentWorkflowEntriesOptions = {},
): SqliteRecentWorkflowFeed {
  const limit = Math.max(1, options.limit ?? 12);
  const offset = Math.max(0, options.offset ?? 0);
  const query = normalizeSearchQuery(options.query);
  if (!existsSync(config.databasePath)) {
    return {
      items: [],
      totalCount: 0,
      limit,
      offset,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  const database = openDatabase(config);

  try {
    ensureSqliteSchema(database);
    const rows = database
      .prepare(`
        SELECT history_json, record_json
        FROM content_record_history
      `)
      .all() as Array<{ history_json: string; record_json: string }>;
    const filteredItems = rows
      .map((row) => {
        const historyEntry = JSON.parse(row.history_json) as SqliteContentHistoryEntry;
        return {
          ...historyEntry,
          title: extractWorkflowRecordTitle(historyEntry.entityKind, row.record_json, historyEntry.entityId),
        } satisfies SqliteRecentWorkflowEntry;
      })
      .filter((entry) => {
        if (options.entityKind && entry.entityKind !== options.entityKind) {
          return false;
        }

        if (options.status && entry.status !== options.status) {
          return false;
        }

        if (!matchesSearchQuery(query, [entry.title, entry.summary])) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        return right.changedAt.localeCompare(left.changedAt) || right.version - left.version;
      });

    return {
      items: filteredItems.slice(offset, offset + limit),
      totalCount: filteredItems.length,
      limit,
      offset,
      hasNextPage: offset + limit < filteredItems.length,
      hasPreviousPage: offset > 0,
    };
  } finally {
    database.close();
  }
}

export function listSqliteRecentWorkflowEntries(
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
  options: ListSqliteRecentWorkflowEntriesOptions = {},
): SqliteRecentWorkflowEntry[] {
  return getSqliteRecentWorkflowFeed(config, options).items;
}

export function updateSqliteChapter(
  input: UpdateSqliteChapterInput,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminChapterDetail {
  const database = openDatabase(config, { ensureDirectory: true });

  try {
    ensureSqliteSchema(database);

    const row = findScopedRecordRow(
      database,
      "content_chapters",
      input.chapterId,
      input.gradeId,
      input.volumeId,
    );

    if (!row) {
      throw new Error(`未找到 chapter 记录: ${input.gradeId}/${input.volumeId}/${input.chapterId}`);
    }

    const chapterRecord = JSON.parse(row.record_json) as StoredChapterRecord;
    const updatedAt = new Date().toISOString();
    const nextChapterRecord: StoredChapterRecord = {
      ...chapterRecord,
      updatedAt,
      chapter: {
        ...chapterRecord.chapter,
        title: input.title.trim(),
        summary: input.summary.trim(),
      },
    };

    database
      .prepare("UPDATE content_chapters SET record_json = ? WHERE row_key = ?")
      .run(JSON.stringify(nextChapterRecord), row.row_key);

    writeWorkflowEntry(database, {
      entityKind: "chapter",
      entityId: input.chapterId,
      gradeId: input.gradeId,
      volumeId: input.volumeId,
      recordJson: JSON.stringify(nextChapterRecord),
      action: "update",
      status: getCurrentWorkflowStatus(
        database,
        "chapter",
        input.chapterId,
        input.gradeId,
        input.volumeId,
      ),
      changedAt: updatedAt,
      summary: "更新章节内容",
      actor: input.actor,
      role: input.role,
      reason: input.reason,
    });

    const detail = getSqliteChapterDetail(
      input.gradeId,
      input.volumeId,
      input.chapterId,
      config,
    );
    if (!detail) {
      throw new Error(`更新后仍未找到 chapter 记录: ${input.chapterId}`);
    }

    return detail;
  } finally {
    database.close();
  }
}

export function updateSqliteLesson(
  input: UpdateSqliteLessonInput,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminLessonDetail {
  const database = openDatabase(config, { ensureDirectory: true });

  try {
    ensureSqliteSchema(database);

    const row = database
      .prepare("SELECT row_key, record_json FROM content_lessons WHERE entity_id = ? LIMIT 1")
      .get(input.lessonId) as ({ row_key: string; record_json: string }) | undefined;

    if (!row) {
      throw new Error(`未找到 lesson 记录: ${input.lessonId}`);
    }

    const lessonRecord = JSON.parse(row.record_json) as StoredLessonRecord;
    const updatedAt = new Date().toISOString();
    const nextLessonRecord: StoredLessonRecord = {
      ...lessonRecord,
      updatedAt,
      lesson: {
        ...lessonRecord.lesson,
        title: input.title.trim(),
        summary: input.summary.trim(),
        learningObjectives: sanitizeTextItems(input.learningObjectives),
        keyRules: sanitizeTextItems(input.keyRules),
      },
    };

    database
      .prepare("UPDATE content_lessons SET record_json = ? WHERE row_key = ?")
      .run(JSON.stringify(nextLessonRecord), row.row_key);

    writeWorkflowEntry(database, {
      entityKind: "lesson",
      entityId: input.lessonId,
      gradeId: nextLessonRecord.gradeId,
      volumeId: nextLessonRecord.volumeId,
      recordJson: JSON.stringify(nextLessonRecord),
      action: "update",
      status: getCurrentWorkflowStatus(
        database,
        "lesson",
        input.lessonId,
        nextLessonRecord.gradeId,
        nextLessonRecord.volumeId,
      ),
      changedAt: updatedAt,
      summary: "更新课时内容",
      actor: input.actor,
      role: input.role,
      reason: input.reason,
    });

    const chapterRow = database
      .prepare(
        "SELECT row_key, record_json FROM content_chapters WHERE entity_id = ?",
      )
      .all(nextLessonRecord.chapterId) as Array<{ row_key: string; record_json: string }>;

    for (const candidate of chapterRow) {
      const chapterRecord = JSON.parse(candidate.record_json) as StoredChapterRecord;
      if (
        chapterRecord.gradeId === nextLessonRecord.gradeId
        && chapterRecord.volumeId === nextLessonRecord.volumeId
        && chapterRecord.id === nextLessonRecord.chapterId
      ) {
        database
          .prepare("UPDATE content_chapters SET record_json = ? WHERE row_key = ?")
          .run(
            JSON.stringify({
              ...chapterRecord,
              updatedAt,
            } satisfies StoredChapterRecord),
            candidate.row_key,
          );
      }
    }

    const detail = getSqliteLessonDetail(input.lessonId, config);
    if (!detail) {
      throw new Error(`更新后仍未找到 lesson 记录: ${input.lessonId}`);
    }

    return detail;
  } finally {
    database.close();
  }
}

export function updateSqliteWorkedExample(
  input: UpdateSqliteWorkedExampleInput,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminWorkedExampleDetail {
  const database = openDatabase(config, { ensureDirectory: true });

  try {
    ensureSqliteSchema(database);

    const row = findScopedRecordRow(
      database,
      "content_worked_examples",
      input.exampleId,
      input.gradeId,
      input.volumeId,
    );

    if (!row) {
      throw new Error(`未找到 worked example 记录: ${input.gradeId}/${input.volumeId}/${input.exampleId}`);
    }

    const workedExampleRecord = JSON.parse(row.record_json) as StoredWorkedExampleRecord;
    const updatedAt = new Date().toISOString();
    const nextWorkedExampleRecord: StoredWorkedExampleRecord = {
      ...workedExampleRecord,
      updatedAt,
      workedExample: {
        ...workedExampleRecord.workedExample,
        title: input.title.trim(),
        summary: input.summary.trim(),
        problem: input.problem.trim(),
        answer: input.answer.trim(),
        commonMistakes: sanitizeTextItems(input.commonMistakes),
        steps: sanitizeWorkedExampleSteps(input.steps),
      },
    };

    database
      .prepare("UPDATE content_worked_examples SET record_json = ? WHERE row_key = ?")
      .run(JSON.stringify(nextWorkedExampleRecord), row.row_key);

    const chapterRow = findScopedRecordRow(
      database,
      "content_chapters",
      nextWorkedExampleRecord.chapterId,
      nextWorkedExampleRecord.gradeId,
      nextWorkedExampleRecord.volumeId,
    );

    if (chapterRow) {
      const chapterRecord = JSON.parse(chapterRow.record_json) as StoredChapterRecord;
      database
        .prepare("UPDATE content_chapters SET record_json = ? WHERE row_key = ?")
        .run(
          JSON.stringify({
            ...chapterRecord,
            updatedAt,
          } satisfies StoredChapterRecord),
          chapterRow.row_key,
        );
    }

    writeWorkflowEntry(database, {
      entityKind: "worked-example",
      entityId: input.exampleId,
      gradeId: input.gradeId,
      volumeId: input.volumeId,
      recordJson: JSON.stringify(nextWorkedExampleRecord),
      action: "update",
      status: getCurrentWorkflowStatus(
        database,
        "worked-example",
        input.exampleId,
        input.gradeId,
        input.volumeId,
      ),
      changedAt: updatedAt,
      summary: "更新例题内容",
      actor: input.actor,
      role: input.role,
      reason: input.reason,
    });

    const detail = getSqliteWorkedExampleDetail(
      input.gradeId,
      input.volumeId,
      input.exampleId,
      config,
    );
    if (!detail) {
      throw new Error(`更新后仍未找到 worked example 记录: ${input.exampleId}`);
    }

    return detail;
  } finally {
    database.close();
  }
}

export function updateSqliteQuiz(
  input: UpdateSqliteQuizInput,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminQuizDetail {
  const database = openDatabase(config, { ensureDirectory: true });

  try {
    ensureSqliteSchema(database);

    const row = findScopedRecordRow(
      database,
      "content_quizzes",
      input.quizId,
      input.gradeId,
      input.volumeId,
    );

    if (!row) {
      throw new Error(`未找到 quiz 记录: ${input.gradeId}/${input.volumeId}/${input.quizId}`);
    }

    const quizRecord = JSON.parse(row.record_json) as StoredQuizRecord;
    const updatedAt = new Date().toISOString();
    const nextQuizRecord: StoredQuizRecord = {
      ...quizRecord,
      updatedAt,
      quiz: {
        ...quizRecord.quiz,
        title: input.title.trim(),
        instructions: input.instructions.trim(),
        passingScore: input.passingScore,
      },
    };

    database
      .prepare("UPDATE content_quizzes SET record_json = ? WHERE row_key = ?")
      .run(JSON.stringify(nextQuizRecord), row.row_key);

    writeWorkflowEntry(database, {
      entityKind: "quiz",
      entityId: input.quizId,
      gradeId: input.gradeId,
      volumeId: input.volumeId,
      recordJson: JSON.stringify(nextQuizRecord),
      action: "update",
      status: getCurrentWorkflowStatus(
        database,
        "quiz",
        input.quizId,
        input.gradeId,
        input.volumeId,
      ),
      changedAt: updatedAt,
      summary: "更新测验内容",
      actor: input.actor,
      role: input.role,
      reason: input.reason,
    });

    const detail = getSqliteQuizDetail(input.gradeId, input.volumeId, input.quizId, config);
    if (!detail) {
      throw new Error(`更新后仍未找到 quiz 记录: ${input.quizId}`);
    }

    return detail;
  } finally {
    database.close();
  }
}

export function updateSqliteQuizQuestion(
  input: UpdateSqliteQuizQuestionInput,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteAdminQuizQuestionDetail {
  const database = openDatabase(config, { ensureDirectory: true });

  try {
    ensureSqliteSchema(database);

    const row = findScopedRecordRow(
      database,
      "content_quiz_questions",
      input.questionId,
      input.gradeId,
      input.volumeId,
    );

    if (!row) {
      throw new Error(`未找到 quiz question 记录: ${input.gradeId}/${input.volumeId}/${input.questionId}`);
    }

    const questionRecord = JSON.parse(row.record_json) as StoredQuizQuestionRecord;
    const payload = parseQuizQuestionPayload(input.payloadJson, questionRecord.question);
    const updatedAt = new Date().toISOString();
    const nextQuestion: QuizQuestion = {
      ...payload,
      id: questionRecord.question.id,
      quizId: questionRecord.question.quizId,
      type: questionRecord.question.type,
      stem: input.stem.trim(),
      explanation: input.explanation.trim(),
      relatedLessonIds: sanitizeTextItems(input.relatedLessonIds),
      relatedExampleIds: sanitizeOptionalTextItems(input.relatedExampleIds),
    } as QuizQuestion;
    const nextQuestionRecord: StoredQuizQuestionRecord = {
      ...questionRecord,
      updatedAt,
      question: nextQuestion,
    };

    database
      .prepare("UPDATE content_quiz_questions SET record_json = ? WHERE row_key = ?")
      .run(JSON.stringify(nextQuestionRecord), row.row_key);

    const quizRow = findScopedRecordRow(
      database,
      "content_quizzes",
      nextQuestionRecord.quizId,
      nextQuestionRecord.gradeId,
      nextQuestionRecord.volumeId,
    );

    if (quizRow) {
      const quizRecord = JSON.parse(quizRow.record_json) as StoredQuizRecord;
      database
        .prepare("UPDATE content_quizzes SET record_json = ? WHERE row_key = ?")
        .run(
          JSON.stringify({
            ...quizRecord,
            updatedAt,
          } satisfies StoredQuizRecord),
          quizRow.row_key,
        );
    }

    writeWorkflowEntry(database, {
      entityKind: "quiz-question",
      entityId: input.questionId,
      gradeId: input.gradeId,
      volumeId: input.volumeId,
      recordJson: JSON.stringify(nextQuestionRecord),
      action: "update",
      status: getCurrentWorkflowStatus(
        database,
        "quiz-question",
        input.questionId,
        input.gradeId,
        input.volumeId,
      ),
      changedAt: updatedAt,
      summary: "更新题目内容",
      actor: input.actor,
      role: input.role,
      reason: input.reason,
    });

    const detail = getSqliteQuizQuestionDetail(
      input.gradeId,
      input.volumeId,
      input.questionId,
      config,
    );
    if (!detail) {
      throw new Error(`更新后仍未找到 quiz question 记录: ${input.questionId}`);
    }

    return detail;
  } finally {
    database.close();
  }
}

export function updateSqliteContentStatus(
  input: UpdateSqliteContentStatusInput,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteContentWorkflowDetail {
  const database = openDatabase(config, { ensureDirectory: true });

  try {
    ensureSqliteSchema(database);
    const targetRecord = getCurrentEntityRecord(database, input);
    const changedAt = new Date().toISOString();

    writeWorkflowEntry(database, {
      entityKind: input.entityKind,
      entityId: input.entityId,
      gradeId: input.gradeId,
      volumeId: input.volumeId,
      recordJson: targetRecord.recordJson,
      action: "status-change",
      status: input.status,
      changedAt,
      summary: input.status === "published" ? "发布内容" : "切换为草稿",
      actor: input.actor,
      role: input.role,
      reason: input.reason,
    });

    const workflow = getSqliteContentWorkflowDetail(
      {
        entityKind: input.entityKind,
        entityId: input.entityId,
        gradeId: input.gradeId,
        volumeId: input.volumeId,
      },
      config,
    );

    if (!workflow) {
      throw new Error(`未找到 workflow 记录: ${input.entityKind}/${input.entityId}`);
    }

    return workflow;
  } finally {
    database.close();
  }
}

export function rollbackSqliteContentRecord(
  input: RollbackSqliteContentRecordInput,
  config: LearningContentSqliteConfig = resolveLearningContentSqliteConfig(),
): SqliteContentWorkflowDetail {
  const database = openDatabase(config, { ensureDirectory: true });

  try {
    ensureSqliteSchema(database);
    const rowKey = createScopedEntityKey(
      input.entityKind,
      input.entityId,
      input.gradeId,
      input.volumeId,
    );
    const targetHistory = database
      .prepare(`
        SELECT record_json, status
        FROM content_record_history
        WHERE row_key = ? AND version = ?
      `)
      .get(rowKey, input.version) as
      | { record_json: string; status: SqliteContentRecordStatus }
      | undefined;

    if (!targetHistory) {
      throw new Error(`未找到可回滚版本: ${input.entityKind}/${input.entityId}#${input.version}`);
    }

    const currentRecord = getCurrentEntityRecord(database, input);
    database
      .prepare(`UPDATE ${resolveEntityTableName(input.entityKind)} SET record_json = ? WHERE row_key = ?`)
      .run(targetHistory.record_json, currentRecord.rowKey);

    writeWorkflowEntry(database, {
      entityKind: input.entityKind,
      entityId: input.entityId,
      gradeId: input.gradeId,
      volumeId: input.volumeId,
      recordJson: targetHistory.record_json,
      action: "rollback",
      status: targetHistory.status,
      changedAt: new Date().toISOString(),
      summary: `回滚到版本 ${input.version}`,
      actor: input.actor,
      role: input.role,
      reason: input.reason,
    });

    const workflow = getSqliteContentWorkflowDetail(
      {
        entityKind: input.entityKind,
        entityId: input.entityId,
        gradeId: input.gradeId,
        volumeId: input.volumeId,
      },
      config,
    );

    if (!workflow) {
      throw new Error(`未找到 workflow 记录: ${input.entityKind}/${input.entityId}`);
    }

    return workflow;
  } finally {
    database.close();
  }
}

function openDatabase(
  config: LearningContentSqliteConfig,
  options: { ensureDirectory?: boolean } = {},
) {
  if (options.ensureDirectory) {
    mkdirSync(path.dirname(config.databasePath), { recursive: true });
  }

  return new DatabaseSync(config.databasePath);
}

function ensureSqliteSchema(database: SqliteDatabase) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS content_manifest (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      manifest_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_grades (
      row_key TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      record_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_volumes (
      row_key TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      record_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_chapters (
      row_key TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      record_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_lessons (
      row_key TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      record_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_worked_examples (
      row_key TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      record_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_quizzes (
      row_key TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      record_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_quiz_questions (
      row_key TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      record_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_record_metadata (
      row_key TEXT PRIMARY KEY,
      metadata_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_record_history (
      row_key TEXT NOT NULL,
      version INTEGER NOT NULL,
      history_json TEXT NOT NULL,
      record_json TEXT NOT NULL,
      status TEXT NOT NULL,
      PRIMARY KEY (row_key, version)
    );

    PRAGMA user_version = 1;
  `);
}

function resetSqliteSchema(database: SqliteDatabase) {
  database.exec(`
    DROP TABLE IF EXISTS content_manifest;
    DROP TABLE IF EXISTS content_grades;
    DROP TABLE IF EXISTS content_volumes;
    DROP TABLE IF EXISTS content_chapters;
    DROP TABLE IF EXISTS content_lessons;
    DROP TABLE IF EXISTS content_worked_examples;
    DROP TABLE IF EXISTS content_quizzes;
    DROP TABLE IF EXISTS content_quiz_questions;
    DROP TABLE IF EXISTS content_record_metadata;
    DROP TABLE IF EXISTS content_record_history;
  `);

  ensureSqliteSchema(database);
}

function writeRecordTable(database: SqliteDatabase, tableName: string, records: Array<{ id: string }>) {
  const statement = database.prepare(
    `INSERT INTO ${tableName} (row_key, entity_id, record_json) VALUES (?, ?, ?)`,
  );

  for (const [index, record] of records.entries()) {
    statement.run(`${record.id}::${index}`, record.id, JSON.stringify(record));
  }
}

function readRecordTable<T>(database: SqliteDatabase, tableName: string): T[] {
  const rows = database
    .prepare(`SELECT record_json FROM ${tableName} ORDER BY row_key`)
    .all() as StoredRecordRow[];

  return rows.map((row) => JSON.parse(row.record_json) as T);
}

function countRows(database: SqliteDatabase, tableName: string) {
  const row = database
    .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
    .get() as { count: number } | undefined;

  return row?.count ?? 0;
}

function createScopedEntityKey(
  entityKind: SqliteContentEntityKind,
  entityId: string,
  gradeId?: string,
  volumeId?: string,
) {
  return [entityKind, gradeId ?? "_", volumeId ?? "_", entityId].join("::");
}

function resolveEntityTableName(entityKind: SqliteContentEntityKind) {
  switch (entityKind) {
    case "chapter":
      return "content_chapters";
    case "lesson":
      return "content_lessons";
    case "worked-example":
      return "content_worked_examples";
    case "quiz":
      return "content_quizzes";
    case "quiz-question":
      return "content_quiz_questions";
    default:
      return "content_lessons";
  }
}

function readWorkflowMetadata(
  database: SqliteDatabase,
  rowKey: string,
) {
  const row = database
    .prepare("SELECT metadata_json FROM content_record_metadata WHERE row_key = ?")
    .get(rowKey) as { metadata_json: string } | undefined;

  return row
    ? normalizeWorkflowMetadata(JSON.parse(row.metadata_json) as Partial<SqliteContentWorkflowMetadata>)
    : undefined;
}

function readWorkflowHistory(
  database: SqliteDatabase,
  rowKey: string,
  limit: number,
) {
  const rows = database
    .prepare(`
      SELECT history_json
      FROM content_record_history
      WHERE row_key = ?
      ORDER BY version DESC
      LIMIT ?
    `)
    .all(rowKey, limit) as Array<{ history_json: string }>;

  return rows.map((row) => normalizeWorkflowHistoryEntry(JSON.parse(row.history_json) as Partial<SqliteContentHistoryEntry>));
}

function getCurrentWorkflowStatus(
  database: SqliteDatabase,
  entityKind: SqliteContentEntityKind,
  entityId: string,
  gradeId?: string,
  volumeId?: string,
): SqliteContentRecordStatus {
  const rowKey = createScopedEntityKey(entityKind, entityId, gradeId, volumeId);
  const metadata = readWorkflowMetadata(database, rowKey);
  return metadata?.status ?? "draft";
}

function extractWorkflowRecordTitle(
  entityKind: SqliteContentEntityKind,
  recordJson: string,
  fallbackTitle: string,
) {
  try {
    const record = JSON.parse(recordJson) as Record<string, unknown>;
    switch (entityKind) {
      case "chapter":
        return readNestedText(record, "chapter", "title") ?? fallbackTitle;
      case "lesson":
        return readNestedText(record, "lesson", "title") ?? fallbackTitle;
      case "worked-example":
        return readNestedText(record, "workedExample", "title") ?? fallbackTitle;
      case "quiz":
        return readNestedText(record, "quiz", "title") ?? fallbackTitle;
      case "quiz-question":
        return readNestedText(record, "question", "stem") ?? fallbackTitle;
      default:
        return fallbackTitle;
    }
  } catch {
    return fallbackTitle;
  }
}

function readNestedText(
  record: Record<string, unknown>,
  objectKey: string,
  fieldKey: string,
) {
  const nested = record[objectKey];
  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return undefined;
  }

  const value = (nested as Record<string, unknown>)[fieldKey];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function createSearchGroup(
  entityKind: SqliteContentEntityKind,
  results: SqliteAdminSearchResult[],
  perEntityLimit: number,
): SqliteAdminSearchGroup {
  return {
    entityKind,
    totalCount: results.length,
    results: results
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt) || left.title.localeCompare(right.title, "zh-CN"))
      .slice(0, perEntityLimit),
  };
}

function createSearchResultWithWorkflow(
  database: SqliteDatabase,
  input: Omit<
    SqliteAdminSearchResult,
    | "workflowStatus"
    | "workflowVersion"
    | "lastPublishedAt"
    | "updatedBy"
    | "updatedByRole"
    | "importBatchId"
    | "latestAction"
    | "latestActionSummary"
    | "latestActionActor"
    | "latestActionRole"
    | "latestActionReason"
  >,
): SqliteAdminSearchResult {
  const rowKey = createScopedEntityKey(
    input.entityKind,
    input.entityId,
    input.gradeId,
    input.volumeId,
  );
  const metadata = readWorkflowMetadata(database, rowKey);
  const latestHistory = readWorkflowHistory(database, rowKey, 1)[0];

  return {
    ...input,
    updatedAt: metadata?.updatedAt ?? input.updatedAt,
    workflowStatus: metadata?.status ?? "draft",
    workflowVersion: metadata?.currentVersion ?? 1,
    lastPublishedAt: metadata?.lastPublishedAt,
    updatedBy: metadata?.updatedBy,
    updatedByRole: metadata?.updatedByRole,
    importBatchId: metadata?.importBatchId,
    latestAction: latestHistory?.action,
    latestActionSummary: latestHistory?.summary,
    latestActionActor: latestHistory?.actor,
    latestActionRole: latestHistory?.role,
    latestActionReason: latestHistory?.reason,
  };
}

function collectSearchMatches(
  query: string,
  entries: Array<[label: string, value: string | undefined]>,
) {
  return entries
    .filter(([, value]) => value?.toLocaleLowerCase("zh-CN").includes(query))
    .map(([label]) => label);
}

function normalizeSearchQuery(value: string | undefined) {
  const normalized = value?.trim().toLocaleLowerCase("zh-CN");
  return normalized ? normalized : undefined;
}

function matchesSearchQuery(query: string | undefined, values: Array<string | undefined>) {
  if (!query) {
    return true;
  }

  return values.some((value) => value?.toLocaleLowerCase("zh-CN").includes(query));
}

function getCurrentEntityRecord(
  database: SqliteDatabase,
  input: {
    entityKind: SqliteContentEntityKind;
    entityId: string;
    gradeId?: string;
    volumeId?: string;
  },
) {
  const tableName = resolveEntityTableName(input.entityKind);

  if (input.gradeId && input.volumeId) {
    const row = findScopedRecordRow(
      database,
      tableName,
      input.entityId,
      input.gradeId,
      input.volumeId,
    );

    if (!row) {
      throw new Error(`未找到内容记录: ${input.entityKind}/${input.entityId}`);
    }

    return {
      rowKey: row.row_key,
      recordJson: row.record_json,
    };
  }

  const row = database
    .prepare(`SELECT row_key, record_json FROM ${tableName} WHERE entity_id = ? LIMIT 1`)
    .get(input.entityId) as { row_key: string; record_json: string } | undefined;

  if (!row) {
    throw new Error(`未找到内容记录: ${input.entityKind}/${input.entityId}`);
  }

  return {
    rowKey: row.row_key,
    recordJson: row.record_json,
  };
}

function writeWorkflowEntry(
  database: SqliteDatabase,
  input: {
    entityKind: SqliteContentEntityKind;
    entityId: string;
    gradeId?: string;
    volumeId?: string;
    recordJson: string;
    action: SqliteContentHistoryAction;
    status: SqliteContentRecordStatus;
    changedAt: string;
    summary: string;
    actor?: SqliteContentWorkflowActor;
    role?: SqliteContentWorkflowRole;
    reason?: string;
    importBatchId?: string;
  },
) {
  const rowKey = createScopedEntityKey(
    input.entityKind,
    input.entityId,
    input.gradeId,
    input.volumeId,
  );
  const currentMetadata = readWorkflowMetadata(database, rowKey);
  const nextVersion = (currentMetadata?.currentVersion ?? 0) + 1;
  const actor = resolveWorkflowActor(input.action, input.actor);
  const role = resolveWorkflowRole(input.action, input.role);
  const reason = resolveWorkflowReason(input.action, input.reason, input.summary);
  const metadata: SqliteContentWorkflowMetadata = {
    entityKind: input.entityKind,
    entityId: input.entityId,
    gradeId: input.gradeId,
    volumeId: input.volumeId,
    status: input.status,
    currentVersion: nextVersion,
    createdAt: currentMetadata?.createdAt ?? input.changedAt,
    createdBy: currentMetadata?.createdBy ?? actor,
    createdByRole: currentMetadata?.createdByRole ?? role,
    updatedAt: input.changedAt,
    updatedBy: actor,
    updatedByRole: role,
    lastActionBy: actor,
    lastActionByRole: role,
    lastPublishedAt: input.status === "published"
      ? input.changedAt
      : currentMetadata?.lastPublishedAt,
    importBatchId: currentMetadata?.importBatchId ?? input.importBatchId,
  };
  const historyEntry: SqliteContentHistoryEntry = {
    entityKind: input.entityKind,
    entityId: input.entityId,
    gradeId: input.gradeId,
    volumeId: input.volumeId,
    version: nextVersion,
    action: input.action,
    status: input.status,
    changedAt: input.changedAt,
    summary: input.summary,
    actor,
    role,
    reason,
    importBatchId: currentMetadata?.importBatchId ?? input.importBatchId,
  };

  database
    .prepare(`
      INSERT INTO content_record_metadata (row_key, metadata_json)
      VALUES (?, ?)
      ON CONFLICT(row_key) DO UPDATE SET metadata_json = excluded.metadata_json
    `)
    .run(rowKey, JSON.stringify(metadata));

  database
    .prepare(`
      INSERT INTO content_record_history (row_key, version, history_json, record_json, status)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      rowKey,
      nextVersion,
      JSON.stringify(historyEntry),
      input.recordJson,
      input.status,
    );
}

function initializeWorkflowEntriesFromStore(
  database: SqliteDatabase,
  store: LearningContentStore,
  importedAt: string,
  importBatchId: string,
) {
  for (const chapter of store.chapters) {
    writeWorkflowEntry(database, {
      entityKind: "chapter",
      entityId: chapter.id,
      gradeId: chapter.gradeId,
      volumeId: chapter.volumeId,
      recordJson: JSON.stringify(chapter),
      action: "import",
      status: "draft",
      changedAt: importedAt,
      summary: "从课程快照导入章节",
      actor: "system-import",
      role: "publisher",
      reason: "初始化导入课程快照",
      importBatchId,
    });
  }

  for (const lesson of store.lessons) {
    writeWorkflowEntry(database, {
      entityKind: "lesson",
      entityId: lesson.id,
      gradeId: lesson.gradeId,
      volumeId: lesson.volumeId,
      recordJson: JSON.stringify(lesson),
      action: "import",
      status: "draft",
      changedAt: importedAt,
      summary: "从课程快照导入课时",
      actor: "system-import",
      role: "publisher",
      reason: "初始化导入课程快照",
      importBatchId,
    });
  }

  for (const example of store.workedExamples) {
    writeWorkflowEntry(database, {
      entityKind: "worked-example",
      entityId: example.id,
      gradeId: example.gradeId,
      volumeId: example.volumeId,
      recordJson: JSON.stringify(example),
      action: "import",
      status: "draft",
      changedAt: importedAt,
      summary: "从课程快照导入例题",
      actor: "system-import",
      role: "publisher",
      reason: "初始化导入课程快照",
      importBatchId,
    });
  }

  for (const quiz of store.quizzes) {
    writeWorkflowEntry(database, {
      entityKind: "quiz",
      entityId: quiz.id,
      gradeId: quiz.gradeId,
      volumeId: quiz.volumeId,
      recordJson: JSON.stringify(quiz),
      action: "import",
      status: "draft",
      changedAt: importedAt,
      summary: "从课程快照导入测验",
      actor: "system-import",
      role: "publisher",
      reason: "初始化导入课程快照",
      importBatchId,
    });
  }

  for (const question of store.quizQuestions) {
    writeWorkflowEntry(database, {
      entityKind: "quiz-question",
      entityId: question.id,
      gradeId: question.gradeId,
      volumeId: question.volumeId,
      recordJson: JSON.stringify(question),
      action: "import",
      status: "draft",
      changedAt: importedAt,
      summary: "从课程快照导入题目",
      actor: "system-import",
      role: "publisher",
      reason: "初始化导入课程快照",
      importBatchId,
    });
  }
}

function normalizeWorkflowMetadata(
  metadata: Partial<SqliteContentWorkflowMetadata>,
): SqliteContentWorkflowMetadata {
  const updatedAt = metadata.updatedAt ?? new Date(0).toISOString();
  const fallbackActor = metadata.lastActionBy ?? metadata.updatedBy ?? metadata.createdBy ?? "admin-console";
  const fallbackRole = metadata.lastActionByRole ?? metadata.updatedByRole ?? metadata.createdByRole ?? "editor";

  return {
    entityKind: metadata.entityKind ?? "lesson",
    entityId: metadata.entityId ?? "",
    gradeId: metadata.gradeId,
    volumeId: metadata.volumeId,
    status: metadata.status ?? "draft",
    currentVersion: metadata.currentVersion ?? 1,
    createdAt: metadata.createdAt ?? updatedAt,
    createdBy: metadata.createdBy ?? fallbackActor,
    createdByRole: metadata.createdByRole ?? fallbackRole,
    updatedAt,
    updatedBy: metadata.updatedBy ?? fallbackActor,
    updatedByRole: metadata.updatedByRole ?? fallbackRole,
    lastActionBy: metadata.lastActionBy ?? metadata.updatedBy ?? fallbackActor,
    lastActionByRole: metadata.lastActionByRole ?? metadata.updatedByRole ?? fallbackRole,
    lastPublishedAt: metadata.lastPublishedAt,
    importBatchId: metadata.importBatchId,
  };
}

function normalizeWorkflowHistoryEntry(
  entry: Partial<SqliteContentHistoryEntry>,
): SqliteContentHistoryEntry {
  const action = entry.action ?? "update";

  return {
    entityKind: entry.entityKind ?? "lesson",
    entityId: entry.entityId ?? "",
    gradeId: entry.gradeId,
    volumeId: entry.volumeId,
    version: entry.version ?? 1,
    action,
    status: entry.status ?? "draft",
    changedAt: entry.changedAt ?? new Date(0).toISOString(),
    summary: entry.summary ?? "",
    actor: entry.actor ?? resolveWorkflowActor(action),
    role: entry.role ?? resolveWorkflowRole(action),
    reason: entry.reason ?? resolveWorkflowReason(action, undefined, entry.summary ?? ""),
    importBatchId: entry.importBatchId,
  };
}

function resolveWorkflowActor(
  action: SqliteContentHistoryAction,
  actor?: SqliteContentWorkflowActor,
) {
  if (actor?.trim()) {
    return actor.trim();
  }

  switch (action) {
    case "import":
      return "system-import";
    case "update":
    case "status-change":
    case "rollback":
    default:
      return "admin-console";
  }
}

function resolveWorkflowRole(
  action: SqliteContentHistoryAction,
  role?: SqliteContentWorkflowRole,
): SqliteContentWorkflowRole {
  if (role === "admin" || role === "editor" || role === "reviewer" || role === "publisher") {
    return role;
  }

  switch (action) {
    case "import":
      return "publisher";
    case "status-change":
      return "publisher";
    case "update":
    case "rollback":
    default:
      return "editor";
  }
}

function resolveWorkflowReason(
  action: SqliteContentHistoryAction,
  reason: string | undefined,
  summary: string,
) {
  if (reason?.trim()) {
    return reason.trim();
  }

  switch (action) {
    case "import":
      return "初始化导入课程快照";
    case "update":
      return "后台编辑内容";
    case "status-change":
      return summary.includes("发布") ? "切换为已发布" : "切换为草稿";
    case "rollback":
      return "按指定历史版本回滚";
    default:
      return summary;
  }
}

function createImportBatchId(importedAt?: string, sourceSnapshotPath?: string) {
  const timestamp = (importedAt ?? new Date().toISOString()).replace(/[:.]/g, "-");
  const snapshotToken = sourceSnapshotPath
    ? path.basename(sourceSnapshotPath).replace(/[^a-zA-Z0-9._-]/g, "-")
    : "manual";
  return `import-${timestamp}-${snapshotToken}`;
}

function createChapterSummary(
  chapterRecord: StoredChapterRecord,
): SqliteAdminChapterSummary {
  return {
    id: chapterRecord.id,
    gradeId: chapterRecord.gradeId,
    volumeId: chapterRecord.volumeId,
    title: chapterRecord.chapter.title,
    summary: chapterRecord.chapter.summary,
    lessonCount: chapterRecord.lessonIds.length,
    workedExampleCount: chapterRecord.workedExampleIds.length,
    updatedAt: chapterRecord.updatedAt,
  };
}

function createLessonSummary(
  lessonRecord: StoredLessonRecord,
  chapterRecords: StoredChapterRecord[],
): SqliteAdminLessonSummary {
  const chapterRecord = chapterRecords.find((candidate) => (
    candidate.id === lessonRecord.chapterId
    && candidate.gradeId === lessonRecord.gradeId
    && candidate.volumeId === lessonRecord.volumeId
  ));

  return {
    id: lessonRecord.id,
    gradeId: lessonRecord.gradeId,
    volumeId: lessonRecord.volumeId,
    chapterId: lessonRecord.chapterId,
    chapterTitle: chapterRecord?.chapter.title ?? lessonRecord.chapterId,
    title: lessonRecord.lesson.title,
    summary: lessonRecord.lesson.summary,
    updatedAt: lessonRecord.updatedAt,
  };
}

function createWorkedExampleSummary(
  workedExampleRecord: StoredWorkedExampleRecord,
  chapterRecords: StoredChapterRecord[],
): SqliteAdminWorkedExampleSummary {
  const chapterRecord = chapterRecords.find((candidate) => (
    candidate.id === workedExampleRecord.chapterId
    && candidate.gradeId === workedExampleRecord.gradeId
    && candidate.volumeId === workedExampleRecord.volumeId
  ));

  return {
    id: workedExampleRecord.id,
    gradeId: workedExampleRecord.gradeId,
    volumeId: workedExampleRecord.volumeId,
    chapterId: workedExampleRecord.chapterId,
    chapterTitle: chapterRecord?.chapter.title ?? workedExampleRecord.chapterId,
    title: workedExampleRecord.workedExample.title,
    summary: workedExampleRecord.workedExample.summary,
    updatedAt: workedExampleRecord.updatedAt,
  };
}

function createQuizSummary(
  quizRecord: StoredQuizRecord,
  chapterRecords: StoredChapterRecord[],
  questionRecords: StoredQuizQuestionRecord[],
): SqliteAdminQuizSummary {
  const chapterRecord = chapterRecords.find((candidate) => (
    candidate.id === quizRecord.chapterId
    && candidate.gradeId === quizRecord.gradeId
    && candidate.volumeId === quizRecord.volumeId
  ));

  return {
    id: quizRecord.id,
    gradeId: quizRecord.gradeId,
    volumeId: quizRecord.volumeId,
    chapterId: quizRecord.chapterId,
    chapterTitle: chapterRecord?.chapter.title ?? quizRecord.chapterId,
    title: quizRecord.quiz.title,
    passingScore: quizRecord.quiz.passingScore,
    questionCount: questionRecords.filter((record) => (
      record.quizId === quizRecord.id
      && record.gradeId === quizRecord.gradeId
      && record.volumeId === quizRecord.volumeId
    )).length,
    updatedAt: quizRecord.updatedAt,
  };
}

function createQuizQuestionSummary(
  questionRecord: StoredQuizQuestionRecord,
  chapterRecords: StoredChapterRecord[],
): SqliteAdminQuizQuestionSummary {
  const chapterRecord = chapterRecords.find((candidate) => (
    candidate.id === questionRecord.chapterId
    && candidate.gradeId === questionRecord.gradeId
    && candidate.volumeId === questionRecord.volumeId
  ));

  return {
    id: questionRecord.id,
    quizId: questionRecord.quizId,
    gradeId: questionRecord.gradeId,
    volumeId: questionRecord.volumeId,
    chapterId: questionRecord.chapterId,
    chapterTitle: chapterRecord?.chapter.title ?? questionRecord.chapterId,
    type: questionRecord.question.type,
    stem: questionRecord.question.stem,
    difficulty: questionRecord.question.difficulty,
    updatedAt: questionRecord.updatedAt,
  };
}

function findScopedRecordRow(
  database: SqliteDatabase,
  tableName: string,
  entityId: string,
  gradeId: string,
  volumeId: string,
) {
  const rows = database
    .prepare(`SELECT row_key, record_json FROM ${tableName} WHERE entity_id = ?`)
    .all(entityId) as Array<{ row_key: string; record_json: string }>;

  return rows.find((candidate) => {
    const record = JSON.parse(candidate.record_json) as {
      gradeId?: string;
      volumeId?: string;
    };

    return record.gradeId === gradeId && record.volumeId === volumeId;
  });
}

function sanitizeTextItems(items: string[]) {
  return items
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeOptionalTextItems(items: string[]) {
  const normalized = sanitizeTextItems(items);
  return normalized.length > 0 ? normalized : undefined;
}

function sanitizeWorkedExampleSteps(steps: WorkedExampleStep[]) {
  return steps
    .map((step, index) => ({
      id: step.id?.trim() || `step-${index + 1}`,
      title: step.title.trim(),
      content: step.content.trim(),
    }))
    .filter((step) => step.title || step.content);
}

function parseQuizQuestionPayload(
  payloadJson: string,
  currentQuestion: QuizQuestion,
) {
  const trimmed = payloadJson.trim();
  if (!trimmed) {
    throw new Error("payloadJson 不能为空。");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("payloadJson 不是合法的 JSON。");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("payloadJson 必须是对象。");
  }

  const payload = parsed as Record<string, unknown>;

  for (const field of ["id", "quizId", "type", "stem", "explanation", "relatedLessonIds", "relatedExampleIds"]) {
    if (field in payload) {
      delete payload[field];
    }
  }

  validateQuizQuestionPayloadByType(currentQuestion.type, payload);

  return {
    ...currentQuestion,
    ...payload,
  };
}

function validateQuizQuestionPayloadByType(
  type: QuizQuestionType,
  payload: Record<string, unknown>,
) {
  if ("difficulty" in payload && typeof payload.difficulty !== "string") {
    throw new Error("payloadJson 中的 difficulty 必须是字符串。");
  }

  switch (type) {
    case "single-choice":
      if (!Array.isArray(payload.options) || typeof payload.correctOptionId !== "string") {
        throw new Error("single-choice 需要 options 和 correctOptionId。");
      }
      break;
    case "multiple-choice":
      if (!Array.isArray(payload.options) || !Array.isArray(payload.correctOptionIds)) {
        throw new Error("multiple-choice 需要 options 和 correctOptionIds。");
      }
      break;
    case "fill-blank":
      if (!Array.isArray(payload.blanks)) {
        throw new Error("fill-blank 需要 blanks。");
      }
      break;
    case "numeric":
      if (typeof payload.prompt !== "string" || !Array.isArray(payload.acceptableAnswers)) {
        throw new Error("numeric 需要 prompt 和 acceptableAnswers。");
      }
      break;
    case "expression":
      if (typeof payload.prompt !== "string" || !Array.isArray(payload.acceptableAnswers)) {
        throw new Error("expression 需要 prompt 和 acceptableAnswers。");
      }
      break;
    case "step-by-step":
      if (!Array.isArray(payload.steps)) {
        throw new Error("step-by-step 需要 steps。");
      }
      break;
    default:
      break;
  }
}

function resolveAbsolutePath(value: string | undefined, baseDir: string) {
  if (!value) {
    return undefined;
  }

  return path.isAbsolute(value) ? value : path.join(baseDir, value);
}

export { SQLITE_SCHEMA_VERSION };
