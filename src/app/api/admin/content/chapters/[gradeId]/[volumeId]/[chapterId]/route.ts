import { NextRequest, NextResponse } from "next/server";

import {
  getSqliteChapterDetail,
  updateSqliteChapter,
} from "@/lib/content-store";

export const runtime = "nodejs";

type UpdateChapterBody = {
  title?: unknown;
  summary?: unknown;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ gradeId: string; volumeId: string; chapterId: string }> },
) {
  try {
    const { gradeId, volumeId, chapterId } = await context.params;
    const chapter = getSqliteChapterDetail(gradeId, volumeId, chapterId);

    if (!chapter) {
      return NextResponse.json(
        {
          error: `未找到章节：${gradeId}/${volumeId}/${chapterId}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取章节详情失败。";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ gradeId: string; volumeId: string; chapterId: string }> },
) {
  try {
    const { gradeId, volumeId, chapterId } = await context.params;
    const body = (await request.json()) as UpdateChapterBody;
    const chapter = updateSqliteChapter({
      gradeId,
      volumeId,
      chapterId,
      title: parseRequiredText(body.title, "title"),
      summary: parseRequiredText(body.summary, "summary"),
    });

    return NextResponse.json({ chapter });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存章节失败。";
    const status = message.includes("未找到 chapter 记录") ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

function parseRequiredText(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} 必须是非空字符串。`);
  }

  return value;
}
