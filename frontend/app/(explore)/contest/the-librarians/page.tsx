'use client';

// Example route, e.g. app/opportunities/the-librarians/page.tsx
// Shows how to render the generic ContestDetailPage for The Librarians,
// passing the bits that live outside the unified ContestData shape.

import ContestDetailPage, { LegalPoint } from '../ContestDetailsPage';
import { librariansContest } from './the-librarians-data';

// Cast carousel stills (in production: a gallery field on the contest).
const GALLERY: string[] = [
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/6536a179-534f-4db7-91d4-db63af09f619/1549733_LIB4306_R.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/ff12d182-bdf2-48d5-8a66-cfb84cdf06ef/LIB102_0209r.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/9bd76c92-5cc7-442d-8825-fef7462a66b0/LIB101_1310r.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/c36334ea-50e4-4b84-abd4-15393c7b20d7/26959_001_0567_R.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/6eafe70e-657a-4f1c-8478-7060bc2b0610/26959_007_0814_R.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/6b354f76-5d83-41c8-8110-11e8cae32e46/26959_002_0019_R.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/d13fc9c7-bb93-4be6-8559-4941b47cdb84/26136_010_0528_R.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/6365d665-23f1-48b7-9184-305473384cd5/25533_012_0076_R.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/a67428d2-beb8-415e-b741-7db415af6c11/25533_012_4013_R.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/5f70f7d8-cf90-4e43-ac79-7f1afb5ba66b/25533_006_0163_R.jpg',
  'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/0726e6f8-83fd-4ac1-a87c-7a6e33df0bc3/24946_001_0507_R.jpg',
];

// Passed explicitly because the unified ContestData flattens these into
// brief.theme / brief.styleDirection (and "Symbols, themes, or quotes" has
// internal commas, so it can't be auto-split back reliably).
const DRAW_INSPIRATION = ['Characters', 'Magical artifacts', 'The Library', 'Iconic moments & lore', 'Symbols, themes, or quotes'];
const STYLES_WELCOME = ['Illustration', 'Graphic design', 'Typography', 'Poster style art', 'Modern or nostalgic'];

// The full 7-point legal list (contest.legal only carries ~5 fields).
const LEGAL_POINTS: LegalPoint[] = [
  { label: 'Eligibility', text: 'Participants must be 18 years or older.' },
  { label: 'Original work', text: 'You confirm your submission is your original creation and does not infringe third party rights.' },
  { label: 'Permitted fan work', text: 'You may include elements from The Librarians IP for this contest. Any other third party content requires permission.' },
  { label: 'Limited promo license', text: 'By submitting, you allow MOD to host and display your submission to run and promote the contest while you retain ownership.' },
  { label: 'Winner agreement', text: 'If selected, you will be asked to sign a separate licensing agreement covering commercial use and royalties.' },
  { label: 'Removal and disqualification', text: 'Submissions may be removed or disqualified if they violate rules or upon IP owner request.' },
  { label: 'Privacy', text: 'Your contact info is used to administer the contest and communicate about prizes and royalties.' },
];

export default function Page() {
  return (
    <ContestDetailPage
      contest={librariansContest}
      gallery={GALLERY}
      drawInspiration={DRAW_INSPIRATION}
      stylesWelcome={STYLES_WELCOME}
      legalPoints={LEGAL_POINTS}
      // submissionSlot={<ElfsightForm appId="390dd5ce-..." />}  // drop your real form here
    />
  );
}
