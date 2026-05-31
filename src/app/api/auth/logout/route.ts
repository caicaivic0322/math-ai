import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_ROLE_COOKIE_NAME,
  ADMIN_USERNAME_COOKIE_NAME,
} from "@/lib/auth";
import {
  ADMIN_ACTOR_COOKIE_NAME,
  ADMIN_ROLE_COOKIE_NAME,
} from "@/app/admin/content/workflow-actor";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/";
  const response = NextResponse.redirect(new URL(redirectTo, request.url), { status: 302 });

  response.cookies.set(ADMIN_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(ADMIN_USERNAME_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(ADMIN_AUTH_ROLE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(ADMIN_ACTOR_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(ADMIN_ROLE_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
