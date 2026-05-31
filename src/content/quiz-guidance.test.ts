import { describe, expect, it } from "vitest";

import { curriculumSlices } from "./index";

describe("图形填空题提示规范", () => {
  it("每个图形填空空位都提供提示词，且不在占位符中泄露答案样式", () => {
    const fillBlankQuestions = curriculumSlices.flatMap((slice) =>
      slice.quiz.questions.filter((question) => question.type === "fill-blank"),
    );

    expect(fillBlankQuestions.length).toBeGreaterThan(0);

    for (const question of fillBlankQuestions) {
      for (const blank of question.blanks) {
        expect(blank.hint, `${question.id}:${blank.id} 缺少提示词`).toBeTruthy();
        expect(blank.placeholder ?? "", `${question.id}:${blank.id} 占位符不应出现示例答案`).not.toMatch(
          /^如\s|例如|比如/,
        );
      }
    }
  });
});
