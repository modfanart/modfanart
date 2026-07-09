import type { ContestData } from '../contest.types.js';


export const librariansContest: ContestData = {
  id: 'd56343d5-47b3-489a-891e-f347a161e764', // real contests.id (uuid) in the database
  status: 'open', // NOT ON PAGE as a field; July 15 deadline is in the future. See "closed" notice preserved below.
  visibility: 'public', // NOT ON PAGE

  brand: {
    name: 'The Librarians',
    logoInitial: 'T', // NOT ON PAGE (first letter of brand name)
    logoUrl: null,
    accentColor: null, // NOT ON PAGE
    bgColor: null,
    surfaceColor: null,
  },

  heroImageUrl:
    'http://modfanart.com/cdn/shop/files/art_collage_3_ea92c133-a198-4bb0-9b22-3b67e9156b45.png?v=1763669699', // og:image meta
  heroVideoUrl:
    'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/f9fd66d7-884a-41d1-8a22-e5b04a52551b/Updated_Motion_Fan-Creators.mp4',
  title: 'The Librarians Official Fan Art Contest',
  tagline: 'BRING YOUR CREATIVITY INTO THE WORLD OF THE LIBRARIANS!',
  contestType: 'Fan Art Contest', 
  region: 'Global',
  ageRequirement: '18+',

  submissionDeadlineDisplay: 'July 31, 2026', 
  winnersCount: 10,
  prizeModel: 'Cash + Royalties + Licensing', 
  productFocus: 'Apparel', 
  startDateDisplay: 'July 1, 2026 12:00 PM EST',

  submissionDeadlineIso: '2026-07-31', 
  submissionDeadlineAt: null, 
  startDateAt: '2026-07-01T12:00:00-05:00', // from "July 1st, 2026 12:00 PM EST"
  timezone: 'America/New_York',

  winnersAnnouncedDisplay: 'August 11-14, 2026', 
  eligibilityLabel: 'Participants must be 18 years or older.',

  // "What You Get" list 
  prizeSummary: {
    headline:
      'Each winner receives $100 plus 5% royalties from every sale of their design.',
    bullets: [
      'Ongoing royalties from merch sales.',
      'Officially licensed and showcased artwork.',
      'Your design recognized and sold as part of the Official Librarians Fan Merch Collection.',
    ],
  },
  // Hero stats + key facts 
  submissionSnapshot: [
    '10 artists selected',
    '$100 USD cash prize per winner',
    '5% royalties from every sale of their design',
    'Participants must be 18 years or older',
  ],
  // "Prizes and compensation" -> WINNERS 
  commercialIntent: [
    '10 selected submissions',
    'Officially licensed artwork',
    'Global distribution via the official collection',
  ],
  // Hero intro + overview statements + details intro 
  overviewParagraphs: [
    'For the first time ever, fan artists are invited to submit original artwork inspired by The Librarians universe — with the opportunity to have your work officially licensed, turned into real merchandise, and sold to fans worldwide.',
    'This is your chance to move from fan art to canon.',
    'We are selecting 10 winning artworks to become part of the Official Librarians Fan Merch Collection. Each winner receives $100 plus 5% royalties from every sale of their design.',
    'Everything you need to know to submit fan art for The Librarians Official Fan Art Contest. Keep it original, keep it true to the universe, and keep it printable.',
  ],

  brief: {
    guidelinesPdfUrl: null,
    // "What to submit" intro + "Draw inspiration from" 
    theme:
      "We're looking for original fan art inspired by The Librarians universe — past, present, or future. Draw inspiration from: Characters, Magical artifacts, The Library, Iconic moments & lore, Symbols, themes, or quotes.",
    // "Styles welcome" + closing 
    styleDirection:
      'Styles welcome: Illustration, Graphic design, Typography, Poster style art, Modern or nostalgic. If it feels authentically Librarians — we want to see it.',
    targetAudience: null,
    // Rules tab -> "What we want you to make" 
    referenceNotes:
      'Create artwork that feels authentically Librarians. You can draw inspiration from characters, artifacts, the Library, iconic moments, symbols, lore, and themes from any era of the series. Illustration, graphic design, typography, poster style. Modern or nostalgic. Recognizable elements fans instantly know.',
    referenceImages: [],
  },

  requirements: {
    // Overview -> ALLOWED
    allowed: [
      'Original fan art in your own style',
      'Recognizable Librarians inspired elements',
      'Respectful, on brand interpretations',
    ],
    // Rules tab -> "Not allowed" 
    notAllowed: [
      'No AI generated art',
      'No copyrighted material from other franchises',
      'No copied official key art',
      'No explicit, hateful, or harmful content',
    ],
    // Overview -> CHECKLIST
    remember: [
      'Explicit content',
      'Hate, harassment, or harmful depictions',
      'Anything that could damage the brand',
    ],
    specs: {
      fileFormats: 'JPG, PNG, or PDF',
      minResolution:
        'Minimum 300 DPI recommended. Upload clear, high quality images (minimum 1200px on the longest side).',
      requiredFields:
        'Include a short description of your artwork and what it references in The Librarians universe. Keep it simple and specific.',
      mockupRequired: 'Optional', // NOT ON PAGE
      printArea:
        'Design with apparel printing in mind. A common DTG maximum print area is about 12 by 16 inches. If you work in pixels, a safe target is about 3600 by 4800 px.',
      printGuideImageUrl:
        'https://files.elfsightcdn.com/10f57fcd-29bb-4da4-9c09-61ea49a5bf6e/9d79a82f-db7a-4980-b7a6-72d5ee7b1674/Screenshot-2026-01-04-at-3-44-57-AM.png',
    },
  },

  submissionRules: {
    maxEntriesPerArtist: null,
    aiPolicy: 'prohibited',
    aiPolicyLabel: 'No AI generated art',
  },

  products: {
    categories: [], // page lists no product categories
    description:
      'Your design recognized and sold as part of the Official Librarians Fan Merch Collection.',
  },

  // "Prizes and compensation" -> PAYOUT 
  prizes: [
    {
      place: 'Winners',
      amount: '$100 guaranteed per winner',
      description:
        '5% royalties from every sale of their design. Official credit as a licensed fan artist. Global distribution via the official collection.',
      count: 10,
    },
  ],
  licensingOpportunityNote:
    'Winner agreement: If selected, you will be asked to sign a separate licensing agreement covering commercial use and royalties.',
  royaltyRate: 5,
  royaltyNote:
    'Royalty payments are handled through the winner licensing agreement after selection.',

  timeline: [
    { label: 'Submissions open', date: 'July 1st, 2026 12:00 PM EST' },
    { label: 'Submission deadline', date: 'July 31st, 2026' }, // 
    { label: 'Winners announced', date: 'August 11-14, 2026' }, // 
    { label: 'Merch launch', date: 'Shortly after selection' },
  ],

  howItWorks: [
    {
      step: 1,
      title: 'Submit your artwork',
      description: 'Upload your original fan art inspired by The Librarians.',
    },
    {
      step: 2,
      title: 'Review and selection',
      description:
        'Submissions are reviewed for creativity, quality, and fit with the franchise.',
    },
    {
      step: 3,
      title: 'Winners announced',
      description: '10 artists are selected and contacted with next steps.',
    },
    {
      step: 4,
      title: 'Licensing and production',
      description: 'Winning designs are officially licensed and produced as merch.',
    },
    {
      step: 5,
      title: 'Get paid',
      description:
        'Each winner receives $100 cash plus 5% royalties from every sale of their design.',
    },
  ],

  judging: {
    // Page states one sentence, not per-criterion descriptions 
    criteria: [
      {
        title: 'Review criteria',
        description:
          'Submissions are reviewed for creativity, quality, and fit with the franchise.',
      },
    ],
    selectionType: null, 
    reviewTeam: null, 
  },

  // Legal sub-fields hold the closest-matching points VERBATIM.
  // The FULL 7-point legal list is preserved in the bottom comment block.
  legal: {
    licenseType:
      'Winner agreement: If selected, you will be asked to sign a separate licensing agreement covering commercial use and royalties.',
    rightsGranted:
      'Limited promo license: By submitting, you allow MOD to host and display your submission to run and promote the contest while you retain ownership.',
    territory: 'Global', // NOT in the legal section; from "Global distribution"
    aiPolicy:
      'AI generated art is not allowed for this contest. Submissions must be created by the artist.',
    ageRequirement: 'Eligibility: Participants must be 18 years or older.',
    termsUrl: 'https://modfanart.com/pages/submission-terms-and-conditions',
  },

  faq: [
    {
      question: 'Who can enter and how many winners are selected?',
      answer:
        'Participants must be 18 years or older. We will select 10 winning artworks.',
    },
    {
      question: 'What can I submit for this contest?',
      answer:
        'Submit original fan art inspired by The Librarians. You can draw inspiration from characters, artifacts, the Library, iconic moments, symbols, and lore. Any style is welcome as long as it feels authentically Librarians and is printable for merch.',
    },
    {
      question: 'Is AI generated or AI assisted art allowed?',
      answer:
        'No. AI generated art is not allowed for this contest. Submissions must be created by the artist.',
    },
    {
      question: 'What are the prizes and how do royalties work?',
      answer:
        'Each selected winner receives: $100 cash prize; 5% royalties from every sale of their design; Official credit as a licensed fan artist; Distribution via the official collection. Royalty payments are handled through the winner licensing agreement after selection.',
    },
    {
      question: 'Do I keep ownership of my artwork?',
      answer:
        'No. You transfer ownership. If selected, you will grant a commercial license for your design under agreed terms so it can be produced and sold as official merch, with royalties paid to you. You are still allowed to post and promote your work however you will not be able to commercialize it directly.',
    },
    {
      question: 'What happens after I submit?',
      answer:
        'Submissions are reviewed for creativity, quality, and fit with The Librarians. If selected, we will contact you to confirm final files, payout details, and the licensing agreement.',
    },
    {
      question: 'What file types and sizes should I upload?',
      answer:
        'Accepted formats are JPG, PNG, or PDF. We recommend 300 DPI for print readiness, and clear high quality images (minimum 1200px on the longest side).',
    },
    {
      question: 'What is the recommended print area for apparel?',
      answer:
        'A common DTG maximum print area is about 12 by 16 inches. If you work in pixels, a safe target is about 3600 by 4800 px. Designing within this safe area helps your art translate cleanly to merch.',
    },
    {
      question: 'What is the deadline and when are winners announced?',
      answer:
        'Submissions open: Now; Submission deadline: July 31, 2026; Winners announced: August 11th-14th, 2026; Merch launch: Shortly after selection.',
    },
    {
      question: 'Where can I read the full legal terms and conditions?',
      answer:
        'You can view the full legal terms here: Submission Terms and Conditions (https://modfanart.com/pages/submission-terms-and-conditions).',
    },
  ],

  // Rules tab -> "Must be true" used as the checklist
  submissionChecklist: [
    'Submissions must be original artwork',
    'Artwork must be inspired by The Librarians IP',
    'Keep it printable and merch friendly',
    'Participants must be 18 years or older',
  ],
  inspirationNote: 'If it feels authentically Librarians — we want to see it.',

  submitUrl: null, // no active submit link captured
  termsUrl: 'https://modfanart.com/pages/submission-terms-and-conditions',
};
