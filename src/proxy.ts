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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
