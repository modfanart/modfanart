import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { MAX_NOTE_LENGTH, packSubmissionNotes } from '../lib/contest-notes.js';

// Mirrors MAX_SUBMISSION_NOTES_LENGTH in contestEntry.controller.js. Asserted
// against below so the two caps cannot silently drift apart.
const SERVER_CAP = 1200;
const IP_MAX_LENGTH = 100;

describe('packSubmissionNotes', () => {
  it('puts the note first, then the IP, separated by a blank line', () => {
    assert.equal(
      packSubmissionNotes('Inspired by my cat.', 'Marvel'),
      'Inspired by my cat.\n\nFandom / Original IP: Marvel'
    );
  });

  it('returns only the note when no IP is given', () => {
    assert.equal(packSubmissionNotes('Inspired by my cat.', ''), 'Inspired by my cat.');
  });

  it('returns only the IP line when no note is given', () => {
    // The pre-existing behaviour this feature had to preserve: before the note
    // field existed, the IP alone was what reached submission_notes.
    assert.equal(packSubmissionNotes('', 'Marvel'), 'Fandom / Original IP: Marvel');
  });

  it('returns undefined when both are empty, so the field is omitted', () => {
    assert.equal(packSubmissionNotes('', ''), undefined);
    assert.equal(packSubmissionNotes(undefined, undefined), undefined);
    assert.equal(packSubmissionNotes(null, null), undefined);
  });

  it('treats a whitespace-only note as absent', () => {
    assert.equal(packSubmissionNotes('   \n  ', 'Marvel'), 'Fandom / Original IP: Marvel');
  });

  it('trims surrounding whitespace from both parts', () => {
    assert.equal(
      packSubmissionNotes('  padded note  ', '  Marvel  '),
      'padded note\n\nFandom / Original IP: Marvel'
    );
  });

  it('preserves newlines inside the note', () => {
    const note = 'Line one.\nLine two.';
    assert.ok(packSubmissionNotes(note, 'Marvel').startsWith(note));
  });

  it('keeps the worst-case packed length under the server cap', () => {
    // The failure this guards: raising MAX_NOTE_LENGTH past the server's
    // headroom would let the form accept a note the API then rejects.
    const packed = packSubmissionNotes('x'.repeat(MAX_NOTE_LENGTH), 'y'.repeat(IP_MAX_LENGTH));

    assert.ok(
      packed.length <= SERVER_CAP,
      `packed length ${packed.length} exceeds server cap ${SERVER_CAP}`
    );
  });
});
