import { NextRequest, NextResponse } from "next/server";

import {
  getSqliteWorkedExampleDetail,
  updateSqliteWorkedExample,
} from "@/lib/content-store";

export const runtime = "nodejs";

type UpdateWorkedExampleBody = {
  title?: unknown;
  summary?: unknown;
  problem?: unknown;
  answer?: unknown;
  commonMistakes?: unknown;
  steps?: unknown;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ gradeId: string; volumeId: string; exampleId: string }> },
) {
  try {
    const { gradeId, volumeId, exampleId } = await context.params;
    const workedExample = getSqliteWorkedExampleDetail(gradeId, volumeId, exampleId);

    if (!workedExample) {
      return NextResponse.json(
        {
          error: `未找到例题：${gradeId}/${volumeId}/${exampleId}`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ workedExample });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取例题详情失败。";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ gradeId: string; volumeId: string; exampleId: string }> },
) {
  try {
    const { gradeId, volumeId, exampleId } = await context.params;
    const body = (await request.json()) as UpdateWorkedExampleBody;
    const workedExample = updateSqliteWorkedExample({
      gradeId,
      volumeId,
      exampleId,
      title: parseRequiredText(body.title, "title"),
      summary: parseRequiredText(body.summary, "summary"),
      problem: parseRequiredText(body.problem, "problem"),
      answer: parseRequiredText(body.answer, "answer"),
      commonMistakes: parseTextArray(body.commonMistakes, "commonMistakes"),
      steps: parseStepArray(body.steps),
    });

    return NextResponse.json({ workedExample });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存例题失败。";
    const status = message.includes("未找到 worked example 记录") ? 404 : 400;

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

function parseStepArray(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error("steps 必须是步骤数组。");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error("steps 必须是步骤数组。");
    }

    const step = item as Record<string, unknown>;

    if (typeof step.title !== "string" || typeof step.content !== "string") {
      throw new Error("每个步骤都必须包含 title 和 content。");
    }

    return {
      id: typeof step.id === "string" && step.id.trim() ? step.id : `step-${index + 1}`,
      title: step.title,
      content: step.content,
    };
  });
}
