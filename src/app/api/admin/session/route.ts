import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_ACTOR_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
  ADMIN_WORKFLOW_ROLES,
  type AdminWorkflowRole,
} from "@/app/admin/content/workflow-actor";
import {
  ADMIN_AUTH_ROLE_COOKIE_NAME,
  ADMIN_USERNAME_COOKIE_NAME,
  normalizeAdminRole,
  normalizeAdminUsername,
} from "@/lib/auth";

export const runtime = "nodejs";

type SessionBody = {
  actor?: unknown;
  role?: unknown;
};

export async function GET() {
  const cookieStore = await cookies();
  const username = normalizeAdminUsername(cookieStore.get(ADMIN_USERNAME_COOKIE_NAME)?.value);
  const accountRole = normalizeAdminRole(cookieStore.get(ADMIN_AUTH_ROLE_COOKIE_NAME)?.value);
  return NextResponse.json({
    actor: normalizeActor(cookieStore.get(ADMIN_ACTOR_COOKIE_NAME)?.value, username),
    role: normalizeRole(cookieStore.get(ADMIN_ROLE_COOKIE_NAME)?.value, accountRole),
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as SessionBody;
    const cookieStore = await cookies();
    const username = normalizeAdminUsername(cookieStore.get(ADMIN_USERNAME_COOKIE_NAME)?.value);
    const accountRole = normalizeAdminRole(cookieStore.get(ADMIN_AUTH_ROLE_COOKIE_NAME)?.value);
    const actor = normalizeActor(typeof body.actor === "string" ? body.actor : undefined, username);
    const role = normalizeRole(undefined, accountRole);
    const response = NextResponse.json({ actor, role });

    response.cookies.set(ADMIN_ACTOR_COOKIE_NAME, actor, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set(ADMIN_ROLE_COOKIE_NAME, role, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存后台会话失败。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function normalizeActor(value: string | undefined, fallbackActor: string) {
  const normalized = value?.trim();
  return normalized || fallbackActor;
}

function normalizeRole(value: unknown, fallbackRole: AdminWorkflowRole): AdminWorkflowRole {
  return typeof value === "string" && ADMIN_WORKFLOW_ROLES.includes(value as AdminWorkflowRole)
    ? value as AdminWorkflowRole
    : fallbackRole;
}
