import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { Issue } from "@/types";

export default function IssueItem({ issue }: { issue: Issue }) {
  const date = new Date(issue.publishedAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const formattedDate = `${day}/${month}`;

  return (
    <Link
      href={`/issues/${issue.slug}`}
      className="flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <time className="text-muted-foreground font-mono group-hover:text-foreground">
          {formattedDate}
        </time>
        <h2 className="group-hover:text-orange-600">{issue.title}</h2>
      </div>
      <ArrowRightIcon
        size={20}
        className="text-muted-foreground group-hover:text-foreground"
      />
    </Link>
  );
}
