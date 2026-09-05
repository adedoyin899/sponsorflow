import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/companies",
    "/emails",
    "/analytics",
    "/onboarding",
  ];

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const token = request.cookies.get("sponsorflow_session")?.value;

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting login or signup, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/companies/:path*",
    "/emails/:path*",
    "/analytics/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
