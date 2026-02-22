import fs from "fs";
import path from "path";
import type { LatestData } from "./types";

/**
 * Reads data/latest.json at build time using the filesystem.
 * Called ONLY from Next.js Server Components during `next build`.
 * Never import this file in Client Components ("use client").
 * Use lib/utils.ts for client-safe helper functions.
 */
export function getLatestData(): LatestData {
  // process.cwd() is the Next.js project root (frontend/) during build.
  // The data/ directory lives one level up at the repo root.
  const filePath = path.join(process.cwd(), "..", "data", "latest.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as LatestData;
}
