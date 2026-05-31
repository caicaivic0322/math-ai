import { describe, expect, it } from "vitest";

import {
  areQuizExpressionsEquivalent,
  buildQuizResult,
  parseQuizAnswers,
  serializeQuizAnswers,
} from "./index";

describe("buildQuizResult", () => {
  it("为多空填空题按空给分，并在部分正确时保留解析信息", () => {
    const quiz = {
      id: "quiz-1",
      chapterId: "chapter-1",
      title: "测试",
      instructions: "测试",
      passingScore: 60,
      questions: [
        {
          id: "q1",
          quizId: "quiz-1",
          type: "fill-blank",
          difficulty: "challenge",
          stem: "看图列式并填写两个空",
          explanation: "先列方程，再求解。",
          relatedLessonIds: ["lesson-1"],
          blanks: [
            {
              id: "equation",
              prompt: "方程",
              acceptableAnswers: ["x(x+2)=48"],
            },
            {
              id: "root",
              prompt: "解",
              acceptableAnswers: ["6"],
            },
          ],
        },
      ],
    } as const;

    const result = buildQuizResult(quiz as never, {
      q1: {
        equation: "x(x+2)=48",
        root: "5",
      },
    } as never);

    expect(result.score).toBe(50);
    expect(result.correctCount).toBe(0);
    expect(result.questionResults[0]).toMatchObject({
      isCorrect: false,
      earnedFraction: 0.5,
      learnerAnswer: "方程：x(x+2)=48；解：5",
      correctAnswer: "方程：x(x+2)=48；解：6",
    });
  });

  it("支持多选题的部分给分、数值题和表达式题判分", () => {
    const quiz = {
      id: "quiz-2",
      chapterId: "chapter-1",
      title: "综合测试",
      instructions: "测试",
      passingScore: 60,
      questions: [
        {
          id: "q1",
          quizId: "quiz-2",
          type: "multiple-choice",
          difficulty: "advanced",
          stem: "哪些说法正确？",
          explanation: "A、C 正确。",
          relatedLessonIds: ["lesson-1"],
          options: [
            { id: "a", label: "A", content: "甲" },
            { id: "b", label: "B", content: "乙" },
            { id: "c", label: "C", content: "丙" },
          ],
          correctOptionIds: ["a", "c"],
        },
        {
          id: "q2",
          quizId: "quiz-2",
          type: "numeric",
          difficulty: "basic",
          stem: "填写结果",
          prompt: "结果",
          acceptableAnswers: ["1/2", "0.5"],
          tolerance: 1e-6,
          explanation: "1/2 等于 0.5。",
          relatedLessonIds: ["lesson-1"],
        },
        {
          id: "q3",
          quizId: "quiz-2",
          type: "expression",
          difficulty: "challenge",
          stem: "化简表达式",
          prompt: "结果",
          acceptableAnswers: ["5x+1"],
          variable: "x",
          explanation: "合并同类项即可。",
          relatedLessonIds: ["lesson-1"],
        },
      ],
    } as const;

    const result = buildQuizResult(quiz as never, {
      q1: ["a"],
      q2: "0.5",
      q3: "2(x-1)+3(x+1)",
    } as never);

    expect(result.questionResults[0]).toMatchObject({
      isCorrect: false,
      earnedFraction: 0.5,
      learnerAnswer: "A. 甲",
      correctAnswer: "A. 甲；C. 丙",
    });
    expect(result.questionResults[1]).toMatchObject({
      isCorrect: true,
      learnerAnswer: "0.5",
      correctAnswer: "1/2",
    });
    expect(result.questionResults[2]).toMatchObject({
      isCorrect: true,
      learnerAnswer: "2(x-1)+3(x+1)",
      correctAnswer: "5x+1",
    });
  });

  it("支持分步作答题按步骤给分", () => {
    const quiz = {
      id: "quiz-3",
      chapterId: "chapter-1",
      title: "分步测试",
      instructions: "测试",
      passingScore: 60,
      questions: [
        {
          id: "q1",
          quizId: "quiz-3",
          type: "step-by-step",
          difficulty: "challenge",
          stem: "按步骤解题",
          explanation: "先列方程，再写解。",
          relatedLessonIds: ["lesson-1"],
          steps: [
            {
              id: "step-1",
              title: "第一步",
              prompt: "方程",
              hint: "先列式",
              acceptableAnswers: ["x+2=5"],
            },
            {
              id: "step-2",
              title: "第二步",
              prompt: "解",
              hint: "求出 x",
              acceptableAnswers: ["3"],
              answerKind: "numeric",
            },
          ],
        },
      ],
    } as const;

    const result = buildQuizResult(quiz as never, {
      q1: {
        "step-1": "x+2=5",
        "step-2": "4",
      },
    } as never);

    expect(result.questionResults[0]).toMatchObject({
      isCorrect: false,
      earnedFraction: 0.5,
      learnerAnswer: "方程：x+2=5；解：4",
      correctAnswer: "方程：x+2=5；解：3",
    });
  });
});

describe("quiz answer serialization", () => {
  it("支持序列化和解析多空填空与多选答案", () => {
    const serialized = serializeQuizAnswers({
      q1: {
        equation: "x(x+2)=48",
        root: "6",
      },
      q2: ["a", "c"],
    } as never);

    expect(parseQuizAnswers(serialized)).toEqual({
      q1: {
        equation: "x(x+2)=48",
        root: "6",
      },
      q2: ["a", "c"],
    });
  });
});

describe("expression equivalence", () => {
  it("能对基础代数表达式做等价判断", () => {
    expect(areQuizExpressionsEquivalent("2(x-1)+3(x+1)", "5x+1")).toBe(true);
    expect(areQuizExpressionsEquivalent("(x-1)^2", "x^2-2x+1")).toBe(true);
    expect(areQuizExpressionsEquivalent("x^2+1", "x^2-1")).toBe(false);
  });
});
