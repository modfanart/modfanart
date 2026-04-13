export function escapeLike(value: string): string {
  if (!value) return '';
  return value.replace(/[\\%_]/g, '\\$&');
}

export function toTsQueryPrefix(text: string): string {
  if (!text?.trim()) return '';
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((word) => `${word}:*`)
    .join(' & ');
}
