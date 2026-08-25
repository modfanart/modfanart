--
-- PostgreSQL database dump
--

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Name: public; Type: SCHEMA; Schema: -

-- *not* creating schema, since initdb creates it

-- Name: SCHEMA public; Type: COMMENT; Schema: -

COMMENT ON SCHEMA public IS '';

-- Name: pgcrypto; Type: EXTENSION; Schema: -

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';

-- Name: artwork_status; Type: TYPE; Schema: public

CREATE TYPE public.artwork_status AS ENUM (
    'draft',
    'published',
    'archived',
    'moderation_pending',
    'rejected'
);

-- Name: brand_manager_role; Type: TYPE; Schema: public

CREATE TYPE public.brand_manager_role AS ENUM (
    'owner',
    'manager',
    'editor'
);

-- Name: brand_status; Type: TYPE; Schema: public

CREATE TYPE public.brand_status AS ENUM (
    'active',
    'suspended',
    'pending',
    'deactivated'
);

-- Name: contact_status; Type: TYPE; Schema: public

CREATE TYPE public.contact_status AS ENUM (
    'unread',
    'read',
    'replied',
    'archived'
);

-- Name: contest_entry_status; Type: TYPE; Schema: public

CREATE TYPE public.contest_entry_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'disqualified',
    'winner'
);

-- Name: contest_status; Type: TYPE; Schema: public

CREATE TYPE public.contest_status AS ENUM (
    'draft',
    'published',
    'live',
    'judging',
    'completed',
    'archived'
);

-- Name: license_type; Type: TYPE; Schema: public

CREATE TYPE public.license_type AS ENUM (
    'personal',
    'commercial',
    'exclusive'
);

-- Name: order_status; Type: TYPE; Schema: public

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'paid',
    'fulfilled',
    'refunded',
    'disputed',
    'failed'
);

-- Name: task_priority; Type: TYPE; Schema: public

CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- Name: task_status; Type: TYPE; Schema: public

CREATE TYPE public.task_status AS ENUM (
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'blocked',
    'done',
    'archived'
);

-- Name: token_type; Type: TYPE; Schema: public

CREATE TYPE public.token_type AS ENUM (
    'email_verification',
    'password_reset'
);

-- Name: user_status; Type: TYPE; Schema: public

CREATE TYPE public.user_status AS ENUM (
    'active',
    'suspended',
    'pending_verification',
    'deactivated'
);

-- Name: verification_status; Type: TYPE; Schema: public

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'interview_scheduled'
);

-- Name: visibility_type; Type: TYPE; Schema: public

CREATE TYPE public.visibility_type AS ENUM (
    'public',
    'private',
    'unlisted'
);

-- Name: artwork_categories; Type: TABLE; Schema: public

CREATE TABLE public.artwork_categories (
    artwork_id uuid NOT NULL,
    category_id uuid NOT NULL
);

-- Name: artwork_likes; Type: TABLE; Schema: public

CREATE TABLE public.artwork_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    artwork_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: artwork_pricing_tiers; Type: TABLE; Schema: public

CREATE TABLE public.artwork_pricing_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    artwork_id uuid,
    license_type public.license_type NOT NULL,
    price_inr_cents integer NOT NULL,
    price_usd_cents integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: artworks; Type: TABLE; Schema: public

CREATE TABLE public.artworks (
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
);

-- Name: auth_tokens; Type: TABLE; Schema: public

CREATE TABLE public.auth_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    type public.token_type NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: brand_artworks; Type: TABLE; Schema: public

CREATE TABLE public.brand_artworks (
    brand_id uuid NOT NULL,
    artwork_id uuid NOT NULL,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    added_at timestamp with time zone DEFAULT now()
);

-- Name: brand_followers; Type: TABLE; Schema: public

CREATE TABLE public.brand_followers (
    brand_id uuid NOT NULL,
    user_id uuid NOT NULL,
    followed_at timestamp with time zone DEFAULT now()
);

