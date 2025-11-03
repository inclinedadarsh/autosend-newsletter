import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

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
      // If already subscribed with same slug, treat as idempotent success
      if (existing.slug === slug) {
        return NextResponse.json(existing, { status: 200 });
      }
      // Email is globally unique, so cannot subscribe same email to another slug
      console.log("Email already subscribed");
      return NextResponse.json(
        { error: "Email already subscribed" },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(subscribers)
      .values({ email, name, slug })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to process request" },
      { status: 500 },
    );
  }
}
