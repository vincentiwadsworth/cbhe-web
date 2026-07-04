/**
 * Resolve an image URL for use in <img> tags, handling Astro's base path.
 *
 * On GitHub Pages with a subpath (e.g., /cbhe-web/), root-relative paths
 * like `/images/foo.jpg` bypass the `<base>` tag and resolve to the wrong URL.
 * This function bakes the BASE_URL into local paths so they always resolve
 * correctly regardless of the `<base>` tag.
 *
 * - Full URLs (https://...) → returned as-is
 * - Root-relative paths (/images/...) → BASE_URL prepended
 * - Relative paths (images/...) → BASE_URL prepended
 * - Empty/null/undefined → returned as-is
 */
export function resolveImageUrl(src: string | undefined | null): string | undefined {
  if (!src) return undefined;

  // Full URL — use as-is
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  const base = import.meta.env.BASE_URL;
  const baseClean = base === "/" ? "" : base.replace(/\/$/, "");

  // Already has base prefix — avoid double-prefix
  if (baseClean && src.startsWith(baseClean)) return src;

  // Normalize: ensure path starts with /
  const normalized = src.startsWith("/") ? src : `/${src}`;

  return `${baseClean}${normalized}`;
}
