import fs from "fs";
import path from "path";
import type { IndexData, CategoryData } from "./types";

const DATA_DIR = path.join(process.cwd(), "..", "data");

/**
 * Reads data/index.json — top 100 trending items for the homepage.
 * Called ONLY from Next.js Server Components during `next build`.
 * Never import this file in Client Components ("use client").
 */
export function getIndexData(): IndexData {
  const raw = fs.readFileSync(path.join(DATA_DIR, "index.json"), "utf-8");
  return JSON.parse(raw) as IndexData;
}

/**
 * Reads data/categories/{slug}.json — all items for a specific category.
 * Called ONLY from Next.js Server Components during `next build`.
 */
export function getCategoryData(slug: string): CategoryData {
  const raw = fs.readFileSync(
    path.join(DATA_DIR, "categories", `${slug}.json`),
    "utf-8"
  );
  return JSON.parse(raw) as CategoryData;
}
