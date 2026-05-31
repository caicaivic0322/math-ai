import { describe, expect, it } from "vitest";

import { curriculumSlices } from "./index";

const juniorSlices = curriculumSlices.filter((slice) => slice.grade.stageId !== "senior");

describe("单元测验整体提难", () => {
  it("继续补齐八下、九下等尚未接入的新册别，至少接入到 29 个单元切片", () => {
    const chapterIds = juniorSlices.map((slice) => slice.chapter.id);

    expect(juniorSlices.length).toBeGreaterThanOrEqual(29);
    expect(chapterIds).toContain("g7-xia-unit-2");
    expect(chapterIds).toContain("g7-xia-unit-3");
    expect(chapterIds).toContain("g7-xia-unit-4");
    expect(chapterIds).toContain("g7-xia-unit-5");
    expect(chapterIds).toContain("g7-xia-unit-6");
    expect(chapterIds).toContain("g8-shang-unit-2");
    expect(chapterIds).toContain("g8-shang-unit-3");
    expect(chapterIds).toContain("g8-shang-unit-4");
    expect(chapterIds).toContain("g8-shang-unit-5");
    expect(chapterIds).toContain("g9-shang-unit-2");
    expect(chapterIds).toContain("g9-shang-unit-3");
    expect(chapterIds).toContain("g9-shang-unit-4");
    expect(chapterIds).toContain("g9-shang-unit-5");
    expect(chapterIds).toContain("g8-xia-unit-1");
    expect(chapterIds).toContain("g8-xia-unit-2");
    expect(chapterIds).toContain("g8-xia-unit-3");
    expect(chapterIds).toContain("g8-xia-unit-4");
    expect(chapterIds).toContain("g8-xia-unit-5");
    expect(chapterIds).toContain("g9-xia-unit-1");
    expect(chapterIds).toContain("g9-xia-unit-2");
    expect(chapterIds).toContain("g9-xia-unit-3");
    expect(chapterIds).toContain("g9-xia-unit-4");
  });

  it("所有已接入单元测验都提升到 2/4/4 的难度结构，且及格线不低于 80", () => {
    for (const slice of juniorSlices) {
      const basics = slice.quiz.questions.filter((question) => question.difficulty === "basic");
      const advanced = slice.quiz.questions.filter((question) => question.difficulty === "advanced");
      const challenge = slice.quiz.questions.filter((question) => question.difficulty === "challenge");

      expect(slice.quiz.instructions).toContain("基础 2 题、进阶 4 题、压轴 4 题");
      expect(slice.quiz.passingScore).toBeGreaterThanOrEqual(80);
      expect(basics).toHaveLength(2);
      expect(advanced).toHaveLength(4);
      expect(challenge).toHaveLength(4);
    }
  });
});
