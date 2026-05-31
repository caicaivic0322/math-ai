import { NextRequest, NextResponse } from "next/server";

import {
  getSqliteQuizDetail,
  updateSqliteQuiz,
} from "@/lib/content-store";

export const runtime = "nodejs";

type UpdateQuizBody = {
  title?: unknown;
  instructions?: unknown;
  passingScore?: unknown;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ gradeId: string; volumeId: string; quizId: string }> },
) {
  try {
    const { gradeId, volumeId, quizId } = await context.params;
    const quiz = getSqliteQuizDetail(gradeId, volumeId, quizId);

    if (!quiz) {
      return NextResponse.json(
        {
          error: `未找到测验：${gradeId}/${volumeId}/${quizId}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取测验详情失败。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ gradeId: string; volumeId: string; quizId: string }> },
) {
  try {
    const { gradeId, volumeId, quizId } = await context.params;
    const body = (await request.json()) as UpdateQuizBody;
    const quiz = updateSqliteQuiz({
      gradeId,
      volumeId,
      quizId,
      title: parseRequiredText(body.title, "title"),
      instructions: parseRequiredText(body.instructions, "instructions"),
      passingScore: parsePassingScore(body.passingScore),
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存测验失败。";
    const status = message.includes("未找到 quiz 记录") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

function parseRequiredText(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} 必须是非空字符串。`);
  }

  return value;
}

function parsePassingScore(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error("passingScore 必须是数字。");
  }

  if (value < 0 || value > 100) {
    throw new Error("passingScore 必须在 0 到 100 之间。");
  }

  return value;
}
