import type { Source } from "@/lib/types";

const SOURCE_CONFIG: Record<
  Source,
  { label: string; bg: string; text: string }
> = {
  github: { label: "GitHub", bg: "bg-gray-800", text: "text-white" },
  hackernews: { label: "HN", bg: "bg-orange-500", text: "text-white" },
  producthunt: { label: "PH", bg: "bg-red-500", text: "text-white" },
  ycombinator: { label: "YC", bg: "bg-orange-600", text: "text-white" },
  twitter: { label: "X", bg: "bg-black", text: "text-white" },
};

interface Props {
  source: Source;
}

export default function SourceBadge({ source }: Props) {
  const cfg = SOURCE_CONFIG[source] ?? {
    label: source,
    bg: "bg-gray-500",
    text: "text-white",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}
