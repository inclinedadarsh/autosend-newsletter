import { desc } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import IssuesList from "@/components/IssuesList";
import { db } from "@/db";
import { issues } from "@/db/schema";

async function getAllIssues() {
  const allIssues = await db
    .select()
    .from(issues)
    .orderBy(desc(issues.publishedAt));
  return allIssues;
}

export default async function Home() {
  const allIssues = await getAllIssues();

  return (
    <div className="">
      <h1 className="text-3xl font-bold font-sans mt-20">Adarsh Dubey</h1>
      <p className="text-lg text-muted-foreground mt-1">
        Figuring out LLM fine-tuning with Google DeepMind.
      </p>
      <IssuesList issues={allIssues} />
      <footer className="my-14 pt-14 text-sm font-mono uppercase tracking-wider border-t-2 border-border border-dashed flex items-center justify-between">
        <span className="text-muted-foreground">
          &copy; {new Date().getFullYear()} Adarsh Dubey
        </span>
        <Link
          href="https://github.com/inclinedadarsh/autosend-newsletter"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          GitHub <ArrowUpRight size={16} />
        </Link>
      </footer>
    </div>
  );
}
