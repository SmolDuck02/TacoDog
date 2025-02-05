import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isAuthenticated = req.cookies.get("next-auth.session-token");

  if (!isAuthenticated && req.nextUrl.pathname == "/chat") {
    return NextResponse.redirect(new URL("/register", req.url));
  }

  if (isAuthenticated && req.nextUrl.pathname == "/register") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next(); // Continue to the requested page
}
