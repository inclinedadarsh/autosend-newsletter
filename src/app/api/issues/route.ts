import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { issues } from "@/db/schema";
import { verifyAdminAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { authenticated, error } = await verifyAdminAuth();
  if (!authenticated) {
    return error;
  }

  const { title, slug, description, content, publishingDate } =
    await request.json();
  const [issue] = await db
    .insert(issues)
    .values({
      title,
      slug,
      description,
      content,
      publishedAt: new Date(publishingDate),
    })
    .returning();

  return NextResponse.json(issue, { status: 201 });
}
