import { eq } from "drizzle-orm";
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

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { authenticated, error } = await verifyAdminAuth();
  if (!authenticated) {
    return error;
  }

  const { slug } = await params;

  // Fetch the issue
  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.slug, slug))
    .limit(1);

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  // Check if already sent
  if (issue.sentToSubscribers) {
    return NextResponse.json(
      { error: "Newsletter has already been sent to subscribers" },
      { status: 400 },
    );
  }

  // Check if issue has content
  if (!issue.content) {
    return NextResponse.json(
      { error: "Issue has no content to send" },
      { status: 400 },
    );
  }

  try {
    // Fetch all verified subscribers
    const verifiedSubscribers = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.isVerified, true));

    if (verifiedSubscribers.length === 0) {
      return NextResponse.json(
        { error: "No verified subscribers found" },
        { status: 400 },
      );
    }

    // Convert markdown to HTML
    const htmlContent = await markdownToHtml(issue.content);

    // Prepare recipients array
    const recipients = verifiedSubscribers.map((subscriber) => ({
      email: subscriber.email,
      name: subscriber.name ?? undefined,
    }));

    // Send newsletter in bulk (batched in groups of 100)
    await sendNewsletterBulk(recipients, issue.title, htmlContent);

    // Update issue to mark as sent
    const now = new Date();
    const [updatedIssue] = await db
      .update(issues)
      .set({
        sentToSubscribers: true,
        sentAt: now,
      })
      .where(eq(issues.id, issue.id))
      .returning();

    if (!updatedIssue) {
      return NextResponse.json(
        { error: "Failed to update issue status" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: `Newsletter sent to ${verifiedSubscribers.length} subscribers`,
        issue: updatedIssue,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send newsletter",
      },
      { status: 500 },
    );
  }
}
