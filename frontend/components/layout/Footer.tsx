import { formatDate } from "@/lib/utils";

interface Props {
  generatedAt: string;
}

export default function Footer({ generatedAt }: Props) {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900 text-sm">CurateAI</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Data updated nightly via GitHub Actions.<br />
              Last run: {formatDate(generatedAt)}
            </p>
          </div>

          {/* Meta */}
          <div className="text-xs text-gray-400 space-y-1 sm:text-right">
            <p>Sources: GitHub · Hacker News · Product Hunt · YCombinator</p>
            <p className="text-gray-300">Free forever · No ads · No tracking</p>
          </div>

        </div>
      </div>
    </footer>
  );
}
