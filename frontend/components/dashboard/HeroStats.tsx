import type { Metadata } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  metadata: Metadata;
}

const SOURCE_LABELS: Record<string, string> = {
  github: "GitHub",
  hackernews: "Hacker News",
  producthunt: "Product Hunt",
  ycombinator: "YCombinator",
};

export default function HeroStats({ metadata }: Props) {
  const sourceEntries = Object.entries(metadata.sources).filter(
    ([, count]) => count > 0
  );

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        AI Trends Today
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Last updated: {formatDate(metadata.generated_at)}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          value={metadata.total_items.toLocaleString()}
          label="Tools Found"
          accent="bg-brand-50 border-brand-200 text-brand-700"
        />
        {sourceEntries.map(([source, count]) => (
          <StatCard
            key={source}
            value={String(count)}
            label={SOURCE_LABELS[source] ?? source}
            accent="bg-gray-50 border-gray-200 text-gray-700"
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${accent}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-70 mt-0.5">{label}</div>
    </div>
  );
}
