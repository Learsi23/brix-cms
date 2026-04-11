import { NextRequest, NextResponse } from "next/server";

// Next.js 16+ proxy — replaces middleware.ts
// Handles auth redirect: if already logged in and visiting /login → go to /admin

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    const token = req.cookies.get("eden_auth");
    if (token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
