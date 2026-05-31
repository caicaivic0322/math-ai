import { describe, expect, it } from "vitest";

import {
  g7ShangUnit1Slice,
  g7ShangUnit2Slice,
  g7ShangUnit3Slice,
} from "./curriculum";
import { curriculumSlices } from "./index";

const juniorSlices = curriculumSlices.filter((slice) => slice.grade.stageId !== "senior");

describe("代表性提难题检查", () => {
  it("七上前三个单元的代表题升级为更强的信息提取或两步推理", () => {
    const q1 = g7ShangUnit1Slice.quiz.questions.find((question) => question.id === "q3");
    const q2 = g7ShangUnit2Slice.quiz.questions.find((question) => question.id === "q3");
    const q3 = g7ShangUnit3Slice.quiz.questions.find((question) => question.id === "q3");

    expect(q1?.type).toBe("fill-blank");
    expect(q2?.type).toBe("fill-blank");
    expect(q3?.type).toBe("fill-blank");
    if (!q1 || q1.type !== "fill-blank") return;
    if (!q2 || q2.type !== "fill-blank") return;
    if (!q3 || q3.type !== "fill-blank") return;

    expect(q1.blanks[1]?.prompt).toContain("到数 2 的距离");
    expect(q1.blanks[1]?.acceptableAnswers).toContain("5");

    expect(q2.blanks[1]?.prompt).toContain("字母项系数和");
    expect(q2.blanks[1]?.acceptableAnswers).toContain("1");

    expect(q3.stem).toContain("2x + 3 = 11");
    expect(q3.blanks[0]?.acceptableAnswers).toContain("2x=8");
    expect(q3.blanks[1]?.acceptableAnswers).toContain("4");
  });

  it("29 个单元的 q3 都升级为带建模或综合判断的代表题", () => {
    for (const slice of juniorSlices) {
      const q3 = slice.quiz.questions.find((question) => question.id === "q3");

      expect(q3?.type).toBe("fill-blank");
      if (!q3 || q3.type !== "fill-blank") return;

      expect(q3.blanks.length).toBeGreaterThanOrEqual(2);

      const reasoningText = [
        q3.stem,
        q3.blanks[1]?.prompt ?? "",
        q3.blanks[1]?.hint ?? "",
        q3.explanation,
      ].join(" ");

      expect(reasoningText).toMatch(
        /判断|说明|理由|依据|关系|方法|思路|模型|是否|比较|规律|方案/,
      );
    }
  });
});
