import type { ToolItem } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { safeUrl } from "@/lib/security";
import SourceBadge from "./SourceBadge";

interface Props {
  items: ToolItem[];
}

export default function TrendingSection({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Trending Today
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => (
          <a
            key={item.id}
            href={safeUrl(item.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-56 rounded-xl border border-gray-200 bg-white p-3 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-2 mb-2">
              <SourceBadge source={item.source} />
              {item.is_new && (
                <span className="text-xs text-green-600 font-medium">New</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
              {item.title}
            </p>
            {item.trending_score !== null && (
              <p className="text-xs text-gray-400 mt-2 font-medium">
                {item.stars !== null ? "★" : "▲"}{" "}
                {formatNumber(item.trending_score)}
              </p>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
