/** True when a file/thumbnail URL points at a PDF, so callers can render a
 * document icon instead of trying to load it as an <Image>. */
export function isPdfUrl(url: string | null | undefined): boolean {
  return !!url && /\.pdf($|\?)/i.test(url);
}