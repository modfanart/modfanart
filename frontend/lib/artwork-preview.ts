// Which image to show for an artwork. Uploads may be PDFs: the backend renders page one to a PNG
// thumbnail, but falls back to the PDF's own URL when rendering fails, and an <img> pointed at a
// PDF is a broken image. `null` means there is no raster to show and the caller should render a
// placeholder instead.

const isPdf = (url: string | null | undefined) => Boolean(url && /\.pdf(\?|#|$)/i.test(url));

export function artworkPreviewSrc(artwork: {
  file_url?: string | null;
  thumbnail_url?: string | null;
}): string | null {
  const candidates = [artwork.thumbnail_url, artwork.file_url];
  return candidates.find((url): url is string => Boolean(url) && !isPdf(url)) ?? null;
}

export function isPdfArtwork(artwork: { file_url?: string | null }): boolean {
  return isPdf(artwork.file_url);
}
