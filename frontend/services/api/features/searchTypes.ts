// ./api/features/searchTypes.ts
// ──────────────────────────────────────────────────────────────────────────────
// Centralized type definitions for the global search feature
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Individual search result item – discriminated union would be ideal,
 * but keeping it simple & flexible as in your current code.
 */
export interface SearchResultItem {
  type: 'artwork' | 'user' | 'brand' | 'contest' | 'category' | 'tag';
  id: string;

  // Common display fields (most items will have at least one of these)
  title?: string; // artworks, contests, brands...
  name?: string; // users, brands, categories...
  username?: string; // users
  slug?: string; // friendly URL part (artworks, users, contests...)

  description?: string | null;

  // Visuals
  image?: string | null; // thumbnail / avatar / poster / logo

  // Optional common metadata
  status?: string; // e.g. "active", "draft", "completed"
  created_at: string; // ISO string

  // Allow backend to send extra type-specific fields without breaking
  [key: string]: any;
}

/**
 * Full shape of the response from /api/search
 */
export interface GlobalSearchResponse {
  results: SearchResultItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Query parameters accepted by the global search endpoint
 */
export interface GlobalSearchParams {
  q: string;
  limit?: number;
  offset?: number;

  /**
   * Optional comma-separated list of types to filter by
   * Example: "artwork,user,brand" or "contest,tag"
   */
  type?: string;
}

// Optional: if you later want a stricter discriminated union approach

export type ArtworkSearchResult = SearchResultItem & {
  type: 'artwork';
  title: string; // required for artworks
  slug?: string;
  // e.g. medium?: string; category?: string; etc.
};

export type UserSearchResult = SearchResultItem & {
  type: 'user';
  username: string; // required for users
  name?: string;
  // e.g. followers_count?: number;
};

export type BrandSearchResult = SearchResultItem & {
  type: 'brand';
  name: string;
  // etc.
};
