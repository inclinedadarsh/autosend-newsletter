import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import { db } from "@/db";
import { issues } from "@/db/schema";

export const dynamic = "force-static";
export const revalidate = false;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getIssue(slug: string) {
  const [issue] = await db
    .select()
    .from(issues)
    .where(eq(issues.slug, slug))
    .limit(1);

  return issue;
}

async function markdownToHtml(markdown: string) {
  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  return processedContent.toString();
}

export default async function IssuePage({ params }: PageProps) {
  const { slug } = await params;
  const issue = await getIssue(slug);

  if (!issue) {
    notFound();
  }

  const htmlContent = issue.content ? await markdownToHtml(issue.content) : "";

  const formattedDate = issue.publishedAt
    ? new Date(issue.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <article className="prose prose-lg max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-sans">{issue.title}</h1>
          {formattedDate && (
            <time className="text-muted-foreground text-sm font-serif">
              {formattedDate}
            </time>
          )}
          {issue.description && (
            <p className="text-lg text-muted-foreground mt-4 font-serif">
              {issue.description}
            </p>
          )}
        </header>

        {htmlContent && (
          <div
            className="issue-content font-serif"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated from markdown using remark, which is safe
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </article>
    </div>
  );
}
