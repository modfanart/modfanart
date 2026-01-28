// src/db/types.ts
// Database row types for Kysely – use these in your DB interface for full type safety

export interface UserRow {
  id: string;
  username: string;
  email: string; // citext in DB
  email_verified: boolean;
  password_hash: string | null;
  role_id: string;
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';
  profile: Record<string, any>;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  payout_method: object | null;
  stripe_connect_id: string | null;
  signup_key_used: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RoleRow {
  id: string;
  name: string;
  hierarchy_level: number;
  is_system: boolean;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface UserRoleRow {
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  assigned_at: string;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  revoked_at: string | null;
}

export interface AuthTokenRow {
  id: string;
  user_id: string;
  type: 'email_verification' | 'password_reset';
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface BrandVerificationRequestRow {
  id: string;
  user_id: string;
  company_name: string;
  website: string | null;
  documents: string[] | null;
  status: 'pending' | 'approved' | 'rejected' | 'interview_scheduled';
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TagRow {
  id: string;
  name: string;
  slug: string;
  approved: boolean;
  usage_count: number;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
}

export interface TaggingRow {
  tag_id: string;
  taggable_type: string;
  taggable_id: string;
  created_by: string | null;
  created_at: string;
}

export interface ArtworkRow {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  file_url: string;
  thumbnail_url: string | null;
  source_file_url: string | null;
  status: 'draft' | 'published' | 'archived' | 'moderation_pending' | 'rejected';
  moderation_status: string;
  moderation_notes: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ArtworkPricingTierRow {
  id: string;
  artwork_id: string;
  license_type: 'personal' | 'commercial' | 'exclusive';
  price_inr_cents: number;
  price_usd_cents: number;
  is_active: boolean;
  created_at: string;
}

export interface ArtworkCategoryRow {
  artwork_id: string;
  category_id: string;
}

export interface ContestRow {
  id: string;
  brand_id: string;
  title: string;
  slug: string;
  description: string;
  rules: string | null;
  prizes: Array<{ rank: number; amount_inr?: number; type: string }> | null;
  start_date: string;
  submission_end_date: string;
  voting_end_date: string | null;
  judging_end_date: string | null;
  status: 'draft' | 'published' | 'live' | 'judging' | 'completed' | 'archived';
  visibility: 'public' | 'private' | 'unlisted';
  max_entries_per_user: number;
  entry_requirements: object | null;
  judging_criteria: object | null;
  winner_announced: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ContestCategoryRow {
  contest_id: string;
  category_id: string;
}

export interface ContestEntryRow {
  id: string;
  contest_id: string;
  artwork_id: string;
  creator_id: string;
  submission_notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'disqualified' | 'winner';
  rank: number | null;
  score_public: number;
  score_judge: number;
  moderation_status: string;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContestVoteRow {
  entry_id: string;
  user_id: string;
  vote_weight: number;
  created_at: string;
}

export interface ContestJudgeRow {
  contest_id: string;
  judge_id: string;
  invited_by: string | null;
  accepted: boolean;
}

export interface ContestJudgeScoreRow {
  entry_id: string;
  judge_id: string;
  score: number;
  comments: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  buyer_id: string | null;
  seller_id: string;
  source_type: 'license_purchase' | 'contest_prize' | 'refund' | 'manual';
  source_id: string | null;
  status: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'disputed' | 'failed';
  currency: string;
  subtotal_cents: number;
  platform_fee_cents: number;
  tax_cents: number;
  total_cents: number;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  invoice_pdf_url: string | null;
  invoice_number: string | null;
  paid_at: string | null;
  fulfilled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  artwork_id: string | null;
  license_type: string | null;
  unit_price_cents: number;
  quantity: number;
  description: string | null;
  metadata: object | null;
}

export interface RefundRow {
  id: string;
  order_id: string;
  amount_cents: number;
  reason: string | null;
  status: string;
  stripe_refund_id: string | null;
  approved_by: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface LicenseRow {
  id: string;
  order_item_id: string;
  artwork_id: string;
  buyer_id: string;
  seller_id: string;
  license_type: string;
  contract_pdf_url: string;
  expires_at: string | null;
  is_active: boolean;
  revoked_at: string | null;
  created_at: string;
}

export interface ModerationQueueRow {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  priority: number;
  assigned_to: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  decision: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserViolationRow {
  id: string;
  user_id: string;
  reported_by: string | null;
  entity_type: string | null;
  entity_id: string | null;
  violation_type: string;
  description: string | null;
  status: string;
  strike_issued: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface FavoriteRow {
  user_id: string;
  favoritable_type: string;
  favoritable_id: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: object | null;
  read_at: string | null;
  created_at: string;
}

export interface AuditedEventRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: object | null;
  new_values: object | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface BrandRow {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  social_links: Record<string, string> | null; // JSONB → object
  status: 'active' | 'suspended' | 'pending' | 'deactivated';
  verification_request_id: string | null;
  followers_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface BrandArtworkRow {
  brand_id: string;
  artwork_id: string;
  is_featured: boolean;
  sort_order: number;
  added_at: Date;
}

export interface BrandPostRow {
  id: string;
  brand_id: string;
  title: string;
  content: string | null;
  media_urls: string[] | null;
  status: 'draft' | 'published' | 'archived';
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  upvotes_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface BrandPostLikeRow {
  post_id: string;
  user_id: string;
  created_at: Date;
}

export interface BrandPostCommentRow {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  likes_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface BrandPostUpvoteRow {
  post_id: string;
  user_id: string;
  vote_weight: number;
  created_at: Date;
}

export interface BrandFollowerRow {
  brand_id: string;
  user_id: string;
  followed_at: Date;
}

// src/db/types.ts

// ... all your existing interface exports ...

// ── Database schema for Kysely ──────────────────────────────────────────────

export interface DB {
  users:                    UserRow;
  roles:                    RoleRow;
  user_roles:               UserRoleRow;
  refresh_tokens:           RefreshTokenRow;
  auth_tokens:              AuthTokenRow;
  brand_verification_requests: BrandVerificationRequestRow;
  categories:               CategoryRow;
  tags:                     TagRow;
  taggings:                 TaggingRow;
  artwork:                  ArtworkRow;
  artwork_pricing_tiers:    ArtworkPricingTierRow;
  artwork_categories:       ArtworkCategoryRow;
  contests:                 ContestRow;
  contest_categories:       ContestCategoryRow;
  contest_entries:          ContestEntryRow;
  contest_votes:            ContestVoteRow;
  contest_judges:           ContestJudgeRow;
  contest_judge_scores:     ContestJudgeScoreRow;
  orders:                   OrderRow;
  order_items:              OrderItemRow;
  refunds:                  RefundRow;
  licenses:                 LicenseRow;
  moderation_queue:         ModerationQueueRow;
  user_violations:          UserViolationRow;
  favorites:                FavoriteRow;
  notifications:            NotificationRow;
  audited_events:           AuditedEventRow;
brands: BrandRow;
  brand_artworks: BrandArtworkRow;
  brand_posts: BrandPostRow;
  brand_post_likes: BrandPostLikeRow;
  brand_post_comments: BrandPostCommentRow;
  brand_post_upvotes: BrandPostUpvoteRow;
  brand_followers: BrandFollowerRow;
  // If you use composite primary keys or want stricter typing later,
  // you can replace e.g. UserRow → UserTable (with more specific fields)
}