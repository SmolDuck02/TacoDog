import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isAuthenticated = req.cookies.get("next-auth.session-token") || null;
  console.log(req.cookies);
  const pathname = req.nextUrl.pathname;
  if (!isAuthenticated && pathname == "/chat") {
    return NextResponse.redirect(new URL("/register", req.url));
  }

  if (isAuthenticated && pathname == "/register") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  return NextResponse.next(); // Continue to the requested page
}

export const config = {
  matcher: ["/chat", "/register"], // Match "/api/*"
};
