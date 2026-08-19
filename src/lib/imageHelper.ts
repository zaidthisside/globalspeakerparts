/**
 * Helper to resolve and optimize media URLs through the local Next.js caching proxy.
 * Prevents external visitors from hammering Supabase storage directly on page refreshes.
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return "/hero-speaker.png";

  // Data URLs, local public paths, and SVG icons don't need proxying
  if (url.startsWith("data:") || url.startsWith("/") || url.endsWith(".svg")) {
    return url;
  }

  // If the image is hosted on Supabase Storage or external allowed domains
  if (url.includes(".supabase.co") || url.includes("supabase.in") || url.includes("images.unsplash.com")) {
    return `/api/media-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
}

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.startsWith("data:video/") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.includes("youtube.com") ||
    lower.includes("vimeo.com")
  );
}
