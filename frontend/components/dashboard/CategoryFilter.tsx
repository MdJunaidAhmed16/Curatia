"use client";

import { useCallback } from "react";
import type { CategoryCount } from "@/lib/types";

interface Props {
  categories: CategoryCount[];
  active: string;
  onChange: (slug: string) => void;
}

export default function CategoryFilter({ categories, active, onChange }: Props) {
  const handleClick = useCallback(
    (slug: string) => () => onChange(slug),
    [onChange]
  );

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => {
        const isActive = cat.slug === active;
        return (
          <button
            key={cat.slug}
            onClick={handleClick(cat.slug)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat.label}
            <span
              className={`text-xs ${
                isActive ? "text-sky-200" : "text-gray-400"
              }`}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
