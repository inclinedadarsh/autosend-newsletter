import Link from "next/link";

interface Issue {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IssuesListProps {
  issues: Issue[];
}

export default function IssuesList({ issues }: IssuesListProps) {
  return (
    <>
      {issues.length === 0 ? (
        <p className="text-muted-foreground font-serif">No issues yet.</p>
      ) : (
        <ul className="space-y-6">
          {issues.map((issue) => {
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
    </>
  );
}
