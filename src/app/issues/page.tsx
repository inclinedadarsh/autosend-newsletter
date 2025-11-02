import { desc } from "drizzle-orm";
import Footer from "@/components/Footer";
import IssuesList from "@/components/IssuesList";
import { db } from "@/db";
import { issues } from "@/db/schema";

async function getAllIssues() {
  const allIssues = await db
    .select()
    .from(issues)
    .orderBy(desc(issues.publishedAt));
  return allIssues;
}

export default async function IssuesPage() {
  const allIssues = await getAllIssues();

  return (
    <div className="w-full max-w-2xl mx-auto px-5 md:px-0">
      <h1 className="text-3xl font-bold font-sans mt-20">Newsletter Issues</h1>
      <p className="text-lg text-muted-foreground mt-1">
        I write about LLMs, Machine Learning and Web Development.
      </p>
      <IssuesList issues={allIssues} />
      <Footer />
    </div>
  );
}
