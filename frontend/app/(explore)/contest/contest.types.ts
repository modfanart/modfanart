// contest.types.ts


export type ContestStatus =
  | 'draft'
  | 'open'
  | 'closed'
  | 'judging'
  | 'completed'
  | 'archived';

export type Visibility = 'public' | 'private' | 'unlisted';

export type AiPolicy = 'allowed' | 'disclosure_required' | 'prohibited';

export type MockupRequirement = 'Required' | 'Optional';

export interface Brand {
  name: string;
  logoInitial: string;
  logoUrl: string | null;
  accentColor: string | null;
  bgColor: string | null;
  surfaceColor: string | null;
}

export interface PrizeSummary {
  headline: string;
  bullets: string[];
}

export interface ReferenceImage {
  url: string;
  caption?: string;
  alt?: string;
}

export interface Brief {
  guidelinesPdfUrl: string | null;
  theme: string;
  styleDirection: string;
  targetAudience: string | null;
  referenceNotes: string;
  referenceImages: ReferenceImage[];
}

export interface SubmissionSpecs {
  fileFormats: string;
  minResolution: string;
  requiredFields: string;
  mockupRequired: MockupRequirement;
  printArea?: string | null;
  printGuideImageUrl?: string | null;
}

export interface Requirements {
  allowed: string[];
  notAllowed: string[];
  remember: string[];
  specs: SubmissionSpecs;
}

export interface SubmissionRules {
  maxEntriesPerArtist: number | null;
  aiPolicy: AiPolicy;
  aiPolicyLabel: string;
}

export interface Products {
  categories: string[];
  description: string;
}

export interface PrizeTier {
  place: string;
  amount: string;
  description: string;
  count?: number;
}

export interface TimelineEntry {
  label: string;
  date: string;
}

export interface JudgingCriterion {
  title: string;
  description: string;
}

export interface Judging {
  criteria: JudgingCriterion[];
  selectionType: string | null;
  reviewTeam: string | null;
}

export interface Legal {
  licenseType: string;
  rightsGranted: string;
  territory: string;
  aiPolicy: string;
  ageRequirement: string;
  termsUrl: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export interface ContestData {
  id: string;
  status: ContestStatus;
  visibility: Visibility;

  brand: Brand;

  heroImageUrl: string;
  heroVideoUrl?: string | null;
  title: string;
  tagline: string;
  contestType: string;
  region: string;
  ageRequirement: string;

  submissionDeadlineDisplay: string;
  winnersCount: number;
  prizeModel: string;
  productFocus: string;
  startDateDisplay: string;

  submissionDeadlineIso: string;
  submissionDeadlineAt?: string | null;
  startDateAt?: string | null;
  timezone?: string | null;

  winnersAnnouncedDisplay: string;
  eligibilityLabel: string;

  prizeSummary: PrizeSummary;
  submissionSnapshot: string[];
  commercialIntent: string[];
  overviewParagraphs: string[];

  brief: Brief;
  requirements: Requirements;
  submissionRules: SubmissionRules;
  products: Products;

  prizes: PrizeTier[];
  licensingOpportunityNote: string;
  royaltyRate?: number | null;
  royaltyNote?: string | null;

  timeline: TimelineEntry[];
  howItWorks?: HowItWorksStep[];

  judging: Judging;
  legal: Legal;
  faq: FaqItem[];

  submissionChecklist: string[];
  inspirationNote: string;

  submitUrl: string | null;
  termsUrl: string;
}

