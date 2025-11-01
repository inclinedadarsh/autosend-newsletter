"use client";

import { LogOutIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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

const AdminPage = () => {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    try {
      const response = await fetch("/api/issues");
      if (!response.ok) {
        throw new Error("Failed to fetch issues");
      }
      const data = await response.json();
      setIssues(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch issues",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete "${slug}"?`)) {
      return;
    }

    setDeletingSlug(slug);
    try {
      const response = await fetch(`/api/issues/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete issue");
      }

      toast.success("Issue deleted successfully");
      // Remove the issue from the list
      setIssues(issues.filter((issue) => issue.slug !== slug));
      // Revalidate the home page
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete issue",
      );
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to logout");
      }

      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to logout");
    }
  };

  const formattedDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Page</h1>
        <div className="flex gap-4">
          <Link href="/admin/new">
            <Button>
              <PlusIcon size={16} /> New Issue
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOutIcon size={16} /> Logout
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      ) : issues.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No issues yet. Create your first issue!
        </p>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="border rounded-lg p-6 hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{issue.title}</h2>
                  {issue.description && (
                    <p className="text-muted-foreground mb-2">
                      {issue.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Slug: {issue.slug}</span>
                    {formattedDate(issue.publishedAt) && (
                      <span>Published: {formattedDate(issue.publishedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/edit/${issue.slug}`}>
                    <Button variant="outline" size="sm">
                      <PencilIcon size={16} /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(issue.slug)}
                    disabled={deletingSlug === issue.slug}
                  >
                    {deletingSlug === issue.slug ? (
                      <Spinner />
                    ) : (
                      <TrashIcon size={16} />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
