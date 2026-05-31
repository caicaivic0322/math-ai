import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { CurriculumSlice } from "@/types/content";

import {
  buildLearningContentStore,
  createSqliteLearningContentRepository,
  serializeLearningContentStore,
} from "../content-store";
import {
  buildCurriculumContentSnapshot,
  createDatabaseCurriculumContentSource,
  createJsonCurriculumContentSource,
  createSqliteCurriculumContentSource,
  serializeCurriculumContentSnapshot,
} from "./source";

describe("buildCurriculumContentSnapshot", () => {
  it("会按学段顺序稳定整理年级、项目和切片顺序", () => {
    const seniorSlice = createSlice({
      gradeId: "g10",
      volumeId: "required-1",
      chapterId: "senior-unit-1",
      chapterTitle: "函数概念初步",
      lessonId: "lesson-senior-1",
      exampleId: "example-senior-1",
      quizId: "quiz-senior-1",
    });
    const juniorSlice = createSlice({
      gradeId: "g7",
      volumeId: "shang",
      chapterId: "junior-unit-1",
      chapterTitle: "有理数",
      lessonId: "lesson-junior-1",
      exampleId: "example-junior-1",
      quizId: "quiz-junior-1",
    });

    const snapshot = buildCurriculumContentSnapshot([seniorSlice, juniorSlice]);

    expect(snapshot.grades.map((grade) => grade.id)).toEqual(["g7", "g10"]);
    expect(snapshot.volumes.map((volume) => `${volume.gradeId}:${volume.id}`)).toEqual([
      "g7:shang",
      "g10:required-1",
    ]);
    expect(snapshot.chapters.map((chapter) => chapter.id)).toEqual([
      "junior-unit-1",
      "senior-unit-1",
    ]);
  });

  it("支持从 JSON 快照重建课程内容源", async () => {
    const slice = createSlice({
      gradeId: "g10",
      volumeId: "required-1",
      chapterId: "senior-unit-1",
      chapterTitle: "函数概念初步",
      lessonId: "lesson-senior-1",
      exampleId: "example-senior-1",
      quizId: "quiz-senior-1",
    });
    const snapshot = buildCurriculumContentSnapshot([slice]);
    const tempDir = path.join(os.tmpdir(), "curriculum-json-source-test");
    await mkdir(tempDir, { recursive: true });
    const outputPath = path.join(tempDir, "snapshot.json");

    await writeFile(outputPath, serializeCurriculumContentSnapshot(snapshot), "utf8");

    const source = createJsonCurriculumContentSource(outputPath);

    expect(source.getSnapshot().curriculumSlices[0]?.chapter.id).toBe("senior-unit-1");
  });

  it("支持从 database-ready content-store 重建课程内容源", async () => {
    const slice = createSlice({
      gradeId: "g7",
      volumeId: "shang",
      chapterId: "junior-unit-1",
      chapterTitle: "有理数",
      lessonId: "lesson-junior-1",
      exampleId: "example-junior-1",
      quizId: "quiz-junior-1",
    });
    const tempDir = path.join(os.tmpdir(), "curriculum-database-source-test");
    await mkdir(tempDir, { recursive: true });
    const outputPath = path.join(tempDir, "content-store.json");
    const store = buildLearningContentStore({
      curriculumSlices: [slice],
      sourceSnapshotPath: "/tmp/curriculum.snapshot.json",
      importedAt: "2026-05-05T10:00:00.000Z",
    });

    await writeFile(outputPath, serializeLearningContentStore(store), "utf8");

    const source = createDatabaseCurriculumContentSource(outputPath);

    expect(source.getSnapshot().curriculumSlices[0]?.chapter.id).toBe("junior-unit-1");
    expect(source.getSnapshot().quizzes[0]?.questions[0]?.id).toBe("quiz-junior-1-q1");
  });

  it("支持从 SQLite 内容数据库重建课程内容源", async () => {
    const slice = createSlice({
      gradeId: "g10",
      volumeId: "required-1",
      chapterId: "senior-unit-1",
      chapterTitle: "函数概念初步",
      lessonId: "lesson-senior-1",
      exampleId: "example-senior-1",
      quizId: "quiz-senior-1",
    });
    const tempDir = path.join(os.tmpdir(), "curriculum-sqlite-source-test");
    await mkdir(tempDir, { recursive: true });
    const databasePath = path.join(tempDir, "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [slice],
      sourceSnapshotPath: "/tmp/curriculum.snapshot.json",
      importedAt: "2026-05-05T11:00:00.000Z",
    });

    const source = createSqliteCurriculumContentSource(databasePath);

    expect(source.getSnapshot().curriculumSlices[0]?.chapter.id).toBe("senior-unit-1");
    expect(source.getSnapshot().quizzes[0]?.questions[0]?.id).toBe("quiz-senior-1-q1");
  });
});

function createSlice({
  gradeId,
  volumeId,
  chapterId,
  chapterTitle,
  lessonId,
  exampleId,
  quizId,
}: {
  gradeId: CurriculumSlice["grade"]["id"];
  volumeId: CurriculumSlice["volume"]["id"];
  chapterId: string;
  chapterTitle: string;
  lessonId: string;
  exampleId: string;
  quizId: string;
}): CurriculumSlice {
  return {
    grade: {
      id: gradeId,
      stageId: gradeId === "g10" ? "senior" : "junior",
      label: gradeId,
      shortLabel: gradeId,
      description: "mock",
    },
    volume: {
      id: volumeId,
      stageId: gradeId === "g10" ? "senior" : "junior",
      gradeId,
      label: volumeId,
      description: "mock",
    },
    chapter: {
      id: chapterId,
      gradeId,
      volumeId,
      slug: chapterId,
      title: chapterTitle,
      summary: "mock",
      order: 1,
      lessonIds: [lessonId],
      workedExampleIds: [exampleId],
      quizId,
    },
    lessons: [
      {
        id: lessonId,
        chapterId,
        slug: lessonId,
        title: lessonId,
        summary: "mock",
        learningObjectives: ["目标"],
        keyRules: ["规则"],
        bodyBlocks: [],
        relatedExampleIds: [exampleId],
        order: 1,
      },
    ],
    workedExamples: [
      {
        id: exampleId,
        chapterId,
        slug: exampleId,
        title: exampleId,
        summary: "mock",
        problem: "mock",
        steps: [{ id: "step-1", title: "步骤", content: "mock" }],
        answer: "mock",
        commonMistakes: ["mock"],
        relatedLessonIds: [lessonId],
        order: 1,
      },
    ],
    quiz: {
      id: quizId,
      chapterId,
      title: quizId,
      instructions: "mock",
      passingScore: 60,
      questions: [
        {
          id: `${quizId}-q1`,
          quizId,
          type: "expression",
          difficulty: "basic",
          stem: "mock",
          prompt: "mock",
          acceptableAnswers: ["x+1"],
          explanation: "mock",
          relatedLessonIds: [lessonId],
        },
      ],
    },
  };
}
