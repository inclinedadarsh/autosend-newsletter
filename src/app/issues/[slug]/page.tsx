import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import Footer from "@/components/Footer";
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

  const publishedDate = new Date(issue.publishedAt);
  const day = publishedDate.getDate();
  const monthShort = publishedDate.toLocaleString("en-US", { month: "short" });
  const year = publishedDate.getFullYear();
  const formattedDate = `${day} ${monthShort}, ${year}`;

  return (
    <div className="w-full max-w-2xl mx-auto px-5 md:px-0">
      <article className="">
        <header className="mt-20 mb-10 space-y-4">
          <div className="text-sm text-muted-foreground">
            Adarsh Dubey — <time className="">{formattedDate}</time>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{issue.title}</h1>
          {issue.description && (
            <p className="text-muted-foreground mt-4 text-lg">
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
      <Footer />
    </div>
  );
}
