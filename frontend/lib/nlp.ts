/**
 * Client-side NLP search engine.
 *
 * Takes a natural language query ("I need a tool that parses PDF files"),
 * strips filler words, matches the core intent against a pre-built map,
 * and returns matching tools ranked by relevance.
 *
 * No API key or server required — runs entirely in the browser.
 */

import Fuse from "fuse.js";
import type { ToolItem } from "./types";

// ---------------------------------------------------------------------------
// Intent expansion map
// Each entry maps user-facing phrases → technical keywords that appear in
// tool titles, descriptions, and tags.
// ---------------------------------------------------------------------------

interface IntentEntry {
  patterns: string[];
  keywords: string[];
  categories?: string[];
}

const INTENT_MAP: IntentEntry[] = [
  // Documents & Files
  {
    patterns: ["pdf", "parse pdf", "read pdf", "extract pdf", "pdf file", "pdf text", "document", "word doc", "docx"],
    keywords: ["pdf", "document", "extraction", "ocr", "text extraction", "document qa", "rag", "parse", "reader"],
    categories: ["rag-search", "data-analytics"],
  },
  {
    patterns: ["ocr", "scan", "scanned", "handwriting", "text from image", "extract text"],
    keywords: ["ocr", "optical character recognition", "text extraction", "vision", "document"],
    categories: ["data-analytics", "rag-search"],
  },

  // Image & Video
  {
    patterns: ["generate image", "create image", "make image", "image generation", "ai image", "picture", "illustration", "artwork", "draw"],
    keywords: ["image generation", "text-to-image", "stable diffusion", "dalle", "midjourney", "flux", "diffusion"],
    categories: ["image-video"],
  },
  {
    patterns: ["edit image", "remove background", "background removal", "photo editing", "enhance photo", "upscale image"],
    keywords: ["image editing", "inpainting", "upscaling", "super resolution", "background removal"],
    categories: ["image-video"],
  },
  {
    patterns: ["generate video", "create video", "text to video", "ai video", "video generation", "animate"],
    keywords: ["video generation", "text-to-video", "animation", "sora", "runway", "pika"],
    categories: ["image-video"],
  },
  {
    patterns: ["3d", "3d model", "three dimensional", "3d generation"],
    keywords: ["3d", "three-dimensional", "mesh", "nerf", "3d generation"],
  },

  // Audio & Voice
  {
    patterns: ["transcribe", "transcription", "speech to text", "voice to text", "audio to text", "meeting notes", "podcast transcript"],
    keywords: ["transcription", "whisper", "speech", "asr", "audio", "speech-to-text", "voice recognition"],
    categories: ["voice-audio"],
  },
  {
    patterns: ["text to speech", "tts", "voice", "text to voice", "narrate", "read aloud", "voiceover"],
    keywords: ["text-to-speech", "tts", "voice synthesis", "elevenlabs", "voice clone", "narration"],
    categories: ["voice-audio"],
  },
  {
    patterns: ["music", "generate music", "ai music", "song", "compose music", "beat"],
    keywords: ["music generation", "suno", "udio", "audiocraft", "music", "song generation"],
    categories: ["voice-audio"],
  },
  {
    patterns: ["clone voice", "voice cloning", "duplicate voice", "copy voice"],
    keywords: ["voice clone", "voice cloning", "voice synthesis", "tts"],
    categories: ["voice-audio"],
  },

  // Code & Development
  {
    patterns: ["write code", "generate code", "coding assistant", "code completion", "programming help", "debug code", "code review", "refactor"],
    keywords: ["code generation", "coding assistant", "copilot", "codeium", "cursor", "autocomplete", "code completion"],
    categories: ["code-generation"],
  },
  {
    patterns: ["sql", "database query", "query database", "natural language sql", "text to sql"],
    keywords: ["nl2sql", "text-to-sql", "natural language sql", "database", "query"],
    categories: ["data-analytics"],
  },

  // Writing & Content
  {
    patterns: ["write email", "email assistant", "draft email", "email template"],
    keywords: ["email assistant", "writing assistant", "email", "draft", "content generation"],
    categories: ["ai-writing"],
  },
  {
    patterns: ["summarize", "summary", "summarise", "tldr", "shorten", "compress text", "long article", "abstract"],
    keywords: ["summarization", "summarize", "text", "content", "abstract", "tldr"],
    categories: ["ai-writing"],
  },
  {
    patterns: ["write blog", "blog post", "article", "content creation", "copywriting", "marketing copy"],
    keywords: ["writing assistant", "content generation", "copywriting", "blog", "marketing"],
    categories: ["ai-writing"],
  },
  {
    patterns: ["translate", "translation", "multilingual", "convert language", "language translation"],
    keywords: ["translation", "multilingual", "language", "translate"],
    categories: ["llm-models"],
  },
  {
    patterns: ["grammar", "grammar check", "proofread", "spell check", "writing errors"],
    keywords: ["grammar", "proofreading", "spell check", "grammarly", "writing assistant"],
    categories: ["ai-writing"],
  },

  // Search & Knowledge
  {
    patterns: ["search documents", "find information", "knowledge base", "ask questions about", "chat with documents", "document search"],
    keywords: ["rag", "retrieval", "semantic search", "knowledge base", "document qa", "chat with"],
    categories: ["rag-search"],
  },
  {
    patterns: ["chatbot", "chat with", "talk to ai", "ai assistant", "conversation", "customer support bot"],
    keywords: ["chatbot", "assistant", "llm", "chat", "conversational", "customer support"],
    categories: ["ai-agents"],
  },
  {
    patterns: ["research", "research assistant", "find papers", "literature review", "academic search"],
    keywords: ["research", "papers", "academic", "semantic search", "knowledge"],
    categories: ["rag-search"],
  },

  // Automation & Agents
  {
    patterns: ["automate", "automation", "workflow", "no code automation", "task automation", "ai workflow"],
    keywords: ["automation", "workflow", "agent", "langchain", "no-code", "zapier", "n8n"],
    categories: ["ai-agents"],
  },
  {
    patterns: ["ai agent", "autonomous agent", "ai that does tasks", "browser automation", "web scraping ai"],
    keywords: ["agent", "autonomous", "browser", "computer use", "web scraping", "task"],
    categories: ["ai-agents"],
  },

  // Data & Analytics
  {
    patterns: ["analyze data", "data analysis", "csv analysis", "spreadsheet ai", "chart from data", "visualize data", "excel ai"],
    keywords: ["data analysis", "pandas", "csv", "spreadsheet", "visualization", "chart", "analytics"],
    categories: ["data-analytics"],
  },

  // Local & Private AI
  {
    patterns: ["local", "offline", "private", "no internet", "on device", "run locally", "own computer", "privacy"],
    keywords: ["local llm", "offline", "on-device", "privacy", "self-hosted", "llama.cpp"],
    categories: ["local-ai"],
  },

  // Face / Avatar
  {
    patterns: ["avatar", "ai avatar", "virtual human", "face swap", "deepfake", "talking head", "digital human"],
    keywords: ["avatar", "face", "deepfake", "talking", "virtual human", "digital human"],
    categories: ["image-video"],
  },

  // Presentation & Design
  {
    patterns: ["presentation", "slides", "powerpoint", "pitch deck", "ai slides"],
    keywords: ["presentation", "slides", "powerpoint", "design", "deck"],
    categories: ["ai-writing"],
  },
  {
    patterns: ["design", "ui design", "web design", "logo", "brand", "graphic design"],
    keywords: ["design", "ui", "logo", "brand", "graphic", "image generation"],
    categories: ["image-video"],
  },

  // Meeting & Productivity
  {
    patterns: ["meeting notes", "meeting summary", "zoom notes", "meeting transcript", "record meeting"],
    keywords: ["meeting", "transcription", "notes", "summary", "productivity"],
    categories: ["voice-audio", "ai-writing"],
  },
  {
    patterns: ["productivity", "task management", "to do", "planner", "calendar ai"],
    keywords: ["productivity", "task", "planner", "assistant", "workflow"],
    categories: ["ai-agents"],
  },

  // Embeddings / Vector
  {
    patterns: ["embedding", "vector search", "similarity search", "vector database", "semantic"],
    keywords: ["embedding", "vector database", "semantic search", "similarity", "faiss", "pinecone"],
    categories: ["rag-search"],
  },
];

