import type { Issue } from "@/types";
import IssueItem from "./IssueItem";

export default function IssuesList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return <p className="text-muted-foreground font-serif">No issues yet.</p>;
  }

  // Group issues by year
  const issuesByYear = issues.reduce(
    (acc, issue) => {
      const year = new Date(issue.publishedAt).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(issue);
      return acc;
    },
    {} as Record<number, Issue[]>,
  );

  // Sort years in descending order (most recent first)
  const sortedYears = Object.keys(issuesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Sort issues within each year by publishedAt (most recent first)
  sortedYears.forEach((year) => {
    issuesByYear[year].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  });

  return (
    <div className="space-y-7 mt-10">
      {sortedYears.map((year) => (
        <div key={year} className="space-y-3">
          <p className="font-mono">{year}</p>
          <div className="space-y-3">
            {issuesByYear[year].map((issue) => (
              <IssueItem key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
