export const DEFAULT_ADMIN_WORKFLOW_ACTOR = "admin-console";
export const ADMIN_WORKFLOW_ROLES = ["admin", "editor", "reviewer", "publisher"] as const;
export type AdminWorkflowRole = (typeof ADMIN_WORKFLOW_ROLES)[number];
export const DEFAULT_ADMIN_WORKFLOW_ROLE: AdminWorkflowRole = "admin";
export const ADMIN_ACTOR_COOKIE_NAME = "admin-workflow-actor";
export const ADMIN_ROLE_COOKIE_NAME = "admin-workflow-role";

type WorkflowActorSessionResponse =
  | { actor: string; role: AdminWorkflowRole }
  | { error: string };

export async function readStoredWorkflowActor() {
  const response = await fetch("/api/admin/session", {
    method: "GET",
    cache: "no-store",
  });
  const payload = (await response.json()) as WorkflowActorSessionResponse;

  if (!response.ok || !("actor" in payload)) {
    throw new Error("error" in payload ? payload.error : "读取后台会话失败。");
  }

  return {
    actor: payload.actor || DEFAULT_ADMIN_WORKFLOW_ACTOR,
    role: payload.role || DEFAULT_ADMIN_WORKFLOW_ROLE,
  };
}

export async function writeStoredWorkflowActor(input: {
  actor: string;
  role: AdminWorkflowRole;
}) {
  const response = await fetch("/api/admin/session", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      actor: input.actor.trim() || DEFAULT_ADMIN_WORKFLOW_ACTOR,
      role: input.role,
    }),
  });
  const payload = (await response.json()) as WorkflowActorSessionResponse;

  if (!response.ok || !("actor" in payload)) {
    throw new Error("error" in payload ? payload.error : "保存后台会话失败。");
  }

  return {
    actor: payload.actor || DEFAULT_ADMIN_WORKFLOW_ACTOR,
    role: payload.role || DEFAULT_ADMIN_WORKFLOW_ROLE,
  };
}

export function canPublishWorkflow(role: AdminWorkflowRole) {
  return role === "admin" || role === "publisher";
}

export function canRollbackWorkflow(role: AdminWorkflowRole) {
  return role === "admin" || role === "reviewer" || role === "publisher";
}

export function canSwitchWorkflowToDraft(_role: AdminWorkflowRole) {
  return true;
}

export function getPublishPermissionMessage(role: AdminWorkflowRole) {
  return canPublishWorkflow(role) ? null : `${role} 角色不能发布，只有 admin 或 publisher 可以发布。`;
}

export function getRollbackPermissionMessage(role: AdminWorkflowRole) {
  return canRollbackWorkflow(role) ? null : `${role} 角色不能回滚，只有 admin、reviewer 或 publisher 可以回滚。`;
}