-- Name: brand_managers; Type: TABLE; Schema: public

CREATE TABLE public.brand_managers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    brand_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT brand_managers_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'manager'::text, 'editor'::text])))
);

-- Name: brand_post_comments; Type: TABLE; Schema: public

CREATE TABLE public.brand_post_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    parent_id uuid,
    content text NOT NULL,
    likes_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);

-- Name: brand_post_likes; Type: TABLE; Schema: public

CREATE TABLE public.brand_post_likes (
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: brand_post_upvotes; Type: TABLE; Schema: public

CREATE TABLE public.brand_post_upvotes (
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote_weight integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: brand_posts; Type: TABLE; Schema: public

CREATE TABLE public.brand_posts (
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
);

-- Name: brand_verification_requests; Type: TABLE; Schema: public

CREATE TABLE public.brand_verification_requests (
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
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: brands; Type: TABLE; Schema: public

CREATE TABLE public.brands (
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
);

-- Name: categories; Type: TABLE; Schema: public

CREATE TABLE public.categories (
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
);

-- Name: cdn_files; Type: TABLE; Schema: public

CREATE TABLE public.cdn_files (
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
);

-- Name: contact_messages; Type: TABLE; Schema: public

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status public.contact_status DEFAULT 'unread'::public.contact_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);

-- Name: contest_categories; Type: TABLE; Schema: public

CREATE TABLE public.contest_categories (
    contest_id uuid NOT NULL,
    category_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: contest_entries; Type: TABLE; Schema: public

CREATE TABLE public.contest_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contest_id uuid,
    artwork_id uuid,
    creator_id uuid,
    status public.contest_entry_status DEFAULT 'pending'::public.contest_entry_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    rank integer,
    submission_notes text
);

-- Name: contest_judge_scores; Type: TABLE; Schema: public

CREATE TABLE public.contest_judge_scores (
    entry_id uuid NOT NULL,
    judge_id uuid NOT NULL,
    score numeric NOT NULL,
    comments text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT contest_judge_scores_score_check CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric)))
);

-- Name: contest_judges; Type: TABLE; Schema: public

CREATE TABLE public.contest_judges (
    contest_id uuid NOT NULL,
    judge_id uuid NOT NULL,
    invited_by uuid,
    accepted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Name: contest_votes; Type: TABLE; Schema: public

CREATE TABLE public.contest_votes (
    entry_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote_weight integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: contests; Type: TABLE; Schema: public

CREATE TABLE public.contests (
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
    gallery text DEFAULT ''::text,
    results_share_token text
);

-- Name: judge_invite_tokens; Type: TABLE; Schema: public

CREATE TABLE public.judge_invite_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token text NOT NULL,
    contest_id uuid NOT NULL,
    judge_id uuid,
    invited_by uuid,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    type text DEFAULT 'direct'::text NOT NULL,
    CONSTRAINT judge_invite_tokens_direct_requires_judge CHECK (((type <> 'direct'::text) OR (judge_id IS NOT NULL))),
    CONSTRAINT judge_invite_tokens_type_check CHECK ((type = ANY (ARRAY['direct'::text, 'self_assign'::text, 'open'::text])))
);

-- Name: kysely_migration; Type: TABLE; Schema: public

CREATE TABLE public.kysely_migration (
    name character varying(255) NOT NULL,
    "timestamp" character varying(255) NOT NULL
);

-- Name: kysely_migration_lock; Type: TABLE; Schema: public

CREATE TABLE public.kysely_migration_lock (
    id character varying(255) NOT NULL,
    is_locked integer DEFAULT 0 NOT NULL
);

-- Name: license_requests; Type: TABLE; Schema: public

CREATE TABLE public.license_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_item_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requested_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    processed_by uuid,
    notes text
);

-- Name: licenses; Type: TABLE; Schema: public

CREATE TABLE public.licenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_item_id uuid,
    artwork_id uuid,
    buyer_id uuid,
    seller_id uuid,
    license_type public.license_type NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: moderation_queue; Type: TABLE; Schema: public

