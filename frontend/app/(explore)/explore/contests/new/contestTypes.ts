// ─────────────────────────────────────────────
//  Contest Data Types & Sample JSON
// ─────────────────────────────────────────────

export type ContestStatus = "draft" | "open" | "review" | "closed" | "completed";
export type Visibility    = "public" | "private" | "invite_only";
export type AIPolicy      = "not_allowed" | "disclosure_required" | "allowed";

export interface ContestBrand {
  name:         string;       // "Dark Legends"
  logoInitial:  string;       // "D"  (shown in brandmark avatar when no logo)
  logoUrl:      string | null;
  accentColor:  string;       // "#2563eb"
  bgColor:      string;       // "#f4f6fb"
  surfaceColor: string;       // "#ffffff"
}

export interface ContestBrief {
  guidelinesPdfUrl: string | null; // null hides the download banner
  theme:            string;
  styleDirection:   string;
  targetAudience:   string;
  referenceNotes:   string;
  referenceImages:  string[];      // array of image URLs (up to ~6)
}

export interface SubmissionSpecs {
  fileFormats:     string;   // "PNG, PSD, AI, SVG"
  minResolution:   string;   // "300 DPI / 4500 × 5400 px"
  requiredFields:  string;   // "Title, description, tags, process notes"
  mockupRequired:  string;   // "Optional" | "Required"
}

export interface ContestRequirements {
  allowed:         string[];
  notAllowed:      string[];
  remember:        string[];
  specs:           SubmissionSpecs;
}

export interface SubmissionRules {
  maxEntriesPerArtist: number;
  aiPolicy:            AIPolicy;
  aiPolicyLabel:       string;   // human-readable e.g. "AI assisted only with disclosure"
}

export interface ContestProducts {
  categories:  string[];   // ["T-Shirts", "Hoodies", "Posters", …]
  description: string;
}

export interface ContestPrize {
  place:       string;  // "1st Place"
  amount:      string;  // "$1,000"
  description: string;
}

export interface TimelineEntry {
  label: string;   // "Submissions Open"
  date:  string;   // "17 March 2026"
}

export interface JudgingCriterion {
  title:       string;
  description: string;
}

export interface ContestJudging {
  criteria:      JudgingCriterion[];
  selectionType: string;   // "Internal Brand and MOD Review"
  reviewTeam:    string;   // "Brand Team, MOD Licensing Team, Guest Judges if applicable"
}

export interface ContestLegal {
  licenseType:    string;   // "Optional on selection"
  rightsGranted:  string;
  territory:      string;   // "Global"
  aiPolicy:       string;   // "AI assisted only with disclosure"
  ageRequirement: string;   // "18+"
  termsUrl:       string;
}

export interface FAQItem {
  question: string;
  answer:   string;
}

export interface PrizeSummary {
  headline: string;    // "$2,000 Prize Pool + Official Licensing Opportunity"
  bullets:  string[];
}

// ─────────────────────────────────────────────
//  Root Contest Object
// ─────────────────────────────────────────────

export interface ContestData {
  // Identity
  id:         string;
  status:     ContestStatus;
  visibility: Visibility;

  // Branding & theming
  brand: ContestBrand;

  // Hero section
  heroImageUrl:    string;
  title:           string;
  tagline:         string;        // short description beneath title
  contestType:     string;        // "Fan Art Contest"
  region:          string;        // "Global"
  ageRequirement:  string;        // "18+"

  // Hero stat bar (4 quick stats)
  submissionDeadlineDisplay: string;  // "9 April 2026"
  winnersCount:               number;
  prizeModel:                 string; // "Cash + Licensing"
  productFocus:               string; // "Apparel + Posters"

  // Status bar
  startDateDisplay:          string;  // "17 March 2026"
  submissionDeadlineIso:     string;  // "2026-04-09"  (for countdown logic)
  winnersAnnouncedDisplay:   string;  // "Shortly After Deadline"
  eligibilityLabel:          string;  // "Global, 18+"

