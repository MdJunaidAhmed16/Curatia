"use client";

import { useState, useMemo } from "react";
import type { ToolItem } from "@/lib/types";
import ToolCard from "./ToolCard";

const PAGE_SIZE = 32;

interface Props {
  items: ToolItem[];
  activeCategory?: string;
}

export default function ToolGrid({ items, activeCategory = "all" }: Props) {
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? items
        : items.filter((item) => item.category === activeCategory),
    [items, activeCategory]
  );

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  if (filtered.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        No tools found in this category yet.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map((item) => (
          <ToolCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 rounded-full border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Load more ({filtered.length - visible.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
