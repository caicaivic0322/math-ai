import { NextRequest, NextResponse } from "next/server";

import {
  ensureFormulaRendered,
  type FormulaAssetFormat,
} from "@/lib/formula-render";

export const runtime = "nodejs";

type FormulaRenderRequestBody = {
  latex?: unknown;
  formats?: unknown;
  includePng?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FormulaRenderRequestBody;
    const latex = parseLatex(body.latex);
    const formats = parseFormats(body.formats, body.includePng);
    const result = await ensureFormulaRendered({
      latex,
      formats,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "公式渲染失败。";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}

function parseLatex(latex: unknown): string {
  if (typeof latex !== "string") {
    throw new Error("请求体中的 latex 必须是字符串。");
  }

  return latex;
}

function parseFormats(formats: unknown, includePng: unknown): FormulaAssetFormat[] {
  if (formats === undefined) {
    return includePng === true ? ["svg", "png"] : ["svg"];
  }

  if (!Array.isArray(formats)) {
    throw new Error("formats 必须是字符串数组。");
  }

  const normalizedFormats = formats.map((format) => {
    if (format !== "svg" && format !== "png") {
      throw new Error(`暂不支持的格式: ${String(format)}。目前仅支持 svg/png。`);
    }

    return format;
  });

  return normalizedFormats;
}
