export function sanitizeFilename(filename: string): string {
  // Remove path traversal characters and limit to alphanumeric, dash, underscore, and dot
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\.{2,}/g, '.')
    .trim();
}
