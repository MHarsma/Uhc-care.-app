import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("uhc_auth_token")?.value;

  // Static assets and internal routes are allowed
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If visiting the root '/', always redirect: to dashboard if logged in, or login if not logged in
  if (pathname === "/") {
    if (token && token.trim() !== "" && token !== "undefined") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protected pages
  const protectedPaths = [
    "/dashboard",
    "/period",
    "/partner",
    "/workout",
    "/notes",
    "/pairing",
    "/routine-history",
    "/analytics",
    "/settings",
    "/fitness",
    "/tasks",
  ];

  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isProtected && (!token || token.trim() === "" || token === "undefined")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting login or signup, redirect to dashboard
  if ((pathname === "/login" || pathname === "/signup") && token && token.trim() !== "" && token !== "undefined") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.json).*)"],
};
