import type {
  QuizAnswerMap,
  QuizAnswerValue,
  QuizBlankAnswerMap,
  QuizDifficulty,
  QuizBlankField,
  QuizMultipleChoiceAnswer,
  QuizQuestion,
  QuizResultSummary,
  QuizQuestionType,
  UnitQuiz,
} from "@/types/content";

export function getQuizDifficultyLabel(difficulty: QuizDifficulty) {
  const labels: Record<QuizDifficulty, string> = {
    basic: "基础",
    advanced: "进阶",
    challenge: "压轴",
  };

  return labels[difficulty];
}

export function getQuizQuestionTypeLabel(type: QuizQuestionType) {
  const labels: Record<QuizQuestionType, string> = {
    "single-choice": "单选题",
    "multiple-choice": "多选题",
    "fill-blank": "填空题",
    numeric: "数值题",
    expression: "表达式题",
    "step-by-step": "分步作答题",
  };

  return labels[type];
}

function normalizeQuizAnswer(answer: string) {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/，/g, ",")
    .replace(/。/g, ".")
    .replace(/：/g, ":")
    .replace(/；/g, ";")
    .replace(/－/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");
}

function isQuizBlankAnswerMap(answer: QuizAnswerValue | null | undefined): answer is QuizBlankAnswerMap {
  return Boolean(answer) && typeof answer === "object" && !Array.isArray(answer);
}

function isQuizMultipleChoiceAnswer(
  answer: QuizAnswerValue | null | undefined,
): answer is QuizMultipleChoiceAnswer {
  return Array.isArray(answer);
}

function getBlankAnswerValue(
  answer: QuizAnswerValue | null | undefined,
  blankId: string,
  blankIndex: number,
) {
  if (typeof answer === "string") {
    return blankIndex === 0 ? answer : "";
  }

  if (isQuizBlankAnswerMap(answer)) {
    return answer[blankId] ?? "";
  }

  return "";
}

export function isQuizAnswerFilled(answer: QuizAnswerValue | null | undefined) {
  if (typeof answer === "string") {
    return Boolean(answer.trim());
  }

  if (isQuizMultipleChoiceAnswer(answer)) {
    return answer.length > 0;
  }

  if (isQuizBlankAnswerMap(answer)) {
    return Object.values(answer).some((value) => Boolean(value.trim()));
  }

  return false;
}

function getSingleChoiceAnswerText(question: QuizQuestion, answerId: string | null) {
  if (question.type !== "single-choice" || !answerId) {
    return null;
  }

  const matchedOption = question.options.find((option) => option.id === answerId);

  if (!matchedOption) {
    return null;
  }

  return `${matchedOption.label}. ${matchedOption.content}`;
}

function getMultipleChoiceAnswerText(
  question: QuizQuestion,
  answerIds: string[],
) {
  if (question.type !== "multiple-choice" || answerIds.length === 0) {
    return null;
  }

  const normalizedIds = new Set(answerIds);
  const matchedOptions = question.options.filter((option) => normalizedIds.has(option.id));

  if (matchedOptions.length === 0) {
    return null;
  }

  return matchedOptions.map((option) => `${option.label}. ${option.content}`).join("；");
}