// ---------------------------------------------------------------------------
// Filler phrases stripped before intent matching
// ---------------------------------------------------------------------------

const FILLER_PATTERNS = [
  /^i need (a |an |some )?/i,
  /^i want (a |an |some )?/i,
  /^i'm looking for (a |an |some )?/i,
  /^help me /i,
  /^show me /i,
  /^find (a |an |some )?/i,
  /^tool (that |to |for |which )/i,
  /^tools? (that |to |for |which )/i,
  /^something (that |to |for |which )/i,
  /^(a |an )?tool (to |for |that |which )/i,
  /^(a |an )?software (to |for |that |which )/i,
  /^(a |an )?app (to |for |that |which )/i,
  /^can you (find |show |suggest )/i,
  /^what (is |are |can )/i,
  /^how (do |can |to )/i,
];

function stripFiller(query: string): string {
  let q = query.trim();
  for (const pattern of FILLER_PATTERNS) {
    q = q.replace(pattern, "");
  }
  return q.trim();
}

// ---------------------------------------------------------------------------
// Detect natural language queries
// ---------------------------------------------------------------------------

const NL_TRIGGERS = ["i ", "help", "find", "show", "need", "want", "looking", "tool", "something", "how ", "what ", "can you"];

export function isNaturalLanguage(query: string): boolean {
  const q = query.toLowerCase().trim();
  // Has 3+ words, OR starts with a known NL trigger phrase
  if (q.split(/\s+/).length >= 3) return true;
  return NL_TRIGGERS.some((t) => q.startsWith(t));
}

