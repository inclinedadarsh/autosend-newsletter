import { and, eq, gt } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const now = new Date();

    const [existing] = await db
      .select()
      .from(subscribers)
      .where(
        and(eq(subscribers.token, token), gt(subscribers.tokenExpiresAt, now)),
      )
      .limit(1);

    if (!existing) {
      // Invalid or expired token
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    // If already verified, treat as success (idempotent)
    if (existing.isVerified) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const [updated] = await db
      .update(subscribers)
      .set({
        isVerified: true,
        verifiedAt: now,
        // Immediately expire the token to prevent reuse
        tokenExpiresAt: now,
      })
      .where(eq(subscribers.id, existing.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    // Do not surface errors; simply respond with non-success to suppress error toasts client-side
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
