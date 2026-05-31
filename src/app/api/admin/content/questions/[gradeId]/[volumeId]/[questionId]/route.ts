import { NextRequest, NextResponse } from "next/server";

import {
  getSqliteQuizQuestionDetail,
  updateSqliteQuizQuestion,
} from "@/lib/content-store";

export const runtime = "nodejs";

type UpdateQuestionBody = {
  stem?: unknown;
  explanation?: unknown;
  relatedLessonIds?: unknown;
  relatedExampleIds?: unknown;
  payloadJson?: unknown;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ gradeId: string; volumeId: string; questionId: string }> },
) {
  try {
    const { gradeId, volumeId, questionId } = await context.params;
    const question = getSqliteQuizQuestionDetail(gradeId, volumeId, questionId);

    if (!question) {
      return NextResponse.json(
        {
          error: `未找到题目：${gradeId}/${volumeId}/${questionId}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取题目详情失败。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ gradeId: string; volumeId: string; questionId: string }> },
) {
  try {
    const { gradeId, volumeId, questionId } = await context.params;
    const body = (await request.json()) as UpdateQuestionBody;
    const question = updateSqliteQuizQuestion({
      gradeId,
      volumeId,
      questionId,
      stem: parseRequiredText(body.stem, "stem"),
      explanation: parseRequiredText(body.explanation, "explanation"),
      relatedLessonIds: parseTextArray(body.relatedLessonIds, "relatedLessonIds"),
      relatedExampleIds: parseTextArray(body.relatedExampleIds, "relatedExampleIds"),
      payloadJson: parseRequiredText(body.payloadJson, "payloadJson"),
    });

    return NextResponse.json({ question });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存题目失败。";
    const status = message.includes("未找到 quiz question 记录") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
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
