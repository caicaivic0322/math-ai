import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { CurriculumSlice } from "@/types/content";

import {
  buildCurriculumSlicesFromStore,
  buildLearningContentStore,
  createJsonLearningContentRepository,
} from "./repository";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("learning content repository", () => {
  it("会把课程切片写入 content-store 并能恢复为课程切片", () => {
    const slice = createSlice({
      gradeId: "g10",
      volumeId: "required-1",
      chapterId: "senior-unit-1",
      chapterTitle: "函数概念初步",
      lessonId: "lesson-senior-1",
      exampleId: "example-senior-1",
      quizId: "quiz-senior-1",
    });

    const store = buildLearningContentStore({
      curriculumSlices: [slice],
      sourceSnapshotPath: "/tmp/curriculum.snapshot.json",
      importedAt: "2026-05-05T12:00:00.000Z",
    });

    expect(store.chapters).toHaveLength(1);
    expect(store.lessons[0]?.formulaHashes).toHaveLength(1);
    expect(store.manifest.sourceSnapshotPath).toBe("/tmp/curriculum.snapshot.json");

    const restoredSlices = buildCurriculumSlicesFromStore(store);
    expect(restoredSlices).toHaveLength(1);
    expect(restoredSlices[0]?.chapter.id).toBe("senior-unit-1");
    expect(restoredSlices[0]?.quiz.questions[0]?.id).toBe("question-001");
  });

  it("支持通过可替换仓储接口写入本地 JSON 内容仓储", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-store-"));
    tempDirs.push(root);
    const repository = createJsonLearningContentRepository({
      storeFilePath: path.join(root, "data", "content-store.json"),
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g7",
          volumeId: "shang",
          chapterId: "junior-unit-1",
          chapterTitle: "有理数",
          lessonId: "lesson-junior-1",
          exampleId: "example-junior-1",
          quizId: "quiz-junior-1",
        }),
      ],
      sourceSnapshotPath: "/tmp/curriculum.snapshot.json",
      importedAt: "2026-05-05T13:00:00.000Z",
    });

    const summary = repository.getSummary();
    const store = repository.getStore();

    expect(summary.exists).toBe(true);
    expect(summary.chapterCount).toBe(1);
    expect(summary.lessonCount).toBe(1);
    expect(store.chapters[0]?.chapter.id).toBe("junior-unit-1");
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
        bodyBlocks: [
          {
            type: "formula",
            id: "formula-1",
            formulas: [String.raw`\frac{1}{2}`],
          },
        ],
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
          id: "question-001",
          quizId,
          type: "expression",
          difficulty: "basic",
          stem: "已知表达式",
          prompt: "化简",
          acceptableAnswers: ["x+1"],
          explanation: "mock",
          relatedLessonIds: [lessonId],
        },
      ],
    },
  };
}