CREATE TABLE public.moderation_queue (
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
);

-- Name: notifications; Type: TABLE; Schema: public

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    data jsonb,
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);

-- Name: order_items; Type: TABLE; Schema: public

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    artwork_id uuid,
    license_type public.license_type,
    unit_price_cents integer NOT NULL
);

-- Name: orders; Type: TABLE; Schema: public

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text,
    buyer_id uuid,
    seller_id uuid,
    status public.order_status DEFAULT 'pending'::public.order_status,
    total_cents integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: project_members; Type: TABLE; Schema: public

CREATE TABLE public.project_members (
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);

-- Name: projects; Type: TABLE; Schema: public

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_by uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: refresh_tokens; Type: TABLE; Schema: public

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone
);

-- Name: roles; Type: TABLE; Schema: public

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    hierarchy_level integer DEFAULT 0 NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: subtasks; Type: TABLE; Schema: public

CREATE TABLE public.subtasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_task_id uuid,
    title text NOT NULL,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: taggings; Type: TABLE; Schema: public

CREATE TABLE public.taggings (
    tag_id uuid NOT NULL,
    taggable_type character varying(50) NOT NULL,
    taggable_id uuid NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: tags; Type: TABLE; Schema: public

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    created_by uuid,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: task_activity_logs; Type: TABLE; Schema: public

CREATE TABLE public.task_activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    actor_id uuid,
    action text NOT NULL,
    old_value jsonb,
    new_value jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: task_attachments; Type: TABLE; Schema: public

CREATE TABLE public.task_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    file_url text NOT NULL,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: task_comments; Type: TABLE; Schema: public

CREATE TABLE public.task_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid,
    user_id uuid,
    content text NOT NULL,
    mentions uuid[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);

-- Name: task_watchers; Type: TABLE; Schema: public

CREATE TABLE public.task_watchers (
    task_id uuid NOT NULL,
    user_id uuid NOT NULL
);

-- Name: tasks; Type: TABLE; Schema: public

CREATE TABLE public.tasks (
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
);

-- Name: user_roles; Type: TABLE; Schema: public

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: user_violations; Type: TABLE; Schema: public

CREATE TABLE public.user_violations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reporter_id uuid,
    type text NOT NULL,
    description text,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: users; Type: TABLE; Schema: public

CREATE TABLE public.users (
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
);

-- Name: artwork_categories artwork_categories_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artwork_categories
    ADD CONSTRAINT artwork_categories_pkey PRIMARY KEY (artwork_id, category_id);

-- Name: artwork_likes artwork_likes_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artwork_likes
    ADD CONSTRAINT artwork_likes_pkey PRIMARY KEY (id);

-- Name: artwork_likes artwork_likes_user_id_artwork_id_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artwork_likes
    ADD CONSTRAINT artwork_likes_user_id_artwork_id_key UNIQUE (user_id, artwork_id);

-- Name: artwork_pricing_tiers artwork_pricing_tiers_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artwork_pricing_tiers
    ADD CONSTRAINT artwork_pricing_tiers_pkey PRIMARY KEY (id);

-- Name: artworks artworks_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artworks
    ADD CONSTRAINT artworks_pkey PRIMARY KEY (id);

-- Name: auth_tokens auth_tokens_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_pkey PRIMARY KEY (id);

-- Name: brand_artworks brand_artworks_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_artworks
    ADD CONSTRAINT brand_artworks_pkey PRIMARY KEY (brand_id, artwork_id);

-- Name: brand_followers brand_followers_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_followers
    ADD CONSTRAINT brand_followers_pkey PRIMARY KEY (brand_id, user_id);

-- Name: brand_managers brand_managers_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_managers
    ADD CONSTRAINT brand_managers_pkey PRIMARY KEY (id);

-- Name: brand_managers brand_managers_user_id_brand_id_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_managers
    ADD CONSTRAINT brand_managers_user_id_brand_id_key UNIQUE (user_id, brand_id);

-- Name: brand_post_comments brand_post_comments_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_comments
    ADD CONSTRAINT brand_post_comments_pkey PRIMARY KEY (id);

-- Name: brand_post_likes brand_post_likes_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_likes
    ADD CONSTRAINT brand_post_likes_pkey PRIMARY KEY (post_id, user_id);

-- Name: brand_post_upvotes brand_post_upvotes_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_upvotes
    ADD CONSTRAINT brand_post_upvotes_pkey PRIMARY KEY (post_id, user_id);

-- Name: brand_posts brand_posts_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_posts
    ADD CONSTRAINT brand_posts_pkey PRIMARY KEY (id);

-- Name: brand_verification_requests brand_verification_requests_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_verification_requests
    ADD CONSTRAINT brand_verification_requests_pkey PRIMARY KEY (id);

-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);

