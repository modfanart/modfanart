// 001_baseline.js
//
// Baseline migration capturing the schema of the live dev database as of 2026-07-13,
// introspected directly (pg_dump against the Neon dev DB, server version 17.10) rather than
// from the stale mod_dev_test_backup.sql dump at the repo root, which is missing columns
// (e.g. users.firebase_uid) and constraints that the live DB and running application code
// actually depend on. See docs/EXISTING_STATE.md for the audit that surfaced this drift.
//
// Every statement is written to be a no-op against a database that already has this schema:
//   - CREATE TABLE / CREATE INDEX use IF NOT EXISTS
//   - CREATE TYPE is wrapped in a DO block that swallows duplicate_object (42710)
//   - ADD CONSTRAINT is wrapped in a DO block that checks pg_constraint by name first --
//     duplicate_object alone is not sufficient here: adding a second PRIMARY KEY to a
//     table that already has one raises invalid_table_definition (42P16), a different
//     exception class, not duplicate_object.
// This makes the migration safe to run against both a fresh database and the existing dev
// database. It intentionally does not attempt to be reversible -- down() is a no-op by
// design; hand-rolling DROPs for 43 interdependent tables to 'undo' a baseline is not
// something a migration tool should ever do automatically.

const statements = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;`,

  `DO $$ BEGIN
