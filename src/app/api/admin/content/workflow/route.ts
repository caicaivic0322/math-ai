import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  getSqliteContentWorkflowDetail,
  rollbackSqliteContentRecord,
  updateSqliteContentStatus,
  type SqliteContentEntityKind,
  type SqliteContentRecordStatus,
} from "@/lib/content-store";
import {
  ADMIN_ROLE_COOKIE_NAME,
  DEFAULT_ADMIN_WORKFLOW_ROLE,
  canPublishWorkflow,
  canRollbackWorkflow,
  type AdminWorkflowRole,
} from "@/app/admin/content/workflow-actor";

export const runtime = "nodejs";

type WorkflowActionBody = {
  entityKind?: unknown;
  entityId?: unknown;
  gradeId?: unknown;
  volumeId?: unknown;
  status?: unknown;
  version?: unknown;
  actor?: unknown;
  role?: unknown;
  reason?: unknown;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workflow = getSqliteContentWorkflowDetail({
      entityKind: parseEntityKind(searchParams.get("entityKind")),
      entityId: parseRequiredString(searchParams.get("entityId"), "entityId"),
      gradeId: searchParams.get("gradeId") ?? undefined,
      volumeId: searchParams.get("volumeId") ?? undefined,
    });

    if (!workflow) {
      return NextResponse.json({ error: "未找到 workflow 记录。" }, { status: 404 });
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取 workflow 失败。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as WorkflowActionBody;
    const sessionRole = await readSessionRole();
    const nextStatus = parseStatus(body.status);
    assertWorkflowStatusPermission(sessionRole, nextStatus);
    const workflow = updateSqliteContentStatus({
      entityKind: parseEntityKind(body.entityKind),
      entityId: parseRequiredString(body.entityId, "entityId"),
      gradeId: parseOptionalString(body.gradeId),
      volumeId: parseOptionalString(body.volumeId),
      status: nextStatus,
      actor: parseOptionalString(body.actor),
      role: sessionRole,
      reason: parseOptionalString(body.reason),
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新 workflow 状态失败。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WorkflowActionBody;
    const sessionRole = await readSessionRole();
    assertWorkflowRollbackPermission(sessionRole);
    const workflow = rollbackSqliteContentRecord({
      entityKind: parseEntityKind(body.entityKind),
      entityId: parseRequiredString(body.entityId, "entityId"),
      gradeId: parseOptionalString(body.gradeId),
      volumeId: parseOptionalString(body.volumeId),
      version: parseVersion(body.version),
      actor: parseOptionalString(body.actor),
      role: sessionRole,
      reason: parseOptionalString(body.reason),
    });

    return NextResponse.json({ workflow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "回滚 workflow 失败。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function parseEntityKind(value: unknown): SqliteContentEntityKind {
  if (
    value === "chapter"
    || value === "lesson"
    || value === "worked-example"
    || value === "quiz"
    || value === "quiz-question"
  ) {
    return value;
  }

  throw new Error("entityKind 非法。");
}

function parseStatus(value: unknown): SqliteContentRecordStatus {
  if (value === "draft" || value === "published") {
    return value;
  }

  throw new Error("status 非法。");
}

function parseVersion(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error("version 必须是正整数。");
  }

  return value;
}

function parseRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} 必须是非空字符串。`);
  }

  return value;
}

function parseOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseRole(value: unknown) {
  return value === "admin" || value === "editor" || value === "reviewer" || value === "publisher"
    ? value
    : undefined;
}

async function readSessionRole(): Promise<AdminWorkflowRole> {
  const cookieStore = await cookies();
  const role = cookieStore.get(ADMIN_ROLE_COOKIE_NAME)?.value;
  return parseRole(role) ?? DEFAULT_ADMIN_WORKFLOW_ROLE;
}

function assertWorkflowStatusPermission(role: AdminWorkflowRole, status: SqliteContentRecordStatus) {
  if (status === "published" && !canPublishWorkflow(role)) {
    throw new Error("当前会话角色无权发布内容，只有 admin 或 publisher 可以发布。");
  }
}

function assertWorkflowRollbackPermission(role: AdminWorkflowRole) {
  if (!canRollbackWorkflow(role)) {
    throw new Error("当前会话角色无权回滚内容，只有 admin、reviewer 或 publisher 可以回滚。");
  }
}
