import { NextRequest, NextResponse } from "next/server";

import {
  getSqliteLessonDetail,
  updateSqliteLesson,
} from "@/lib/content-store";

export const runtime = "nodejs";

type UpdateLessonBody = {
  title?: unknown;
  summary?: unknown;
  learningObjectives?: unknown;
  keyRules?: unknown;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await context.params;
    const lesson = getSqliteLessonDetail(lessonId);

    if (!lesson) {
      return NextResponse.json(
        {
          error: `未找到课时：${lessonId}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      lesson,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取课时详情失败。";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await context.params;
    const body = (await request.json()) as UpdateLessonBody;
    const lesson = updateSqliteLesson({
      lessonId,
      title: parseRequiredText(body.title, "title"),
      summary: parseRequiredText(body.summary, "summary"),
      learningObjectives: parseTextArray(body.learningObjectives, "learningObjectives"),
      keyRules: parseTextArray(body.keyRules, "keyRules"),
    });

    return NextResponse.json({
      lesson,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存课时失败。";
    const status = message.includes("未找到 lesson 记录") ? 404 : 400;

    return NextResponse.json(
      {
        error: message,
      },
      { status },
    );
  }
}

function parseRequiredText(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} 必须是非空字符串。`);
  }

  return value;
}

function parseTextArray(value: unknown, fieldName: string) {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} 必须是字符串数组。`);
  }

  return value.map((item) => {
    if (typeof item !== "string") {
      throw new Error(`${fieldName} 必须是字符串数组。`);
    }

    return item;
  });
}