-- Name: brands brands_slug_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_slug_key UNIQUE (slug);

-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);

-- Name: cdn_files cdn_files_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.cdn_files
    ADD CONSTRAINT cdn_files_pkey PRIMARY KEY (id);

-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);

-- Name: contest_categories contest_categories_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_categories
    ADD CONSTRAINT contest_categories_pkey PRIMARY KEY (contest_id, category_id);

-- Name: contest_entries contest_entries_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_entries
    ADD CONSTRAINT contest_entries_pkey PRIMARY KEY (id);

-- Name: contest_judge_scores contest_judge_scores_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_judge_scores
    ADD CONSTRAINT contest_judge_scores_pkey PRIMARY KEY (entry_id, judge_id);

-- Name: contest_judges contest_judges_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_judges
    ADD CONSTRAINT contest_judges_pkey PRIMARY KEY (contest_id, judge_id);

-- Name: contest_votes contest_votes_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_votes
    ADD CONSTRAINT contest_votes_pkey PRIMARY KEY (entry_id, user_id);

-- Name: contests contests_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_pkey PRIMARY KEY (id);

-- Name: contests contests_slug_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_slug_key UNIQUE (slug);

-- Name: judge_invite_tokens judge_invite_tokens_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.judge_invite_tokens
    ADD CONSTRAINT judge_invite_tokens_pkey PRIMARY KEY (id);

-- Name: judge_invite_tokens judge_invite_tokens_token_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.judge_invite_tokens
    ADD CONSTRAINT judge_invite_tokens_token_key UNIQUE (token);

-- Name: kysely_migration_lock kysely_migration_lock_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.kysely_migration_lock
    ADD CONSTRAINT kysely_migration_lock_pkey PRIMARY KEY (id);

-- Name: kysely_migration kysely_migration_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.kysely_migration
    ADD CONSTRAINT kysely_migration_pkey PRIMARY KEY (name);

-- Name: license_requests license_requests_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.license_requests
    ADD CONSTRAINT license_requests_pkey PRIMARY KEY (id);

-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);

-- Name: moderation_queue moderation_queue_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.moderation_queue
    ADD CONSTRAINT moderation_queue_pkey PRIMARY KEY (id);

-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);

-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);

-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);

-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (project_id, user_id);

-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);

-- Name: projects projects_slug_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_slug_key UNIQUE (slug);

-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);

-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);

-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);

-- Name: subtasks subtasks_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_pkey PRIMARY KEY (id);

-- Name: taggings taggings_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT taggings_pkey PRIMARY KEY (tag_id, taggable_type, taggable_id);

-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);

-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);

-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);

-- Name: task_activity_logs task_activity_logs_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_activity_logs
    ADD CONSTRAINT task_activity_logs_pkey PRIMARY KEY (id);

-- Name: task_attachments task_attachments_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_pkey PRIMARY KEY (id);

-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);

-- Name: task_watchers task_watchers_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_watchers
    ADD CONSTRAINT task_watchers_pkey PRIMARY KEY (task_id, user_id);

-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);

-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);

-- Name: user_violations user_violations_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_pkey PRIMARY KEY (id);

