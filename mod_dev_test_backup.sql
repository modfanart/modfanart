--
-- PostgreSQL database dump
--

\restrict OlIkxLA1PXCalcreNtPyY019cAujhFE45MkEs8qQYf8EWwDaDlPygP0eFpUe2NL

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: mod_dev_test_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO mod_dev_test_user;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: increment_brand_post_counter(uuid, text); Type: FUNCTION; Schema: public; Owner: mod_dev_test_user
--

CREATE FUNCTION public.increment_brand_post_counter(p_post_id uuid, p_column text) RETURNS void
    LANGUAGE plpgsql
    AS $_$
    BEGIN
      EXECUTE format('UPDATE brand_posts SET %I = %I + 1 WHERE id = $1', p_column, p_column)
      USING p_post_id;
    END;
    $_$;


ALTER FUNCTION public.increment_brand_post_counter(p_post_id uuid, p_column text) OWNER TO mod_dev_test_user;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: mod_dev_test_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO mod_dev_test_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: artwork_categories; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.artwork_categories (
    artwork_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE public.artwork_categories OWNER TO mod_dev_test_user;

--
-- Name: artwork_pricing_tiers; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.artwork_pricing_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    artwork_id uuid NOT NULL,
    license_type text NOT NULL,
    price_inr_cents integer NOT NULL,
    price_usd_cents integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT artwork_pricing_tiers_license_type_check CHECK ((license_type = ANY (ARRAY['personal'::text, 'commercial'::text, 'exclusive'::text])))
);


ALTER TABLE public.artwork_pricing_tiers OWNER TO mod_dev_test_user;

--
-- Name: artworks; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.artworks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    thumbnail_url text,
    source_file_url text,
    status text NOT NULL,
    moderation_status text DEFAULT 'pending'::text NOT NULL,
    moderation_notes text,
    moderated_by uuid,
    moderated_at timestamp with time zone,
    views_count integer DEFAULT 0 NOT NULL,
    favorites_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT artworks_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text, 'moderation_pending'::text, 'rejected'::text])))
);


ALTER TABLE public.artworks OWNER TO mod_dev_test_user;

--
-- Name: audited_events; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.audited_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audited_events OWNER TO mod_dev_test_user;

--
-- Name: auth_tokens; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.auth_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT auth_tokens_type_check CHECK ((type = ANY (ARRAY['email_verification'::text, 'password_reset'::text])))
);


ALTER TABLE public.auth_tokens OWNER TO mod_dev_test_user;

--
-- Name: brand_artworks; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.brand_artworks (
    brand_id uuid NOT NULL,
    artwork_id uuid NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brand_artworks OWNER TO mod_dev_test_user;

--
-- Name: brand_followers; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.brand_followers (
    brand_id uuid NOT NULL,
    user_id uuid NOT NULL,
    followed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brand_followers OWNER TO mod_dev_test_user;

--
-- Name: brand_post_comments; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.brand_post_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    parent_id uuid,
    content text NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.brand_post_comments OWNER TO mod_dev_test_user;

--
-- Name: brand_post_likes; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.brand_post_likes (
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brand_post_likes OWNER TO mod_dev_test_user;

--
-- Name: brand_post_upvotes; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.brand_post_upvotes (
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote_weight integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brand_post_upvotes OWNER TO mod_dev_test_user;

--
-- Name: brand_posts; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.brand_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    title text NOT NULL,
    content text,
    media_urls jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'draft'::text NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    comments_count integer DEFAULT 0 NOT NULL,
    upvotes_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT brand_posts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])))
);


ALTER TABLE public.brand_posts OWNER TO mod_dev_test_user;

--
-- Name: brand_verification_requests; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.brand_verification_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_name text NOT NULL,
    website text,
    documents jsonb,
    status text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT brand_verification_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'interview_scheduled'::text])))
);


ALTER TABLE public.brand_verification_requests OWNER TO mod_dev_test_user;

--
-- Name: brands; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo_url text,
    banner_url text,
    website text,
    social_links jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    verification_request_id uuid,
    followers_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT brands_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'pending'::text, 'deactivated'::text])))
);


ALTER TABLE public.brands OWNER TO mod_dev_test_user;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

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


ALTER TABLE public.categories OWNER TO mod_dev_test_user;

--
-- Name: contest_categories; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.contest_categories (
    contest_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE public.contest_categories OWNER TO mod_dev_test_user;

--
-- Name: contest_entries; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.contest_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contest_id uuid NOT NULL,
    artwork_id uuid NOT NULL,
    creator_id uuid NOT NULL,
    submission_notes text,
    status text NOT NULL,
    rank integer,
    score_public integer DEFAULT 0 NOT NULL,
    score_judge integer DEFAULT 0 NOT NULL,
    moderation_status text DEFAULT 'pending'::text NOT NULL,
    moderated_by uuid,
    moderated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contest_entries_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'disqualified'::text, 'winner'::text])))
);


ALTER TABLE public.contest_entries OWNER TO mod_dev_test_user;

--
-- Name: contest_judge_scores; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.contest_judge_scores (
    entry_id uuid NOT NULL,
    judge_id uuid NOT NULL,
    score integer NOT NULL,
    comments text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contest_judge_scores OWNER TO mod_dev_test_user;

--
-- Name: contest_judges; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.contest_judges (
    contest_id uuid NOT NULL,
    judge_id uuid NOT NULL,
    invited_by uuid,
    accepted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.contest_judges OWNER TO mod_dev_test_user;

--
-- Name: contest_votes; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.contest_votes (
    entry_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vote_weight integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contest_votes OWNER TO mod_dev_test_user;

--
-- Name: contests; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.contests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id uuid NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    rules text,
    prizes jsonb,
    start_date timestamp with time zone NOT NULL,
    submission_end_date timestamp with time zone NOT NULL,
    voting_end_date timestamp with time zone,
    judging_end_date timestamp with time zone,
    status text NOT NULL,
    visibility text NOT NULL,
    max_entries_per_user integer NOT NULL,
    entry_requirements jsonb,
    judging_criteria jsonb,
    winner_announced boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT contests_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'live'::text, 'judging'::text, 'completed'::text, 'archived'::text]))),
    CONSTRAINT contests_visibility_check CHECK ((visibility = ANY (ARRAY['public'::text, 'private'::text, 'unlisted'::text])))
);


ALTER TABLE public.contests OWNER TO mod_dev_test_user;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.favorites (
    user_id uuid NOT NULL,
    favoritable_type text NOT NULL,
    favoritable_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.favorites OWNER TO mod_dev_test_user;

--
-- Name: kysely_migration; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.kysely_migration (
    name character varying(255) NOT NULL,
    "timestamp" character varying(255) NOT NULL
);


ALTER TABLE public.kysely_migration OWNER TO mod_dev_test_user;

--
-- Name: kysely_migration_lock; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.kysely_migration_lock (
    id character varying(255) NOT NULL,
    is_locked integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.kysely_migration_lock OWNER TO mod_dev_test_user;

--
-- Name: licenses; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.licenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_item_id uuid NOT NULL,
    artwork_id uuid NOT NULL,
    buyer_id uuid NOT NULL,
    seller_id uuid NOT NULL,
    license_type text NOT NULL,
    contract_pdf_url text NOT NULL,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.licenses OWNER TO mod_dev_test_user;

--
-- Name: moderation_queue; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.moderation_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    status text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    assigned_to uuid,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    decision text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.moderation_queue OWNER TO mod_dev_test_user;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    data jsonb,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO mod_dev_test_user;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    artwork_id uuid,
    license_type text,
    unit_price_cents integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    description text,
    metadata jsonb
);


ALTER TABLE public.order_items OWNER TO mod_dev_test_user;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text NOT NULL,
    buyer_id uuid,
    seller_id uuid NOT NULL,
    source_type text NOT NULL,
    source_id uuid,
    status text NOT NULL,
    currency text NOT NULL,
    subtotal_cents integer NOT NULL,
    platform_fee_cents integer NOT NULL,
    tax_cents integer NOT NULL,
    total_cents integer NOT NULL,
    stripe_payment_intent_id text,
    stripe_charge_id text,
    invoice_pdf_url text,
    invoice_number text,
    paid_at timestamp with time zone,
    fulfilled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_source_type_check CHECK ((source_type = ANY (ARRAY['license_purchase'::text, 'contest_prize'::text, 'refund'::text, 'manual'::text]))),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'fulfilled'::text, 'refunded'::text, 'disputed'::text, 'failed'::text])))
);