function formatBlankAnswerSummary(
  values: Array<{ prompt: string; answer: string | null }>,
) {
  const answeredValues = values.filter((item) => item.answer);

  if (answeredValues.length === 0) {
    return null;
  }

  return answeredValues.map((item) => `${item.prompt}：${item.answer}`).join("；");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toExecutableMathExpression(raw: string, variable = "x") {
  const normalized = normalizeQuizAnswer(raw);

  if (!normalized || normalized.includes("=")) {
    return null;
  }

  const variablePattern = variable
    .split("")
    .map((char) => escapeRegExp(char))
    .join("");
  const allowedPattern = new RegExp(`^[0-9+\\-*/^().${variablePattern}]+$`);

  if (!allowedPattern.test(normalized)) {
    return null;
  }

  return normalized
    .replace(new RegExp(`(\\d)(${variablePattern}|\\()`, "g"), "$1*$2")
    .replace(new RegExp(`(${variablePattern}|\\))(\\d)`, "g"), "$1*$2")
    .replace(new RegExp(`(${variablePattern}|\\))(\\()`, "g"), "$1*$2")
    .replace(new RegExp(`(${variablePattern})(${variablePattern})`, "g"), "$1*$2")
    .replace(/\^/g, "**");
}

function evaluateMathExpression(raw: string, variableValue?: number, variable = "x") {
  const executable = toExecutableMathExpression(raw, variable);
  if (!executable) {
    return null;
  }

  try {
    const evaluator = new Function(variable, `return (${executable});`) as (value: number) => number;
    const result = evaluator(variableValue ?? 0);

    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

export function areQuizExpressionsEquivalent(
  left: string,
  right: string,
  variable = "x",
) {
  if (normalizeQuizAnswer(left) === normalizeQuizAnswer(right)) {
    return true;
  }

  const sampleValues = [-3, -2, -1, 0, 1, 2, 3, 4];

  for (const sample of sampleValues) {
    const leftValue = evaluateMathExpression(left, sample, variable);
    const rightValue = evaluateMathExpression(right, sample, variable);

    if (leftValue === null || rightValue === null) {
      return false;
    }

    if (Math.abs(leftValue - rightValue) > 1e-6) {
      return false;
    }
  }

  return true;
}

function isExpectedAnswerMatched(
  learnerValue: string,
  expectation: {
    acceptableAnswers: string[];
    answerKind?: "text" | "numeric" | "expression";
    tolerance?: number;
    variable?: string;
  },
) {
  const normalizedLearnerValue = learnerValue.trim();

  if (!normalizedLearnerValue) {
    return false;
  }

  if (expectation.answerKind === "numeric") {
    const learnerNumeric = evaluateMathExpression(normalizedLearnerValue);
    if (learnerNumeric === null) {
      return false;
    }

    return expectation.acceptableAnswers.some((answer) => {
      const expectedNumeric = evaluateMathExpression(answer);
      if (expectedNumeric === null) {
        return false;
      }

      return Math.abs(learnerNumeric - expectedNumeric) <= (expectation.tolerance ?? 1e-6);
    });
  }

  if (expectation.answerKind === "expression") {
    return expectation.acceptableAnswers.some((answer) =>
      areQuizExpressionsEquivalent(
        normalizedLearnerValue,
        answer,
        expectation.variable ?? "x",
      ),
    );
  }

  const normalizedInput = normalizeQuizAnswer(normalizedLearnerValue);
  return expectation.acceptableAnswers.some(
    (answer) => normalizeQuizAnswer(answer) === normalizedInput,
  );
}

function buildBlankLikeAnswerBreakdown(
  fields: QuizBlankField[],
  rawAnswer: QuizAnswerValue | null,
) {
  return fields.map((field, index) => {
    const learnerValue = getBlankAnswerValue(rawAnswer, field.id, index).trim();

    return {
      id: field.id,
      prompt: field.prompt,
      learnerAnswer: learnerValue || null,
      correctAnswer: field.acceptableAnswers[0] ?? "",
      isCorrect: isExpectedAnswerMatched(learnerValue, field),
    };
  });
}

export function buildQuizResult(
  quiz: UnitQuiz,
  answers: QuizAnswerMap,
): QuizResultSummary {
  const questionResults = quiz.questions.map((question) => {
    const rawAnswer = answers[question.id] ?? null;

    if (question.type === "single-choice") {
      const singleChoiceAnswerId = typeof rawAnswer === "string" ? rawAnswer : null;
      const correctOption = question.options.find(
        (option) => option.id === question.correctOptionId,
      );

      if (!correctOption) {
        throw new Error(`Quiz question ${question.id} is missing a valid correct option.`);
      }

      return {
        questionId: question.id,
        type: question.type,
        stem: question.stem,
        difficulty: question.difficulty,
        figure: question.figure,
        earnedFraction: singleChoiceAnswerId === correctOption.id ? 1 : 0,
        learnerAnswer: getSingleChoiceAnswerText(question, singleChoiceAnswerId),
        correctAnswer: `${correctOption.label}. ${correctOption.content}`,
        isCorrect: singleChoiceAnswerId === correctOption.id,
        explanation: question.explanation,
        relatedLessonIds: question.relatedLessonIds,
        relatedExampleIds: question.relatedExampleIds ?? [],
      };
    }

    if (question.type === "multiple-choice") {
      const learnerAnswerIds = isQuizMultipleChoiceAnswer(rawAnswer)
        ? Array.from(new Set(rawAnswer))
        : [];
      const correctIds = Array.from(new Set(question.correctOptionIds));
      const correctIdSet = new Set(correctIds);
      const correctSelectedCount = learnerAnswerIds.filter((id) => correctIdSet.has(id)).length;
      const incorrectSelectedCount = learnerAnswerIds.filter((id) => !correctIdSet.has(id)).length;
      const earnedFraction = correctIds.length === 0
        ? 0
        : Math.max(0, (correctSelectedCount - incorrectSelectedCount) / correctIds.length);
      const isCorrect =
        incorrectSelectedCount === 0 && correctSelectedCount === correctIds.length;
      const correctOptionsText = question.options
        .filter((option) => correctIdSet.has(option.id))
        .map((option) => `${option.label}. ${option.content}`)
        .join("；");

      return {
        questionId: question.id,
        type: question.type,
        stem: question.stem,
        difficulty: question.difficulty,
        figure: question.figure,
        earnedFraction,
        learnerAnswer: getMultipleChoiceAnswerText(question, learnerAnswerIds),
        correctAnswer: correctOptionsText,
        isCorrect,
        explanation: question.explanation,
        relatedLessonIds: question.relatedLessonIds,
        relatedExampleIds: question.relatedExampleIds ?? [],
      };
    }

    if (question.type === "numeric" || question.type === "expression") {
      const learnerValue = typeof rawAnswer === "string" ? rawAnswer.trim() : "";
      const isCorrect = isExpectedAnswerMatched(learnerValue, {
        acceptableAnswers: question.acceptableAnswers,
        answerKind: question.type === "numeric" ? "numeric" : "expression",
        tolerance: question.type === "numeric" ? question.tolerance : undefined,
        variable: question.type === "expression" ? question.variable : undefined,
      });

      return {
        questionId: question.id,
        type: question.type,
        stem: question.stem,
        difficulty: question.difficulty,
        figure: question.figure,
        earnedFraction: isCorrect ? 1 : 0,
        learnerAnswer: learnerValue || null,
        correctAnswer: question.acceptableAnswers[0] ?? "",
        isCorrect,
        explanation: question.explanation,
        relatedLessonIds: question.relatedLessonIds,
        relatedExampleIds: question.relatedExampleIds ?? [],
      };
    }

    const fields = question.type === "step-by-step" ? question.steps : question.blanks;
    const answerBreakdown = buildBlankLikeAnswerBreakdown(fields, rawAnswer);
    const correctBlankCount = answerBreakdown.filter((item) => item.isCorrect).length;
    const earnedFraction =
      fields.length === 0 ? 0 : correctBlankCount / fields.length;

    return {
      questionId: question.id,
      type: question.type,
      stem: question.stem,
      difficulty: question.difficulty,
      figure: question.figure,
      earnedFraction,
      learnerAnswer: formatBlankAnswerSummary(
        answerBreakdown.map((item) => ({
          prompt: item.prompt,
          answer: item.learnerAnswer,
        })),
      ),
      correctAnswer: answerBreakdown
        .map((item) => `${item.prompt}：${item.correctAnswer}`)
        .join("；"),
      isCorrect: fields.length > 0 && correctBlankCount === fields.length,
      explanation: question.explanation,
      relatedLessonIds: question.relatedLessonIds,
      relatedExampleIds: question.relatedExampleIds ?? [],
      answerBreakdown,
    };
  });

  const correctCount = questionResults.filter((result) => result.isCorrect).length;
  const totalQuestions = quiz.questions.length;
  const earnedPoints = questionResults.reduce((sum, result) => sum + result.earnedFraction, 0);
  const score = totalQuestions === 0 ? 0 : Math.round((earnedPoints / totalQuestions) * 100);
  const suggestedLessonIds = Array.from(
    new Set(
      questionResults
        .filter((result) => !result.isCorrect)
        .flatMap((result) => result.relatedLessonIds),
    ),
  );

  return {
    quizId: quiz.id,
    chapterId: quiz.chapterId,
    totalQuestions,
    correctCount,
    earnedPoints,
    score,
    passingScore: quiz.passingScore,
    passed: score >= quiz.passingScore,
    questionResults,
    suggestedLessonIds,
  };
}

export function serializeQuizAnswers(answers: QuizAnswerMap) {
  return encodeURIComponent(JSON.stringify(answers));
}

export function parseQuizAnswers(serialized: string | null | undefined): QuizAnswerMap {
  if (!serialized) {
    return {};
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(serialized));

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as QuizAnswerMap;
  } catch {
    return {};
  }
}
