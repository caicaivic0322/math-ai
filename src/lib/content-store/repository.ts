import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createFormulaHash } from "../formula-render";
import type {
  LearningContentStorageManifest,
  StoredChapterRecord,
  StoredGradeRecord,
  StoredLessonRecord,
  StoredQuizQuestionRecord,
  StoredQuizRecord,
  StoredVolumeRecord,
  StoredWorkedExampleRecord,
} from "../storage";
import type { CurriculumSlice, LessonContentBlock, QuizQuestion } from "../../types/content";

export interface LearningContentStoreManifest extends LearningContentStorageManifest {
  schemaVersion: "phase6-v1";
  importedAt?: string;
  sourceSnapshotPath?: string;
}

export interface LearningContentStore {
  manifest: LearningContentStoreManifest;
  grades: StoredGradeRecord[];
  volumes: StoredVolumeRecord[];
  chapters: StoredChapterRecord[];
  lessons: StoredLessonRecord[];
  workedExamples: StoredWorkedExampleRecord[];
  quizzes: StoredQuizRecord[];
  quizQuestions: StoredQuizQuestionRecord[];
}

export interface LearningContentRepositoryConfig {
  storeFilePath: string;
  assetStorageKind?: LearningContentStoreManifest["assetStorageKind"];
}

export interface ReplaceLearningContentInput {
  curriculumSlices: CurriculumSlice[];
  sourceSnapshotPath?: string;
  importedAt?: string;
}

export interface LearningContentStoreSummary {
  exists: boolean;
  backendKind: "json-file" | "sqlite";
  locationPath: string;
  storeFilePath: string;
  sourceKind: LearningContentStoreManifest["contentSourceKind"];
  schemaVersion: LearningContentStoreManifest["schemaVersion"];
  importedAt?: string;
  sourceSnapshotPath?: string;
  gradeCount: number;
  volumeCount: number;
  chapterCount: number;
  lessonCount: number;
  workedExampleCount: number;
  quizCount: number;
  questionCount: number;
}

export interface LearningContentRepository {
  getStore(): LearningContentStore;
  replace(input: ReplaceLearningContentInput): LearningContentStore;
  getSummary(): LearningContentStoreSummary;
}

export function createJsonLearningContentRepository(
  config: LearningContentRepositoryConfig = resolveLearningContentRepositoryConfig(),
): LearningContentRepository {
  return {
    getStore() {
      return readLearningContentStore(config);
    },
    replace(input) {
      return saveLearningContentStore(input, config);
    },
    getSummary() {
      return getLearningContentStoreSummary(config);
    },
  };
}

export function resolveLearningContentRepositoryConfig(
  env: NodeJS.ProcessEnv = process.env,
): LearningContentRepositoryConfig {
  const projectRoot = process.cwd();
  const storeFilePath = resolveAbsolutePath(env.CONTENT_STORE_PATH, projectRoot)
    ?? path.join(projectRoot, "data", "content-store.json");

  return {
    storeFilePath,
    assetStorageKind: env.CONTENT_STORE_ASSET_STORAGE_KIND === "object-storage"
      ? "object-storage"
      : "filesystem",
  };
}

export function createEmptyLearningContentStore(
  config: LearningContentRepositoryConfig = resolveLearningContentRepositoryConfig(),
): LearningContentStore {
  return {
    manifest: {
      schemaVersion: "phase6-v1",
      contentSourceKind: "database",
      assetStorageKind: config.assetStorageKind ?? "filesystem",
    },
    grades: [],
    volumes: [],
    chapters: [],
    lessons: [],
    workedExamples: [],
    quizzes: [],
    quizQuestions: [],
  };
}

