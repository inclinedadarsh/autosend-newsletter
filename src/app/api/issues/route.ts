import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { issues } from "@/db/schema";
import { verifyAdminAuth } from "@/lib/auth";

export async function GET() {
  const allIssues = await db
    .select()
    .from(issues)
    .orderBy(sql`COALESCE(${issues.publishedAt}, ${issues.createdAt}) DESC`);
  return NextResponse.json(allIssues);
}

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

  // Revalidate the home page, issues list page, and the specific issue page
  revalidatePath("/");
  revalidatePath("/issues");
  revalidatePath(`/issues/${slug}`);

  return NextResponse.json(issue, { status: 201 });
}
