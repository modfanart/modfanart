// ./api/features/searchTypes.ts

// ─────────────────────────────────────────────
// Individual result item
// ─────────────────────────────────────────────
export interface SearchResultItem {
  type: 'artwork' | 'user' | 'brand' | 'contest' | 'category' | 'tag';
  id: string;

  // Main UI fields (match backend controller)
  title: string;
  subtitle?: string | null;
  image?: string | null;
  extra?: string | null;

  created_at: string;

  // Optional metadata
  slug?: string;
  status?: string;
  description?: string | null;

  // Allow backend expansion without breaking
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
// API response
// ─────────────────────────────────────────────
export interface GlobalSearchResponse {
  results: SearchResultItem[];
  total: number;
  limit: number;
  offset: number;
}

// ─────────────────────────────────────────────
// Query params
// ─────────────────────────────────────────────
export interface GlobalSearchParams {
  q: string;
  limit?: number;
  offset?: number;
  type?: string;
}

// ─────────────────────────────────────────────
// Optional stricter result types
// ─────────────────────────────────────────────
export type ArtworkSearchResult = SearchResultItem & {
  type: 'artwork';
  title: string;
};

export type UserSearchResult = SearchResultItem & {
  type: 'user';
  title: string;
};

export type BrandSearchResult = SearchResultItem & {
  type: 'brand';
  title: string;
};
