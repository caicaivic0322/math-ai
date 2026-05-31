import React from "react";
import type { ReactNode } from "react";
import {
  Angle,
  drawSVG,
  intersections,
  Line,
  Point,
  Rectangle,
  Segment,
} from "@mathigon/euclid";

import type { QuizQuestionFigure } from "@/types/content";

type QuizFigureRendererProps = {
  figure: QuizQuestionFigure;
  className?: string;
};

const geometryPalette = {
  ink: "#274060",
  line: "#44566c",
  accent: "#5b8def",
  emphasis: "#ea6b66",
  panelA: "#dbe8ff",
  panelB: "#ffe0d1",
  panelC: "#dbf5e4",
  fill: "#eef4ff",
};

function GeometryLine(props: React.SVGProps<SVGLineElement>) {
  return <line data-geometry-role="line" {...props} />;
}

function GeometryPath({
  role,
  ...props
}: React.SVGProps<SVGPathElement> & { role: string }) {
  return <path data-geometry-role={role} {...props} />;
}

function GeometryPoint(props: React.SVGProps<SVGCircleElement>) {
  return <circle data-geometry-role="point" {...props} />;
}

function GeometryAngleMarker(props: React.SVGProps<SVGPathElement>) {
  return <path data-geometry-role="angle-marker" {...props} />;
}

function GeometryAngleSector(props: React.SVGProps<SVGPathElement>) {
  return <path data-geometry-role="angle-sector" {...props} />;
}

function GeometryParallelMark(props: React.SVGProps<SVGLineElement>) {
  return <line data-geometry-role="parallel-mark" {...props} />;
}

function GeometryGuideLine(props: React.SVGProps<SVGLineElement>) {
  return <line data-geometry-role="label-guide" {...props} />;
}

function GeometryLabel(props: React.SVGProps<SVGTextElement>) {
  return <text data-geometry-role="label" {...props} />;
}

function GeometryPointLabel(props: React.SVGProps<SVGTextElement>) {
  return <text data-geometry-role="point-label" {...props} />;
}

function FigureTitle({ children }: { children: ReactNode }) {
  return (
    <GeometryLabel x="36" y="42" fontSize="22" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">
      {children}
    </GeometryLabel>
  );
}

