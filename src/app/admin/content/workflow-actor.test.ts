import { describe, expect, it } from "vitest";

import {
  canPublishWorkflow,
  canRollbackWorkflow,
  canSwitchWorkflowToDraft,
  getPublishPermissionMessage,
  getRollbackPermissionMessage,
} from "./workflow-actor";

describe("workflow actor permissions", () => {
  it("允许 admin 与 publisher 发布", () => {
    expect(canPublishWorkflow("admin")).toBe(true);
    expect(canPublishWorkflow("editor")).toBe(false);
    expect(canPublishWorkflow("reviewer")).toBe(false);
    expect(canPublishWorkflow("publisher")).toBe(true);
  });

  it("允许 admin、reviewer 与 publisher 回滚", () => {
    expect(canRollbackWorkflow("admin")).toBe(true);
    expect(canRollbackWorkflow("editor")).toBe(false);
    expect(canRollbackWorkflow("reviewer")).toBe(true);
    expect(canRollbackWorkflow("publisher")).toBe(true);
  });

  it("所有角色都可以切回草稿", () => {
    expect(canSwitchWorkflowToDraft("admin")).toBe(true);
    expect(canSwitchWorkflowToDraft("editor")).toBe(true);
    expect(canSwitchWorkflowToDraft("reviewer")).toBe(true);
    expect(canSwitchWorkflowToDraft("publisher")).toBe(true);
  });

  it("为无权限操作返回明确提示", () => {
    expect(getPublishPermissionMessage("admin")).toBeNull();
    expect(getPublishPermissionMessage("editor")).toContain("publisher");
    expect(getPublishPermissionMessage("publisher")).toBeNull();
    expect(getRollbackPermissionMessage("admin")).toBeNull();
    expect(getRollbackPermissionMessage("editor")).toContain("reviewer");
    expect(getRollbackPermissionMessage("publisher")).toBeNull();
  });
});