export function readLearningContentStore(
  config: LearningContentRepositoryConfig = resolveLearningContentRepositoryConfig(),
): LearningContentStore {
  if (!existsSync(config.storeFilePath)) {
    return createEmptyLearningContentStore(config);
  }

  const raw = readFileSync(config.storeFilePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<LearningContentStore>;

  return {
    ...createEmptyLearningContentStore(config),
    ...parsed,
    manifest: {
      ...createEmptyLearningContentStore(config).manifest,
      ...(parsed.manifest ?? {}),
      schemaVersion: "phase6-v1",
      contentSourceKind: "database",
    },
    grades: parsed.grades ?? [],
    volumes: parsed.volumes ?? [],
    chapters: parsed.chapters ?? [],
    lessons: parsed.lessons ?? [],
    workedExamples: parsed.workedExamples ?? [],
    quizzes: parsed.quizzes ?? [],
    quizQuestions: parsed.quizQuestions ?? [],
  };
}

export function saveLearningContentStore(
  input: ReplaceLearningContentInput,
  config: LearningContentRepositoryConfig = resolveLearningContentRepositoryConfig(),
): LearningContentStore {
  const store = buildLearningContentStore(input, config);
  mkdirSync(path.dirname(config.storeFilePath), { recursive: true });
  writeFileSync(config.storeFilePath, serializeLearningContentStore(store), "utf8");
  return store;
}

export function buildLearningContentStore(
  input: ReplaceLearningContentInput,
  config: LearningContentRepositoryConfig = resolveLearningContentRepositoryConfig(),
): LearningContentStore {
  const importedAt = input.importedAt ?? new Date().toISOString();
  const gradeMap = new Map<string, StoredGradeRecord>();
  const volumeMap = new Map<string, StoredVolumeRecord>();
  const chapters: StoredChapterRecord[] = [];
  const lessons: StoredLessonRecord[] = [];
  const workedExamples: StoredWorkedExampleRecord[] = [];
  const quizzes: StoredQuizRecord[] = [];
  const quizQuestions: StoredQuizQuestionRecord[] = [];

  for (const slice of input.curriculumSlices) {
    gradeMap.set(slice.grade.id, {
      id: slice.grade.id,
      grade: slice.grade,
      updatedAt: importedAt,
    });

    const volumeId = createVolumeRecordId(slice.grade.id, slice.volume.id);
    volumeMap.set(volumeId, {
      id: volumeId,
      gradeId: slice.grade.id,
      volumeId: slice.volume.id,
      volume: slice.volume,
      updatedAt: importedAt,
    });

    chapters.push({
      id: slice.chapter.id,
      gradeId: slice.grade.id,
      volumeId: slice.volume.id,
      chapter: slice.chapter,
      lessonIds: slice.lessons.map((lesson) => lesson.id),
      workedExampleIds: slice.workedExamples.map((example) => example.id),
      quizId: slice.quiz.id,
      updatedAt: importedAt,
    });

    for (const lesson of slice.lessons) {
      lessons.push({
        id: lesson.id,
        gradeId: slice.grade.id,
        volumeId: slice.volume.id,
        chapterId: slice.chapter.id,
        lesson,
        formulaHashes: collectLessonFormulaHashes(lesson.bodyBlocks),
        updatedAt: importedAt,
      });
    }

    for (const workedExample of slice.workedExamples) {
      workedExamples.push({
        id: workedExample.id,
        gradeId: slice.grade.id,
        volumeId: slice.volume.id,
        chapterId: slice.chapter.id,
        workedExample,
        formulaHashes: [],
        updatedAt: importedAt,
      });
    }

    const questionIds = slice.quiz.questions.map((question) => question.id);
    quizzes.push({
      id: slice.quiz.id,
      gradeId: slice.grade.id,
      volumeId: slice.volume.id,
      chapterId: slice.chapter.id,
      quiz: {
        ...slice.quiz,
        questions: [],
      },
      questionIds,
      updatedAt: importedAt,
    });

    for (const question of slice.quiz.questions) {
      quizQuestions.push({
        id: question.id,
        quizId: slice.quiz.id,
        chapterId: slice.chapter.id,
        gradeId: slice.grade.id,
        volumeId: slice.volume.id,
        question,
        formulaHashes: collectQuizQuestionFormulaHashes(question),
        updatedAt: importedAt,
      });
    }
  }

  return {
    manifest: {
      schemaVersion: "phase6-v1",
      contentSourceKind: "database",
      assetStorageKind: config.assetStorageKind ?? "filesystem",
      importedAt,
      sourceSnapshotPath: input.sourceSnapshotPath,
    },
    grades: Array.from(gradeMap.values()),
    volumes: Array.from(volumeMap.values()),
    chapters,
    lessons,
    workedExamples,
    quizzes,
    quizQuestions,
  };
}

export function buildCurriculumSlicesFromStore(store: LearningContentStore): CurriculumSlice[] {
  const gradeMap = new Map(store.grades.map((record) => [record.id, record.grade]));
  const volumeMap = new Map(store.volumes.map((record) => [record.id, record.volume]));
  const lessonMap = new Map(store.lessons.map((record) => [record.id, record.lesson]));
  const workedExampleMap = new Map(
    store.workedExamples.map((record) => [record.id, record.workedExample]),
  );
  const quizMap = new Map(store.quizzes.map((record) => [record.id, record]));
  const questionMap = new Map(store.quizQuestions.map((record) => [record.id, record.question]));

  return [...store.chapters]
    .sort((left, right) => left.chapter.order - right.chapter.order)
    .map((chapterRecord) => {
      const grade = gradeMap.get(chapterRecord.gradeId);
      const volume = volumeMap.get(createVolumeRecordId(chapterRecord.gradeId, chapterRecord.volumeId));
      const quizRecord = quizMap.get(chapterRecord.quizId);

      if (!grade || !volume || !quizRecord) {
        throw new Error(`content-store 缺少章节 ${chapterRecord.id} 的关联记录。`);
      }

      return {
        grade,
        volume,
        chapter: chapterRecord.chapter,
        lessons: chapterRecord.lessonIds.map((lessonId) => {
          const lesson = lessonMap.get(lessonId);

          if (!lesson) {
            throw new Error(`content-store 缺少 lesson 记录: ${lessonId}`);
          }

          return lesson;
        }),
        workedExamples: chapterRecord.workedExampleIds.map((exampleId) => {
          const workedExample = workedExampleMap.get(exampleId);

          if (!workedExample) {
            throw new Error(`content-store 缺少 workedExample 记录: ${exampleId}`);
          }

          return workedExample;
        }),
        quiz: {
          ...quizRecord.quiz,
          questions: quizRecord.questionIds.map((questionId) => {
            const question = questionMap.get(questionId);

            if (!question) {
              throw new Error(`content-store 缺少 quizQuestion 记录: ${questionId}`);
            }

            return question;
          }),
        },
      } satisfies CurriculumSlice;
    });
}

export function serializeLearningContentStore(store: LearningContentStore) {
  return `${JSON.stringify(store, null, 2)}\n`;
}

export function getLearningContentStoreSummary(
  config: LearningContentRepositoryConfig = resolveLearningContentRepositoryConfig(),
): LearningContentStoreSummary {
  const exists = existsSync(config.storeFilePath);
  const store = readLearningContentStore(config);
  const questionCount = store.quizQuestions.length;

  return {
    exists,
    backendKind: "json-file",
    locationPath: config.storeFilePath,
    storeFilePath: config.storeFilePath,
    sourceKind: store.manifest.contentSourceKind,
    schemaVersion: store.manifest.schemaVersion,
    importedAt: store.manifest.importedAt,
    sourceSnapshotPath: store.manifest.sourceSnapshotPath,
    gradeCount: store.grades.length,
    volumeCount: store.volumes.length,
    chapterCount: store.chapters.length,
    lessonCount: store.lessons.length,
    workedExampleCount: store.workedExamples.length,
    quizCount: store.quizzes.length,
    questionCount,
  };
}

function collectLessonFormulaHashes(bodyBlocks: LessonContentBlock[]) {
  const formulas = bodyBlocks.flatMap((block) => {
    if (block.type !== "formula") {
      return [];
    }

    return block.formulas;
  });

  return dedupeFormulaHashes(formulas);
}

function collectQuizQuestionFormulaHashes(question: QuizQuestion) {
  const formulas: string[] = [];

  if (question.type === "expression" || question.type === "numeric") {
    formulas.push(...question.acceptableAnswers);
  }

  if (question.type === "fill-blank") {
    for (const blank of question.blanks) {
      formulas.push(...blank.acceptableAnswers);
    }
  }

  if (question.type === "step-by-step") {
    for (const step of question.steps) {
      formulas.push(...step.acceptableAnswers);
    }
  }

  return dedupeFormulaHashes(formulas);
}

function dedupeFormulaHashes(formulas: string[]) {
  return Array.from(
    new Set(
      formulas
        .map((formula) => formula.trim())
        .filter(Boolean)
        .map((formula) => createFormulaHash(formula)),
    ),
  );
}

function createVolumeRecordId(gradeId: string, volumeId: string) {
  return `${gradeId}:${volumeId}`;
}

function resolveAbsolutePath(value: string | undefined, baseDir: string) {
  if (!value) {
    return undefined;
  }

  return path.isAbsolute(value) ? value : path.join(baseDir, value);
}
