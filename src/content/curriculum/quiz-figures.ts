import type { QuizQuestionFigure } from "@/types/content";

export function createNumberLineFigure(
  alt: string,
  leftLabel: string,
  middleLabel: string,
  rightLabel: string,
  focusLabel: string,
) : QuizQuestionFigure {
  return {
    kind: "number-line",
    title: "数轴示意图",
    alt,
    leftLabel,
    middleLabel,
    rightLabel,
    focusLabel,
  };
}

export function createExpressionFigure(
  alt: string,
  expression: string,
  leftBox: string,
  middleBox: string,
  rightBox: string,
) : QuizQuestionFigure {
  return {
    kind: "expression",
    title: "整式结构图",
    alt,
    expression,
    leftBox,
    middleBox,
    rightBox,
  };
}

export function createEquationBalanceFigure(
  alt: string,
  leftText: string,
  rightText: string,
) : QuizQuestionFigure {
  return {
    kind: "equation-balance",
    title: "方程天平图",
    alt,
    leftText,
    rightText,
  };
}

export function createAngleFigure(
  alt: string,
  centerLabel: string,
  angleLabel: string,
) : QuizQuestionFigure {
  return {
    kind: "angle",
    title: "角度示意图",
    alt,
    centerLabel,
    angleLabel,
  };
}

export function createParallelLinesFigure(
  alt: string,
  upperLabel: string,
  lowerLabel: string,
) : QuizQuestionFigure {
  return {
    kind: "parallel-lines",
    title: "平行线示意图",
    alt,
    upperLabel,
    lowerLabel,
  };
}

export function createTriangleFigure(
  alt: string,
  leftSide: string,
  rightSide: string,
  baseSide: string,
  options?: {
    title?: string;
  },
) : QuizQuestionFigure {
  return {
    kind: "triangle",
    title: options?.title ?? "三角形示意图",
    alt,
    leftSide,
    rightSide,
    baseSide,
  };
}

export function createCongruentTrianglesFigure(
  alt: string,
  leftTriangle: {
    vertexLabels: [string, string, string];
    leftSide: string;
    rightSide: string;
    baseSide: string;
  },
  rightTriangle: {
    vertexLabels: [string, string, string];
    leftSide: string;
    rightSide: string;
    baseSide: string;
  },
  relationLabel = "≌",
) : QuizQuestionFigure {
  return {
    kind: "congruent-triangles",
    alt,
    leftTriangle,
    rightTriangle,
    relationLabel,
  };
}

export function createRectangleFigure(
  alt: string,
  widthLabel: string,
  heightLabel: string,
) : QuizQuestionFigure {
  return {
    kind: "rectangle",
    title: "面积模型图",
    alt,
    widthLabel,
    heightLabel,
  };
}

export function createCoordinatePlaneFigure(
  alt: string,
  points: Array<{ x: number; y: number; label?: string; emphasis?: boolean }>,
  options?: {
    title?: string;
    xLabel?: string;
    yLabel?: string;
  },
): QuizQuestionFigure {
  return {
    kind: "coordinate-plane",
    title: options?.title ?? "平面直角坐标系",
    alt,
    xLabel: options?.xLabel ?? "x",
    yLabel: options?.yLabel ?? "y",
    points,
  };
}

export function createFunctionGraphFigure(
  alt: string,
  options: {
    graphType: "linear" | "quadratic";
    equationLabel: string;
    domain: [number, number];
    coefficients: number[];
    highlightedPoints?: Array<{ x: number; y: number; label?: string; emphasis?: boolean }>;
    title?: string;
  },
): QuizQuestionFigure {
  return {
    kind: "function-graph",
    title: options.title ?? "函数图像示意图",
    alt,
    graphType: options.graphType,
    equationLabel: options.equationLabel,
    domain: options.domain,
    coefficients: options.coefficients,
    highlightedPoints: options.highlightedPoints,
  };
}
