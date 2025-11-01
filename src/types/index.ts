export interface Issue {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
