import { describe, expect, it } from "vitest";

import { g8ShangUnit1Slice } from "./curriculum/g8-shang-unit-1";

describe("全等三角形题文案规范", () => {
  it("使用标准角记号而不是口语化描述", () => {
    const question = g8ShangUnit1Slice.quiz.questions.find((item) => item.id === "q2");

    expect(question?.type).toBe("fill-blank");
    if (!question || question.type !== "fill-blank") return;

    const angleBlank = question.blanks.find((blank) => blank.id === "angle");

    expect(question.stem).toContain("∠B");
    expect(angleBlank?.prompt).toContain("∠B");
    expect(angleBlank?.hint).toContain("∠E");
    expect(angleBlank?.acceptableAnswers).toEqual(["∠E"]);
  });
});
