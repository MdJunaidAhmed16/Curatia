import type { ToolItem } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { safeUrl } from "@/lib/security";
import SourceBadge from "./SourceBadge";

interface Props {
  items: ToolItem[];
}

const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];

export default function TrendingSection({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base leading-none">🔥</span>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Trending now
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map((item, i) => (
          <a
            key={item.id}
            href={safeUrl(item.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-52 rounded-xl border border-gray-200/80 bg-white p-3 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
          >
            {/* Rank + source row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black tabular-nums w-5 leading-none ${
                    RANK_COLORS[i] ?? "text-gray-200"
                  }`}
                >
                  {i + 1}
                </span>
                <SourceBadge source={item.source} />
              </div>
              {item.trending_score !== null && (
                <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                  {item.stars !== null ? "★" : "▲"} {formatNumber(item.trending_score)}
                </span>
              )}
            </div>

            {/* Title */}
            <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
              {item.title}
            </p>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
