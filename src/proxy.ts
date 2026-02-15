import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

const SESSION_COOKIE = "running-red-session";

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Allow login page and auth API without session
  if (pathname === "/admin/login" || pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  // Check for session cookie on all /admin routes
  const session = request.cookies.get(SESSION_COOKIE);

  if (!session?.value) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
