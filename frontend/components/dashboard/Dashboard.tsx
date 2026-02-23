"use client";

import { useState, useMemo, useCallback } from "react";
import type { LatestData } from "@/lib/types";
import type { ToolTypeValue } from "./ToolTypeFilter";
import { nlpSearch, isNaturalLanguage } from "@/lib/nlp";
import HeroStats from "./HeroStats";
import TrendingSection from "./TrendingSection";
import CategoryFilter from "./CategoryFilter";
import ToolGrid from "./ToolGrid";
import ToolTypeFilter from "./ToolTypeFilter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Props {
  data: LatestData;
}

export default function Dashboard({ data }: Props) {
  const { items, categories, metadata } = data;

  // Filter state
  const [activeCategory, setActiveCategory] = useState("all");
  const [typeFilter, setTypeFilter] = useState<ToolTypeValue>("all");

  // NLP search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{
    items: ReturnType<typeof nlpSearch>["items"];
    intent: string;
    keywords: string[];
  } | null>(null);

  const isSearchMode = searchResult !== null;

  // Handle search submission from the header SearchBar
  const handleSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setSearchResult(null);
        setSearchQuery("");
        return;
      }
      setSearchQuery(trimmed);
      const result = nlpSearch(items, trimmed);
      setSearchResult(result);
    },
    [items]
  );

  const clearSearch = useCallback(() => {
    setSearchResult(null);
    setSearchQuery("");
  }, []);

  // Compute displayed items — search mode bypasses category filter
  const displayItems = useMemo(() => {
    let base = isSearchMode ? searchResult.items : items;

    // Apply category filter (only in browse mode)
    if (!isSearchMode && activeCategory !== "all") {
      base = base.filter((item) => item.category === activeCategory);
    }

    // Apply tool type filter in both modes
    if (typeFilter !== "all") {
      base = base.filter((item) => item.tool_type === typeFilter);
    }

    return base;
  }, [isSearchMode, searchResult, items, activeCategory, typeFilter]);

  const trendingItems = useMemo(
    () => items.filter((item) => item.trending_score !== null).slice(0, 12),
    [items]
  );

  return (
    <>
      <Header items={items} onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isSearchMode && <HeroStats metadata={metadata} />}

        {/* Search results header */}
        {isSearchMode && (
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {isNaturalLanguage(searchQuery) ? "AI-matched results for" : "Results for"}
                </p>
                <h2 className="text-xl font-bold text-gray-900">
                  &ldquo;{searchResult.intent}&rdquo;
                </h2>
                {searchResult.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs text-gray-400 self-center">Keywords:</span>
                    {searchResult.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={clearSearch}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span>✕</span>
                <span>Clear</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {displayItems.length} tool{displayItems.length !== 1 ? "s" : ""} found
            </p>
          </div>
        )}

        {/* Trending — hidden in search mode */}
        {!isSearchMode && <TrendingSection items={trendingItems} />}

        {/* Filters row */}
        <div className="mt-6 space-y-3">
          <ToolTypeFilter
            items={items}
            active={typeFilter}
            onChange={setTypeFilter}
          />

          {/* Category filter — hidden in search mode */}
          {!isSearchMode && (
            <CategoryFilter
              categories={categories}
              active={activeCategory}
              onChange={setActiveCategory}
            />
          )}
        </div>

        {/* Main grid */}
        <div className="mt-4">
          <ToolGrid items={displayItems} activeCategory="all" />
        </div>
      </main>

      <Footer generatedAt={metadata.generated_at} />
    </>
  );
}
