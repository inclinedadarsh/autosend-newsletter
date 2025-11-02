"use client";

import { LogOutIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AdminIssueCard from "@/components/AdminIssueCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { Issue } from "@/types";

const AdminPage = () => {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    try {
      const response = await fetch(`/api/issues/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete issue");
      }

      toast.success("Issue deleted successfully");
      setIssues(issues.filter((issue) => issue.slug !== slug));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete issue",
      );
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

  return (
    <div className="bg-stone-50 py-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Page</h1>
          <div className="flex gap-4">
            <Link
              href="/admin/new"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <PlusIcon size={16} /> New Issue
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue) => (
              <AdminIssueCard
                key={issue.id}
                issue={issue}
                handleDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
