import { type NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  // Verify password
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Create session
  const sessionToken = await createSession();

  // Set HTTP-only cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
