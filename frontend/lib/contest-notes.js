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
