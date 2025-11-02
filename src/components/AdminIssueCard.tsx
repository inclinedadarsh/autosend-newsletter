import { Eye, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import type { Issue } from "@/types";

const AdminIssueCard = ({
  issue,
  handleDelete,
}: {
  issue: Issue;
  handleDelete: (slug: string) => void;
}) => {
  const { title, description, slug, publishedAt } = issue;
  const date = new Date(publishedAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const formattedDate = `${day}/${month}`;

  return (
    <div className="border rounded-lg border-stone-200 bg-white overflow-hidden">
      <div className="p-4">
        <h2 className="font-medium">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground truncate mt-1">
            {description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-10">
          <div className="flex flex-col">
            <span className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
              Published
            </span>
            <span className="text-sm font-medium font-mono">
              {formattedDate}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
              Slug{" "}
            </span>
            <span className="text-sm font-medium font-mono">{slug}</span>
          </div>
        </div>
      </div>
      <div className="bg-stone-100 border-t border-stone-200 grid grid-cols-3 text-sm">
        <Link
          href={`/issues/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono uppercase tracking-wider flex gap-2 items-center p-4 justify-center border-r border-stone-200 hover:bg-stone-200 transition-colors"
        >
          <Eye size={13} /> View
        </Link>
        <Link
          href={`/admin/edit/${slug}`}
          className="font-mono uppercase tracking-wider flex gap-2 items-center p-4 justify-center border-r border-stone-200 hover:bg-stone-200 transition-colors"
        >
          <Pencil size={13} /> Edit
        </Link>
        <button
          type="button"
          onClick={() => handleDelete(slug)}
          className="font-mono uppercase tracking-wider flex gap-2 items-center p-4 justify-center hover:bg-stone-200 transition-colors cursor-pointer"
        >
          <Trash size={13} /> Delete
        </button>
      </div>
    </div>
  );
};

export default AdminIssueCard;
