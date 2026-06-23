-- Database Schema for Art Platform
-- PostgreSQL with extensions: pgcrypto (for gen_random_uuid), citext

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- 1. USERS & AUTH CORE
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username varchar(50) UNIQUE NOT NULL,
    email citext UNIQUE NOT NULL,
    email_verified boolean DEFAULT false,
    password_hash text,
    role_id uuid NOT NULL,
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification', 'deactivated')),
    profile jsonb DEFAULT '{}',
    avatar_url text,
    banner_url text,
    bio text,
    location text,
    website text,
    payout_method jsonb, -- {type: 'stripe', account_id: '...'} or UPI
    stripe_connect_id text,
    signup_key_used text, -- for MVP restricted signup
    last_login_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

-- Hierarchical Roles
CREATE TABLE roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(50) UNIQUE NOT NULL, -- 'guest', 'default_user', 'premium_creator', 'brand_pending', 'brand', 'judge', 'admin', 'super_admin'
    hierarchy_level int NOT NULL, -- higher = more power
    is_system boolean DEFAULT true,
    permissions jsonb DEFAULT '{}', -- { "contests.create": true, "ecom.listings.create": true }
    created_at timestamptz DEFAULT now()
);

-- User <-> Role (for future multi-role support)
CREATE TABLE user_roles (
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_by uuid REFERENCES users(id),
    assigned_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

-- Sessions & Tokens
CREATE TABLE refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    revoked_at timestamptz
);

-- Email Verification & Password Reset Tokens
CREATE TABLE auth_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type varchar(20) NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Brand Verification Requests
CREATE TABLE brand_verification_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name text NOT NULL,
    website text,
    documents jsonb, -- array of uploaded file URLs
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'interview_scheduled')),
    reviewed_by uuid REFERENCES users(id),
    reviewed_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. CATEGORIES & TAGS
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    slug varchar(100) UNIQUE NOT NULL,
    parent_id uuid REFERENCES categories(id),
    description text,
    icon_url text,
    sort_order int DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) UNIQUE NOT NULL,
    slug varchar(100) UNIQUE NOT NULL,
    approved boolean DEFAULT false,
    usage_count int DEFAULT 0,
    created_by uuid REFERENCES users(id),
    approved_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now()
);

-- Polymorphic tagging system
CREATE TABLE taggings (
    tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    taggable_type varchar(50) NOT NULL,
    taggable_id uuid NOT NULL,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (tag_id, taggable_type, taggable_id)
);

-- 3. ARTWORKS / LISTINGS (E-COMMERCE CORE)
CREATE TABLE artworks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    thumbnail_url text,
    source_file_url text, -- original high-res
    status varchar(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'moderation_pending', 'rejected')),
    moderation_status varchar(20) DEFAULT 'pending',
    moderation_notes text,
    moderated_by uuid REFERENCES users(id),
    moderated_at timestamptz,
    views_count bigint DEFAULT 0,
    favorites_count int DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

-- Pricing Tiers per Artwork
CREATE TABLE artwork_pricing_tiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    license_type varchar(30) NOT NULL CHECK (license_type IN ('personal', 'commercial', 'exclusive')),
    price_inr_cents bigint NOT NULL,
    price_usd_cents bigint NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Category assignment for artworks
CREATE TABLE artwork_categories (
    artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
    category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (artwork_id, category_id)
);

-- 4. CONTESTS
CREATE TABLE contests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text NOT NULL,
    rules text,
    prizes jsonb, -- [{rank: 1, amount_inr: 500000, type: 'cash'}]
    start_date timestamptz NOT NULL,
    submission_end_date timestamptz NOT NULL,
    voting_end_date timestamptz,
    judging_end_date timestamptz,
    status varchar(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'live', 'judging', 'completed', 'archived')),
    visibility varchar(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    max_entries_per_user int DEFAULT 1,
    entry_requirements jsonb,
    judging_criteria jsonb,
    winner_announced boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
);

-- Contest <-> Category
CREATE TABLE contest_categories (
    contest_id uuid REFERENCES contests(id) ON DELETE CASCADE,
    category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (contest_id, category_id)
);

-- Contest Entries
CREATE TABLE contest_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE RESTRICT,
    creator_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    submission_notes text,
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disqualified', 'winner')),
    rank int,
    score_public numeric(5,2) DEFAULT 0,
    score_judge numeric(5,2) DEFAULT 0,
    moderation_status varchar(20) DEFAULT 'pending',
    moderated_by uuid REFERENCES users(id),
    moderated_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Voting (anti-cheat: one vote per user per entry)