// ---------------------------------------------------------------------------
// Main search function
// ---------------------------------------------------------------------------

export function nlpSearch(items: ToolItem[], query: string): { items: ToolItem[]; intent: string; keywords: string[] } {
  const core = stripFiller(query);
  const coreLower = core.toLowerCase();

  // Collect all matched keywords from the intent map
  const matchedKeywords: string[] = [];
  const matchedCategories: string[] = [];

  for (const entry of INTENT_MAP) {
    const patternMatch = entry.patterns.some((p) => coreLower.includes(p.toLowerCase()));
    if (patternMatch) {
      matchedKeywords.push(...entry.keywords);
      if (entry.categories) matchedCategories.push(...entry.categories);
    }
  }

  // Always include the raw core words as fallback keywords
  const rawWords = coreLower.split(/\s+/).filter((w) => w.length > 2);
  const allKeywords = [...new Set([...matchedKeywords, ...rawWords])];

  // Build a synthetic search string from expanded keywords
  const searchString = allKeywords.slice(0, 15).join(" ");

  // Run Fuse.js with the expanded keyword string
  const fuse = new Fuse(items, {
    keys: [
      { name: "title", weight: 2 },
      { name: "description", weight: 1.5 },
      { name: "tags", weight: 1 },
      { name: "category", weight: 0.5 },
    ],
    threshold: 0.4,
    minMatchCharLength: 2,
    includeScore: true,
  });

  const fuseResults = fuse.search(searchString);

  // Also do category filtering if we matched categories
  let results = fuseResults.map((r) => r.item);

  if (matchedCategories.length > 0 && results.length < 5) {
    // Supplement with category-matched items if Fuse results are thin
    const catItems = items.filter((item) => matchedCategories.includes(item.category));
    const existing = new Set(results.map((r) => r.id));
    results = [...results, ...catItems.filter((i) => !existing.has(i.id))];
  }

  return {
    items: results,
    intent: core || query,
    keywords: [...new Set(matchedKeywords)].slice(0, 8),
  };
}
