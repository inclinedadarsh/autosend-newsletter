"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Editor from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Issue</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the issue title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a brief description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Enter the slug (e.g., issue-1)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishingDate">Publishing Date</Label>
            <Input
              id="publishingDate"
              type="date"
              value={publishingDate}
              onChange={(e) => setPublishingDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="markdownContent">Content</Label>
          <div className="border rounded-md min-h-[400px]">
            <Editor markdown={markdownContent} onChange={setMarkdownContent} />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={!isFormValid || isSaving}>
            {isSaving ? <Spinner /> : "Update Issue"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditIssuePage;