CREATE TABLE contest_votes (
    entry_id uuid NOT NULL REFERENCES contest_entries(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    vote_weight int DEFAULT 1, -- future: premium users get 2x
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (entry_id, user_id)
);

-- Judges Assignment
CREATE TABLE contest_judges (
    contest_id uuid REFERENCES contests(id) ON DELETE CASCADE,
    judge_id uuid REFERENCES users(id) ON DELETE CASCADE,
    invited_by uuid REFERENCES users(id),
    accepted boolean DEFAULT false,
    PRIMARY KEY (contest_id, judge_id)
);

-- Judge Scores
CREATE TABLE contest_judge_scores (
    entry_id uuid REFERENCES contest_entries(id) ON DELETE CASCADE,
    judge_id uuid REFERENCES users(id) ON DELETE CASCADE,
    score numeric(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    comments text,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (entry_id, judge_id)
);

-- 5. ORDERS & INVOICES
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number varchar(50) UNIQUE NOT NULL, -- e.g., ORD-2025-000123
    buyer_id uuid REFERENCES users(id),
    seller_id uuid NOT NULL REFERENCES users(id),
    source_type varchar(30) NOT NULL CHECK (source_type IN ('license_purchase', 'contest_prize', 'refund', 'manual')),
    source_id uuid, -- artwork_id, contest_entry_id, etc.
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'refunded', 'disputed', 'failed')),
    currency char(3) DEFAULT 'INR',
    subtotal_cents bigint NOT NULL,
    platform_fee_cents bigint NOT NULL,
    tax_cents bigint DEFAULT 0,
    total_cents bigint NOT NULL,
    stripe_payment_intent_id text,
    stripe_charge_id text,
    invoice_pdf_url text,
    invoice_number varchar(50) UNIQUE,
    paid_at timestamptz,
    fulfilled_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Order Line Items (immutable snapshot)
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    artwork_id uuid REFERENCES artworks(id),
    license_type varchar(30),
    unit_price_cents bigint NOT NULL,
    quantity int DEFAULT 1,
    description text,
    metadata jsonb
);

-- Refunds
CREATE TABLE refunds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount_cents bigint NOT NULL,
    reason text,
    status varchar(20) DEFAULT 'requested',
    stripe_refund_id text,
    approved_by uuid REFERENCES users(id),
    processed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 6. LICENSES (Issued on purchase)
CREATE TABLE licenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
    artwork_id uuid NOT NULL REFERENCES artworks(id),
    buyer_id uuid NOT NULL REFERENCES users(id),
    seller_id uuid NOT NULL REFERENCES users(id),
    license_type varchar(30) NOT NULL,
    contract_pdf_url text NOT NULL,
    expires_at timestamptz, -- null = perpetual
    is_active boolean DEFAULT true,
    revoked_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 7. MODERATION & VIOLATIONS
CREATE TABLE moderation_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type varchar(50) NOT NULL, -- 'artwork', 'contest_entry', 'listing', 'user'
    entity_id uuid NOT NULL,
    status varchar(20) DEFAULT 'pending',
    priority int DEFAULT 0,
    assigned_to uuid REFERENCES users(id),
    reviewed_by uuid REFERENCES users(id),
    reviewed_at timestamptz,
    decision varchar(20), -- 'approved', 'rejected', 'flagged'
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE user_violations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_by uuid REFERENCES users(id),
    entity_type varchar(50),
    entity_id uuid,
    violation_type varchar(50) NOT NULL,
    description text,
    status varchar(20) DEFAULT 'open',
    strike_issued boolean DEFAULT false,
    resolved_by uuid REFERENCES users(id),
    resolved_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 8. FAVORITES & ACTIVITY
CREATE TABLE favorites (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    favoritable_type varchar(50) NOT NULL,
    favoritable_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, favoritable_type, favoritable_id)
);

-- 9. NOTIFICATIONS
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type varchar(50) NOT NULL,
    title text NOT NULL,
    body text,
    data jsonb,
    read_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 10. AUDIT & ACTIVITY LOG (Global)
CREATE TABLE audited_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES users(id),
    action varchar(100) NOT NULL,
    entity_type varchar(50),
    entity_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);