// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Define paths that do NOT require login
  const publicPaths = ["/login", "/register", "/reset-password", "/verify-otp", "/forgot-password"];

  // Helper: Check if current path matches any public path
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // 2. Redirect Logged-In Users AWAY from Auth pages
  // (e.g., If I am logged in, I shouldn't see the Login page)
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. Redirect Guests AWAY from Protected pages
  // (If it's NOT public and I don't have a token -> Go to Login)
  if (!isPublicPath && !token) {
    // Exclude API routes to prevent breaking backend calls (optional, depending on strategy)
    if (!pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // "Negative Lookahead": Match EVERYTHING except nextjs internals, static files, and images
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
