import { getIndexData, getCategoryData } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/dashboard/ToolCard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

const CATEGORY_ICONS: Record<string, string> = {
  "llm-models":        "🤖",
  "ai-agents":         "🕵️",
  "code-generation":   "💻",
  "image-video":       "🎨",
  "voice-audio":       "🎙️",
  "rag-search":        "🔍",
  "local-ai":          "🏠",
  "ai-infrastructure": "⚙️",
  "data-analytics":    "📊",
  "ai-writing":        "✍️",
  "robotics-embodied": "🦾",
};

export async function generateStaticParams() {
  const data = getIndexData();
  return data.categories
    .filter((cat) => cat.slug !== "all")
    .map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getIndexData();
  const cat = data.categories.find((c) => c.slug === slug);
  return {
    title: `${cat?.label ?? slug} — CurateAI`,
    description: `Latest ${cat?.label ?? slug} tools, repos and launches.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const indexData = getIndexData();
  const categoryData = getCategoryData(slug);

  const category = indexData.categories.find((c) => c.slug === slug);
  const icon = CATEGORY_ICONS[slug] ?? "🔹";
  const label = category?.label ?? categoryData.label;

  return (
    <>
      <Header items={categoryData.items} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 group"
          >
            <svg
              className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All tools
          </a>

          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{label}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {categoryData.items.length.toLocaleString()} tool{categoryData.items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {categoryData.items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl mb-3">🔭</p>
            <p className="text-gray-400 text-sm">No tools found in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryData.items.map((item) => (
              <ToolCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      <Footer generatedAt={indexData.metadata.generated_at} />
    </>
  );
}
