import { getIndexData, getCategoryData } from "@/lib/data";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolCard from "@/components/dashboard/ToolCard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

// Required for static export — pre-renders one page per category
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
    title: `${cat?.label ?? slug} — AI Trends`,
    description: `Latest ${cat?.label ?? slug} tools and repos.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const indexData = getIndexData();
  const categoryData = getCategoryData(slug);

  const category = indexData.categories.find((c) => c.slug === slug);

  return (
    <>
      <Header items={categoryData.items} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to all
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {category?.label ?? categoryData.label}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {categoryData.items.length} tool{categoryData.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {categoryData.items.length === 0 ? (
          <p className="text-gray-400 text-center py-16">
            No tools found in this category yet.
          </p>
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
