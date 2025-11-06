import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { issues, subscribers } from "@/db/schema";
import { verifyAdminAuth } from "@/lib/auth";
import { markdownToHtml, sendNewsletterBulk } from "@/lib/email";

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

  const {
    title,
    slug,
    description,
    content,
    publishingDate,
    sendToSubscribers,
  } = await request.json();
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

  // Send newsletter if requested
  if (sendToSubscribers && content) {
    try {
      // Fetch all verified subscribers
      const verifiedSubscribers = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.isVerified, true));

      if (verifiedSubscribers.length > 0) {
        // Convert markdown to HTML
        const htmlContent = await markdownToHtml(content);

        // Prepare recipients array
        const recipients = verifiedSubscribers.map((subscriber) => ({
          email: subscriber.email,
          name: subscriber.name ?? undefined,
        }));

        // Send newsletter in bulk (batched in groups of 100)
        await sendNewsletterBulk(recipients, title, htmlContent);

        // Update issue to mark as sent
        const now = new Date();
        await db
          .update(issues)
          .set({
            sentToSubscribers: true,
            sentAt: now,
          })
          .where(eq(issues.id, issue.id));
      }
    } catch (error) {
      // Log error but don't fail the issue creation
      console.error("Error sending newsletter:", error);
    }
  }

  // Fetch updated issue to return
  const [updatedIssue] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, issue.id))
    .limit(1);

  return NextResponse.json(updatedIssue || issue, { status: 201 });
}
