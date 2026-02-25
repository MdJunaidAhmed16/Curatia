import type { ToolItem } from "@/lib/types";
import SearchBar from "@/components/dashboard/SearchBar";

const NAV_LINKS = [
  { href: "/", label: "Today" },
  { href: "/category/llm-models/", label: "LLMs" },
  { href: "/category/ai-agents/", label: "Agents" },
  { href: "/category/code-generation/", label: "Code" },
  { href: "/category/image-video/", label: "Images" },
];

interface Props {
  items: ToolItem[];
  onSearch?: (query: string) => void;
}

export default function Header({ items, onSearch }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gray-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* Brand + Nav */}
        <div className="flex items-center gap-5 min-w-0">
          <a href="/" className="flex items-center gap-2 flex-shrink-0 group">
            {/* Logo mark — gradient bolt icon */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-150">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-bold text-white text-[15px] tracking-tight hidden sm:block">
              CurateAI
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <SearchBar items={items} onSearch={onSearch} />
      </div>
    </header>
  );
}
