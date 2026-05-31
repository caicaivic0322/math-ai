import { NextRequest, NextResponse } from "next/server";

import {
  listFormulaRecords,
  saveFormulaRecord,
  type FormulaRecordEntityType,
} from "@/lib/formula-records";

export const runtime = "nodejs";

type SaveFormulaRecordBody = {
  entityType?: unknown;
  entityId?: unknown;
  field?: unknown;
  latex?: unknown;
  formats?: unknown;
  note?: unknown;
};

export async function GET(request: NextRequest) {
  try {
    const entityTypeValue = request.nextUrl.searchParams.get("entityType");
    const entityIdValue = request.nextUrl.searchParams.get("entityId");
    const limitValue = request.nextUrl.searchParams.get("limit");

    const records = await listFormulaRecords({
      entityType: parseOptionalEntityType(entityTypeValue),
      entityId: entityIdValue?.trim() || undefined,
      limit: parseOptionalLimit(limitValue),
    });

    return NextResponse.json({
      records,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取公式记录失败。";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveFormulaRecordBody;
    const record = await saveFormulaRecord({
      entityType: parseRequiredEntityType(body.entityType),
      entityId: parseRequiredText(body.entityId, "entityId"),
      field: parseRequiredText(body.field, "field"),
      latex: parseRequiredText(body.latex, "latex"),
      formats: parseOptionalFormats(body.formats),
      note: parseOptionalText(body.note),
    });

    return NextResponse.json({
      record,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存公式记录失败。";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}

function parseRequiredEntityType(value: unknown): FormulaRecordEntityType {
  if (
    value === "question"
    || value === "analysis"
    || value === "lesson"
    || value === "worksheet"
    || value === "poster"
    || value === "other"
  ) {
    return value;
  }

  throw new Error("entityType 非法。");
}

function parseOptionalEntityType(value: string | null): FormulaRecordEntityType | undefined {
  if (!value) {
    return undefined;
  }

  return parseRequiredEntityType(value);
}

function parseRequiredText(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} 必须是非空字符串。`);
  }

  return value;
}

function parseOptionalText(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error("note 必须是字符串。");
  }

  return value;
}

function parseOptionalFormats(value: unknown): Array<"svg" | "png"> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error("formats 必须是数组。");
  }

  return value.map((format) => {
    if (format !== "svg" && format !== "png") {
      throw new Error(`暂不支持的格式: ${String(format)}。`);
    }

    return format;
  });
}

function parseOptionalLimit(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("limit 必须是正整数。");
  }

  return parsed;
}
