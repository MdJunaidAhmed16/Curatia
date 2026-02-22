import type { ToolItem } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { safeUrl, safeThumbnailUrl } from "@/lib/security";
import SourceBadge from "./SourceBadge";

// One gradient per category slug — used as thumbnail fallback
const CATEGORY_GRADIENTS: Record<string, string> = {
  "llm-models": "from-violet-500 to-purple-700",
  "ai-agents": "from-blue-500 to-cyan-700",
  "code-generation": "from-emerald-500 to-teal-700",
  "image-video": "from-pink-500 to-rose-700",
  "voice-audio": "from-yellow-400 to-orange-600",
  "rag-search": "from-sky-500 to-indigo-700",
  "local-ai": "from-green-500 to-lime-700",
  "ai-infrastructure": "from-slate-500 to-gray-700",
  "data-analytics": "from-amber-400 to-yellow-600",
  "ai-writing": "from-fuchsia-500 to-pink-700",
  "robotics-embodied": "from-red-500 to-orange-700",
};

interface Props {
  item: ToolItem;
}

export default function ToolCard({ item }: Props) {
  const gradient =
    CATEGORY_GRADIENTS[item.category] ?? "from-gray-400 to-gray-600";

  const displayScore =
    item.stars !== null
      ? `★ ${formatNumber(item.stars)}`
      : item.score !== null
      ? `▲ ${formatNumber(item.score)}`
      : null;

  // Validate URLs before rendering — prevents javascript: / data: injection
  const cardUrl = safeUrl(item.url);
  const thumbnailUrl = safeThumbnailUrl(item.thumbnail_url);

  return (
    <a
      href={cardUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* Thumbnail — only renders if URL passes domain allowlist */}
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt={item.title}
          className="h-32 w-full object-cover"
        />
      ) : (
        <div
          className={`h-32 w-full bg-gradient-to-br ${gradient} opacity-80`}
        />
      )}

      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={item.source} />
          {item.is_new && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
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
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: score + language + author */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
          {displayScore && (
            <span className="font-medium text-gray-600">{displayScore}</span>
          )}
          {item.language && (
            <>
              <span>·</span>
              <span>{item.language}</span>
            </>
          )}
          {item.author && (
            <>
              <span>·</span>
              <span className="truncate max-w-[80px]">@{item.author}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}
