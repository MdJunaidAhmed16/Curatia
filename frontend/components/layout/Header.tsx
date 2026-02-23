import type { ToolItem } from "@/lib/types";
import SearchBar from "@/components/dashboard/SearchBar";

interface Props {
  items: ToolItem[];
  onSearch?: (query: string) => void;
}

export default function Header({ items, onSearch }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <a href="/" className="text-white font-bold text-lg tracking-tight">
            AI Trends
          </a>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Today</a>
            <a href="/category/llm-models/" className="hover:text-white transition-colors">LLMs</a>
            <a href="/category/ai-agents/" className="hover:text-white transition-colors">Agents</a>
            <a href="/category/code-generation/" className="hover:text-white transition-colors">Code</a>
          </nav>
        </div>
        <SearchBar items={items} onSearch={onSearch} />
      </div>
    </header>
  );
}
