"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Editor from "@/components/Editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { Issue } from "@/types";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const EditIssuePage = ({ params }: PageProps) => {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalIssue, setOriginalIssue] = useState<Issue | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishingDate, setPublishingDate] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [sendToSubscribers, setSendToSubscribers] = useState(false);

  const fetchIssue = useCallback(
    async (issueSlug: string) => {
      try {
        const response = await fetch(`/api/issues/${issueSlug}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Issue not found");
            router.push("/admin");
            return;
          }
          throw new Error("Failed to fetch issue");
        }
        const issue: Issue = await response.json();
        setOriginalIssue(issue);

        // Pre-fill form with issue data
        setTitle(issue.title);
        setDescription(issue.description || "");
        setMarkdownContent(issue.content || "");
        if (issue.publishedAt) {
          const date = new Date(issue.publishedAt);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          setPublishingDate(`${year}-${month}-${day}`);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch issue",
        );
        router.push("/admin");
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  // Initialize params and fetch issue data
  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      await fetchIssue(resolvedParams.slug);
    };
    init();
  }, [params, fetchIssue]);

  // Reset form to original values
  const handleReset = () => {
    if (!originalIssue) return;

    setTitle(originalIssue.title);
    setDescription(originalIssue.description || "");
    setMarkdownContent(originalIssue.content || "");
    if (originalIssue.publishedAt) {
      const date = new Date(originalIssue.publishedAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setPublishingDate(`${year}-${month}-${day}`);
    }
    setSlug(originalIssue.slug);
    toast.success("Form reset to original values");
  };

  // Check if form is valid
  const isFormValid =
    title.trim() !== "" &&
    slug.trim() !== "" &&
    publishingDate !== "" &&
    markdownContent.trim() !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || !originalIssue) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/issues/${originalIssue.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          content: markdownContent,
          publishingDate,
          sendToSubscribers,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update issue");
      }
      const data = await response.json();
      toast.success("Issue updated successfully");
      router.push(`/issues/${data.slug}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update issue",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!originalIssue) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-5 md:px-0 mt-10">
      <form onSubmit={handleSubmit} className="">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin"
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            <ArrowLeft />
          </Link>
          <div className="space-x-2">
            <Button
              type="submit"
              className="cursor-pointer"
              variant="outline"
              size="sm"
              disabled={!isFormValid || isSaving}
            >
              {isSaving ? <Spinner /> : "Republish"}
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
            >
              Discard Changes
            </Button>
          </div>
        </div>
        <div className="space-y-5">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="An interesting title..."
            className="w-full overflow-hidden resize-none text-3xl font-semibold"
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="(Optional) Enter a brief description..."
            className="w-full overflow-hidden resize-none text-muted-foreground text-lg"
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Enter the slug (e.g., issue-1)"
              required
            />
            <Input
              type="date"
              value={publishingDate}
              onChange={(e) => setPublishingDate(e.target.value)}
            />
          </div>
          {!originalIssue.sentToSubscribers && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendToSubscribers"
                checked={sendToSubscribers}
                onChange={(e) => setSendToSubscribers(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="sendToSubscribers"
                className="text-sm font-medium cursor-pointer"
              >
                Send to subscribers
              </label>
            </div>
          )}
        </div>

        <div className="min-h-[400px] mt-6 mb-10 pt-6 border-t-2 border-dashed border-border">
          <Editor markdown={markdownContent} onChange={setMarkdownContent} />
        </div>

        <div className="flex gap-4"></div>
      </form>
    </div>
  );
};

export default EditIssuePage;
