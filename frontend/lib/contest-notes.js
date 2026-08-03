// Shared by the two contest submission forms (components/submissions/
// new-submission.tsx and app/(dashboard)/artist/[artistId]/my-artworks/new/
// page.tsx). Kept as a plain module with JSDoc types rather than inline in
// either form so both call the same implementation and it can be tested.

/**
 * Longest note an entrant may write. The server allows 1200 for the packed
 * string (see MAX_SUBMISSION_NOTES_LENGTH in contestEntry.controller.js),
 * leaving room for the appended Fandom / Original IP line.
 */
export const MAX_NOTE_LENGTH = 1000;

/**
 * Combine the entrant's note and their Fandom / Original IP into the single
 * submission_notes column. The note goes first because judges read top-down.
 *
 * @param {string | undefined | null} note Entrant's free-text note.
 * @param {string | undefined | null} originalIp Fandom or original IP.
 * @returns {string | undefined} Packed value, or undefined when both are empty
 *   so callers can omit the field entirely rather than sending "".
 */
export function packSubmissionNotes(note, originalIp) {
  const parts = [];

  if (note?.trim()) {
    parts.push(note.trim());
  }

  if (originalIp?.trim()) {
    parts.push(`Fandom / Original IP: ${originalIp.trim()}`);
  }

  return parts.length > 0 ? parts.join('\n\n') : undefined;
}

/** Prefix packSubmissionNotes uses for the IP line. Kept adjacent so the two
 * functions cannot drift apart. */
const IP_PREFIX = 'Fandom / Original IP: ';

/**
 * Inverse of packSubmissionNotes, for review surfaces that want to show the
 * entrant's note and their Fandom / Original IP as separate labelled fields
 * instead of one blob.
 *
 * Note that packing two values into a single column is lossy: an entrant can
 * type the IP prefix inside their own note. This splits on the LAST occurrence
 * of the prefix at the start of a trailing block, which is where the packer
 * always puts it, so a note that merely mentions the prefix stays intact. The
 * durable fix is a separate column - this is a reader-side workaround.
 *
 * @param {string | undefined | null} packed Raw submission_notes value.
 * @returns {{ note: string | null, originalIp: string | null }}
 */
export function unpackSubmissionNotes(packed) {
  const empty = { note: null, originalIp: null };

  if (!packed?.trim()) return empty;

  const text = packed.trim();
  const separator = `\n\n${IP_PREFIX}`;
  const splitAt = text.lastIndexOf(separator);

  // The packer emits the IP line either after a blank line (note present) or
  // as the entire value (note absent). Anything else is a note with no IP.
  if (splitAt !== -1) {
    const note = text.slice(0, splitAt).trim();
    const originalIp = text.slice(splitAt + separator.length).trim();

    return {
      note: note || null,
      originalIp: originalIp || null,
    };
  }

  if (text.startsWith(IP_PREFIX)) {
    const originalIp = text.slice(IP_PREFIX.length).trim();
    return { note: null, originalIp: originalIp || null };
  }

  return { note: text, originalIp: null };
}
