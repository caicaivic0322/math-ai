import { describe, expect, it } from "vitest";

import { createNextConfig } from "./next.config";

describe("createNextConfig", () => {
  it("在设置 NEXT_DIST_DIR 时使用独立构建目录", () => {
    expect(
      createNextConfig({
        NODE_ENV: "test",
        NEXT_DIST_DIR: ".next-build",
      }).distDir,
    ).toBe(".next-build");
  });

  it("在未设置 NEXT_DIST_DIR 时继续使用默认 .next", () => {
    expect(
      createNextConfig({
        NODE_ENV: "test",
      }).distDir,
    ).toBe(".next");
  });
});
