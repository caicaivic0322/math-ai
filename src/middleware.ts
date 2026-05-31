import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_ROLE_COOKIE_NAME,
  buildLoginRedirect,
  canAccessAdminSurface,
  canAccessFormulaStudio,
  isAuthenticatedAdminSession,
  normalizeAdminRole,
} from "@/lib/auth";

const ADMIN_PAGE_PREFIXES = ["/admin"];
const ADMIN_API_PREFIXES = ["/api/admin"];
const FORMULA_PAGE_PREFIXES = ["/formula-studio"];
const FORMULA_API_PREFIXES = ["/api/formula-records", "/api/formula-render"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = ADMIN_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAdminApi = ADMIN_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isFormulaPage = FORMULA_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isFormulaApi = FORMULA_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isProtectedPage = isAdminPage || isFormulaPage;
  const isProtectedApi = isAdminApi || isFormulaApi;

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  const accountRole = normalizeAdminRole(request.cookies.get(ADMIN_AUTH_ROLE_COOKIE_NAME)?.value);
  if (isAuthenticatedAdminSession(authCookie)) {
    if ((isAdminPage || isAdminApi) && canAccessAdminSurface(accountRole)) {
      return NextResponse.next();
    }
    if ((isFormulaPage || isFormulaApi) && canAccessFormulaStudio(accountRole)) {
      return NextResponse.next();
    }

    if (isProtectedApi) {
      return NextResponse.json({ error: "当前账户角色无权访问该接口。" }, { status: 403 });
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedApi) {
    return NextResponse.json({ error: "未登录或无权访问后台接口。" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", buildLoginRedirect(`${pathname}${request.nextUrl.search}`));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/formula-studio",
    "/api/admin/:path*",
    "/api/formula-records/:path*",
    "/api/formula-render",
  ],
};