  // Summary cards (3 cards under hero)
  prizeSummary:      PrizeSummary;
  submissionSnapshot: string[];
  commercialIntent:  string[];

  // Overview
  overviewParagraphs: string[];

  // Creative brief
  brief: ContestBrief;

  // Requirements + submission rules
  requirements:    ContestRequirements;
  submissionRules: SubmissionRules;

  // Products
  products: ContestProducts;

  // Prizes
  prizes:                   ContestPrize[];
  licensingOpportunityNote: string;

  // Timeline
  timeline: TimelineEntry[];

  // Judging
  judging: ContestJudging;

  // Legal
  legal: ContestLegal;

  // FAQ
  faq: FAQItem[];

  // Sidebar
  submissionChecklist: string[];
  inspirationNote:     string;

  // CTA
  submitUrl: string;
  termsUrl:  string;
}

// ─────────────────────────────────────────────
//  Sample / Default Contest JSON
// ─────────────────────────────────────────────

export const sampleContest: ContestData = {
  id:         "contest_dark_legends_2026",
  status:     "open",
  visibility: "public",

  brand: {
    name:         "Dark Legends",
    logoInitial:  "D",
    logoUrl:      null,
    accentColor:  "#2563eb",
    bgColor:      "#f4f6fb",
    surfaceColor: "#ffffff",
  },

  heroImageUrl:
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80",
  title:          "Dark Legends Official Merch Design Contest",
  tagline:
    "Create original artwork inspired by the world, characters, and themes of Dark Legends for a chance to be licensed, produced, and sold as official merchandise.",
  contestType:    "Fan Art Contest",
  region:         "Global",
  ageRequirement: "18+",

  submissionDeadlineDisplay: "9 April 2026",
  winnersCount:               3,
  prizeModel:                 "Cash + Licensing",
  productFocus:               "Apparel + Posters",

  startDateDisplay:        "17 March 2026",
  submissionDeadlineIso:   "2026-04-09",
  winnersAnnouncedDisplay: "Shortly After Deadline",
  eligibilityLabel:        "Global, 18+",

  prizeSummary: {
    headline: "$2,000 Prize Pool + Official Licensing Opportunity",
    bullets: [
      "Cash prizes for top entries",
      "Selected designs may be licensed and produced",
      "Exposure across MOD and brand channels",
    ],
  },
  submissionSnapshot: [
    "Up to 3 entries per artist",
    "PNG, PSD, AI, SVG accepted",
    "300 DPI minimum for print ready work",
    "AI assisted only with disclosure",
  ],
  commercialIntent: [
    "Winning designs may be sold commercially",
    "Launch planned on MOD marketplace",
    "Potential brand storefront release",
    "Royalty structure shared with finalists",
  ],

  overviewParagraphs: [
    "This campaign invites artists, designers, and fan creators to develop original merchandise ready artwork inspired by Dark Legends. Selected entries may move beyond the contest itself and into official licensing conversations, production, and release across MOD and brand sales channels.",
    "The brand is looking for strong creative interpretations that feel true to the IP while still bringing a fresh point of view. Designs should feel commercially viable, visually compelling, and appropriate for the planned product categories.",
  ],

  brief: {
    guidelinesPdfUrl: "/files/dark-legends-brand-guidelines.pdf",
    theme:
      "Dark fantasy iconography, ancient factions, cursed relics, warrior myths, and high contrast character energy.",
    styleDirection:
      "Premium graphic apparel, collectible poster aesthetics, atmospheric, bold composition, dramatic silhouettes, clean print execution.",
    targetAudience:
      "Core fandom collectors, fantasy genre fans, dark apparel buyers, con going audiences, and premium merch shoppers.",
    referenceNotes:
      "Use official lore, approved symbols, and character energy as inspiration. Avoid direct scene copies or traced promotional material.",
    referenceImages: [],
  },

  requirements: {
    allowed: [
      "100% original artwork",
      "Theme relevant creative interpretations",
      "Print friendly merchandise designs",
      "AI assisted workflow only if disclosed",
      "Layered source files for selected finalists",
    ],
    notAllowed: [
      "Fully AI generated content without disclosure",
      "Traced or copied official artwork",
      "NSFW, hateful, harmful, or offensive content",
      "Unlicensed third party IP",
      "Low resolution non production ready designs",
    ],
    remember: [
      "Maximum 3 entries per person",
      "Follow all brand guidelines provided",
      "Be respectful of the IP and community",
      "Commercial readiness matters",
      "Originality confirmation required on submit",
    ],
    specs: {
      fileFormats:    "PNG, PSD, AI, SVG",
      minResolution:  "300 DPI / 4500 x 5400 px",
      requiredFields: "Title, description, tags, process notes",
      mockupRequired: "Optional",
    },
  },

  submissionRules: {
    maxEntriesPerArtist: 3,
    aiPolicy:            "disclosure_required",
    aiPolicyLabel:       "Disclose Usage",
  },

  products: {
    categories:  ["T-Shirts", "Hoodies", "Posters", "Stickers", "Accessories"],
    description:
      "Winning or selected designs may be adapted for physical merchandise. Product rollout may include the MOD marketplace, the official brand storefront, or both depending on final approvals and campaign performance.",
  },

  prizes: [
    { place: "1st Place", amount: "$1,000", description: "Cash prize, featured winner spotlight, and priority licensing review." },
    { place: "2nd Place", amount: "$600",   description: "Cash prize and official campaign feature across MOD channels." },
    { place: "3rd Place", amount: "$400",   description: "Cash prize and honorable mention placement." },
  ],
  licensingOpportunityNote:
    "Separate from prize placement, selected artwork may be licensed for official merchandise release. Royalty terms, product scope, duration, and channel distribution will be confirmed directly with selected artists where applicable.",

  timeline: [
    { label: "Submissions Open",    date: "17 March 2026" },
    { label: "Submission Deadline", date: "9 April 2026" },
    { label: "Review Period",       date: "10 to 18 April 2026" },
    { label: "Winners Announced",   date: "Shortly After Deadline" },
    { label: "Target Merch Launch", date: "May 2026" },
  ],

  judging: {
    criteria: [
      { title: "Brand Fit",         description: "How well the concept reflects the source IP, campaign theme, and audience." },
      { title: "Originality",       description: "Fresh interpretation, authenticity, and clearly original creative work." },
      { title: "Commercial Appeal", description: "Merch readiness, print viability, and product marketability." },
      { title: "Execution",         description: "Strong composition, quality, technical polish, and file readiness." },
    ],
    selectionType: "Internal Brand and MOD Review",
    reviewTeam:    "Brand Team, MOD Licensing Team, Guest Judges if applicable",
  },

  legal: {
    licenseType:    "Optional on selection",
    rightsGranted:  "Commercial merchandising, digital promotion, and marketing use as specified in final agreement.",
    territory:      "Global",
    aiPolicy:       "AI assisted only with disclosure",
    ageRequirement: "18+",
    termsUrl:       "#",
  },

  faq: [
    {
      question: "Can I submit more than one design?",
      answer:   "Yes. This campaign allows up to 3 entries per artist unless otherwise stated in the submission rules.",
    },
    {
      question: "Can my art be licensed even if I do not place in the top 3?",
      answer:   "Yes. The brand may choose additional entries for licensing or future consideration outside the official prize ranking.",
    },
    {
      question: "Can I use AI tools?",
      answer:   "Only if the campaign allows it and you disclose your process. Fully AI generated, non transformative submissions may be rejected.",
    },
    {
      question: "Where will winning merchandise be sold?",
      answer:   "Depending on approvals, products may launch on the MOD marketplace, the brand store, or both.",
    },
  ],

  submissionChecklist: [
    "Original artwork only",
    "Correct file format and resolution",
    "Title and description included",
    "AI disclosure if applicable",
    "Agree to submission terms",
  ],
  inspirationNote:
    "Review the creative brief, approved themes, and reference materials before submitting your concept.",

  submitUrl: "#",
  termsUrl:  "#",
};
