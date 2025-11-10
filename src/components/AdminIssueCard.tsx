import { CheckCircle2, Eye, Mail, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Issue } from "@/types";

const AdminIssueCard = ({
  issue,
  handleDelete,
  onNewsletterSent,
}: {
  issue: Issue;
  handleDelete: (slug: string) => void;
  onNewsletterSent?: () => void;
}) => {
  const { title, description, slug, publishedAt, sentToSubscribers, sentAt } =
    issue;
  const [isSending, setIsSending] = useState(false);
  const date = new Date(publishedAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const formattedDate = `${day}/${month}`;

  const handleSendNewsletter = async () => {
    if (sentToSubscribers) {
      toast.error("Newsletter has already been sent");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/issues/${slug}/send`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send newsletter");
      }

      toast.success("Newsletter sent successfully");
      if (onNewsletterSent) {
        onNewsletterSent();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send newsletter",
      );
    } finally {
      setIsSending(false);
    }
  };

  const formatSentDate = (date: Date | null) => {
    if (!date) return "";
    const sentDate = new Date(date);
    const day = String(sentDate.getDate()).padStart(2, "0");
    const month = String(sentDate.getMonth() + 1).padStart(2, "0");
    const year = sentDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="border rounded-lg bg-white dark:bg-zinc-950/20 overflow-hidden">
      <div className="p-4">
        <h2 className="font-medium">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground truncate mt-1">
            {description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/50 truncate mt-1">
            No description
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
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendNewsletter}
            disabled={sentToSubscribers || isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Spinner /> Sending...
              </>
            ) : sentToSubscribers ? (
              <>
                <CheckCircle2 size={14} className="text-green-600" />
                <span>Sent to subscribers</span>
                {sentAt && (
                  <span className="font-mono">({formatSentDate(sentAt)})</span>
                )}
              </>
            ) : (
              <>
                <Mail size={14} /> Send to subscribers
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="bg-stone-100 dark:bg-transparent border-t grid grid-cols-3 text-sm">
        <Link
          href={`/issues/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono uppercase tracking-wider flex gap-2 items-center p-4 justify-center border-r hover:bg-stone-200 dark:hover:bg-white/5 transition-colors"
        >
          <Eye size={13} /> View
        </Link>
        <Link
          href={`/admin/edit/${slug}`}
          className="font-mono uppercase tracking-wider flex gap-2 items-center p-4 justify-center border-r hover:bg-stone-200 dark:hover:bg-white/5 transition-colors"
        >
          <Pencil size={13} /> Edit
        </Link>
        <button
          type="button"
          onClick={() => handleDelete(slug)}
          className="font-mono uppercase tracking-wider flex gap-2 items-center p-4 justify-center hover:bg-stone-200 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Trash size={13} /> Delete
        </button>
      </div>
    </div>
  );
};

export default AdminIssueCard;