function EuclidParallelLinesFigure({ figure }: { figure: Extract<QuizQuestionFigure, { kind: "parallel-lines" }> }) {
  const boardBox = new Rectangle(new Point(44, 28), 332, 164);
  const upperLine = new Line(new Point(72, 78), new Point(348, 78));
  const lowerLine = new Line(new Point(72, 150), new Point(348, 150));
  const transversal = new Segment(new Point(136, 32), new Point(282, 198));
  const upperPoint = intersections(upperLine, new Line(transversal.p1, transversal.p2))[0] ?? new Point(176, 78);
  const lowerPoint = intersections(lowerLine, new Line(transversal.p1, transversal.p2))[0] ?? new Point(240, 150);
  const upperAngle = new Angle(new Point(upperPoint.x + 40, upperPoint.y), upperPoint, transversal.p2);
  const lowerAngle = new Angle(new Point(lowerPoint.x + 40, lowerPoint.y), lowerPoint, transversal.p2);
  const parallelMarksTop = [
    new Segment(new Point(110, 68), new Point(118, 88)),
  ];
  const parallelMarksBottom = [
    new Segment(new Point(110, 140), new Point(118, 160)),
  ];

  return (
    <figure className="overflow-hidden rounded-[1.6rem] border border-[var(--color-border)] bg-white">
      <svg
        viewBox="0 0 420 220"
        role="img"
        aria-label={figure.alt}
        data-geometry-renderer="euclid"
        className="h-auto w-full bg-white"
      >
        <rect width="420" height="220" rx="28" fill="#ffffff" />

        <GeometryPath
          role="line"
          d={drawSVG(upperLine, { box: boardBox })}
          fill="none"
          stroke="#222b38"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <GeometryPath
          role="line"
          d={drawSVG(lowerLine, { box: boardBox })}
          fill="none"
          stroke="#222b38"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <GeometryPath
          role="line"
          d={drawSVG(transversal)}
          fill="none"
          stroke="#222b38"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {parallelMarksTop.concat(parallelMarksBottom).map((segment, index) => (
          <GeometryPath
            key={index}
            role="parallel-mark"
            d={drawSVG(segment)}
            fill="none"
            stroke="#222b38"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ))}

        <GeometryPath
          role="angle-sector"
          d={drawSVG(upperAngle.shape(true, 28, true))}
          fill="rgba(93, 124, 172, 0.08)"
          stroke="none"
        />
        <GeometryPath
          role="angle-sector"
          d={drawSVG(lowerAngle.shape(true, 28, true))}
          fill="rgba(93, 124, 172, 0.08)"
          stroke="none"
        />
        <GeometryPath
          role="angle-marker"
          d={drawSVG(upperAngle.shape(false, 28, true))}
          fill="none"
          stroke="#2d4b73"
          strokeWidth="1.8"
        />
        <GeometryPath
          role="angle-marker"
          d={drawSVG(lowerAngle.shape(false, 28, true))}
          fill="none"
          stroke="#2d4b73"
          strokeWidth="1.8"
        />

        <GeometryGuideLine
          x1={upperPoint.x + 18}
          y1={upperPoint.y + 5}
          x2={upperPoint.x + 90}
          y2={upperPoint.y - 27}
          stroke="#8894a7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <GeometryGuideLine
          x1={lowerPoint.x + 18}
          y1={lowerPoint.y + 10}
          x2={lowerPoint.x + 52}
          y2={lowerPoint.y + 46}
          stroke="#8894a7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <GeometryLabel x={upperPoint.x + 100} y={upperPoint.y - 30} fontSize="17" fill="#2d4b73" fontFamily="Arial" fontWeight="700">{figure.upperLabel}</GeometryLabel>
        <GeometryLabel x={lowerPoint.x + 56} y={lowerPoint.y + 56} fontSize="17" fill="#2d4b73" fontFamily="Arial" fontWeight="700">{figure.lowerLabel}</GeometryLabel>

        <GeometryLabel x="392" y="58" fontSize="18" fill="#222b38" fontFamily="Arial" fontWeight="700">a</GeometryLabel>
        <GeometryLabel x="392" y="194" fontSize="18" fill="#222b38" fontFamily="Arial" fontWeight="700">b</GeometryLabel>
        <GeometryLabel x="108" y="24" fontSize="18" fill="#222b38" fontFamily="Arial" fontWeight="700">c</GeometryLabel>
      </svg>
      {figure.caption ? (
        <figcaption className="px-4 py-3 text-sm leading-6 text-[var(--color-text-muted)]">
          {figure.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Frame({
  figure,
  children,
  viewBox = "0 0 420 220",
}: {
  figure: QuizQuestionFigure;
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-[1.6rem] border border-[var(--color-border)] bg-white">
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={figure.alt}
        className="h-auto w-full bg-[linear-gradient(180deg,#fbfcff_0%,#f5f8ff_100%)]"
      >
        <rect width="420" height="220" rx="28" fill="#fbfcff" />
        {figure.title ? (
          <FigureTitle>{figure.title}</FigureTitle>
        ) : null}
        {children}
      </svg>
      {figure.caption ? (
        <figcaption className="px-4 py-3 text-sm leading-6 text-[var(--color-text-muted)]">
          {figure.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

const graphViewport = {
  left: 72,
  right: 348,
  top: 54,
  bottom: 176,
};

function mapDomainValue(value: number, min: number, max: number, start: number, end: number) {
  if (max === min) {
    return (start + end) / 2;
  }

  return start + ((value - min) / (max - min)) * (end - start);
}

function mapX(value: number, min: number, max: number) {
  return mapDomainValue(value, min, max, graphViewport.left, graphViewport.right);
}

function mapY(value: number, min: number, max: number) {
  return mapDomainValue(value, min, max, graphViewport.bottom, graphViewport.top);
}

function createLinearTicks(min: number, max: number, segments = 4) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [];
  }

  if (max === min) {
    return [min];
  }

  return Array.from({ length: segments + 1 }, (_, index) => min + ((max - min) * index) / segments);
}

function evaluateFunctionGraph(
  figure: Extract<QuizQuestionFigure, { kind: "function-graph" }>,
  x: number,
) {
  if (figure.graphType === "linear") {
    const [slope = 1, intercept = 0] = figure.coefficients;
    return slope * x + intercept;
  }

  const [a = 1, b = 0, c = 0] = figure.coefficients;
  return a * x * x + b * x + c;
}

function getFunctionGraphRange(
  figure: Extract<QuizQuestionFigure, { kind: "function-graph" }>,
) {
  const [domainStart, domainEnd] = figure.domain;
  const sampleCount = 48;
  const sampledValues = Array.from({ length: sampleCount + 1 }, (_, index) => {
    const x = domainStart + ((domainEnd - domainStart) * index) / sampleCount;
    return evaluateFunctionGraph(figure, x);
  });
  const allYValues = sampledValues.concat(
    (figure.highlightedPoints ?? []).map((point) => point.y),
    0,
  );
  const minY = Math.min(...allYValues);
  const maxY = Math.max(...allYValues);

  if (minY === maxY) {
    return [minY - 1, maxY + 1] as const;
  }

  const padding = Math.max(1, (maxY - minY) * 0.18);
  return [minY - padding, maxY + padding] as const;
}

function createFunctionGraphPath(
  figure: Extract<QuizQuestionFigure, { kind: "function-graph" }>,
  yRange: readonly [number, number],
) {
  const [domainStart, domainEnd] = figure.domain;
  const sampleCount = 64;

  return Array.from({ length: sampleCount + 1 }, (_, index) => {
    const x = domainStart + ((domainEnd - domainStart) * index) / sampleCount;
    const y = evaluateFunctionGraph(figure, x);
    const drawX = mapX(x, domainStart, domainEnd);
    const drawY = mapY(y, yRange[0], yRange[1]);

    return `${index === 0 ? "M" : "L"} ${drawX.toFixed(2)} ${drawY.toFixed(2)}`;
  }).join(" ");
}

function getCoordinatePlaneRange(
  points: Array<{ x: number; y: number }> | undefined,
) {
  const source = points && points.length > 0 ? points : [{ x: -3, y: -2 }, { x: 3, y: 2 }];
  const minX = Math.min(...source.map((point) => point.x), -1);
  const maxX = Math.max(...source.map((point) => point.x), 1);
  const minY = Math.min(...source.map((point) => point.y), -1);
  const maxY = Math.max(...source.map((point) => point.y), 1);

  return {
    xMin: minX - 1,
    xMax: maxX + 1,
    yMin: minY - 1,
    yMax: maxY + 1,
  };
}

export function QuizFigureRenderer({ figure, className }: QuizFigureRendererProps) {
  return (
    <div className={className}>
      {figure.kind === "number-line" ? (
        <Frame figure={figure}>
          <GeometryLine x1="56" y1="122" x2="364" y2="122" stroke={geometryPalette.ink} strokeWidth="6" strokeLinecap="round" />
          <polygon points="364,122 346,112 346,132" fill="#274060" />
          <GeometryLine x1="104" y1="92" x2="104" y2="152" stroke="#6d7f99" strokeWidth="4" />
          <GeometryLine x1="210" y1="92" x2="210" y2="152" stroke="#6d7f99" strokeWidth="4" />
          <GeometryLine x1="316" y1="92" x2="316" y2="152" stroke="#6d7f99" strokeWidth="4" />
          <GeometryPoint cx="210" cy="122" r="14" fill={geometryPalette.accent} />
          <GeometryLabel x="92" y="184" fontSize="24" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="600">{figure.leftLabel}</GeometryLabel>
          <GeometryLabel x="200" y="184" fontSize="24" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="600">{figure.middleLabel}</GeometryLabel>
          <GeometryLabel x="306" y="184" fontSize="24" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="600">{figure.rightLabel}</GeometryLabel>
          <GeometryPointLabel x="184" y="82" fontSize="22" fill={geometryPalette.emphasis} fontFamily="Arial" fontWeight="700">{figure.focusLabel}</GeometryPointLabel>
        </Frame>
      ) : null}

      {figure.kind === "expression" ? (
        <Frame figure={figure}>
          <GeometryLabel x="36" y="84" fontSize="28" fill={geometryPalette.accent} fontFamily="Arial" fontWeight="700">{figure.expression}</GeometryLabel>
          <rect x="40" y="118" width="100" height="56" rx="18" fill={geometryPalette.panelA} />
          <rect x="160" y="118" width="100" height="56" rx="18" fill={geometryPalette.panelB} />
          <rect x="280" y="118" width="100" height="56" rx="18" fill={geometryPalette.panelC} />
          <GeometryLabel x="74" y="154" fontSize="24" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="600">{figure.leftBox}</GeometryLabel>
          <GeometryLabel x="194" y="154" fontSize="24" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="600">{figure.middleBox}</GeometryLabel>
          <GeometryLabel x="314" y="154" fontSize="24" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="600">{figure.rightBox}</GeometryLabel>
        </Frame>
      ) : null}

      {figure.kind === "equation-balance" ? (
        <Frame figure={figure}>
          <GeometryLine x1="210" y1="50" x2="210" y2="166" stroke={geometryPalette.line} strokeWidth="8" strokeLinecap="round" />
          <GeometryLine x1="118" y1="98" x2="302" y2="98" stroke={geometryPalette.line} strokeWidth="8" strokeLinecap="round" />
          <GeometryLine x1="148" y1="98" x2="118" y2="140" stroke="#7b8ca4" strokeWidth="4" />
          <GeometryLine x1="272" y1="98" x2="302" y2="140" stroke="#7b8ca4" strokeWidth="4" />
          <rect x="74" y="140" width="92" height="38" rx="14" fill={geometryPalette.panelA} />
          <rect x="254" y="140" width="92" height="38" rx="14" fill={geometryPalette.panelB} />
          <GeometryLabel x="88" y="165" fontSize="22" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="600">{figure.leftText}</GeometryLabel>
          <GeometryLabel x="268" y="165" fontSize="22" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="600">{figure.rightText}</GeometryLabel>
        </Frame>
      ) : null}

      {figure.kind === "angle" ? (
        <Frame figure={figure}>
          <GeometryLine x1="122" y1="164" x2="210" y2="120" stroke={geometryPalette.line} strokeWidth="7" strokeLinecap="round" />
          <GeometryLine x1="210" y1="120" x2="318" y2="120" stroke={geometryPalette.line} strokeWidth="7" strokeLinecap="round" />
          <GeometryAngleMarker d="M246 120 A36 36 0 0 0 226 90" fill="none" stroke={geometryPalette.accent} strokeWidth="6" />
          <GeometryPoint cx="210" cy="120" r="8" fill={geometryPalette.emphasis} />
          <GeometryPointLabel x="202" y="146" fontSize="22" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">{figure.centerLabel}</GeometryPointLabel>
          <GeometryLabel x="236" y="104" fontSize="22" fill={geometryPalette.accent} fontFamily="Arial" fontWeight="700">{figure.angleLabel}</GeometryLabel>
        </Frame>
      ) : null}

      {figure.kind === "parallel-lines" ? (
        <EuclidParallelLinesFigure figure={figure} />
      ) : null}

      {figure.kind === "triangle" ? (
        <Frame figure={figure}>
          <polygon points="92,168 210,66 328,168" fill={geometryPalette.fill} stroke="none" />
          <GeometryLine x1="92" y1="168" x2="210" y2="66" stroke={geometryPalette.line} strokeWidth="4" strokeLinecap="round" />
          <GeometryLine x1="210" y1="66" x2="328" y2="168" stroke={geometryPalette.line} strokeWidth="4" strokeLinecap="round" />
          <GeometryLine x1="92" y1="168" x2="328" y2="168" stroke={geometryPalette.line} strokeWidth="4" strokeLinecap="round" />
          <GeometryLabel x="132" y="118" fontSize="20" fill={geometryPalette.emphasis} fontFamily="Arial" fontWeight="700">{figure.leftSide}</GeometryLabel>
          <GeometryLabel x="252" y="118" fontSize="20" fill={geometryPalette.emphasis} fontFamily="Arial" fontWeight="700">{figure.rightSide}</GeometryLabel>
          <GeometryLabel x="192" y="190" fontSize="20" fill={geometryPalette.accent} fontFamily="Arial" fontWeight="700">{figure.baseSide}</GeometryLabel>
        </Frame>
      ) : null}

      {figure.kind === "congruent-triangles" ? (
        <Frame figure={figure}>
          <polygon points="48,174 138,102 182,174" fill={geometryPalette.fill} stroke="none" />
          <GeometryLine x1="48" y1="174" x2="138" y2="102" stroke={geometryPalette.line} strokeWidth="3.5" strokeLinecap="round" />
          <GeometryLine x1="138" y1="102" x2="182" y2="174" stroke={geometryPalette.line} strokeWidth="3.5" strokeLinecap="round" />
          <GeometryLine x1="48" y1="174" x2="182" y2="174" stroke={geometryPalette.line} strokeWidth="3.5" strokeLinecap="round" />
          <GeometryLabel x="80" y="136" fontSize="18" fill={geometryPalette.emphasis} fontFamily="Arial" fontWeight="700">{figure.leftTriangle.leftSide}</GeometryLabel>
          <GeometryLabel x="145" y="140" fontSize="18" fill={geometryPalette.emphasis} fontFamily="Arial" fontWeight="700">{figure.leftTriangle.rightSide}</GeometryLabel>
          <GeometryLabel x="102" y="197" fontSize="18" fill={geometryPalette.accent} fontFamily="Arial" fontWeight="700">{figure.leftTriangle.baseSide}</GeometryLabel>
          <GeometryPointLabel x="34" y="194" fontSize="18" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">{figure.leftTriangle.vertexLabels[0]}</GeometryPointLabel>
          <GeometryPointLabel x="132" y="92" fontSize="18" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">{figure.leftTriangle.vertexLabels[1]}</GeometryPointLabel>
          <GeometryPointLabel x="186" y="194" fontSize="18" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">{figure.leftTriangle.vertexLabels[2]}</GeometryPointLabel>

          <polygon points="238,174 328,102 372,174" fill={geometryPalette.fill} stroke="none" />
          <GeometryLine x1="238" y1="174" x2="328" y2="102" stroke={geometryPalette.line} strokeWidth="3.5" strokeLinecap="round" />
          <GeometryLine x1="328" y1="102" x2="372" y2="174" stroke={geometryPalette.line} strokeWidth="3.5" strokeLinecap="round" />
          <GeometryLine x1="238" y1="174" x2="372" y2="174" stroke={geometryPalette.line} strokeWidth="3.5" strokeLinecap="round" />
          <GeometryLabel x="270" y="136" fontSize="18" fill={geometryPalette.emphasis} fontFamily="Arial" fontWeight="700">{figure.rightTriangle.leftSide}</GeometryLabel>
          <GeometryLabel x="335" y="140" fontSize="18" fill={geometryPalette.emphasis} fontFamily="Arial" fontWeight="700">{figure.rightTriangle.rightSide}</GeometryLabel>
          <GeometryLabel x="292" y="197" fontSize="18" fill={geometryPalette.accent} fontFamily="Arial" fontWeight="700">{figure.rightTriangle.baseSide}</GeometryLabel>
          <GeometryPointLabel x="224" y="194" fontSize="18" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">{figure.rightTriangle.vertexLabels[0]}</GeometryPointLabel>
          <GeometryPointLabel x="322" y="92" fontSize="18" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">{figure.rightTriangle.vertexLabels[1]}</GeometryPointLabel>
          <GeometryPointLabel x="376" y="194" fontSize="18" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">{figure.rightTriangle.vertexLabels[2]}</GeometryPointLabel>

          <GeometryLabel x="198" y="132" fontSize="22" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">
            {figure.relationLabel ?? "≌"}
          </GeometryLabel>
        </Frame>
      ) : null}

      {figure.kind === "rectangle" ? (
        <Frame figure={figure}>
          <rect x="96" y="74" width="220" height="102" rx="10" fill={geometryPalette.fill} stroke={geometryPalette.line} strokeWidth="6" />
          <GeometryLabel x="188" y="66" fontSize="22" fill={geometryPalette.accent} fontFamily="Arial" fontWeight="700">{figure.widthLabel}</GeometryLabel>
          <GeometryLabel x="64" y="132" fontSize="22" fill={geometryPalette.emphasis} fontFamily="Arial" fontWeight="700">{figure.heightLabel}</GeometryLabel>
          <GeometryLabel x="168" y="132" fontSize="30" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">48</GeometryLabel>
        </Frame>
      ) : null}

      {figure.kind === "coordinate-plane" ? (() => {
        const range = getCoordinatePlaneRange(figure.points);
        const axisX = mapX(0, range.xMin, range.xMax);
        const axisY = mapY(0, range.yMin, range.yMax);
        const xTicks = createLinearTicks(range.xMin, range.xMax);
        const yTicks = createLinearTicks(range.yMin, range.yMax);

        return (
          <Frame figure={figure}>
            {xTicks.map((tick) => (
              <GeometryLine
                key={`x-grid-${tick}`}
                x1={mapX(tick, range.xMin, range.xMax)}
                y1={graphViewport.top}
                x2={mapX(tick, range.xMin, range.xMax)}
                y2={graphViewport.bottom}
                stroke="#d7e0ec"
                strokeWidth="1"
              />
            ))}
            {yTicks.map((tick) => (
              <GeometryLine
                key={`y-grid-${tick}`}
                x1={graphViewport.left}
                y1={mapY(tick, range.yMin, range.yMax)}
                x2={graphViewport.right}
                y2={mapY(tick, range.yMin, range.yMax)}
                stroke="#d7e0ec"
                strokeWidth="1"
              />
            ))}
            <GeometryLine
              x1={graphViewport.left}
              y1={axisY}
              x2={graphViewport.right}
              y2={axisY}
              stroke={geometryPalette.ink}
              strokeWidth="2.5"
            />
            <GeometryLine
              x1={axisX}
              y1={graphViewport.top}
              x2={axisX}
              y2={graphViewport.bottom}
              stroke={geometryPalette.ink}
              strokeWidth="2.5"
            />
            <polygon
              points={`${graphViewport.right},${axisY} ${graphViewport.right - 14},${axisY - 7} ${graphViewport.right - 14},${axisY + 7}`}
              fill={geometryPalette.ink}
            />
            <polygon
              points={`${axisX},${graphViewport.top} ${axisX - 7},${graphViewport.top + 14} ${axisX + 7},${graphViewport.top + 14}`}
              fill={geometryPalette.ink}
            />
            <GeometryLabel x={graphViewport.right + 10} y={axisY + 6} fontSize="18" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">
              {figure.xLabel ?? "x"}
            </GeometryLabel>
            <GeometryLabel x={axisX + 10} y={graphViewport.top - 8} fontSize="18" fill={geometryPalette.ink} fontFamily="Arial" fontWeight="700">
              {figure.yLabel ?? "y"}
            </GeometryLabel>
            {(figure.points ?? []).map((point, index) => {
              const cx = mapX(point.x, range.xMin, range.xMax);
              const cy = mapY(point.y, range.yMin, range.yMax);

              return (
                <React.Fragment key={`${point.label ?? "point"}-${index}`}>
                  <GeometryPoint
                    cx={cx}
                    cy={cy}
                    r={point.emphasis ? 7 : 5.5}
                    fill={point.emphasis ? geometryPalette.emphasis : geometryPalette.accent}
                  />
                  {point.label ? (
                    <GeometryPointLabel
                      x={cx + 8}
                      y={cy - 8}
                      fontSize="17"
                      fill={geometryPalette.ink}
                      fontFamily="Arial"
                      fontWeight="700"
                    >
                      {point.label}
                    </GeometryPointLabel>
                  ) : null}
                </React.Fragment>
              );
            })}
          </Frame>
        );
      })() : null}

      {figure.kind === "function-graph" ? (() => {
        const yRange = getFunctionGraphRange(figure);
        const [domainStart, domainEnd] = figure.domain;
        const axisX = mapX(0, domainStart, domainEnd);
        const axisY = mapY(0, yRange[0], yRange[1]);
        const xTicks = createLinearTicks(domainStart, domainEnd);
        const yTicks = createLinearTicks(yRange[0], yRange[1]);
        const pathData = createFunctionGraphPath(figure, yRange);

        return (
          <Frame figure={figure}>
            {xTicks.map((tick) => (
              <GeometryLine
                key={`fx-grid-${tick}`}
                x1={mapX(tick, domainStart, domainEnd)}
                y1={graphViewport.top}
                x2={mapX(tick, domainStart, domainEnd)}
                y2={graphViewport.bottom}
                stroke="#d7e0ec"
                strokeWidth="1"
              />
            ))}
            {yTicks.map((tick) => (
              <GeometryLine
                key={`fy-grid-${tick}`}
                x1={graphViewport.left}
                y1={mapY(tick, yRange[0], yRange[1])}
                x2={graphViewport.right}
                y2={mapY(tick, yRange[0], yRange[1])}
                stroke="#d7e0ec"
                strokeWidth="1"
              />
            ))}
            <GeometryLine
              x1={graphViewport.left}
              y1={axisY}
              x2={graphViewport.right}
              y2={axisY}
              stroke={geometryPalette.ink}
              strokeWidth="2.5"
            />
            <GeometryLine
              x1={axisX}
              y1={graphViewport.top}
              x2={axisX}
              y2={graphViewport.bottom}
              stroke={geometryPalette.ink}
              strokeWidth="2.5"
            />
            <GeometryPath
              role="function-curve"
              d={pathData}
              fill="none"
              stroke={geometryPalette.accent}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <GeometryLabel x="46" y="76" fontSize="20" fill={geometryPalette.emphasis} fontFamily="Arial" fontWeight="700">
              {figure.equationLabel}
            </GeometryLabel>
            {(figure.highlightedPoints ?? []).map((point, index) => {
              const cx = mapX(point.x, domainStart, domainEnd);
              const cy = mapY(point.y, yRange[0], yRange[1]);

              return (
                <React.Fragment key={`${point.label ?? "graph-point"}-${index}`}>
                  <GeometryPoint
                    cx={cx}
                    cy={cy}
                    r={point.emphasis ? 7 : 5.5}
                    fill={point.emphasis ? geometryPalette.emphasis : geometryPalette.accent}
                  />
                  {point.label ? (
                    <GeometryPointLabel
                      x={cx + 8}
                      y={cy - 10}
                      fontSize="16"
                      fill={geometryPalette.ink}
                      fontFamily="Arial"
                      fontWeight="700"
                    >
                      {point.label}
                    </GeometryPointLabel>
                  ) : null}
                </React.Fragment>
              );
            })}
          </Frame>
        );
      })() : null}
    </div>
  );
}