-- Name: users users_email_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

-- Name: users users_pkey; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Name: users users_username_key; Type: CONSTRAINT; Schema: public

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);

-- Name: contests_results_share_token_key; Type: INDEX; Schema: public

CREATE UNIQUE INDEX contests_results_share_token_key ON public.contests USING btree (results_share_token) WHERE (results_share_token IS NOT NULL);

-- Name: idx_activity_task_id; Type: INDEX; Schema: public

CREATE INDEX idx_activity_task_id ON public.task_activity_logs USING btree (task_id);

-- Name: idx_comments_task_id; Type: INDEX; Schema: public

CREATE INDEX idx_comments_task_id ON public.task_comments USING btree (task_id);

-- Name: idx_project_members_user; Type: INDEX; Schema: public

CREATE INDEX idx_project_members_user ON public.project_members USING btree (user_id);

-- Name: idx_tasks_assigned_to; Type: INDEX; Schema: public

CREATE INDEX idx_tasks_assigned_to ON public.tasks USING btree (assigned_to);

-- Name: idx_tasks_project_id; Type: INDEX; Schema: public

CREATE INDEX idx_tasks_project_id ON public.tasks USING btree (project_id);

-- Name: idx_tasks_status; Type: INDEX; Schema: public

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);

-- Name: idx_users_firebase_uid; Type: INDEX; Schema: public

CREATE INDEX idx_users_firebase_uid ON public.users USING btree (firebase_uid);

-- Name: judge_invite_tokens_contest_judge_unused_idx; Type: INDEX; Schema: public

CREATE INDEX judge_invite_tokens_contest_judge_unused_idx ON public.judge_invite_tokens USING btree (contest_id, judge_id) WHERE (used_at IS NULL);

-- Name: judge_invite_tokens_token_idx; Type: INDEX; Schema: public

CREATE INDEX judge_invite_tokens_token_idx ON public.judge_invite_tokens USING btree (token);

-- Name: users_firebase_uid_key; Type: INDEX; Schema: public

CREATE UNIQUE INDEX users_firebase_uid_key ON public.users USING btree (firebase_uid);

-- Name: artwork_categories artwork_categories_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artwork_categories
    ADD CONSTRAINT artwork_categories_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;

-- Name: artwork_categories artwork_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artwork_categories
    ADD CONSTRAINT artwork_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

-- Name: artwork_likes artwork_likes_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artwork_likes
    ADD CONSTRAINT artwork_likes_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;

-- Name: artwork_likes artwork_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artwork_likes
    ADD CONSTRAINT artwork_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: artwork_pricing_tiers artwork_pricing_tiers_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artwork_pricing_tiers
    ADD CONSTRAINT artwork_pricing_tiers_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;

-- Name: artworks artworks_creator_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artworks
    ADD CONSTRAINT artworks_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: artworks artworks_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.artworks
    ADD CONSTRAINT artworks_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.users(id);

-- Name: auth_tokens auth_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: brand_artworks brand_artworks_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_artworks
    ADD CONSTRAINT brand_artworks_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;

-- Name: brand_artworks brand_artworks_brand_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_artworks
    ADD CONSTRAINT brand_artworks_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

-- Name: brand_followers brand_followers_brand_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_followers
    ADD CONSTRAINT brand_followers_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

-- Name: brand_followers brand_followers_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_followers
    ADD CONSTRAINT brand_followers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: brand_managers brand_managers_brand_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_managers
    ADD CONSTRAINT brand_managers_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

-- Name: brand_managers brand_managers_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_managers
    ADD CONSTRAINT brand_managers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: brand_post_comments brand_post_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_comments
    ADD CONSTRAINT brand_post_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.brand_post_comments(id) ON DELETE CASCADE;

-- Name: brand_post_comments brand_post_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_comments
    ADD CONSTRAINT brand_post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.brand_posts(id) ON DELETE CASCADE;

