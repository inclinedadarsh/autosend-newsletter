import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { issues, subscribers } from "@/db/schema";
import { verifyAdminAuth } from "@/lib/auth";
import { markdownToHtml, sendNewsletterBulk } from "@/lib/email";

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

  // Revalidate the home page, issues list page, and issue pages
  revalidatePath("/");
  revalidatePath("/issues");
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

  // Fetch current issue to check if already sent
  const [currentIssue] = await db
    .select()
    .from(issues)
    .where(eq(issues.slug, slug))
    .limit(1);

  if (!currentIssue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
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

  // Send newsletter if requested and not already sent
  if (
    body.sendToSubscribers &&
    !currentIssue.sentToSubscribers &&
    updatedIssue.content
  ) {
    try {
      // Fetch all verified subscribers
      const verifiedSubscribers = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.isVerified, true));

      if (verifiedSubscribers.length > 0) {
        // Convert markdown to HTML
        const htmlContent = await markdownToHtml(updatedIssue.content);

        // Prepare recipients array
        const recipients = verifiedSubscribers.map((subscriber) => ({
          email: subscriber.email,
          name: subscriber.name ?? undefined,
        }));

        // Send newsletter in bulk (batched in groups of 100)
        await sendNewsletterBulk(recipients, updatedIssue.title, htmlContent);

        // Update issue to mark as sent
        const now = new Date();
        const [finalIssue] = await db
          .update(issues)
          .set({
            sentToSubscribers: true,
            sentAt: now,
          })
          .where(eq(issues.id, updatedIssue.id))
          .returning();

        if (finalIssue) {
          // Revalidate the home page, issues list page, and both old and new issue pages
          revalidatePath("/");
          revalidatePath("/issues");
          revalidatePath(`/issues/${slug}`);
          if (body.slug && body.slug !== slug) {
            revalidatePath(`/issues/${body.slug}`);
          }

          return NextResponse.json(finalIssue, { status: 200 });
        }
      }
    } catch (error) {
      // Log error but don't fail the issue update
      console.error("Error sending newsletter:", error);
    }
  }

  // Revalidate the home page, issues list page, and both old and new issue pages
  revalidatePath("/");
  revalidatePath("/issues");
  revalidatePath(`/issues/${slug}`);
  if (body.slug && body.slug !== slug) {
    revalidatePath(`/issues/${body.slug}`);
  }

  return NextResponse.json(updatedIssue, { status: 200 });
}
