import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isAuthenticated =
    req.cookies.has("__Secure-next-auth.session-token") ||
    req.cookies.has("next-auth.session-token");

  const pathname = req.nextUrl.pathname;
  
  // Redirect unauthenticated users away from chat
  if (!isAuthenticated && pathname == "/chat") {
    return NextResponse.redirect(new URL("/register", req.url));
  }

  // Redirect authenticated users away from register
  if (isAuthenticated && pathname == "/register") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // Redirect authenticated users from home to chat (no flash!)
  if (isAuthenticated && pathname == "/") {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // If not authenticated and on home, let them see it (good for SEO)
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat", "/register"], // Include home page in matcher
};