-- Name: brand_post_comments brand_post_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_comments
    ADD CONSTRAINT brand_post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: brand_post_likes brand_post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_likes
    ADD CONSTRAINT brand_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.brand_posts(id) ON DELETE CASCADE;

-- Name: brand_post_likes brand_post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_likes
    ADD CONSTRAINT brand_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: brand_post_upvotes brand_post_upvotes_post_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_upvotes
    ADD CONSTRAINT brand_post_upvotes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.brand_posts(id) ON DELETE CASCADE;

-- Name: brand_post_upvotes brand_post_upvotes_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_post_upvotes
    ADD CONSTRAINT brand_post_upvotes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: brand_posts brand_posts_brand_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_posts
    ADD CONSTRAINT brand_posts_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

-- Name: brand_verification_requests brand_verification_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_verification_requests
    ADD CONSTRAINT brand_verification_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);

-- Name: brand_verification_requests brand_verification_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brand_verification_requests
    ADD CONSTRAINT brand_verification_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Name: brands brands_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);

-- Name: contest_categories contest_categories_contest_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_categories
    ADD CONSTRAINT contest_categories_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;

-- Name: contest_entries contest_entries_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_entries
    ADD CONSTRAINT contest_entries_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id);

-- Name: contest_entries contest_entries_contest_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_entries
    ADD CONSTRAINT contest_entries_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;

-- Name: contest_entries contest_entries_creator_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_entries
    ADD CONSTRAINT contest_entries_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);

-- Name: contest_judge_scores contest_judge_scores_entry_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_judge_scores
    ADD CONSTRAINT contest_judge_scores_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.contest_entries(id) ON DELETE CASCADE;

-- Name: contest_judges contest_judges_contest_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_judges
    ADD CONSTRAINT contest_judges_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;

-- Name: contest_votes contest_votes_entry_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contest_votes
    ADD CONSTRAINT contest_votes_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.contest_entries(id) ON DELETE CASCADE;

-- Name: contests contests_brand_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

-- Name: judge_invite_tokens judge_invite_tokens_contest_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.judge_invite_tokens
    ADD CONSTRAINT judge_invite_tokens_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;

-- Name: judge_invite_tokens judge_invite_tokens_invited_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.judge_invite_tokens
    ADD CONSTRAINT judge_invite_tokens_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- Name: judge_invite_tokens judge_invite_tokens_judge_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.judge_invite_tokens
    ADD CONSTRAINT judge_invite_tokens_judge_id_fkey FOREIGN KEY (judge_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: license_requests license_requests_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.license_requests
    ADD CONSTRAINT license_requests_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;

-- Name: license_requests license_requests_processed_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.license_requests
    ADD CONSTRAINT license_requests_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);

-- Name: licenses licenses_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id);

-- Name: licenses licenses_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);

-- Name: licenses licenses_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id);

-- Name: licenses licenses_seller_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);

-- Name: order_items order_items_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id);

-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);

-- Name: orders orders_seller_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);

-- Name: project_members project_members_project_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Name: project_members project_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: subtasks subtasks_parent_task_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_parent_task_id_fkey FOREIGN KEY (parent_task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Name: taggings taggings_created_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT taggings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

-- Name: taggings taggings_tag_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT taggings_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;

-- Name: tags tags_approved_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);

-- Name: tags tags_created_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

-- Name: task_activity_logs task_activity_logs_actor_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_activity_logs
    ADD CONSTRAINT task_activity_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);

-- Name: task_activity_logs task_activity_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_activity_logs
    ADD CONSTRAINT task_activity_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Name: task_attachments task_attachments_task_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Name: task_attachments task_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);

-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Name: task_comments task_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

-- Name: task_watchers task_watchers_task_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_watchers
    ADD CONSTRAINT task_watchers_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Name: task_watchers task_watchers_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.task_watchers
    ADD CONSTRAINT task_watchers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);

-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);

-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Name: user_roles user_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);

-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;

-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: user_violations user_violations_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Name: user_violations user_violations_user_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);

--
-- PostgreSQL database dump complete
