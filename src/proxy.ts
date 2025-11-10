import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionToken = req.cookies.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Verify session exists
    const session = await getSession(sessionToken);

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirect logged-in users away from /login
  if (pathname === "/login") {
    const sessionToken = req.cookies.get("session")?.value;

    if (sessionToken) {
      // Verify session exists
      const session = await getSession(sessionToken);

      if (session) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
