import type { Metadata } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  metadata: Metadata;
}

const SOURCE_CONFIG: Record<string, { label: string; icon: string }> = {
  github:      { label: "GitHub repos",    icon: "⭐" },
  hackernews:  { label: "HN threads",      icon: "🔶" },
  producthunt: { label: "PH launches",     icon: "🐱" },
  ycombinator: { label: "YC startups",     icon: "🚀" },
};

export default function HeroStats({ metadata }: Props) {
  const sourceCount = Object.values(metadata.sources).filter((v) => v && v > 0).length;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-950 border border-white/8 mb-8 px-6 py-8 sm:px-10">
      {/* Ambient glow decorations */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl" />

      <div className="relative">
        {/* Live badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            Updated {metadata.date}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2">
          What&apos;s trending in AI{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            today
          </span>
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          {metadata.total_items.toLocaleString()} tools tracked across {sourceCount} sources
          &nbsp;&middot;&nbsp; {formatDate(metadata.generated_at)}
        </p>

        {/* Source stat pills */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(metadata.sources)
            .filter(([, count]) => (count ?? 0) > 0)
            .map(([source, count]) => {
              const cfg = SOURCE_CONFIG[source] ?? { label: source, icon: "📡" };
              return (
                <div
                  key={source}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                >
                  <span className="text-sm leading-none">{cfg.icon}</span>
                  <span className="text-white font-semibold text-sm tabular-nums">
                    {(count as number).toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-xs">{cfg.label}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
