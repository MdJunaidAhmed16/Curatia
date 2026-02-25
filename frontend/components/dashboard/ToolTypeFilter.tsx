"use client";

import type { ToolItem } from "@/lib/types";

export type ToolTypeValue = "all" | "app" | "library" | "model";

interface Props {
  items: ToolItem[];
  active: ToolTypeValue;
  onChange: (value: ToolTypeValue) => void;
}

const OPTIONS: { value: ToolTypeValue; label: string }[] = [
  { value: "all",     label: "All types"  },
  { value: "app",     label: "Apps"       },
  { value: "library", label: "Libraries"  },
  { value: "model",   label: "Models"     },
];

export default function ToolTypeFilter({ items, active, onChange }: Props) {
  const counts: Record<ToolTypeValue, number> = {
    all:     items.length,
    app:     items.filter((i) => i.tool_type === "app").length,
    library: items.filter((i) => i.tool_type === "library").length,
    model:   items.filter((i) => i.tool_type === "model").length,
  };

  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100 border border-gray-200">
      {OPTIONS.map((opt) => {
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
            <span
              className={`text-xs tabular-nums ${
                isActive ? "text-gray-400" : "text-gray-400/50"
              }`}
            >
              {counts[opt.value].toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
