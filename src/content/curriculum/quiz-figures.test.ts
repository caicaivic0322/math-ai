import { describe, expect, it } from "vitest";

import {
  createCoordinatePlaneFigure,
  createFunctionGraphFigure,
  createParallelLinesFigure,
} from "./quiz-figures";

describe("createParallelLinesFigure", () => {
  it("返回结构化图形数据，交给统一渲染器处理", () => {
    const figure = createParallelLinesFigure("测试图", "4x-10°", "3x+20°");

    expect(figure).toMatchObject({
      kind: "parallel-lines",
      alt: "测试图",
      upperLabel: "4x-10°",
      lowerLabel: "3x+20°",
    });
  });

  it("支持构造坐标系点位图，供高中函数与解析几何复用", () => {
    const figure = createCoordinatePlaneFigure("坐标系测试图", [
      { x: -2, y: 1, label: "A" },
      { x: 3, y: 2, label: "B", emphasis: true },
    ]);

    expect(figure).toMatchObject({
      kind: "coordinate-plane",
      alt: "坐标系测试图",
      xLabel: "x",
      yLabel: "y",
    });
  });

  it("支持构造函数图像数据，供高中函数题统一渲染", () => {
    const figure = createFunctionGraphFigure("函数图像测试图", {
      graphType: "quadratic",
      equationLabel: "y=x^2-2x-3",
      domain: [-3, 5],
      coefficients: [1, -2, -3],
      highlightedPoints: [{ x: 3, y: 0, label: "(3,0)" }],
    });

    expect(figure).toMatchObject({
      kind: "function-graph",
      graphType: "quadratic",
      equationLabel: "y=x^2-2x-3",
      domain: [-3, 5],
    });
  });
});
