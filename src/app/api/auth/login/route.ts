import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_ROLE_COOKIE_NAME,
  ADMIN_SESSION_TOKEN,
  ADMIN_USERNAME_COOKIE_NAME,
  buildLoginRedirect,
} from "@/lib/auth";
import {
  ADMIN_ACTOR_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
} from "@/app/admin/content/workflow-actor";
import { findStoredAdminAccount } from "@/lib/admin-account-store";

export const runtime = "nodejs";

type LoginFormBody = {
  username?: unknown;
  password?: unknown;
  redirectTo?: unknown;
};

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isForm = contentType.includes("application/x-www-form-urlencoded")
    || contentType.includes("multipart/form-data");

  let username = "";
  let password = "";
  let redirectTo = "/";

  if (isForm) {
    const formData = await request.formData();
    username = String(formData.get("username") ?? "");
    password = String(formData.get("password") ?? "");
    redirectTo = buildLoginRedirect(String(formData.get("redirectTo") ?? "/"));
  } else {
    const body = (await request.json()) as LoginFormBody;
    username = typeof body.username === "string" ? body.username : "";
    password = typeof body.password === "string" ? body.password : "";
    redirectTo = buildLoginRedirect(typeof body.redirectTo === "string" ? body.redirectTo : "/");
  }

  const account = findStoredAdminAccount({ username, password });

  if (!account) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "invalid-credentials");
    loginUrl.searchParams.set("redirectTo", redirectTo);
    return NextResponse.redirect(loginUrl, { status: 302 });
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url), { status: 302 });
  response.cookies.set(ADMIN_AUTH_COOKIE_NAME, ADMIN_SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(ADMIN_USERNAME_COOKIE_NAME, account.username, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(ADMIN_AUTH_ROLE_COOKIE_NAME, account.role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(ADMIN_ACTOR_COOKIE_NAME, account.username, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(ADMIN_ROLE_COOKIE_NAME, account.role, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