ALTER TABLE public.orders OWNER TO mod_dev_test_user;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone
);


ALTER TABLE public.refresh_tokens OWNER TO mod_dev_test_user;

--
-- Name: refunds; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.refunds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    amount_cents integer NOT NULL,
    reason text,
    status text NOT NULL,
    stripe_refund_id text,
    approved_by uuid,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refunds OWNER TO mod_dev_test_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    hierarchy_level integer NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO mod_dev_test_user;

--
-- Name: taggings; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.taggings (
    tag_id uuid NOT NULL,
    taggable_type text NOT NULL,
    taggable_id uuid NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.taggings OWNER TO mod_dev_test_user;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

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


ALTER TABLE public.tags OWNER TO mod_dev_test_user;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_roles OWNER TO mod_dev_test_user;

--
-- Name: user_violations; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.user_violations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reported_by uuid,
    entity_type text,
    entity_id uuid,
    violation_type text NOT NULL,
    description text,
    status text NOT NULL,
    strike_issued boolean DEFAULT false NOT NULL,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_violations OWNER TO mod_dev_test_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: mod_dev_test_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email public.citext NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    password_hash text,
    role_id uuid,
    status text NOT NULL,
    profile jsonb DEFAULT '{}'::jsonb,
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
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'pending_verification'::text, 'deactivated'::text])))
);


ALTER TABLE public.users OWNER TO mod_dev_test_user;

--
-- Data for Name: artwork_categories; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.artwork_categories (artwork_id, category_id) FROM stdin;
6ff7595f-edf9-4c5e-9cff-ba6c500b9a3c	f53aa759-3790-419a-a795-bd27a3e110b5
e73fe2d9-9487-401e-8007-a4131807b56d	2c0c9d26-8315-440d-bdc1-438433ed28af
b293992b-b8ee-4934-8677-b114d052e3e7	0b01732b-092c-4921-adf2-31a955f669cb
b1518e08-0a86-4cfd-983e-fef543aa248f	5660736d-1b63-4cc1-a767-5690617b347b
\.


