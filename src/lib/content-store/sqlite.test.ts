import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { CurriculumSlice } from "@/types/content";

import { buildCurriculumSlicesFromStore } from "./repository";
import {
  createSqliteLearningContentRepository,
  getSqliteChapterDetail,
  getSqliteContentWorkflowDetail,
  getSqliteRecentWorkflowFeed,
  getSqliteContentWorkflowStatusSummary,
  searchSqliteAdminContent,
  getSqliteLessonDetail,
  getSqliteQuizDetail,
  getSqliteQuizQuestionDetail,
  getSqliteWorkedExampleDetail,
  listSqliteChapterSummaries,
  listSqliteLessonSummaries,
  listSqliteRecentWorkflowEntries,
  listSqliteQuizQuestionSummaries,
  listSqliteQuizSummaries,
  listSqliteWorkedExampleSummaries,
  rollbackSqliteContentRecord,
  updateSqliteChapter,
  updateSqliteContentStatus,
  updateSqliteLesson,
  updateSqliteQuiz,
  updateSqliteQuizQuestion,
  updateSqliteWorkedExample,
} from "./sqlite";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("sqlite learning content repository", () => {
  it("支持把课程切片写入 SQLite 并恢复为课程切片", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-sqlite-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g10",
          volumeId: "required-1",
          chapterId: "senior-unit-1",
          chapterTitle: "函数概念初步",
          lessonId: "lesson-senior-1",
          exampleId: "example-senior-1",
          quizId: "quiz-senior-1",
        }),
      ],
      sourceSnapshotPath: "/tmp/curriculum.snapshot.json",
      importedAt: "2026-05-05T14:00:00.000Z",
    });

    const summary = repository.getSummary();
    const store = repository.getStore();
    const slices = buildCurriculumSlicesFromStore(store);

    expect(summary.exists).toBe(true);
    expect(summary.backendKind).toBe("sqlite");
    expect(summary.chapterCount).toBe(1);
    expect(summary.questionCount).toBe(1);
    expect(slices[0]?.chapter.id).toBe("senior-unit-1");
    expect(slices[0]?.quiz.questions[0]?.id).toBe("question-001");
  });

  it("支持读取并更新单个课时记录", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-sqlite-update-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g7",
          volumeId: "shang",
          chapterId: "unit-1",
          chapterTitle: "第一章 有理数",
          lessonId: "lesson-junior-1",
          exampleId: "example-junior-1",
          quizId: "quiz-junior-1",
        }),
      ],
      sourceSnapshotPath: "/tmp/curriculum.snapshot.json",
      importedAt: "2026-05-05T15:00:00.000Z",
    });

    const before = getSqliteLessonDetail("lesson-junior-1", {
      databasePath,
      storeFilePath: databasePath,
    });
    const list = listSqliteLessonSummaries(
      {
        databasePath,
        storeFilePath: databasePath,
      },
      { limit: 10 },
    );

    expect(before?.title).toBe("lesson-junior-1");
    expect(list[0]?.chapterTitle).toBe("第一章 有理数");

    const updated = updateSqliteLesson(
      {
        lessonId: "lesson-junior-1",
        title: "有理数的意义",
        summary: "理解有理数的定义与分类。",
        learningObjectives: ["认识正数和负数", "会判断有理数类别"],
        keyRules: ["0 既不是正数也不是负数"],
      },
      {
        databasePath,
        storeFilePath: databasePath,
      },
    );

    expect(updated.title).toBe("有理数的意义");
    expect(updated.lesson.learningObjectives).toEqual([
      "认识正数和负数",
      "会判断有理数类别",
    ]);
    expect(updated.lesson.keyRules).toEqual(["0 既不是正数也不是负数"]);
  });

  it("支持读取并更新章节记录", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-sqlite-chapter-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g7",
          volumeId: "shang",
          chapterId: "unit-1",
          chapterTitle: "第一章 有理数",
          lessonId: "lesson-junior-1",
          exampleId: "example-junior-1",
          quizId: "quiz-junior-1",
        }),
      ],
    });

    const list = listSqliteChapterSummaries(
      { databasePath, storeFilePath: databasePath },
      { limit: 10 },
    );
    const before = getSqliteChapterDetail("g7", "shang", "unit-1", {
      databasePath,
      storeFilePath: databasePath,
    });

    expect(list[0]?.title).toBe("第一章 有理数");
    expect(before?.lessonCount).toBe(1);

    const updated = updateSqliteChapter(
      {
        gradeId: "g7",
        volumeId: "shang",
        chapterId: "unit-1",
        title: "有理数与数轴",
        summary: "理解有理数的概念，并能结合数轴进行表示。",
      },
      { databasePath, storeFilePath: databasePath },
    );

    expect(updated.title).toBe("有理数与数轴");
    expect(updated.chapter.summary).toBe("理解有理数的概念，并能结合数轴进行表示。");
  });

  it("支持读取并更新例题记录", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-sqlite-example-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g7",
          volumeId: "shang",
          chapterId: "unit-1",
          chapterTitle: "第一章 有理数",
          lessonId: "lesson-junior-1",
          exampleId: "example-junior-1",
          quizId: "quiz-junior-1",
        }),
      ],
    });

    const list = listSqliteWorkedExampleSummaries(
      { databasePath, storeFilePath: databasePath },
      { limit: 10 },
    );
    const before = getSqliteWorkedExampleDetail("g7", "shang", "example-junior-1", {
      databasePath,
      storeFilePath: databasePath,
    });

    expect(list[0]?.chapterTitle).toBe("第一章 有理数");
    expect(before?.workedExample.steps).toHaveLength(1);

    const updated = updateSqliteWorkedExample(
      {
        gradeId: "g7",
        volumeId: "shang",
        exampleId: "example-junior-1",
        title: "例题：比较两个有理数大小",
        summary: "通过数轴和符号法则比较两个数。",
        problem: "比较 -2 与 3 的大小。",
        answer: "-2 < 3",
        commonMistakes: ["忽略负数一定小于正数"],
        steps: [
          { id: "step-1", title: "判断符号", content: "一个负数，一个正数。" },
          { id: "step-2", title: "比较大小", content: "负数小于正数，所以 -2 < 3。" },
        ],
      },
      { databasePath, storeFilePath: databasePath },
    );

    expect(updated.title).toBe("例题：比较两个有理数大小");
    expect(updated.workedExample.commonMistakes).toEqual(["忽略负数一定小于正数"]);
    expect(updated.workedExample.steps).toHaveLength(2);
  });

  it("支持读取并更新测验记录", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-sqlite-quiz-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g7",
          volumeId: "shang",
          chapterId: "unit-1",
          chapterTitle: "第一章 有理数",
          lessonId: "lesson-junior-1",
          exampleId: "example-junior-1",
          quizId: "quiz-junior-1",
        }),
      ],
    });

    const list = listSqliteQuizSummaries({ databasePath, storeFilePath: databasePath }, { limit: 10 });
    const before = getSqliteQuizDetail("g7", "shang", "quiz-junior-1", {
      databasePath,
      storeFilePath: databasePath,
    });

    expect(list[0]?.questionCount).toBe(1);
    expect(before?.quiz.title).toBe("quiz-junior-1");

    const updated = updateSqliteQuiz(
      {
        gradeId: "g7",
        volumeId: "shang",
        quizId: "quiz-junior-1",
        title: "有理数基础小测",
        instructions: "先完成题目，再检查步骤与结果。",
        passingScore: 70,
      },
      { databasePath, storeFilePath: databasePath },
    );

    expect(updated.title).toBe("有理数基础小测");
    expect(updated.quiz.passingScore).toBe(70);
  });

  it("支持读取并更新题目记录", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-sqlite-question-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g7",
          volumeId: "shang",
          chapterId: "unit-1",
          chapterTitle: "第一章 有理数",
          lessonId: "lesson-junior-1",
          exampleId: "example-junior-1",
          quizId: "quiz-junior-1",
        }),
      ],
    });

    const list = listSqliteQuizQuestionSummaries(
      { databasePath, storeFilePath: databasePath },
      { limit: 10 },
    );
    const before = getSqliteQuizQuestionDetail("g7", "shang", "question-001", {
      databasePath,
      storeFilePath: databasePath,
    });

    expect(list[0]?.type).toBe("expression");
    expect(before?.question.stem).toBe("已知表达式");

    const updated = updateSqliteQuizQuestion(
      {
        gradeId: "g7",
        volumeId: "shang",
        questionId: "question-001",
        stem: "化简表达式 2x+3x-1",
        explanation: "先合并同类项，再保留常数项。",
        relatedLessonIds: ["lesson-junior-1"],
        relatedExampleIds: ["example-junior-1"],
        payloadJson: JSON.stringify({
          difficulty: "advanced",
          prompt: "填写化简结果",
          acceptableAnswers: ["5x-1", "5*x-1"],
          placeholder: "填写表达式",
          variable: "x",
        }),
      },
      { databasePath, storeFilePath: databasePath },
    );

    expect(updated.stem).toBe("化简表达式 2x+3x-1");
    expect(updated.question.type).toBe("expression");
    if (updated.question.type === "expression") {
      expect(updated.question.acceptableAnswers).toEqual(["5x-1", "5*x-1"]);
      expect(updated.question.difficulty).toBe("advanced");
    }
  });

  it("导入后为内容记录建立初始 workflow 版本", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-sqlite-workflow-import-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g7",
          volumeId: "shang",
          chapterId: "unit-1",
          chapterTitle: "第一章 有理数",
          lessonId: "lesson-junior-1",
          exampleId: "example-junior-1",
          quizId: "quiz-junior-1",
        }),
      ],
      importedAt: "2026-05-05T16:00:00.000Z",
    });

    const workflow = getSqliteContentWorkflowDetail(
      {
        entityKind: "lesson",
        entityId: "lesson-junior-1",
        gradeId: "g7",
        volumeId: "shang",
      },
      { databasePath, storeFilePath: databasePath },
    );

    expect(workflow).toBeDefined();
    expect(workflow?.metadata.status).toBe("draft");
    expect(workflow?.metadata.currentVersion).toBe(1);
    expect(workflow?.metadata.createdAt).toBe("2026-05-05T16:00:00.000Z");
    expect(workflow?.metadata.createdBy).toBe("system-import");
    expect(workflow?.metadata.createdByRole).toBe("publisher");
    expect(workflow?.metadata.updatedAt).toBe("2026-05-05T16:00:00.000Z");
    expect(workflow?.metadata.updatedBy).toBe("system-import");
    expect(workflow?.metadata.updatedByRole).toBe("publisher");
    expect(workflow?.metadata.lastActionBy).toBe("system-import");
    expect(workflow?.metadata.lastActionByRole).toBe("publisher");
    expect(workflow?.metadata.importBatchId).toContain("import-2026-05-05T16-00-00-000Z");
    expect(workflow?.history).toHaveLength(1);
    expect(workflow?.history[0]).toMatchObject({
      action: "import",
      status: "draft",
      version: 1,
      summary: "从课程快照导入课时",
      actor: "system-import",
      role: "publisher",
      reason: "初始化导入课程快照",
    });
  });

  it("支持对 workflow 执行发布和回滚", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-sqlite-workflow-rollback-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g7",
          volumeId: "shang",
          chapterId: "unit-1",
          chapterTitle: "第一章 有理数",
          lessonId: "lesson-junior-1",
          exampleId: "example-junior-1",
          quizId: "quiz-junior-1",
        }),
      ],
      importedAt: "2026-05-05T17:00:00.000Z",
    });

    updateSqliteChapter(
      {
        gradeId: "g7",
        volumeId: "shang",
        chapterId: "unit-1",
        title: "有理数与数轴",
        summary: "理解有理数和数轴的对应关系。",
      },
      { databasePath, storeFilePath: databasePath },
    );

    const publishedWorkflow = updateSqliteContentStatus(
      {
        entityKind: "chapter",
        entityId: "unit-1",
        gradeId: "g7",
        volumeId: "shang",
        status: "published",
        actor: "teacher-a",
        role: "publisher",
        reason: "主编审核通过",
      },
      { databasePath, storeFilePath: databasePath },
    );

    expect(publishedWorkflow.metadata.status).toBe("published");
    expect(publishedWorkflow.metadata.currentVersion).toBe(3);
    expect(publishedWorkflow.history[0]).toMatchObject({
      action: "status-change",
      status: "published",
      version: 3,
      summary: "发布内容",
      actor: "teacher-a",
      role: "publisher",
      reason: "主编审核通过",
    });
    expect(publishedWorkflow.metadata.lastPublishedAt).toBeDefined();
    expect(publishedWorkflow.metadata.updatedByRole).toBe("publisher");
    expect(publishedWorkflow.metadata.lastActionByRole).toBe("publisher");

    updateSqliteChapter(
      {
        gradeId: "g7",
        volumeId: "shang",
        chapterId: "unit-1",
        title: "有理数与绝对值",
        summary: "理解绝对值与数轴距离。",
      },
      { databasePath, storeFilePath: databasePath },
    );

    const rolledBackWorkflow = rollbackSqliteContentRecord(
      {
        entityKind: "chapter",
        entityId: "unit-1",
        gradeId: "g7",
        volumeId: "shang",
        version: 2,
        actor: "teacher-b",
        role: "reviewer",
        reason: "发现发布稿有误，回退到上一版",
      },
      { databasePath, storeFilePath: databasePath },
    );
    const chapter = getSqliteChapterDetail("g7", "shang", "unit-1", {
      databasePath,
      storeFilePath: databasePath,
    });

    expect(chapter?.title).toBe("有理数与数轴");
    expect(chapter?.summary).toBe("理解有理数和数轴的对应关系。");
    expect(rolledBackWorkflow.metadata.status).toBe("draft");
    expect(rolledBackWorkflow.metadata.currentVersion).toBe(5);
    expect(rolledBackWorkflow.metadata.updatedBy).toBe("teacher-b");
    expect(rolledBackWorkflow.metadata.updatedByRole).toBe("reviewer");
    expect(rolledBackWorkflow.metadata.lastActionBy).toBe("teacher-b");
    expect(rolledBackWorkflow.metadata.lastActionByRole).toBe("reviewer");
    expect(rolledBackWorkflow.metadata.lastPublishedAt).toBeDefined();
    expect(rolledBackWorkflow.history.slice(0, 4)).toMatchObject([
      {
        action: "rollback",
        status: "draft",
        version: 5,
        summary: "回滚到版本 2",
        actor: "teacher-b",
        role: "reviewer",
        reason: "发现发布稿有误，回退到上一版",
      },
      {
        action: "update",
        status: "published",
        version: 4,
        summary: "更新章节内容",
      },
      {
        action: "status-change",
        status: "published",
        version: 3,
        summary: "发布内容",
        role: "publisher",
      },
      {
        action: "update",
        status: "draft",
        version: 2,
        summary: "更新章节内容",
      },
    ]);
  });

  it("支持聚合 workflow 状态摘要和最近变更列表", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "learning-content-sqlite-workflow-dashboard-"));
    tempDirs.push(root);
    const databasePath = path.join(root, "data", "content-store.sqlite");
    const repository = createSqliteLearningContentRepository({
      databasePath,
      storeFilePath: databasePath,
    });

    repository.replace({
      curriculumSlices: [
        createSlice({
          gradeId: "g7",
          volumeId: "shang",
          chapterId: "unit-1",
          chapterTitle: "第一章 有理数",
          lessonId: "lesson-junior-1",
          exampleId: "example-junior-1",
          quizId: "quiz-junior-1",
        }),
      ],
      importedAt: "2026-05-05T08:00:00.000Z",
    });

    updateSqliteLesson(
      {
        lessonId: "lesson-junior-1",
        title: "有理数的分类",
        summary: "能区分正数、负数与零。",
        learningObjectives: ["会分类"],
        keyRules: ["0 单独处理"],
      },
      { databasePath, storeFilePath: databasePath },
    );
    updateSqliteContentStatus(
      {
        entityKind: "lesson",
        entityId: "lesson-junior-1",
        gradeId: "g7",
        volumeId: "shang",
        status: "published",
      },
      { databasePath, storeFilePath: databasePath },
    );

    const summary = getSqliteContentWorkflowStatusSummary({
      databasePath,
      storeFilePath: databasePath,
    });
    const recentEntries = listSqliteRecentWorkflowEntries(
      {
        databasePath,
        storeFilePath: databasePath,
      },
      { limit: 3 },
    );

    expect(summary.totalCount).toBe(5);
    expect(summary.publishedCount).toBe(1);
    expect(summary.draftCount).toBe(4);
    expect(summary.byEntityKind).toMatchObject([
      { entityKind: "chapter", totalCount: 1, draftCount: 1, publishedCount: 0 },
      { entityKind: "lesson", totalCount: 1, draftCount: 0, publishedCount: 1 },
      { entityKind: "worked-example", totalCount: 1, draftCount: 1, publishedCount: 0 },
      { entityKind: "quiz", totalCount: 1, draftCount: 1, publishedCount: 0 },
      { entityKind: "quiz-question", totalCount: 1, draftCount: 1, publishedCount: 0 },
    ]);
    expect(recentEntries).toHaveLength(3);
    expect(recentEntries[0]).toMatchObject({
      entityKind: "lesson",
      entityId: "lesson-junior-1",
      action: "status-change",
      status: "published",
      title: "有理数的分类",
      summary: "发布内容",
      actor: "admin-console",
      reason: "切换为已发布",
    });
    expect(recentEntries[1]).toMatchObject({
      entityKind: "lesson",
      action: "update",
      title: "有理数的分类",
      summary: "更新课时内容",
    });

    const publishedFeed = getSqliteRecentWorkflowFeed(
      {
        databasePath,
        storeFilePath: databasePath,
      },
      {
        status: "published",
        limit: 5,
      },
    );
    const lessonFeed = getSqliteRecentWorkflowFeed(
      {
        databasePath,
        storeFilePath: databasePath,
      },
      {
        entityKind: "lesson",
        limit: 1,
        offset: 1,
      },
    );
    const searchFeed = getSqliteRecentWorkflowFeed(
      {
        databasePath,
        storeFilePath: databasePath,
      },
      {
        query: "分类",
        limit: 10,
      },
    );
    const searchedLessons = listSqliteLessonSummaries(
      {
        databasePath,
        storeFilePath: databasePath,
      },
      {
        limit: 10,
        query: "分类",
      },
    );
    const searchedQuestions = listSqliteQuizQuestionSummaries(
      {
        databasePath,
        storeFilePath: databasePath,
      },
      {
        limit: 10,
        query: "表达式",
      },
    );

    expect(publishedFeed.totalCount).toBe(1);
    expect(publishedFeed.items[0]).toMatchObject({
      entityKind: "lesson",
      action: "status-change",
      status: "published",
    });
    expect(publishedFeed.hasNextPage).toBe(false);
    expect(publishedFeed.hasPreviousPage).toBe(false);

    expect(lessonFeed.totalCount).toBe(3);
    expect(lessonFeed.items).toHaveLength(1);
    expect(lessonFeed.items[0]).toMatchObject({
      entityKind: "lesson",
      action: "update",
    });
    expect(lessonFeed.hasNextPage).toBe(true);
    expect(lessonFeed.hasPreviousPage).toBe(true);

    expect(searchFeed.totalCount).toBe(2);
    expect(searchFeed.items.every((entry) => entry.title.includes("分类") || entry.summary.includes("分类"))).toBe(true);
    expect(searchedLessons).toHaveLength(1);
    expect(searchedLessons[0]?.title).toBe("有理数的分类");
    expect(searchedQuestions).toHaveLength(1);
    expect(searchedQuestions[0]?.stem).toBe("已知表达式");

    const unifiedSearch = searchSqliteAdminContent(
      {
        databasePath,
        storeFilePath: databasePath,
      },
      {
        query: "分类",
        perEntityLimit: 2,
      },
    );

    expect(unifiedSearch.totalCount).toBe(1);
    expect(unifiedSearch.groups).toHaveLength(1);
    expect(unifiedSearch.groups[0]).toMatchObject({
      entityKind: "lesson",
      totalCount: 1,
    });
    expect(unifiedSearch.groups[0]?.results[0]).toMatchObject({
      entityKind: "lesson",
      title: "有理数的分类",
      subtitle: "第一章 有理数",
      matchSources: ["标题"],
      workflowStatus: "published",
      workflowVersion: 3,
      updatedBy: "admin-console",
      latestAction: "status-change",
      latestActionSummary: "发布内容",
      latestActionActor: "admin-console",
      latestActionReason: "切换为已发布",
    });
    expect(unifiedSearch.groups[0]?.results[0]?.importBatchId).toContain("import-2026-05-05T08-00-00-000Z");
    expect(unifiedSearch.groups[0]?.results[0]?.lastPublishedAt).toBeTruthy();
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
