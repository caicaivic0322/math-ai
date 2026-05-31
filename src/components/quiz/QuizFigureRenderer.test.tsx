import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QuizFigureRenderer } from "./QuizFigureRenderer";
import {
  createCoordinatePlaneFigure,
  createCongruentTrianglesFigure,
  createFunctionGraphFigure,
  createParallelLinesFigure,
} from "../../content/curriculum/quiz-figures";

describe("QuizFigureRenderer", () => {
  it("用组件化 SVG 渲染平行线图，而不是 data url 图片", () => {
    const markup = renderToStaticMarkup(
      <QuizFigureRenderer
        figure={createParallelLinesFigure("测试图", "4x-10°", "3x+20°")}
      />,
    );

    expect(markup).toContain("<svg");
    expect(markup).toContain("3x+20°");
    expect(markup).not.toContain("data:image/svg+xml");
  });

  it("使用统一几何元件输出角弧、点位和直线语义", () => {
    const markup = renderToStaticMarkup(
      <QuizFigureRenderer
        figure={createParallelLinesFigure("测试图", "4x-10°", "3x+20°")}
      />,
    );

    expect(markup).toContain('data-geometry-role="line"');
    expect(markup).toContain('data-geometry-role="angle-marker"');
    expect(markup).toContain('data-geometry-role="label-guide"');
  });

  it("把同位角画成考试常见的扇形高亮，并标出平行符号", () => {
    const markup = renderToStaticMarkup(
      <QuizFigureRenderer
        figure={createParallelLinesFigure("测试图", "73°", "?")}
      />,
    );

    expect(markup).toContain('data-geometry-role="angle-sector"');
    expect(markup).toContain('data-geometry-role="parallel-mark"');
    expect(markup).toContain("73°");
    expect(markup).toContain("?");
  });

  it("平行线图 PoC 使用 Euclid 渲染层输出考试风格图形", () => {
    const markup = renderToStaticMarkup(
      <QuizFigureRenderer
        figure={createParallelLinesFigure("测试图", "73°", "?")}
      />,
    );

    expect(markup).toContain('data-geometry-renderer="euclid"');
    expect(markup).toContain('stroke-width="2.5"');
  });

  it("把 a、b、c 和角表达式移到空白区，并移除顶部标题", () => {
    const markup = renderToStaticMarkup(
      <QuizFigureRenderer
        figure={createParallelLinesFigure("测试图", "4x-10°", "3x+20°")}
      />,
    );

    expect(markup).toContain(">a<");
    expect(markup).toContain(">b<");
    expect(markup).toContain(">c<");
    expect(markup).not.toContain("平行线示意图</text>");
    expect(markup).not.toContain('data-geometry-role="label-box"');
    expect(markup).toContain('x="392" y="58"');
    expect(markup).toContain('x="392" y="194"');
    expect(markup).toContain('x="108" y="24"');
  });

  it("不会用遮罩或过多引导线遮掉中间的直线主体", () => {
    const markup = renderToStaticMarkup(
      <QuizFigureRenderer
        figure={createParallelLinesFigure("测试图", "4x-10°", "3x+20°")}
      />,
    );

    expect(markup).not.toContain('data-geometry-role="label-box"');
    expect((markup.match(/data-geometry-role="label-guide"/g) ?? []).length).toBe(2);
  });

  it("不会渲染干扰读题的交点字母和角编号", () => {
    const markup = renderToStaticMarkup(
      <QuizFigureRenderer
        figure={createParallelLinesFigure("测试图", "73°", "?")}
      />,
    );

    expect(markup).not.toContain('data-geometry-role="point-label"');
    expect(markup).not.toContain("∠1");
    expect(markup).not.toContain("∠2");
  });

  it("全等三角形题会同时展示 ABC 和 DEF 两个三角形", () => {
    const figure = createCongruentTrianglesFigure(
      "全等三角形示意图",
      {
        vertexLabels: ["A", "B", "C"],
        leftSide: "2x+1",
        rightSide: "7",
        baseSide: "10",
      },
      {
        vertexLabels: ["D", "E", "F"],
        leftSide: "11",
        rightSide: "7",
        baseSide: "10",
      },
    );

    const markup = renderToStaticMarkup(<QuizFigureRenderer figure={figure} />);

    expect(markup).toContain(">D<");
    expect(markup).toContain(">E<");
    expect(markup).toContain(">F<");
    expect(markup).toContain(">11<");
  });

  it("全等三角形图不再渲染顶部标题，避免和顶点标注挤在一起", () => {
    const figure = createCongruentTrianglesFigure(
      "全等三角形示意图",
      {
        vertexLabels: ["A", "B", "C"],
        leftSide: "AB",
        rightSide: "BC",
        baseSide: "AC",
      },
      {
        vertexLabels: ["D", "E", "F"],
        leftSide: "DE",
        rightSide: "EF",
        baseSide: "DF",
      },
    );

    const markup = renderToStaticMarkup(<QuizFigureRenderer figure={figure} />);

    expect(markup).not.toContain("全等三角形示意图</text>");
  });

  it("支持渲染平面直角坐标系点位图，供高中解析几何题复用", () => {
    const markup = renderToStaticMarkup(
      <QuizFigureRenderer
        figure={createCoordinatePlaneFigure("坐标系测试图", [
          { x: -2, y: 1, label: "A" },
          { x: 3, y: 2, label: "B", emphasis: true },
        ])}
      />,
    );

    expect(markup).toContain("<svg");
    expect(markup).toContain(">A<");
    expect(markup).toContain(">B<");
  });

  it("支持渲染函数图像，供高中函数题与讲解页复用", () => {
    const markup = renderToStaticMarkup(
      <QuizFigureRenderer
        figure={createFunctionGraphFigure("函数图像测试图", {
          graphType: "quadratic",
          equationLabel: "y=x^2-2x-3",
          domain: [-3, 5],
          coefficients: [1, -2, -3],
          highlightedPoints: [
            { x: -1, y: 0, label: "(-1,0)" },
            { x: 3, y: 0, label: "(3,0)", emphasis: true },
          ],
        })}
      />,
    );

    expect(markup).toContain('data-geometry-role="function-curve"');
    expect(markup).toContain("y=x^2-2x-3");
    expect(markup).toContain("(-1,0)");
    expect(markup).toContain("(3,0)");
  });
});
