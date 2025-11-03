import { desc } from "drizzle-orm";
import Footer from "@/components/Footer";
import IssuesList from "@/components/IssuesList";
import SubscribeModal from "@/components/SubscribeModal";
import { db } from "@/db";
import { issues } from "@/db/schema";

// Force static generation at build time
export const dynamic = "force-static";

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
    <div className="w-full max-w-2xl mx-auto px-5 md:px-0">
      <h1 className="text-3xl font-bold font-sans mt-20">Adarsh Dubey</h1>
      <p className="text-lg text-muted-foreground mt-1">
        Figuring out LLM fine-tuning with Google DeepMind.
      </p>
      <IssuesList issues={allIssues} />
      <SubscribeModal />
      <Footer />
    </div>
  );
}
