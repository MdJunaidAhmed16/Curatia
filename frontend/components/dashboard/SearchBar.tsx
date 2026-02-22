"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import type { ToolItem } from "@/lib/types";
import { safeUrl } from "@/lib/security";

const MAX_QUERY_LENGTH = 100;

interface Props {
  items: ToolItem[];
}

export default function SearchBar({ items }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["title", "description", "tags", "author"],
        threshold: 0.35,
        minMatchCharLength: 2,
      }),
    [items]
  );

  // Cap query length to prevent performance degradation on large datasets
  const safeQuery = query.trim().slice(0, MAX_QUERY_LENGTH);
  const results = safeQuery.length >= 2 ? fuse.search(safeQuery).slice(0, 8) : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Search AI tools..."
          value={query}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-56 sm:w-72 pl-9 pr-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {results.map(({ item }) => (
            <a
              key={item.id}
              href={safeUrl(item.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => setOpen(false)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {item.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                {item.source}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
