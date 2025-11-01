import IssuesList from "@/components/IssuesList";
import { db } from "@/db";
import { issues } from "@/db/schema";

async function getAllIssues() {
  const allIssues = await db.select().from(issues);
  return allIssues;
}

export default async function IssuesPage() {
  const allIssues = await getAllIssues();

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 font-sans">Newsletter Issues</h1>
      <IssuesList issues={allIssues} />
    </div>
  );
}
