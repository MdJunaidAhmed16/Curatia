"use client";

import type { ToolItem } from "@/lib/types";

export type ToolTypeValue = "all" | "app" | "library" | "model";

interface Props {
  items: ToolItem[];
  active: ToolTypeValue;
  onChange: (value: ToolTypeValue) => void;
}

const OPTIONS: { value: ToolTypeValue; label: string; emoji: string; description: string }[] = [
  { value: "all",     label: "All",           emoji: "⚡", description: "Everything" },
  { value: "app",     label: "Apps & Tools",  emoji: "🛠️", description: "Consumer-facing products" },
  { value: "library", label: "Libraries",     emoji: "📦", description: "Developer frameworks & SDKs" },
  { value: "model",   label: "Models",        emoji: "🧠", description: "Weights & checkpoints" },
];

export default function ToolTypeFilter({ items, active, onChange }: Props) {
  const counts: Record<ToolTypeValue, number> = {
    all:     items.length,
    app:     items.filter((i) => i.tool_type === "app").length,
    library: items.filter((i) => i.tool_type === "library").length,
    model:   items.filter((i) => i.tool_type === "model").length,
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => {
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.description}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <span>{opt.emoji}</span>
            <span>{opt.label}</span>
            <span className={`text-xs tabular-nums ${isActive ? "text-gray-300" : "text-gray-400"}`}>
              {counts[opt.value].toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
