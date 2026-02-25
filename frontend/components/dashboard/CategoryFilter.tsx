"use client";

import { useCallback } from "react";
import type { CategoryCount } from "@/lib/types";

interface Props {
  categories: CategoryCount[];
  active: string;
  onChange: (slug: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  "all":               "⚡",
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

export default function CategoryFilter({ categories, active, onChange }: Props) {
  const handleClick = useCallback(
    (slug: string) => () => onChange(slug),
    [onChange]
  );

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => {
        const isActive = cat.slug === active;
        const icon = CATEGORY_ICONS[cat.slug] ?? "🔹";
        return (
          <button
            key={cat.slug}
            onClick={handleClick(cat.slug)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap ${
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span className="leading-none">{icon}</span>
            <span>{cat.label}</span>
            <span
              className={`text-xs tabular-nums ${
                isActive ? "text-violet-200" : "text-gray-400"
              }`}
            >
              {cat.count.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
