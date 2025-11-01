import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { issues } from "@/db/schema";
import { verifyAdminAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.slug, slug))
    .limit(1);

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  return NextResponse.json(issue);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { authenticated, error } = await verifyAdminAuth();
  if (!authenticated) {
    return error;
  }

  const { slug } = await params;

  const [deletedIssue] = await db
    .delete(issues)
    .where(eq(issues.slug, slug))
    .returning();

  if (!deletedIssue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  // Revalidate the home page and issue pages
  revalidatePath("/");
  revalidatePath(`/issues/${slug}`);

  return NextResponse.json(deletedIssue, { status: 200 });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { authenticated, error } = await verifyAdminAuth();
  if (!authenticated) {
    return error;
  }

  const { slug } = await params;
  const body = await request.json();

  // Build update object from provided fields
  const updateData: {
    title?: string;
    slug?: string;
    description?: string;
    content?: string;
    publishedAt?: Date;
  } = {};

  if (body.title !== undefined) updateData.title = body.title;
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.content !== undefined) updateData.content = body.content;
  if (body.publishingDate !== undefined) {
    updateData.publishedAt = new Date(body.publishingDate);
  }

  // Add updatedAt timestamp
  const [updatedIssue] = await db
    .update(issues)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(issues.slug, slug))
    .returning();

  if (!updatedIssue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  // Revalidate the home page and both old and new issue pages
  revalidatePath("/");
  revalidatePath(`/issues/${slug}`);
  if (body.slug && body.slug !== slug) {
    revalidatePath(`/issues/${body.slug}`);
  }

  return NextResponse.json(updatedIssue, { status: 200 });
}
