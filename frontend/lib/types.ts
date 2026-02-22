export type Source = "github" | "hackernews" | "producthunt" | "ycombinator" | "twitter";

export interface ToolItem {
  id: string;
  source: Source;
  title: string;
  description: string | null;
  url: string;
  author: string;
  stars: number | null;
  score: number | null;
  category: string;
  tags: string[];
  language: string | null;
  created_at: string;
  fetched_at: string;
  thumbnail_url: string | null;
  is_new: boolean;
  trending_score: number | null;
}

export interface CategoryCount {
  slug: string;
  label: string;
  count: number;
}

export interface Metadata {
  generated_at: string;
  date: string;
  total_items: number;
  sources: Partial<Record<Source, number>>;
  schema_version: string;
}

export interface LatestData {
  metadata: Metadata;
  items: ToolItem[];
  categories: CategoryCount[];
}
