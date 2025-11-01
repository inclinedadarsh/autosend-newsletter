import Link from "next/link";
import { db } from "@/db";
import { issues } from "@/db/schema";

async function getAllIssues() {
  const allIssues = await db.select().from(issues);
  return allIssues;
}

export default async function Home() {
  const allIssues = await getAllIssues();

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 font-sans">Newsletter Issues</h1>

      {allIssues.length === 0 ? (
        <p className="text-muted-foreground font-serif">No issues yet.</p>
      ) : (
        <ul className="space-y-6">
          {allIssues.map((issue) => {
            const formattedDate = issue.publishedAt
              ? new Date(issue.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : null;

            return (
              <li key={issue.id} className="border-b pb-6 last:border-b-0">
                <Link
                  href={`/issues/${issue.slug}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <h2 className="text-2xl font-bold mb-2 font-sans hover:underline">
                    {issue.title}
                  </h2>
                  {formattedDate && (
                    <time className="text-sm text-muted-foreground font-serif">
                      {formattedDate}
                    </time>
                  )}
                  {issue.description && (
                    <p className="text-muted-foreground mt-2 font-serif">
                      {issue.description}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
