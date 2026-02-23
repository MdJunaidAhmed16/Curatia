"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import type { ToolItem } from "@/lib/types";
import { safeUrl } from "@/lib/security";
import { isNaturalLanguage } from "@/lib/nlp";

const MAX_QUERY_LENGTH = 150;

interface Props {
  items: ToolItem[];
  onSearch?: (query: string) => void;
}

export default function SearchBar({ items, onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["title", "description", "tags", "author"],
        threshold: 0.35,
        minMatchCharLength: 2,
      }),
    [items]
  );

  // Show dropdown only for short keyword queries, not natural language
  const safeQuery = query.trim().slice(0, MAX_QUERY_LENGTH);
  const isNL = isNaturalLanguage(safeQuery);
  const dropdownResults = !isNL && safeQuery.length >= 2 ? fuse.search(safeQuery).slice(0, 8) : [];

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = safeQuery;
      if (!q) return;
      setOpen(false);
      onSearch?.(q);
    }
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        {/* Icon: sparkle for NL mode, magnifier for keyword mode */}
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {isNL && safeQuery.length > 0 ? (
            <span className="text-sm leading-none">✨</span>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </span>

        <input
          ref={inputRef}
          type="search"
          placeholder="Search or ask in plain English…"
          value={query}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-64 sm:w-80 pl-9 pr-4 py-1.5 rounded-full border border-gray-600 bg-gray-800 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
        />
      </div>

      {/* Natural language hint popup */}
      {isNL && safeQuery.length >= 3 && open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-3">
          <p className="text-xs text-gray-400 mb-1.5">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono border">Enter</kbd> to search:
          </p>
          <p className="text-sm font-semibold text-gray-900 line-clamp-2">&ldquo;{safeQuery}&rdquo;</p>
          <p className="text-xs text-blue-500 mt-1.5">✨ Uses intent matching to find relevant tools</p>
        </div>
      )}

      {/* Standard keyword dropdown */}
      {!isNL && open && dropdownResults.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {dropdownResults.map(({ item }) => (
            <a
              key={item.id}
              href={safeUrl(item.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => setOpen(false)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{item.source}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
