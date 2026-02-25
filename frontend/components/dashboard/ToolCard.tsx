import type { ToolItem } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { safeUrl, safeThumbnailUrl } from "@/lib/security";
import SourceBadge from "./SourceBadge";

// Category accent color — shown as a thin top strip on each card
const CATEGORY_ACCENT: Record<string, string> = {
  "llm-models":        "bg-violet-500",
  "ai-agents":         "bg-blue-500",
  "code-generation":   "bg-emerald-500",
  "image-video":       "bg-pink-500",
  "voice-audio":       "bg-yellow-400",
  "rag-search":        "bg-sky-500",
  "local-ai":          "bg-green-500",
  "ai-infrastructure": "bg-slate-400",
  "data-analytics":    "bg-amber-500",
  "ai-writing":        "bg-fuchsia-500",
  "robotics-embodied": "bg-red-500",
};

// Muted gradient for placeholder (no thumbnail)
const CATEGORY_GRADIENT: Record<string, string> = {
  "llm-models":        "from-violet-500/12 to-purple-700/12",
  "ai-agents":         "from-blue-500/12 to-cyan-700/12",
  "code-generation":   "from-emerald-500/12 to-teal-700/12",
  "image-video":       "from-pink-500/12 to-rose-700/12",
  "voice-audio":       "from-yellow-400/12 to-orange-600/12",
  "rag-search":        "from-sky-500/12 to-indigo-700/12",
  "local-ai":          "from-green-500/12 to-lime-700/12",
  "ai-infrastructure": "from-slate-400/12 to-gray-600/12",
  "data-analytics":    "from-amber-400/12 to-yellow-600/12",
  "ai-writing":        "from-fuchsia-500/12 to-pink-700/12",
  "robotics-embodied": "from-red-500/12 to-orange-700/12",
};

interface Props {
  item: ToolItem;
}

export default function ToolCard({ item }: Props) {
  const accent   = CATEGORY_ACCENT[item.category]   ?? "bg-gray-400";
  const gradient = CATEGORY_GRADIENT[item.category] ?? "from-gray-400/12 to-gray-600/12";

  const displayScore =
    item.stars !== null
      ? { icon: "★", value: formatNumber(item.stars) }
      : item.score !== null
      ? { icon: "▲", value: formatNumber(item.score) }
      : null;

  const cardUrl      = safeUrl(item.url);
  const thumbnailUrl = safeThumbnailUrl(item.thumbnail_url);

  return (
    <a
      href={cardUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-gray-200/80 bg-white shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Header: real image or subtle gradient placeholder */}
      {thumbnailUrl ? (
        <div className="relative h-28 overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={item.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent}`} />
        </div>
      ) : (
        <div className={`relative h-16 w-full bg-gradient-to-br ${gradient} flex items-center px-4 overflow-hidden`}>
          {/* Large decorative initial */}
          <span className="text-5xl font-black text-gray-900/8 select-none uppercase leading-none">
            {item.title.charAt(0)}
          </span>
          {/* Category accent strip */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${accent}`} />
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <SourceBadge source={item.source} />
          {item.is_new && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
              New
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: score + language + author */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 min-w-0">
            {displayScore && (
              <span className="font-semibold text-gray-600">
                {displayScore.icon} {displayScore.value}
              </span>
            )}
            {item.language && (
              <>
                {displayScore && <span className="text-gray-300">·</span>}
                <span>{item.language}</span>
              </>
            )}
          </div>
          {item.author && (
            <span className="truncate max-w-[90px] ml-2">@{item.author}</span>
          )}
        </div>
      </div>
    </a>
  );
}
