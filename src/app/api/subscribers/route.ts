import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";

    if (!email || !slug) {
      return NextResponse.json(
        { error: "'email' and 'slug' are required" },
        { status: 400 },
      );
    }

    // Very basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check if subscriber already exists by unique email
    const [existing] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1);

    if (existing) {
      // If the email is already verified, block re-subscription
      if (existing.isVerified) {
        return NextResponse.json(
          { error: "This email is already subscribed." },
          { status: 409 },
        );
      }

      // Not verified yet; check token expiry
      const now = new Date();
      const isExpired =
        !existing.tokenExpiresAt ||
        existing.tokenExpiresAt.getTime() <= now.getTime();

      if (!isExpired) {
        return NextResponse.json(
          {
            error:
              "You're almost there. Please confirm your subscription from the email we sent.",
          },
          { status: 409 },
        );
      }

      // Token expired → reset token and related fields (keep email the same)
      const newToken = crypto.randomBytes(32).toString("hex");
      const newTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      try {
        const updated = await db.transaction(async (tx) => {
          const [row] = await tx
            .update(subscribers)
            .set({
              name,
              slug,
              token: newToken,
              tokenExpiresAt: newTokenExpiresAt,
              isVerified: false,
              verifiedAt: null,
            })
            .where(eq(subscribers.email, email))
            .returning();

          await sendVerificationEmail(
            row.email,
            row.token,
            row.name ?? undefined,
          );

          return row;
        });

        return NextResponse.json(
          {
            message:
              "Subscription request renewed. Please check your email to confirm.",
            subscriber: updated,
          },
          { status: 200 },
        );
      } catch {
        return NextResponse.json(
          {
            error:
              "We couldn't send the verification email. Please try again in a moment.",
          },
          { status: 502 },
        );
      }
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      const created = await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(subscribers)
          .values({ email, name, slug, token, tokenExpiresAt })
          .returning();

        await sendVerificationEmail(
          row.email,
          row.token,
          row.name ?? undefined,
        );

        return row;
      });

      return NextResponse.json(
        {
          message: "You're almost there. Please check your email to confirm.",
          subscriber: created,
        },
        { status: 201 },
      );
    } catch {
      return NextResponse.json(
        {
          error:
            "We couldn't send the verification email. Please try again in a moment.",
        },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 },
    );
  }
}
