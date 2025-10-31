"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Editor from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const NewIssuePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishingDate, setPublishingDate] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Set default publishing date to today
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;
    setPublishingDate(todayString);
  }, []);

  // Check if form is valid
  const isFormValid =
    title.trim() !== "" &&
    slug.trim() !== "" &&
    publishingDate !== "" &&
    markdownContent.trim() !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/issues", {
        method: "POST",
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
        throw new Error("Failed to create issue");
      }
      const data = await response.json();
      toast.success("Issue created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create issue",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;
    setPublishingDate(todayString);
    setMarkdownContent("");
    setSlug("");
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Issue</h1>

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
          <Button type="submit" disabled={!isFormValid || isLoading}>
            {isLoading ? <Spinner /> : "Create Issue"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewIssuePage;