CREATE TYPE public.artwork_status AS ENUM (
    'draft',
    'published',
    'archived',
    'moderation_pending',
    'rejected'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.brand_manager_role AS ENUM (
    'owner',
    'manager',
    'editor'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.brand_status AS ENUM (
    'active',
    'suspended',
    'pending',
    'deactivated'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.contact_status AS ENUM (
    'unread',
    'read',
    'replied',
    'archived'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.contest_entry_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'disqualified',
    'winner'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.contest_status AS ENUM (
    'draft',
    'published',
    'live',
    'judging',
    'completed',
    'archived'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.license_type AS ENUM (
    'personal',
    'commercial',
    'exclusive'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'paid',
    'fulfilled',
    'refunded',
    'disputed',
    'failed'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.task_status AS ENUM (
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'blocked',
    'done',
    'archived'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.token_type AS ENUM (
    'email_verification',
    'password_reset'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.user_status AS ENUM (
    'active',
    'suspended',
    'pending_verification',
    'deactivated'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'interview_scheduled'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `DO $$ BEGIN
CREATE TYPE public.visibility_type AS ENUM (
    'public',
    'private',
    'unlisted'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`,

  `CREATE TABLE IF NOT EXISTS public.artwork_categories (
    artwork_id uuid NOT NULL,
    category_id uuid NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.artwork_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    artwork_id uuid,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.artwork_pricing_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    artwork_id uuid,
    license_type public.license_type NOT NULL,
    price_inr_cents integer NOT NULL,
    price_usd_cents integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.artworks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid,
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    thumbnail_url text,
    source_file_url text,
    status public.artwork_status DEFAULT 'draft'::public.artwork_status NOT NULL,
    moderation_status text DEFAULT 'pending'::text NOT NULL,
    moderation_notes text,
    moderated_by uuid,
    moderated_at timestamp with time zone,
    views_count integer DEFAULT 0,
    favorites_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    slug text,
    preview_url text
);`,

  `CREATE TABLE IF NOT EXISTS public.auth_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    type public.token_type NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.brand_artworks (
    brand_id uuid NOT NULL,
    artwork_id uuid NOT NULL,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    added_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.brand_followers (
    brand_id uuid NOT NULL,
    user_id uuid NOT NULL,
    followed_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.brand_managers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brand_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT brand_managers_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'manager'::text, 'editor'::text])))
);`,

  `CREATE TABLE IF NOT EXISTS public.brand_post_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    parent_id uuid,
    content text NOT NULL,
    likes_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);`,

  `CREATE TABLE IF NOT EXISTS public.brand_post_likes (
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.brand_post_upvotes (
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote_weight integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.brand_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    title text NOT NULL,
    content text,
    media_urls jsonb,
    status text NOT NULL,
    is_pinned boolean DEFAULT false,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    upvotes_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT brand_posts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])))
);`,

  `CREATE TABLE IF NOT EXISTS public.brand_verification_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    company_name text NOT NULL,
    website text,
    documents text[],
    status public.verification_status DEFAULT 'pending'::public.verification_status NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    contact_email text,
    contact_phone text,
    description text,
    team_size text,
    how_heard text
);`,

  `CREATE TABLE IF NOT EXISTS public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo_url text,
    banner_url text,
    website text,
    social_links jsonb,
    status public.brand_status DEFAULT 'pending'::public.brand_status NOT NULL,
    verification_request_id uuid,
    followers_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);`,

  `CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    parent_id uuid,
    description text,
    icon_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.cdn_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    original_name text NOT NULL,
    stored_name text NOT NULL,
    mime_type text NOT NULL,
    extension text,
    size bigint NOT NULL,
    url text NOT NULL,
    path text NOT NULL,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status public.contact_status DEFAULT 'unread'::public.contact_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);`,

  `CREATE TABLE IF NOT EXISTS public.contest_categories (
    contest_id uuid NOT NULL,
    category_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.contest_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contest_id uuid,
    artwork_id uuid,
    creator_id uuid,
    status public.contest_entry_status DEFAULT 'pending'::public.contest_entry_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    rank integer
);`,

  `CREATE TABLE IF NOT EXISTS public.contest_judge_scores (
    entry_id uuid NOT NULL,
    judge_id uuid NOT NULL,
    score numeric NOT NULL,
    comments text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT contest_judge_scores_score_check CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric)))
);`,

  `CREATE TABLE IF NOT EXISTS public.contest_judges (
    contest_id uuid NOT NULL,
    judge_id uuid NOT NULL,
    invited_by uuid,
    accepted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.contest_votes (
    entry_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote_weight integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.contests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    rules text,
    prizes jsonb,
    start_date timestamp with time zone NOT NULL,
    submission_end_date timestamp with time zone NOT NULL,
    voting_end_date timestamp with time zone,
    judging_end_date timestamp with time zone,
    status public.contest_status DEFAULT 'draft'::public.contest_status,
    visibility public.visibility_type DEFAULT 'public'::public.visibility_type,
    max_entries_per_user integer DEFAULT 1,
    entry_requirements jsonb,
    judging_criteria jsonb,
    winner_announced boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    hero_image text DEFAULT ''::text,
    gallery text DEFAULT ''::text
);`,

  `CREATE TABLE IF NOT EXISTS public.license_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_item_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requested_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    processed_by uuid,
    notes text
);`,

  `CREATE TABLE IF NOT EXISTS public.licenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_item_id uuid,
    artwork_id uuid,
    buyer_id uuid,
    seller_id uuid,
    license_type public.license_type NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.moderation_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    assigned_to uuid,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    decision text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    data jsonb,
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);`,

  `CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    artwork_id uuid,
    license_type public.license_type,
    unit_price_cents integer NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text,
    buyer_id uuid,
    seller_id uuid,
    status public.order_status DEFAULT 'pending'::public.order_status,
    total_cents integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.project_members (
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_by uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone
);`,

  `CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    hierarchy_level integer DEFAULT 0 NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.subtasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_task_id uuid,
    title text NOT NULL,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    created_by uuid,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.task_activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    actor_id uuid,
    action text NOT NULL,
    old_value jsonb,
    new_value jsonb,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.task_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    file_url text NOT NULL,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.task_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    user_id uuid,
    content text NOT NULL,
    mentions uuid[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);`,

  `CREATE TABLE IF NOT EXISTS public.task_watchers (
    task_id uuid NOT NULL,
    user_id uuid NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    title text NOT NULL,
    description text,
    status public.task_status DEFAULT 'todo'::public.task_status,
    priority public.task_priority DEFAULT 'medium'::public.task_priority,
    created_by uuid,
    assigned_to uuid,
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    story_points integer,
    labels text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);`,

  `CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.user_violations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reporter_id uuid,
    type text NOT NULL,
    description text,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);`,

  `CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    password_hash text,
    role_id uuid NOT NULL,
    status public.user_status DEFAULT 'pending_verification'::public.user_status NOT NULL,
    profile jsonb DEFAULT '{}'::jsonb NOT NULL,
    avatar_url text,
    banner_url text,
    bio text,
    location text,
    website text,
    payout_method jsonb,
    stripe_connect_id text,
    signup_key_used text,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    firebase_uid text
);`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artwork_categories_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artwork_categories
        ADD CONSTRAINT artwork_categories_pkey PRIMARY KEY (artwork_id, category_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artwork_likes_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artwork_likes
        ADD CONSTRAINT artwork_likes_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artwork_likes_user_id_artwork_id_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artwork_likes
        ADD CONSTRAINT artwork_likes_user_id_artwork_id_key UNIQUE (user_id, artwork_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artwork_pricing_tiers_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artwork_pricing_tiers
        ADD CONSTRAINT artwork_pricing_tiers_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artworks_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artworks
        ADD CONSTRAINT artworks_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'auth_tokens_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.auth_tokens
        ADD CONSTRAINT auth_tokens_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_artworks_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_artworks
        ADD CONSTRAINT brand_artworks_pkey PRIMARY KEY (brand_id, artwork_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_followers_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_followers
        ADD CONSTRAINT brand_followers_pkey PRIMARY KEY (brand_id, user_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_managers_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_managers
        ADD CONSTRAINT brand_managers_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_managers_user_id_brand_id_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_managers
        ADD CONSTRAINT brand_managers_user_id_brand_id_key UNIQUE (user_id, brand_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_comments_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_comments
        ADD CONSTRAINT brand_post_comments_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_likes_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_likes
        ADD CONSTRAINT brand_post_likes_pkey PRIMARY KEY (post_id, user_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_upvotes_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_upvotes
        ADD CONSTRAINT brand_post_upvotes_pkey PRIMARY KEY (post_id, user_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_posts_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_posts
        ADD CONSTRAINT brand_posts_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_verification_requests_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_verification_requests
        ADD CONSTRAINT brand_verification_requests_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brands_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brands
        ADD CONSTRAINT brands_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brands_slug_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brands
        ADD CONSTRAINT brands_slug_key UNIQUE (slug);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.categories
        ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.categories
        ADD CONSTRAINT categories_slug_key UNIQUE (slug);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cdn_files_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.cdn_files
        ADD CONSTRAINT cdn_files_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contact_messages
        ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_categories_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_categories
        ADD CONSTRAINT contest_categories_pkey PRIMARY KEY (contest_id, category_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_entries_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_entries
        ADD CONSTRAINT contest_entries_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_judge_scores_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_judge_scores
        ADD CONSTRAINT contest_judge_scores_pkey PRIMARY KEY (entry_id, judge_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_judges_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_judges
        ADD CONSTRAINT contest_judges_pkey PRIMARY KEY (contest_id, judge_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_votes_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_votes
        ADD CONSTRAINT contest_votes_pkey PRIMARY KEY (entry_id, user_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contests_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contests
        ADD CONSTRAINT contests_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contests_slug_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contests
        ADD CONSTRAINT contests_slug_key UNIQUE (slug);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'license_requests_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.license_requests
        ADD CONSTRAINT license_requests_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'licenses_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.licenses
        ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'moderation_queue_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.moderation_queue
        ADD CONSTRAINT moderation_queue_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.notifications
        ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.order_items
        ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.orders
        ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.orders
        ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_members_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.project_members
        ADD CONSTRAINT project_members_pkey PRIMARY KEY (project_id, user_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.projects
        ADD CONSTRAINT projects_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_slug_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.projects
        ADD CONSTRAINT projects_slug_key UNIQUE (slug);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.refresh_tokens
        ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'roles_name_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.roles
        ADD CONSTRAINT roles_name_key UNIQUE (name);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'roles_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.roles
        ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subtasks_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.subtasks
        ADD CONSTRAINT subtasks_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tags_name_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.tags
        ADD CONSTRAINT tags_name_key UNIQUE (name);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tags_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.tags
        ADD CONSTRAINT tags_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tags_slug_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.tags
        ADD CONSTRAINT tags_slug_key UNIQUE (slug);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_activity_logs_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_activity_logs
        ADD CONSTRAINT task_activity_logs_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_attachments_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_attachments
        ADD CONSTRAINT task_attachments_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_comments_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_comments
        ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_watchers_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_watchers
        ADD CONSTRAINT task_watchers_pkey PRIMARY KEY (task_id, user_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.tasks
        ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.user_roles
        ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_violations_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.user_violations
        ADD CONSTRAINT user_violations_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_firebase_uid_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_pkey PRIMARY KEY (id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;`,

  `CREATE INDEX IF NOT EXISTS idx_activity_task_id ON public.task_activity_logs USING btree (task_id);`,

  `CREATE INDEX IF NOT EXISTS idx_comments_task_id ON public.task_comments USING btree (task_id);`,

  `CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members USING btree (user_id);`,

  `CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks USING btree (assigned_to);`,

  `CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks USING btree (project_id);`,

  `CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks USING btree (status);`,

  `CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users USING btree (firebase_uid);`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artwork_categories_artwork_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artwork_categories
        ADD CONSTRAINT artwork_categories_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artwork_categories_category_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artwork_categories
        ADD CONSTRAINT artwork_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artwork_likes_artwork_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artwork_likes
        ADD CONSTRAINT artwork_likes_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artwork_likes_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artwork_likes
        ADD CONSTRAINT artwork_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artwork_pricing_tiers_artwork_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artwork_pricing_tiers
        ADD CONSTRAINT artwork_pricing_tiers_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artworks_creator_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artworks
        ADD CONSTRAINT artworks_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'artworks_moderated_by_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.artworks
        ADD CONSTRAINT artworks_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'auth_tokens_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.auth_tokens
        ADD CONSTRAINT auth_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_artworks_artwork_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_artworks
        ADD CONSTRAINT brand_artworks_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_artworks_brand_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_artworks
        ADD CONSTRAINT brand_artworks_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_followers_brand_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_followers
        ADD CONSTRAINT brand_followers_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_followers_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_followers
        ADD CONSTRAINT brand_followers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_managers_brand_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_managers
        ADD CONSTRAINT brand_managers_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_managers_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_managers
        ADD CONSTRAINT brand_managers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_comments_parent_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_comments
        ADD CONSTRAINT brand_post_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.brand_post_comments(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_comments_post_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_comments
        ADD CONSTRAINT brand_post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.brand_posts(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_comments_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_comments
        ADD CONSTRAINT brand_post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_likes_post_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_likes
        ADD CONSTRAINT brand_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.brand_posts(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_likes_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_likes
        ADD CONSTRAINT brand_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_upvotes_post_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_upvotes
        ADD CONSTRAINT brand_post_upvotes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.brand_posts(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_post_upvotes_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_post_upvotes
        ADD CONSTRAINT brand_post_upvotes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_posts_brand_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_posts
        ADD CONSTRAINT brand_posts_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_verification_requests_reviewed_by_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_verification_requests
        ADD CONSTRAINT brand_verification_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brand_verification_requests_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brand_verification_requests
        ADD CONSTRAINT brand_verification_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brands_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.brands
        ADD CONSTRAINT brands_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_parent_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.categories
        ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_categories_contest_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_categories
        ADD CONSTRAINT contest_categories_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_entries_artwork_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_entries
        ADD CONSTRAINT contest_entries_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_entries_contest_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_entries
        ADD CONSTRAINT contest_entries_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_entries_creator_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_entries
        ADD CONSTRAINT contest_entries_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_judge_scores_entry_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_judge_scores
        ADD CONSTRAINT contest_judge_scores_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.contest_entries(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_judges_contest_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_judges
        ADD CONSTRAINT contest_judges_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contest_votes_entry_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contest_votes
        ADD CONSTRAINT contest_votes_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.contest_entries(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contests_brand_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.contests
        ADD CONSTRAINT contests_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'license_requests_order_item_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.license_requests
        ADD CONSTRAINT license_requests_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'license_requests_processed_by_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.license_requests
        ADD CONSTRAINT license_requests_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'licenses_artwork_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.licenses
        ADD CONSTRAINT licenses_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'licenses_buyer_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.licenses
        ADD CONSTRAINT licenses_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'licenses_order_item_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.licenses
        ADD CONSTRAINT licenses_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'licenses_seller_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.licenses
        ADD CONSTRAINT licenses_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_artwork_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.order_items
        ADD CONSTRAINT order_items_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.order_items
        ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_buyer_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.orders
        ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_seller_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.orders
        ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_members_project_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.project_members
        ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'project_members_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.project_members
        ADD CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_created_by_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.projects
        ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.refresh_tokens
        ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subtasks_parent_task_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.subtasks
        ADD CONSTRAINT subtasks_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tags_approved_by_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.tags
        ADD CONSTRAINT tags_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tags_created_by_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.tags
        ADD CONSTRAINT tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_activity_logs_actor_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_activity_logs
        ADD CONSTRAINT task_activity_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_activity_logs_task_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_activity_logs
        ADD CONSTRAINT task_activity_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_attachments_task_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_attachments
        ADD CONSTRAINT task_attachments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_attachments_uploaded_by_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_attachments
        ADD CONSTRAINT task_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_comments_task_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_comments
        ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_comments_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_comments
        ADD CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_watchers_task_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_watchers
        ADD CONSTRAINT task_watchers_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'task_watchers_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.task_watchers
        ADD CONSTRAINT task_watchers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_assigned_to_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.tasks
        ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_created_by_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.tasks
        ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_project_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.tasks
        ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_assigned_by_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.user_roles
        ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_role_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.user_roles
        ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.user_roles
        ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_violations_reporter_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.user_violations
        ADD CONSTRAINT user_violations_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_violations_user_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.user_violations
        ADD CONSTRAINT user_violations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;`,

  `DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_id_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);
  END IF;
END $$;`
];

async function up(db) {
  const { sql } = require('kysely');
  for (const stmt of statements) {
    await sql.raw(stmt).execute(db);
  }
}

async function down() {
  // Intentionally a no-op -- see header comment.
}

module.exports = { up, down };
