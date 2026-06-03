import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "sulail-secret-key-change-me");

export default async function middleware(request) {
  const path = request.nextUrl.pathname;
  const protectedPaths = ["/tribes", "/admin"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));
  const token = request.cookies.get("sulail_token")?.value;

  let userRole = null;
  let userBranchId = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userRole = payload.role_id;
      userBranchId = payload.branch_id;
    } catch (e) {}
  }

  if (path === "/" || path === "/auth/login" || path === "/auth/register" || path === "/auth/logout") {
    return NextResponse.next();
  }

  if (isProtected && !userRole) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("sulail_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("sulail_user_name", "", { maxAge: 0, path: "/" });
    return response;
  }

  if (path.startsWith("/admin") && userRole != 5) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-user-role", String(userRole || ""));
  response.headers.set("x-user-branch-id", String(userBranchId || ""));

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};