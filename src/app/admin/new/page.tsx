"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Editor from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const NewIssuePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishingDate, setPublishingDate] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendToSubscribers, setSendToSubscribers] = useState(false);
  // Set default publishing date to today
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;
    setPublishingDate(todayString);
    setMarkdownContent("Start writing here...");
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
          sendToSubscribers,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create issue");
      }
      const data = await response.json();
      toast.success("Issue created successfully");
      router.push(`/issues/${data.slug}`);
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
    <div className="w-full max-w-2xl mx-auto px-5 md:px-0 mt-10">
      <form onSubmit={handleSubmit} className="">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-medium">New Issue</h1>
          <div className="space-x-2">
            <Button
              type="submit"
              className="cursor-pointer"
              variant="outline"
              size="sm"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? <Spinner /> : "Publish"}
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
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
        </div>

        <div className="min-h-[400px] mt-6 mb-10 pt-6 border-t-2 border-dashed border-border">
          <Editor markdown={markdownContent} onChange={setMarkdownContent} />
        </div>

        <div className="flex gap-4"></div>
      </form>
    </div>
  );
};

export default NewIssuePage;