--
-- Data for Name: artwork_pricing_tiers; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.artwork_pricing_tiers (id, artwork_id, license_type, price_inr_cents, price_usd_cents, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: artworks; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.artworks (id, creator_id, title, description, file_url, thumbnail_url, source_file_url, status, moderation_status, moderation_notes, moderated_by, moderated_at, views_count, favorites_count, created_at, updated_at, deleted_at) FROM stdin;
e73fe2d9-9487-401e-8007-a4131807b56d	423179db-fe41-4cca-9e91-1f1da9be7369	Samurai Soul	Samurai illustration	https://example.com/samurai.jpg	\N	\N	published	approved	\N	\N	\N	0	0	2026-01-09 05:59:22.642126+00	2026-01-09 05:59:22.642126+00	\N
b293992b-b8ee-4934-8677-b114d052e3e7	c5207128-b7ae-4c4e-af18-fc934663bb35	Cosmic Vision	Sci-fi abstract art	https://example.com/cosmic.jpg	\N	\N	published	approved	\N	\N	\N	0	0	2026-01-09 05:59:22.642126+00	2026-01-09 05:59:22.642126+00	\N
b1518e08-0a86-4cfd-983e-fef543aa248f	87a7fd6c-5503-42ef-9caf-bb42dd8373dc	Urban Sketch	City sketch artwork	https://example.com/urban.jpg	\N	\N	published	approved	\N	\N	\N	0	0	2026-01-09 05:59:22.642126+00	2026-01-09 05:59:22.642126+00	\N
7f50336d-af47-4f09-b28d-acf0c368b6b2	2c78b09d-10d3-44da-8e6c-76703bcb9df3	dfsdfsdf	sdfsdfsdf sdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdfsdf	https://amzn-artwork-images.s3.undefined.amazonaws.com/artworks/2c78b09d-10d3-44da-8e6c-76703bcb9df3/fd3d8d82-d008-4094-85e0-418c623e0fe5.png	https://amzn-artwork-images.s3.undefined.amazonaws.com/artworks/2c78b09d-10d3-44da-8e6c-76703bcb9df3/fd3d8d82-d008-4094-85e0-418c623e0fe5.png	https://amzn-artwork-images.s3.undefined.amazonaws.com/artworks/2c78b09d-10d3-44da-8e6c-76703bcb9df3/fd3d8d82-d008-4094-85e0-418c623e0fe5.png	draft	pending	\N	\N	\N	0	0	2026-01-25 08:03:39.107405+00	2026-01-25 08:03:39.107405+00	\N
70b10c92-c004-431c-ad04-8f8b3d488466	2c78b09d-10d3-44da-8e6c-76703bcb9df3	bjhbjhbjhb	fdbdfbdfdbdfbdfdbdfbdfdbdfbdfdbdfbdfdbdfbdfdbdfbdfdbdfbdfdbdfbdfdbdfbdfdbdfbdfdbdfbdfdbdfbd	https://amzn-artwork-images.s3.eu-north-1.amazonaws.com/artworks/2c78b09d-10d3-44da-8e6c-76703bcb9df3/67d06e6c-b0f7-491e-a4a4-cf60c146e7ed.jpeg	https://amzn-artwork-images.s3.eu-north-1.amazonaws.com/artworks/2c78b09d-10d3-44da-8e6c-76703bcb9df3/67d06e6c-b0f7-491e-a4a4-cf60c146e7ed.jpeg	https://amzn-artwork-images.s3.eu-north-1.amazonaws.com/artworks/2c78b09d-10d3-44da-8e6c-76703bcb9df3/67d06e6c-b0f7-491e-a4a4-cf60c146e7ed.jpeg	draft	pending	\N	\N	\N	0	0	2026-01-25 09:59:59.720797+00	2026-01-25 09:59:59.720797+00	\N
6ff7595f-edf9-4c5e-9cff-ba6c500b9a3c	57fc162e-a89f-420f-8c0e-611dbee4c2cd	Nature Hulk	Hulk inspired artwork	https://example.com/hulk.jpg	\N	\N	published	approved	\N	\N	\N	2	0	2026-01-09 05:59:22.642126+00	2026-01-26 09:28:16.359578+00	\N
136958a1-96b1-4692-8ec8-cf95ceaa0d22	006243c7-dc8e-4002-bf25-abd4e7f9e7f7	Marvel Exclusive Poster	Official Marvel artwork	https://example.com/marvel.jpg	\N	\N	published	approved	\N	\N	\N	16	0	2026-01-09 05:59:30.416375+00	2026-01-26 13:58:59.771561+00	\N
\.


--
-- Data for Name: audited_events; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.audited_events (id, actor_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: auth_tokens; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.auth_tokens (id, user_id, type, token_hash, expires_at, used_at, created_at) FROM stdin;
0704e54e-f2d9-4227-aaf2-dbc0dd0b6b60	12013723-a995-40d2-a322-26c20eec6655	email_verification	db64bd1fd781c5b96ffe2fe902d3acfbc4546ded603db6efcefa6cc0984899d7	2026-02-02 11:42:40.38+00	\N	2026-02-01 11:42:40.913546+00
\.


--
-- Data for Name: brand_artworks; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.brand_artworks (brand_id, artwork_id, is_featured, sort_order, added_at) FROM stdin;
\.


--
-- Data for Name: brand_followers; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.brand_followers (brand_id, user_id, followed_at) FROM stdin;
\.


--
-- Data for Name: brand_post_comments; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.brand_post_comments (id, post_id, user_id, parent_id, content, likes_count, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: brand_post_likes; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.brand_post_likes (post_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: brand_post_upvotes; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.brand_post_upvotes (post_id, user_id, vote_weight, created_at) FROM stdin;
\.


--
-- Data for Name: brand_posts; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.brand_posts (id, brand_id, title, content, media_urls, status, is_pinned, likes_count, comments_count, upvotes_count, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: brand_verification_requests; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.brand_verification_requests (id, user_id, company_name, website, documents, status, reviewed_by, reviewed_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.brands (id, user_id, name, slug, description, logo_url, banner_url, website, social_links, status, verification_request_id, followers_count, created_at, updated_at, deleted_at) FROM stdin;
5612aca1-5396-4eb2-9af3-377b5d044d44	2c78b09d-10d3-44da-8e6c-76703bcb9df3	Marvel	marvel	Official account for Marvel	\N	\N	https://www.marvel.com	{}	active	\N	0	2026-01-20 11:26:16.374005+00	2026-01-20 11:26:16.374005+00	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.categories (id, name, slug, parent_id, description, icon_url, sort_order, is_active, created_at, updated_at) FROM stdin;
2930f1f8-fb91-4b08-a9c7-0014f89a959e	Anime	anime	\N	\N	\N	1	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
5660736d-1b63-4cc1-a767-5690617b347b	Digital Art	digital-art	\N	\N	\N	2	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
f53aa759-3790-419a-a795-bd27a3e110b5	Superhero	superhero	\N	\N	\N	3	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
750f0fb0-1170-4081-8bc1-390a6b8d9922	Movies	movies	\N	\N	\N	4	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
df713eeb-fb05-42ac-beba-14887dab1a39	Gaming	gaming	\N	\N	\N	5	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
2c0c9d26-8315-440d-bdc1-438433ed28af	Character Design	character-design	\N	\N	\N	6	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
8b02d8c5-fbda-4541-88f4-1553207dc88f	Merchandise	merchandise	\N	\N	\N	7	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
34fd1e51-c7ae-4b7c-a437-dd4602c96512	Fantasy	fantasy	\N	\N	\N	8	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
af816068-146d-48c6-a247-37524cd9c8dc	Books	books	\N	\N	\N	9	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
0b01732b-092c-4921-adf2-31a955f669cb	Concept Art	concept-art	\N	\N	\N	10	t	2026-01-09 06:11:31.556888+00	2026-01-09 06:11:31.556888+00
\.


--
-- Data for Name: contest_categories; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.contest_categories (contest_id, category_id) FROM stdin;
\.


--
-- Data for Name: contest_entries; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.contest_entries (id, contest_id, artwork_id, creator_id, submission_notes, status, rank, score_public, score_judge, moderation_status, moderated_by, moderated_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contest_judge_scores; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.contest_judge_scores (entry_id, judge_id, score, comments, created_at) FROM stdin;
\.


--
-- Data for Name: contest_judges; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.contest_judges (contest_id, judge_id, invited_by, accepted) FROM stdin;
\.


--
-- Data for Name: contest_votes; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.contest_votes (entry_id, user_id, vote_weight, created_at) FROM stdin;
\.


--
-- Data for Name: contests; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.contests (id, brand_id, title, slug, description, rules, prizes, start_date, submission_end_date, voting_end_date, judging_end_date, status, visibility, max_entries_per_user, entry_requirements, judging_criteria, winner_announced, created_at, updated_at, deleted_at) FROM stdin;
3b7a1bb4-ab66-412a-ab17-99dc504f309d	006243c7-dc8e-4002-bf25-abd4e7f9e7f7	Anime Expo 2023 Fan Art Contest	anime-expo-2023-fan-art-contest	Create original fan art for popular anime series featured at Anime Expo 2023.	\N	[{"rank": 1, "type": "cash", "amount_inr": 83000}]	2023-05-01 00:00:00+00	2023-06-15 00:00:00+00	\N	\N	live	public	3	\N	\N	f	2026-01-09 06:08:05.548377+00	2026-01-09 06:08:05.548377+00	\N
bea64456-f058-40f2-b163-82779b0aa360	006243c7-dc8e-4002-bf25-abd4e7f9e7f7	Marvel Cinematic Universe Art Challenge	marvel-cinematic-universe-art-challenge	Design fan art inspired by the latest Marvel movies and TV shows.	\N	[{"rank": 1, "type": "cash", "amount_inr": 207500}]	2023-06-01 00:00:00+00	2023-07-30 00:00:00+00	\N	\N	live	public	3	\N	\N	f	2026-01-09 06:08:15.982001+00	2026-01-09 06:08:15.982001+00	\N
8935e470-c6c0-41ad-a996-84b7c8e11bf6	006243c7-dc8e-4002-bf25-abd4e7f9e7f7	Indie Game Character Reimagined	indie-game-character-reimagined	Reimagine characters from popular indie games in your unique style.	\N	[{"rank": 1, "type": "cash", "amount_inr": 62250}]	2023-06-15 00:00:00+00	2023-08-10 00:00:00+00	\N	\N	live	public	3	\N	\N	f	2026-01-09 06:08:25.492328+00	2026-01-09 06:08:25.492328+00	\N
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.favorites (user_id, favoritable_type, favoritable_id, created_at) FROM stdin;
\.


--
-- Data for Name: kysely_migration; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.kysely_migration (name, "timestamp") FROM stdin;
202601060001_extensions_and_core	2026-01-06T10:51:03.193Z
202601060002_categories_tags	2026-01-06T10:51:04.344Z
202601060003_artworks	2026-01-06T10:51:05.813Z
202601060004_contests	2026-01-06T10:51:07.799Z
202601060005_orders_and_licenses	2026-01-06T10:51:09.236Z
202601060006_moderation_and_misc	2026-01-06T10:51:10.941Z
202601190001_extensions_and_core	2026-01-20T04:49:24.006Z
\.


--
-- Data for Name: kysely_migration_lock; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.kysely_migration_lock (id, is_locked) FROM stdin;
migration_lock	0
\.


--
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.licenses (id, order_item_id, artwork_id, buyer_id, seller_id, license_type, contract_pdf_url, expires_at, is_active, revoked_at, created_at) FROM stdin;
\.


--
-- Data for Name: moderation_queue; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.moderation_queue (id, entity_type, entity_id, status, priority, assigned_to, reviewed_by, reviewed_at, decision, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.notifications (id, user_id, type, title, body, data, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.order_items (id, order_id, artwork_id, license_type, unit_price_cents, quantity, description, metadata) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.orders (id, order_number, buyer_id, seller_id, source_type, source_id, status, currency, subtotal_cents, platform_fee_cents, tax_cents, total_cents, stripe_payment_intent_id, stripe_charge_id, invoice_pdf_url, invoice_number, paid_at, fulfilled_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, created_at, revoked_at) FROM stdin;
d3222552-e1ca-4f52-9871-4c42ebe66ab2	2c78b09d-10d3-44da-8e6c-76703bcb9df3	356cd330e3ab90088f69d7566e3fd74f99baea8a3d9f45848c4d948f605f8493	2026-01-18 14:34:37.512+00	2026-01-11 14:34:37.359483+00	\N
f920e074-6068-44c6-bfb9-bbe1e058bb02	2c78b09d-10d3-44da-8e6c-76703bcb9df3	cd0e29429d7a1ef7d463f63519f586f7823aa3eed3dce942bddec14208cbcd0f	2026-01-18 14:35:48.253+00	2026-01-11 14:35:48.085535+00	\N
cd993a91-bcb7-40e4-aa6e-758319a72dab	2c78b09d-10d3-44da-8e6c-76703bcb9df3	7106573b699f6fa4be5da2234816d71d432743453cfe79cd55afd5b494cb6a42	2026-01-18 14:42:31.617+00	2026-01-11 14:42:31.452601+00	\N
1c3e4f2a-9a31-4189-a1fd-1512cf7e0092	2c78b09d-10d3-44da-8e6c-76703bcb9df3	6355b888ea7e62f5bf4c652ed2df2777a7384f95df38a197fc65a66df7151279	2026-01-18 14:44:28.443+00	2026-01-11 14:44:28.288733+00	\N
93e15649-687b-436c-8e3f-391272156c2c	2c78b09d-10d3-44da-8e6c-76703bcb9df3	7cb2f5f26c045b188a40730436feb06b7f4581b52a159fac7c514f3ead8e5cc3	2026-01-18 14:45:20.382+00	2026-01-11 14:45:20.251434+00	\N
e050eb48-f714-42a8-81e3-79e65a835e23	2c78b09d-10d3-44da-8e6c-76703bcb9df3	fe432aff2d657a76de5ccff7fe519151835643df57b0e3adb3d69b3fae216f48	2026-01-24 14:49:58.51+00	2026-01-17 14:49:58.340772+00	\N
01ab4626-ee5e-482a-bea3-69cd99b0b185	2c78b09d-10d3-44da-8e6c-76703bcb9df3	fa8a7030345a051f35ceede8801ccd42e735377f5ad77973e6b1b0924603daf7	2026-01-25 09:11:24.687+00	2026-01-18 09:11:25.310349+00	\N
e529d64a-00f9-4ed0-8703-e881755d4998	2c78b09d-10d3-44da-8e6c-76703bcb9df3	322fb016dbb1f59c58d444e6d226c5cc6b48fa444c00cad201b2d26ed029a061	2026-01-25 09:12:23.809+00	2026-01-18 09:12:24.383602+00	\N
6a3f6d66-f7cc-413f-a70c-be0bd17441d7	2c78b09d-10d3-44da-8e6c-76703bcb9df3	bba951629179a75d6c42f2cb80dfcff35aebdc8279efbf969a04a2ea245bc08b	2026-01-25 09:21:36.281+00	2026-01-18 09:21:36.890278+00	\N
ef3a3618-fccd-49cc-9b70-a5301efe4896	2c78b09d-10d3-44da-8e6c-76703bcb9df3	9bc1b84206e4735125e78559fdcc16456aa256b6d3df300e9748426a4a700359	2026-01-25 09:23:39.601+00	2026-01-18 09:23:40.444767+00	\N
030530f3-9bda-49ff-b1a3-63b79636308a	2c78b09d-10d3-44da-8e6c-76703bcb9df3	bacdf72bf02d6e77219b3b01a8212719158b4c0b3970749e257651a5f60fcc46	2026-01-25 11:54:46.225+00	2026-01-18 11:54:47.399721+00	\N
63ab1a0e-71c3-4595-9d91-40004d81588b	2c78b09d-10d3-44da-8e6c-76703bcb9df3	eb2d78fbc612e1ffc6991cb01bdea28dd7e39af0db7d9ef40237287f93a48992	2026-01-25 12:46:20.025+00	2026-01-18 12:46:20.746156+00	\N
2b4a3a3c-0f63-4b79-912a-41dc22c66a41	2c78b09d-10d3-44da-8e6c-76703bcb9df3	1b27c88eb48f0a1ecb3510ac442dce6fb77f35276d445cdd59aac8a31803d3ca	2026-01-31 05:33:35.221+00	2026-01-24 05:33:34.656231+00	\N
ac4ac817-09e1-49d5-a73d-59d67a5f5f90	2c78b09d-10d3-44da-8e6c-76703bcb9df3	136080262e7528cfdbccc7461cdba5a0ab37060e69b6a9061414ba827151cdbc	2026-01-31 15:57:44.878+00	2026-01-24 15:57:44.404961+00	\N
30ee3635-4d4c-4ae0-b273-0dad54579f2c	2c78b09d-10d3-44da-8e6c-76703bcb9df3	fd6eaa9bc04b95a329bb5b3d556e9b9ba15cbc088853712952af035b4ab38dbc	2026-01-31 16:26:24.945+00	2026-01-24 16:26:24.731874+00	\N
e27cf291-f9be-4925-94d7-fee405b558c7	2c78b09d-10d3-44da-8e6c-76703bcb9df3	bd2b649293db353d1935f710f61d0fc762e6f1d4a1d4fb4e3011f4179c6ab93d	2026-01-31 16:41:55.042+00	2026-01-24 16:41:54.919541+00	\N
3fab1836-37ba-44e2-bf25-6018f6b26f3d	2c78b09d-10d3-44da-8e6c-76703bcb9df3	2385fb41b5317aac52573bcb2892e5b9ee0c7927535bf5d62cff8f54e895b672	2026-01-31 16:46:37.525+00	2026-01-24 16:46:37.52152+00	\N
bcd76310-deba-4de6-aab5-ecd08ad54f75	2c78b09d-10d3-44da-8e6c-76703bcb9df3	9fc30c3ed4b701e6c2dde49602e225130e776a56a31d6d64838b197fcd9aae06	2026-01-31 16:51:51.411+00	2026-01-24 16:51:51.338875+00	\N
cb351c65-e742-4122-b273-77518d7c2b95	2c78b09d-10d3-44da-8e6c-76703bcb9df3	b6575303722c03ae62a18447c3b4e38ccdf9eaea96735899546f9e2949558058	2026-02-01 04:45:36.488+00	2026-01-25 04:45:35.74237+00	\N
84f246af-8d52-4efa-ab20-14c1b5813884	2c78b09d-10d3-44da-8e6c-76703bcb9df3	02e07a41f3b73188e3022612ae6e4dc6acc7ed10bd410907765bf3a28b73f437	2026-02-01 04:55:32.924+00	2026-01-25 04:55:32.235611+00	\N
c952ad88-1f8a-4d37-8e72-2ab95ab5fc86	2c78b09d-10d3-44da-8e6c-76703bcb9df3	819bcee198dfba03803a3429b00ca6050b75a803a05cd37a4068df22ffd6b05c	2026-02-01 06:14:16.26+00	2026-01-25 06:14:17.390317+00	\N
c711d840-ba10-498e-9f6a-ee4c6f0f7296	2c78b09d-10d3-44da-8e6c-76703bcb9df3	b1496a7d393dad1504ccee4381f1bf1b504ffde6c1d5460d70d4b28e4d485656	2026-02-01 07:56:11.204+00	2026-01-25 07:56:12.413076+00	\N
9a2ea92f-886f-410a-a71a-726181c5cd01	2c78b09d-10d3-44da-8e6c-76703bcb9df3	bbbb965f7a4fa8af58bb92ac968d27a5592ecb943852a73a2ff3f0a1ad626e3d	2026-02-01 08:03:09.509+00	2026-01-25 08:03:10.72591+00	\N
cf430720-853c-4001-bb1e-ae08912b1d18	2c78b09d-10d3-44da-8e6c-76703bcb9df3	30ec6f369f96897a86ac3f0e79447241362b145e60434994bec4fb644ebf0a22	2026-02-01 08:37:03.384+00	2026-01-25 08:37:04.630909+00	\N
80925869-4e50-4e6f-b316-01d15a2a50d6	2c78b09d-10d3-44da-8e6c-76703bcb9df3	89f855004825f7422fd8a6e2205a3e1c0ee6be95422e9c5669bcbcf40723be05	2026-02-01 09:05:43.816+00	2026-01-25 09:05:45.083707+00	\N
b7c3dfd3-d62f-46e1-badd-7f32bb281d8f	2c78b09d-10d3-44da-8e6c-76703bcb9df3	b6d8034267e9e9b06a575ee546d8bd04e77109ce56cbc332989045cbe231ef2a	2026-02-01 09:43:55.095+00	2026-01-25 09:43:55.257936+00	\N
c8d4fd2b-a743-42a2-b8a6-f6cafb6a154e	2c78b09d-10d3-44da-8e6c-76703bcb9df3	c62771ea85fd1a1952f53c472861c1bb095b91fb8284bdbccf4b1d08fbda50de	2026-02-01 09:49:35.17+00	2026-01-25 09:49:35.33968+00	\N
8dee5107-491c-45cc-bde6-f397da79c3df	2c78b09d-10d3-44da-8e6c-76703bcb9df3	dad81ca3e0c3e6b28f28cb217c1ff3700c308a9f95ef8258f3fb6aaca6962423	2026-02-01 09:54:09.194+00	2026-01-25 09:54:09.362008+00	\N
c326a353-1b4f-4fa0-8868-024c88d849e3	2c78b09d-10d3-44da-8e6c-76703bcb9df3	1b2ed56d8afa0c435b84f9a01e0e22c621d6d08735beb1d824e2f79b93cf3034	2026-02-01 11:14:46.121+00	2026-01-25 11:14:45.669287+00	\N
ca5a40d6-dc5f-4e9b-affa-674ff68e886a	2c78b09d-10d3-44da-8e6c-76703bcb9df3	f2c3884d974cc2ba5240797c9c4ea430b04ab8e069a676dc834af4255a1435e3	2026-02-01 11:34:19.206+00	2026-01-25 11:34:18.852645+00	\N
f18b09c6-c824-4abe-a1b4-8470fb401347	2c78b09d-10d3-44da-8e6c-76703bcb9df3	c67e5f0c403f7ea18e40b4dfadbdc7ed3989ac76acb3aa0092221f6a7b57083a	2026-02-01 12:05:57.178+00	2026-01-25 12:05:56.759732+00	\N
11ee1372-ee19-419c-8ecd-b135d1e7af34	2c78b09d-10d3-44da-8e6c-76703bcb9df3	ae1e70f47dcd397dd75b335391b0878528f1693a715a21845380338ed4d503b1	2026-02-01 12:22:30.209+00	2026-01-25 12:22:29.811018+00	\N
b53084c6-453e-4044-8f93-582be4c975ff	2c78b09d-10d3-44da-8e6c-76703bcb9df3	4a168fdddd98f7b69148a65dadac1612c12c8e82d020647dad367c35ff7fc2c7	2026-02-01 12:23:34.636+00	2026-01-25 12:23:34.236152+00	\N
0c0d1c63-8144-4435-ae1a-7dbe642c70b7	2c78b09d-10d3-44da-8e6c-76703bcb9df3	037355a2048570977fcdc010885c7f1f0b3267965fccae7a1e6757ffeb7939c3	2026-02-02 09:17:36.16+00	2026-01-26 09:17:36.781424+00	\N
f62aafa7-1ee6-4fc5-89de-292262d5c898	2c78b09d-10d3-44da-8e6c-76703bcb9df3	30e89ffae275884164c04060ff7c68e5bb5b5258e2389b1e5a79cec8921b95f4	2026-02-02 09:24:03.825+00	2026-01-26 09:24:04.447436+00	\N
189a733b-0c2a-444a-a12d-7ed9671f98fe	2c78b09d-10d3-44da-8e6c-76703bcb9df3	9090a471cb47f5f1d0f1bd34397a62cd3291066467689a114248110735ab9670	2026-02-02 09:43:11.722+00	2026-01-26 09:43:12.363828+00	\N
902eb241-43db-4867-acdb-0a9f71aa4e7e	2c78b09d-10d3-44da-8e6c-76703bcb9df3	b9e13460f7583025f8a0c52e1385d509b6f9218f607b0e66a99b3585af8e0338	2026-02-02 09:53:34.102+00	2026-01-26 09:53:34.763484+00	\N
0d18b928-dd16-4cf8-aa6b-b26e6ef1b4c9	2c78b09d-10d3-44da-8e6c-76703bcb9df3	19139663208728d9f0cc75d1fa08e744162bdd7f501f83afa53d658034e24039	2026-02-02 09:55:04.112+00	2026-01-26 09:55:04.773813+00	\N
9e73cf85-7ad7-4e29-9e15-a7510ab031be	2c78b09d-10d3-44da-8e6c-76703bcb9df3	851c98c23f4852c64b98066c9aca741ab15f215f2a8934f34fbeee9feb4b2a39	2026-02-02 10:01:19.886+00	2026-01-26 10:01:20.545759+00	\N
f30d1f86-4572-4737-ab60-d1151578be96	2c78b09d-10d3-44da-8e6c-76703bcb9df3	4fd43b0c4fd3d0ee33396385b7df982311186b2b060367a44fe324533dfdcf65	2026-02-02 11:47:45.196+00	2026-01-26 11:47:45.001681+00	\N
a2b4c474-5d50-4d7c-ad4d-4274d12dbd2e	2c78b09d-10d3-44da-8e6c-76703bcb9df3	785d90aaba3b9096d26eb53569fa90832517d609ef4bf5e08f7e335a1015b8a3	2026-02-02 11:55:44.025+00	2026-01-26 11:55:43.862862+00	\N
571d8cf8-3264-413f-a26d-c2ef6ff2f00b	2c78b09d-10d3-44da-8e6c-76703bcb9df3	7877d93c31149772c476f99a954a67a1a4a7d9b163633e65928ad63b42bc6a9a	2026-02-02 12:02:24.576+00	2026-01-26 12:02:24.396563+00	\N
34e56c44-2e2f-415c-b921-be961170318d	2c78b09d-10d3-44da-8e6c-76703bcb9df3	fbb57903b7d0423024c3203a0a396a606d27882a7d847c43c8bbb279181227dd	2026-02-02 12:09:57.204+00	2026-01-26 12:09:57.029651+00	\N
260b284a-6a54-4ed7-8a57-f2e054a48a95	2c78b09d-10d3-44da-8e6c-76703bcb9df3	c521a79fbbdccf5473404da9e07f7be5857079f60e52511a23b376380b473df5	2026-02-02 12:19:29.379+00	2026-01-26 12:19:29.214216+00	\N
77951f62-948b-4da8-98ae-77c854ffaa55	2c78b09d-10d3-44da-8e6c-76703bcb9df3	b209c8174223e7cc02a6b7cdd6a4adf6a470b83f61bda424b198a05916b0dced	2026-02-02 12:39:18.26+00	2026-01-26 12:39:18.135965+00	\N
82422622-6844-4db9-8fe4-fbcb53845cbb	2c78b09d-10d3-44da-8e6c-76703bcb9df3	3edab2918c7b6841f7c9927ec92e5385bd2695ecd99793bb47d5e0412e2cda9d	2026-02-02 12:39:44.927+00	2026-01-26 12:39:44.785662+00	\N
a54304fa-3d25-4265-b710-af108e7ca56f	2c78b09d-10d3-44da-8e6c-76703bcb9df3	32b0aafc63c9e4783ae9824241a7b2ce5951c36ff743efaff16314fc522728a1	2026-02-02 12:41:45.37+00	2026-01-26 12:41:45.232488+00	\N
b0f04697-b5c1-40d2-8ed7-fd61176cdf83	2c78b09d-10d3-44da-8e6c-76703bcb9df3	74c67ea7452e9f268cf1b69b5268f2f5d4a890a9399c9492f9ac13785ca8202e	2026-02-02 13:04:11.92+00	2026-01-26 13:04:11.680571+00	\N
253a8b3b-30b1-422a-b4b6-5135a2df7614	2c78b09d-10d3-44da-8e6c-76703bcb9df3	de451ea7c3fedfbcb2a5722b982cc910dee501e4c33cb8464c3da9ae826bcbe3	2026-02-02 13:55:23.741+00	2026-01-26 13:55:23.899417+00	\N
26ee077c-9dd8-4849-9611-6096b0395c6a	2c78b09d-10d3-44da-8e6c-76703bcb9df3	1a51d36f6c99d8a8fbc9d8cab3e4def55cf25bec1dc3e3493c2bc4c4f0720fd7	2026-02-02 16:04:12.081+00	2026-01-26 16:04:12.402164+00	\N
8293da70-ef3e-4714-93a3-680d7a4a0b09	2c78b09d-10d3-44da-8e6c-76703bcb9df3	3a9baead52e728bd17194669f997f14c8e0f63595fb852b5bccb4481f62e306c	2026-02-04 06:24:23.814+00	2026-01-28 06:24:23.784951+00	\N
0717c797-a041-459a-a3c5-49e342465821	2c78b09d-10d3-44da-8e6c-76703bcb9df3	cb2459eb4e07c90dd1fc42f9bebee41fbc0556d30b2a53994572f4b9e9cc06ba	2026-02-04 11:17:13.672+00	2026-01-28 11:17:13.944846+00	\N
23577aa2-6e63-442a-b7ce-c9b8728946a5	2c78b09d-10d3-44da-8e6c-76703bcb9df3	6b1a3e6f221758204b64edfe13fce6a65fb365871a505be145e2921653cada13	2026-02-04 11:25:05.823+00	2026-01-28 11:25:06.098706+00	\N
175e81e4-8c86-4acc-95fc-3e7602106047	2c78b09d-10d3-44da-8e6c-76703bcb9df3	dbbd5d73a26a31c6d8a5ed2e4689e8356c371a9679623dd2261b7254ce97de03	2026-02-08 09:29:07.957+00	2026-02-01 09:29:08.102299+00	\N
826cbb8a-d2be-4947-bbe6-e3cf3cc77712	2c78b09d-10d3-44da-8e6c-76703bcb9df3	cf4a97c850ff083b885f375af90494968742f2d52d9e50154358122c122216a6	2026-02-08 10:38:56.231+00	2026-02-01 10:38:56.63854+00	\N
140e2cf2-d3f2-4999-be80-c0b1777cf357	2c78b09d-10d3-44da-8e6c-76703bcb9df3	53f6be91b19ff9e54c029fb580f4f3e59d21fed9062e3b4414d9b9ef21bb823f	2026-02-08 11:10:34.805+00	2026-02-01 11:10:35.225895+00	\N
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.refunds (id, order_id, amount_cents, reason, status, stripe_refund_id, approved_by, processed_at, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.roles (id, name, hierarchy_level, is_system, permissions, created_at) FROM stdin;
3b7b86be-b3c5-4c2a-a93a-a2719806dd3e	user	10	t	{"can_view": true, "can_create_artwork": true, "can_enter_contests": true}	2026-01-06 11:16:50.25216+00
cf8e889a-f96d-4a20-8800-343b0b91063f	admin	90	t	{"all": true}	2026-01-06 11:16:50.25216+00
9fe3eb9c-71b7-4e6e-adb2-cded74d8d219	Admin	100	t	{"*": true}	2026-01-09 05:46:29.47811+00
59efad3f-e41c-4754-8eda-36e58905277a	Artist	10	f	{"create_artwork": true}	2026-01-09 05:46:29.47811+00
ba0763c1-3633-480a-b4fb-01565a8b7cbb	Brand	50	f	{"license_artwork": true}	2026-01-09 05:46:29.47811+00
\.


--
-- Data for Name: taggings; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.taggings (tag_id, taggable_type, taggable_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.tags (id, name, slug, approved, usage_count, created_by, approved_by, created_at) FROM stdin;
242ce774-63d0-4754-a0a4-2a9c035a57af	vector	vector	t	0	\N	\N	2026-01-09 05:56:02.333312+00
8be95fc5-cd26-411d-a191-a26cdd68cbfc	anime	anime	t	0	\N	\N	2026-01-09 05:56:02.333312+00
25f91406-02c5-42cc-b5e6-8bb83ed7ae4c	illustration	illustration	t	0	\N	\N	2026-01-09 05:56:02.333312+00
c0ec2357-39f1-4ef1-a5c5-54741616cce0	black and white	black-and-white	t	0	\N	\N	2026-01-09 05:56:02.333312+00
22f882d8-a9ca-4acb-b094-8bf624a0e232	samurai	samurai	t	0	\N	\N	2026-01-09 05:56:02.333312+00
3476831f-e105-47f9-b114-79cd252241be	minimalist	minimalist	t	0	\N	\N	2026-01-09 05:56:02.333312+00
6d580a12-f2d7-4cff-a968-269797a26cd8	wildlife	wildlife	t	0	\N	\N	2026-01-09 05:56:02.333312+00
3ed3a4be-494b-4b3a-bf6f-41d148bec8f8	comic book	comic-book	t	0	\N	\N	2026-01-09 05:56:02.333312+00
7a1a7f07-017d-48ff-b951-f0147fefb212	watercolor	watercolor	t	0	\N	\N	2026-01-09 05:56:02.333312+00
d9c6eba3-ed25-45ef-8aa6-7d15bcc4ff70	manga	manga	t	0	\N	\N	2026-01-09 05:56:02.333312+00
9cb21e61-e538-4253-9d8c-32672fab781d	character	character	t	0	\N	\N	2026-01-09 05:56:02.333312+00
66df5449-b658-40db-8f3f-8169be05c187	superhero	superhero	t	0	\N	\N	2026-01-09 05:56:02.333312+00
a17646b5-aefa-45dc-bf1c-bcac3e58b63e	game	game	t	0	\N	\N	2026-01-09 05:56:02.333312+00
428b230b-3ab1-4899-ac85-3d78fd5567a4	portrait	portrait	t	0	\N	\N	2026-01-09 05:56:02.333312+00
1003fb59-bf96-4ae8-9196-7291fb356f38	geometric	geometric	t	0	\N	\N	2026-01-09 05:56:02.333312+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.user_roles (user_id, role_id, assigned_by, assigned_at) FROM stdin;
\.


--
-- Data for Name: user_violations; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.user_violations (id, user_id, reported_by, entity_type, entity_id, violation_type, description, status, strike_issued, resolved_by, resolved_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mod_dev_test_user
--

COPY public.users (id, username, email, email_verified, password_hash, role_id, status, profile, avatar_url, banner_url, bio, location, website, payout_method, stripe_connect_id, signup_key_used, last_login_at, created_at, updated_at, deleted_at) FROM stdin;
57fc162e-a89f-420f-8c0e-611dbee4c2cd	Carlos Rodriguez	carlos-rodriguez@example.com	t	$2b$12$examplehashedpassword	59efad3f-e41c-4754-8eda-36e58905277a	active	{"display_name": "Carlos Rodriguez"}	\N	\N	Artist known for Rodriguez inspired works.	Unknown	\N	\N	\N	\N	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	\N
423179db-fe41-4cca-9e91-1f1da9be7369	Thomas Wright	thomas-wright@example.com	t	$2b$12$examplehashedpassword	59efad3f-e41c-4754-8eda-36e58905277a	active	{"display_name": "Thomas Wright"}	\N	\N	Artist known for Wright inspired works.	Unknown	\N	\N	\N	\N	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	\N
c5207128-b7ae-4c4e-af18-fc934663bb35	Alex Rivera	alex-rivera@example.com	t	$2b$12$examplehashedpassword	59efad3f-e41c-4754-8eda-36e58905277a	active	{"display_name": "Alex Rivera"}	\N	\N	Artist known for Rivera inspired works.	Unknown	\N	\N	\N	\N	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	\N
87a7fd6c-5503-42ef-9caf-bb42dd8373dc	Ken Masters	ken-masters@example.com	t	$2b$12$examplehashedpassword	59efad3f-e41c-4754-8eda-36e58905277a	active	{"display_name": "Ken Masters"}	\N	\N	Artist known for Masters inspired works.	Unknown	\N	\N	\N	\N	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	\N
a206f1b8-efd6-43b4-8761-3cf5c835cece	Soulhouse Design	soulhouse-design@example.com	t	$2b$12$examplehashedpassword	59efad3f-e41c-4754-8eda-36e58905277a	active	{"display_name": "Soulhouse Design"}	\N	\N	Artist known for Design inspired works.	Unknown	\N	\N	\N	\N	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	\N
67037ca6-251b-4a10-9310-0343bd48b38c	Emma Wilson	emma-wilson@example.com	t	$2b$12$examplehashedpassword	59efad3f-e41c-4754-8eda-36e58905277a	active	{"display_name": "Emma Wilson"}	\N	\N	Artist known for Wilson inspired works.	Unknown	\N	\N	\N	\N	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	\N
f3a67da6-1d5b-4616-a364-a3cb7e23f163	Olivia Martinez	olivia-martinez@example.com	t	$2b$12$examplehashedpassword	59efad3f-e41c-4754-8eda-36e58905277a	active	{"display_name": "Olivia Martinez"}	\N	\N	Artist known for Martinez inspired works.	Unknown	\N	\N	\N	\N	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	\N
2d2c043c-6a70-463b-8763-7d9acf701d04	Sarah Johnson	sarah-johnson@example.com	t	$2b$12$examplehashedpassword	59efad3f-e41c-4754-8eda-36e58905277a	active	{"display_name": "Sarah Johnson"}	\N	\N	Artist known for Johnson inspired works.	Unknown	\N	\N	\N	\N	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	2026-01-09 05:48:48.400124+00	\N
ebd09e90-a59a-4e3d-9798-8101d74233c2	Admin User	admin@example.com	t	$2b$12$examplehashedpassword	9fe3eb9c-71b7-4e6e-adb2-cded74d8d219	active	{"display_name": "Admin User"}	\N	\N	Platform administrator	Unknown	\N	\N	\N	\N	2026-01-09 05:49:02.128423+00	2026-01-09 05:49:02.128423+00	2026-01-09 05:49:02.128423+00	\N
2cb4bffd-6e7e-49e1-bf26-24afccd80a21	jethalal_gadaelectronics	jethalal@gadaelectronics.in	f	$2b$12$kgRPhL8BOyFmYPuX76ti1uxt4TkLT9hTAQbNCiVtVClJry4lM9.rm	3b7b86be-b3c5-4c2a-a93a-a2719806dd3e	pending_verification	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-17 17:09:49.543994+00	2026-01-17 17:09:49.543994+00	\N
006243c7-dc8e-4002-bf25-abd4e7f9e7f7	Marvel Official	marvel@brand.com	t	$2b$12$examplehashedpassword	ba0763c1-3633-480a-b4fb-01565a8b7cbb	deactivated	{"display_name": "Marvel Official"}	\N	\N	Official account for Marvel	Unknown	\N	\N	\N	\N	2026-01-09 05:49:11.587893+00	2026-01-09 05:49:11.587893+00	2026-01-20 11:27:32.107926+00	2026-01-20 11:27:32.107926+00
2c78b09d-10d3-44da-8e6c-76703bcb9df3	dhruv0911	vermadhruv09112002@gmail.com	f	$2a$06$kKr5n7H/3Pr4ozH459B8FuIgJf4XV0w.CaJ2ptLh/hArRUV9SFbsO	cf8e889a-f96d-4a20-8800-343b0b91063f	active	{}	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-01 11:10:34.948413+00	2026-01-06 11:18:01.286129+00	2026-01-06 11:18:01.286129+00	\N
12013723-a995-40d2-a322-26c20eec6655	atmarambhide	gajubhai@gmail.com	f	$2b$12$rWlbrsxrZFxavRy3lBOPiOxga3Im1/yF66j2MtHKt.pE5CcxZFuya	3b7b86be-b3c5-4c2a-a93a-a2719806dd3e	pending_verification	{}	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-01 11:42:40.556435+00	2026-02-01 11:42:40.556435+00	\N
\.


--
-- Name: artwork_categories artwork_categories_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.artwork_categories
    ADD CONSTRAINT artwork_categories_pk PRIMARY KEY (artwork_id, category_id);


--
-- Name: artwork_pricing_tiers artwork_pricing_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.artwork_pricing_tiers
    ADD CONSTRAINT artwork_pricing_tiers_pkey PRIMARY KEY (id);


--
-- Name: artworks artworks_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.artworks
    ADD CONSTRAINT artworks_pkey PRIMARY KEY (id);


--
-- Name: audited_events audited_events_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.audited_events
    ADD CONSTRAINT audited_events_pkey PRIMARY KEY (id);


--
-- Name: auth_tokens auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_pkey PRIMARY KEY (id);


--
-- Name: brand_artworks brand_artworks_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_artworks
    ADD CONSTRAINT brand_artworks_pk PRIMARY KEY (brand_id, artwork_id);


--
-- Name: brand_followers brand_followers_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_followers
    ADD CONSTRAINT brand_followers_pk PRIMARY KEY (brand_id, user_id);


--
-- Name: brand_post_comments brand_post_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_comments
    ADD CONSTRAINT brand_post_comments_pkey PRIMARY KEY (id);


--
-- Name: brand_post_likes brand_post_likes_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_likes
    ADD CONSTRAINT brand_post_likes_pk PRIMARY KEY (post_id, user_id);


--
-- Name: brand_post_upvotes brand_post_upvotes_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_upvotes
    ADD CONSTRAINT brand_post_upvotes_pk PRIMARY KEY (post_id, user_id);


--
-- Name: brand_posts brand_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_posts
    ADD CONSTRAINT brand_posts_pkey PRIMARY KEY (id);


--
-- Name: brand_verification_requests brand_verification_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_verification_requests
    ADD CONSTRAINT brand_verification_requests_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: brands brands_slug_key; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_slug_key UNIQUE (slug);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: contest_categories contest_categories_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_categories
    ADD CONSTRAINT contest_categories_pk PRIMARY KEY (contest_id, category_id);


--
-- Name: contest_entries contest_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_entries
    ADD CONSTRAINT contest_entries_pkey PRIMARY KEY (id);


--
-- Name: contest_judge_scores contest_judge_scores_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_judge_scores
    ADD CONSTRAINT contest_judge_scores_pk PRIMARY KEY (entry_id, judge_id);


--
-- Name: contest_judges contest_judges_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_judges
    ADD CONSTRAINT contest_judges_pk PRIMARY KEY (contest_id, judge_id);


--
-- Name: contest_votes contest_votes_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_votes
    ADD CONSTRAINT contest_votes_pk PRIMARY KEY (entry_id, user_id);


--
-- Name: contests contests_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_pkey PRIMARY KEY (id);


--
-- Name: contests contests_slug_key; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_slug_key UNIQUE (slug);


--
-- Name: favorites favorites_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pk PRIMARY KEY (user_id, favoritable_type, favoritable_id);


--
-- Name: kysely_migration_lock kysely_migration_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.kysely_migration_lock
    ADD CONSTRAINT kysely_migration_lock_pkey PRIMARY KEY (id);


--
-- Name: kysely_migration kysely_migration_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.kysely_migration
    ADD CONSTRAINT kysely_migration_pkey PRIMARY KEY (name);


--
-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);


--
-- Name: moderation_queue moderation_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.moderation_queue
    ADD CONSTRAINT moderation_queue_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: taggings taggings_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT taggings_pk PRIMARY KEY (tag_id, taggable_type, taggable_id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: user_roles user_roles_pk; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pk PRIMARY KEY (user_id, role_id);


--
-- Name: user_violations user_violations_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: artworks_creator_id_idx; Type: INDEX; Schema: public; Owner: mod_dev_test_user
--

CREATE INDEX artworks_creator_id_idx ON public.artworks USING btree (creator_id);


--
-- Name: brand_posts_brand_id_idx; Type: INDEX; Schema: public; Owner: mod_dev_test_user
--

CREATE INDEX brand_posts_brand_id_idx ON public.brand_posts USING btree (brand_id);


--
-- Name: brand_posts_status_idx; Type: INDEX; Schema: public; Owner: mod_dev_test_user
--

CREATE INDEX brand_posts_status_idx ON public.brand_posts USING btree (status);


--
-- Name: brands_slug_idx; Type: INDEX; Schema: public; Owner: mod_dev_test_user
--

CREATE INDEX brands_slug_idx ON public.brands USING btree (slug);


--
-- Name: brands_user_id_idx; Type: INDEX; Schema: public; Owner: mod_dev_test_user
--

CREATE INDEX brands_user_id_idx ON public.brands USING btree (user_id);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: mod_dev_test_user
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: brand_post_comments update_brand_post_comments_updated_at; Type: TRIGGER; Schema: public; Owner: mod_dev_test_user
--

CREATE TRIGGER update_brand_post_comments_updated_at BEFORE UPDATE ON public.brand_post_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: brand_posts update_brand_posts_updated_at; Type: TRIGGER; Schema: public; Owner: mod_dev_test_user
--

CREATE TRIGGER update_brand_posts_updated_at BEFORE UPDATE ON public.brand_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: brands update_brands_updated_at; Type: TRIGGER; Schema: public; Owner: mod_dev_test_user
--

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: artwork_categories artwork_categories_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.artwork_categories
    ADD CONSTRAINT artwork_categories_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;


--
-- Name: artwork_categories artwork_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.artwork_categories
    ADD CONSTRAINT artwork_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: artwork_pricing_tiers artwork_pricing_tiers_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.artwork_pricing_tiers
    ADD CONSTRAINT artwork_pricing_tiers_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;


--
-- Name: artworks artworks_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.artworks
    ADD CONSTRAINT artworks_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: artworks artworks_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.artworks
    ADD CONSTRAINT artworks_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.users(id);


--
-- Name: audited_events audited_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.audited_events
    ADD CONSTRAINT audited_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: auth_tokens auth_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.auth_tokens
    ADD CONSTRAINT auth_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: brand_artworks brand_artworks_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_artworks
    ADD CONSTRAINT brand_artworks_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;


--
-- Name: brand_artworks brand_artworks_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_artworks
    ADD CONSTRAINT brand_artworks_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: brand_followers brand_followers_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_followers
    ADD CONSTRAINT brand_followers_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: brand_followers brand_followers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_followers
    ADD CONSTRAINT brand_followers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: brand_post_comments brand_post_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_comments
    ADD CONSTRAINT brand_post_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.brand_post_comments(id) ON DELETE CASCADE;


--
-- Name: brand_post_comments brand_post_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_comments
    ADD CONSTRAINT brand_post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.brand_posts(id) ON DELETE CASCADE;


--
-- Name: brand_post_comments brand_post_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_comments
    ADD CONSTRAINT brand_post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: brand_post_likes brand_post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_likes
    ADD CONSTRAINT brand_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.brand_posts(id) ON DELETE CASCADE;


--
-- Name: brand_post_likes brand_post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_likes
    ADD CONSTRAINT brand_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: brand_post_upvotes brand_post_upvotes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_upvotes
    ADD CONSTRAINT brand_post_upvotes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.brand_posts(id) ON DELETE CASCADE;


--
-- Name: brand_post_upvotes brand_post_upvotes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_post_upvotes
    ADD CONSTRAINT brand_post_upvotes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: brand_posts brand_posts_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_posts
    ADD CONSTRAINT brand_posts_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: brand_verification_requests brand_verification_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_verification_requests
    ADD CONSTRAINT brand_verification_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: brand_verification_requests brand_verification_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brand_verification_requests
    ADD CONSTRAINT brand_verification_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: brands brands_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: brands brands_verification_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_verification_request_id_fkey FOREIGN KEY (verification_request_id) REFERENCES public.brand_verification_requests(id) ON DELETE SET NULL;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: contest_categories contest_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_categories
    ADD CONSTRAINT contest_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: contest_categories contest_categories_contest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_categories
    ADD CONSTRAINT contest_categories_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;


--
-- Name: contest_entries contest_entries_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_entries
    ADD CONSTRAINT contest_entries_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;


--
-- Name: contest_entries contest_entries_contest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_entries
    ADD CONSTRAINT contest_entries_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;


--
-- Name: contest_entries contest_entries_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_entries
    ADD CONSTRAINT contest_entries_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contest_entries contest_entries_moderated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_entries
    ADD CONSTRAINT contest_entries_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.users(id);


--
-- Name: contest_judge_scores contest_judge_scores_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_judge_scores
    ADD CONSTRAINT contest_judge_scores_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.contest_entries(id) ON DELETE CASCADE;


--
-- Name: contest_judge_scores contest_judge_scores_judge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_judge_scores
    ADD CONSTRAINT contest_judge_scores_judge_id_fkey FOREIGN KEY (judge_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contest_judges contest_judges_contest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_judges
    ADD CONSTRAINT contest_judges_contest_id_fkey FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE;


--
-- Name: contest_judges contest_judges_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_judges
    ADD CONSTRAINT contest_judges_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id);


--
-- Name: contest_judges contest_judges_judge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_judges
    ADD CONSTRAINT contest_judges_judge_id_fkey FOREIGN KEY (judge_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contest_votes contest_votes_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_votes
    ADD CONSTRAINT contest_votes_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.contest_entries(id) ON DELETE CASCADE;


--
-- Name: contest_votes contest_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contest_votes
    ADD CONSTRAINT contest_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: contests contests_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.contests
    ADD CONSTRAINT contests_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: licenses licenses_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;


--
-- Name: licenses licenses_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- Name: licenses licenses_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;


--
-- Name: licenses licenses_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: moderation_queue moderation_queue_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.moderation_queue
    ADD CONSTRAINT moderation_queue_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: moderation_queue moderation_queue_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.moderation_queue
    ADD CONSTRAINT moderation_queue_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_artwork_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- Name: orders orders_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refunds refunds_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: refunds refunds_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: taggings taggings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT taggings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: taggings taggings_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT taggings_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: tags tags_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: tags tags_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: user_roles user_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_violations user_violations_reported_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(id);


--
-- Name: user_violations user_violations_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: user_violations user_violations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.user_violations
    ADD CONSTRAINT user_violations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mod_dev_test_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: FUNCTION citextin(cstring); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citextin(cstring) TO mod_dev_test_user;


--
-- Name: FUNCTION citextout(public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citextout(public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citextrecv(internal); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citextrecv(internal) TO mod_dev_test_user;


--
-- Name: FUNCTION citextsend(public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citextsend(public.citext) TO mod_dev_test_user;


--
-- Name: TYPE citext; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TYPE public.citext TO mod_dev_test_user;


--
-- Name: FUNCTION citext(boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext(boolean) TO mod_dev_test_user;


--
-- Name: FUNCTION citext(character); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext(character) TO mod_dev_test_user;


--
-- Name: FUNCTION citext(inet); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext(inet) TO mod_dev_test_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.armor(bytea) TO mod_dev_test_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.armor(bytea, text[], text[]) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_cmp(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_cmp(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_eq(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_eq(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_ge(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_ge(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_gt(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_gt(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_hash(public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_hash(public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_hash_extended(public.citext, bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_hash_extended(public.citext, bigint) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_larger(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_larger(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_le(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_le(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_lt(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_lt(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_ne(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_ne(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_pattern_cmp(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_pattern_cmp(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_pattern_ge(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_pattern_ge(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_pattern_gt(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_pattern_gt(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_pattern_le(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_pattern_le(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_pattern_lt(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_pattern_lt(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION citext_smaller(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.citext_smaller(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.crypt(text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.dearmor(text) TO mod_dev_test_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.digest(bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.digest(text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION fips_mode(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fips_mode() TO mod_dev_test_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_random_bytes(integer) TO mod_dev_test_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_random_uuid() TO mod_dev_test_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_salt(text) TO mod_dev_test_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_salt(text, integer) TO mod_dev_test_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.hmac(text, text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT wal_buffers_full bigint, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT parallel_workers_to_launch bigint, OUT parallel_workers_launched bigint, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT wal_buffers_full bigint, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT parallel_workers_to_launch bigint, OUT parallel_workers_launched bigint, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO mod_dev_test_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO mod_dev_test_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_match(string public.citext, pattern public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_match(string public.citext, pattern public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_match(string public.citext, pattern public.citext, flags text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_match(string public.citext, pattern public.citext, flags text) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_matches(string public.citext, pattern public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_matches(string public.citext, pattern public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_matches(string public.citext, pattern public.citext, flags text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_matches(string public.citext, pattern public.citext, flags text) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_replace(string public.citext, pattern public.citext, replacement text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_replace(string public.citext, pattern public.citext, replacement text) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_replace(string public.citext, pattern public.citext, replacement text, flags text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_replace(string public.citext, pattern public.citext, replacement text, flags text) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_split_to_array(string public.citext, pattern public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_split_to_array(string public.citext, pattern public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_split_to_array(string public.citext, pattern public.citext, flags text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_split_to_array(string public.citext, pattern public.citext, flags text) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_split_to_table(string public.citext, pattern public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_split_to_table(string public.citext, pattern public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION regexp_split_to_table(string public.citext, pattern public.citext, flags text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.regexp_split_to_table(string public.citext, pattern public.citext, flags text) TO mod_dev_test_user;


--
-- Name: FUNCTION replace(public.citext, public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.replace(public.citext, public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION split_part(public.citext, public.citext, integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.split_part(public.citext, public.citext, integer) TO mod_dev_test_user;


--
-- Name: FUNCTION strpos(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.strpos(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION texticlike(public.citext, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.texticlike(public.citext, text) TO mod_dev_test_user;


--
-- Name: FUNCTION texticlike(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.texticlike(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION texticnlike(public.citext, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.texticnlike(public.citext, text) TO mod_dev_test_user;


--
-- Name: FUNCTION texticnlike(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.texticnlike(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION texticregexeq(public.citext, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.texticregexeq(public.citext, text) TO mod_dev_test_user;


--
-- Name: FUNCTION texticregexeq(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.texticregexeq(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION texticregexne(public.citext, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.texticregexne(public.citext, text) TO mod_dev_test_user;


--
-- Name: FUNCTION texticregexne(public.citext, public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.texticregexne(public.citext, public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION translate(public.citext, public.citext, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.translate(public.citext, public.citext, text) TO mod_dev_test_user;


--
-- Name: FUNCTION max(public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.max(public.citext) TO mod_dev_test_user;


--
-- Name: FUNCTION min(public.citext); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.min(public.citext) TO mod_dev_test_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO mod_dev_test_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO mod_dev_test_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO mod_dev_test_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO mod_dev_test_user;


--
-- PostgreSQL database dump complete
--

\unrestrict OlIkxLA1PXCalcreNtPyY019cAujhFE45MkEs8qQYf8EWwDaDlPygP0eFpUe2NL

