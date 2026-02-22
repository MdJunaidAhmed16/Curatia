"use client";

import { useState } from "react";
import type { LatestData } from "@/lib/types";
import HeroStats from "./HeroStats";
import TrendingSection from "./TrendingSection";
import CategoryFilter from "./CategoryFilter";
import ToolGrid from "./ToolGrid";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Props {
  data: LatestData;
}

export default function Dashboard({ data }: Props) {
  const { items, categories, metadata } = data;
  const [activeCategory, setActiveCategory] = useState("all");

  const trendingItems = items
    .filter((item) => item.trending_score !== null)
    .slice(0, 12);

  return (
    <>
      <Header items={items} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroStats metadata={metadata} />
        <TrendingSection items={trendingItems} />
        <div className="mt-8 space-y-4">
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
          <ToolGrid items={items} activeCategory={activeCategory} />
        </div>
      </main>
      <Footer generatedAt={metadata.generated_at} />
    </>
  );
}
