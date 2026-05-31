import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { VideoPlaceholderCard } from "./VideoPlaceholderCard";

describe("VideoPlaceholderCard", () => {
  it("keeps the placeholder state when no video source exists", () => {
    const markup = renderToStaticMarkup(
      <VideoPlaceholderCard
        video={{
          title: "板书微课：坐标系里的读点和平移",
          durationLabel: "6 分钟",
          description: "把点的坐标和平移规律串起来。",
        }}
      />,
    );

    expect(markup).toContain("视频占位");
    expect(markup).not.toContain("<video");
  });

  it("renders a playable video when a source is available", () => {
    const markup = renderToStaticMarkup(
      <VideoPlaceholderCard
        video={{
          title: "板书微课：解不等式组的公共部分怎么看",
          durationLabel: "6 分钟",
          description: "用数轴对照不等式组的解集。",
          src: "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4",
          posterSrc: "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg",
          status: "rendered",
        }}
      />,
    );

    expect(markup).toContain("<video");
    expect(markup).toMatch(/<video\b[^>]*\bcontrols(?:=|[\s>])/);
    expect(markup).toContain(
      "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.mp4",
    );
    expect(markup).toContain(
      "/videos/chapter-videos/g7-xia-unit-5-yi-yuan-yi-ci-bu-deng-shi.jpg",
    );
    expect(markup).not.toContain("视频占位");
  });
});
