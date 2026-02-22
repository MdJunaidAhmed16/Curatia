/**
 * Security utilities for sanitizing data from external APIs
 * before rendering in the browser.
 */

const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

/**
 * Returns the URL only if it uses http(s). Returns "#" for anything else
 * (javascript:, data:, blob:, etc.) to prevent injection attacks.
 */
export function safeUrl(url: string | null | undefined): string {
  if (!url) return "#";
  try {
    const parsed = new URL(url);
    if (ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return url;
    }
    return "#";
  } catch {
    return "#";
  }
}

/**
 * Returns the image URL only if it comes from a trusted domain.
 * Falls back to null so the gradient placeholder renders instead.
 */
const TRUSTED_IMAGE_HOSTS = new Set([
  "ph-files.imgix.net",
  "producthunt-static.s3.amazonaws.com",
  "bookface-images.s3.amazonaws.com",
  "avatars.githubusercontent.com",
  "opengraph.githubassets.com",
  "repository-images.githubusercontent.com",
  "ycombinator.com",
  "s3.amazonaws.com",
]);

export function safeThumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    // Allow exact matches or subdomain matches
    const host = parsed.hostname;
    for (const trusted of TRUSTED_IMAGE_HOSTS) {
      if (host === trusted || host.endsWith(`.${trusted}`)) {
        return url;
      }
    }
    return null;
  } catch {
    return null;
  }
}
