// src/db/types.js
/**
 * @typedef {Object} ContactMessageRow
 * @property {string} id                  UUID primary key
 * @property {string} name
 * @property {string} email               (citext)
 * @property {string} subject
 * @property {string} message
 * @property {'unread' | 'read' | 'replied' | 'archived'} status
 * @property {string} created_at          timestamptz ISO string
 * @property {string} updated_at          timestamptz ISO string
 * @property {string | null} deleted_at   timestamptz ISO string (soft delete)
 */
/**
 * @typedef {Object} UserRow
 * @property {string} id                  UUID
 * @property {string} username
 * @property {string} email               (citext)
 * @property {boolean} email_verified
 * @property {string | null} password_hash
 * @property {string} role_id             (references roles.id)
 * @property {'active' | 'suspended' | 'pending_verification' | 'deactivated'} status
 * @property {Record<string, any>} profile
 * @property {string | null} avatar_url
 * @property {string | null} banner_url
 * @property {string | null} bio
 * @property {string | null} location
 * @property {string | null} website
 * @property {object | null} payout_method       JSONB (e.g. { type: 'stripe'|'upi', ... })
 * @property {string | null} stripe_connect_id
 * @property {string | null} signup_key_used
 * @property {string | null} last_login_at       timestamptz ISO string
 * @property {string} created_at                 timestamptz ISO string
 * @property {string} updated_at                 timestamptz ISO string
 * @property {string | null} deleted_at          timestamptz ISO string (soft delete)
 */

/**
 * @typedef {Object} RoleRow
 * @property {string} id
 * @property {string} name
 * @property {number} hierarchy_level
 * @property {boolean} is_system
 * @property {Record<string, boolean>} permissions
 * @property {string} created_at
 */

/**
 * @typedef {Object} UserRoleRow
 * @property {string} user_id
 * @property {string} role_id
 * @property {string | null} assigned_by
 * @property {string} assigned_at
 */

/**
 * @typedef {Object} RefreshTokenRow
 * @property {string} id
 * @property {string} user_id
 * @property {string} token_hash
 * @property {string} expires_at
 * @property {string} created_at
 * @property {string | null} revoked_at
 */

/**
 * @typedef {Object} AuthTokenRow
 * @property {string} id
 * @property {string} user_id
 * @property {'email_verification' | 'password_reset'} type
 * @property {string} token_hash
 * @property {string} expires_at
 * @property {string | null} used_at
 * @property {string} created_at
 */

/**
 * @typedef {Object} BrandVerificationRequestRow
 * @property {string} id
 * @property {string} user_id
 * @property {string} company_name
 * @property {string | null} website
 * @property {string[] | null} documents             JSONB array of URLs
 * @property {'pending' | 'approved' | 'rejected' | 'interview_scheduled'} status
 * @property {string | null} reviewed_by
 * @property {string | null} reviewed_at
 * @property {string | null} notes
 * @property {string} created_at
 * @property {string} updated_at
 */
 
/**
 * @typedef {Object} CategoryRow
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string | null} parent_id
 * @property {string | null} description
 * @property {string | null} icon_url
 * @property {number} sort_order
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} TagRow
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {boolean} approved
 * @property {number} usage_count
 * @property {string | null} created_by
 * @property {string | null} approved_by
 * @property {string} created_at
 */

/**
 * @typedef {Object} TaggingRow
 * @property {string} tag_id
 * @property {string} taggable_type
 * @property {string} taggable_id
 * @property {string | null} created_by
 * @property {string} created_at
 */

/**
 * @typedef {Object} ArtworkRow
 * @property {string} id
 * @property {string} creator_id
 * @property {string} title
 * @property {string | null} description
 * @property {string} file_url
 * @property {string | null} thumbnail_url
 * @property {string | null} source_file_url
 * @property {'draft' | 'published' | 'archived' | 'moderation_pending' | 'rejected'} status
 * @property {string} moderation_status
 * @property {string | null} moderation_notes
 * @property {string | null} moderated_by
 * @property {string | null} moderated_at
 * @property {number} views_count
 * @property {number} favorites_count
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string | null} deleted_at
 */
/**
 * @typedef {Object} ArtworkLikeRow
 * @property {string} id
 * @property {string} user_id
 * @property {string} artwork_id
 * @property {string} created_at
 */
/**
 * @typedef {Object} ArtworkPricingTierRow
 * @property {string} id
 * @property {string} artwork_id
 * @property {'personal' | 'commercial' | 'exclusive'} license_type
 * @property {number} price_inr_cents
 * @property {number} price_usd_cents
 * @property {boolean} is_active
 * @property {string} created_at
 */

/**
 * @typedef {Object} ArtworkCategoryRow
 * @property {string} artwork_id
 * @property {string} category_id
 */

/**
 * @typedef {Object} ContestRow
 * @property {string} id
 * @property {string} brand_id
 * @property {string} title
 * @property {string} slug
 * @property {string} description
 * @property {string | null} rules
 * @property {Array<{rank: number, amount_inr?: number, type: string, ...}> | null} prizes
 * @property {string} start_date
 * @property {string} submission_end_date
 * @property {string | null} voting_end_date
 * @property {string | null} judging_end_date
 * @property {'draft' | 'published' | 'live' | 'judging' | 'completed' | 'archived'} status
 * @property {'public' | 'private' | 'unlisted'} visibility
 * @property {number} max_entries_per_user
 * @property {object | null} entry_requirements
 * @property {object | null} judging_criteria
 * @property {boolean} winner_announced
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string | null} deleted_at
 */

/**
 * @typedef {Object} ContestCategoryRow
 * @property {string} contest_id
 * @property {string} category_id
 */

/**
 * @typedef {Object} ContestEntryRow
 * @property {string} id
 * @property {string} contest_id
 * @property {string} artwork_id
 * @property {string} creator_id
 * @property {string | null} submission_notes
 * @property {'pending' | 'approved' | 'rejected' | 'disqualified' | 'winner'} status
 * @property {number | null} rank
 * @property {number} score_public
 * @property {number} score_judge
 * @property {string} moderation_status
 * @property {string | null} moderated_by
 * @property {string | null} moderated_at
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ContestVoteRow
 * @property {string} entry_id
 * @property {string} user_id
 * @property {number} vote_weight
 * @property {string} created_at
 */

/**
 * @typedef {Object} ContestJudgeRow
 * @property {string} contest_id
 * @property {string} judge_id
 * @property {string | null} invited_by
 * @property {boolean} accepted
 */

/**
 * @typedef {Object} ContestJudgeScoreRow
 * @property {string} entry_id
 * @property {string} judge_id
 * @property {number} score
 * @property {string | null} comments
 * @property {string} created_at
 */

/**
 * @typedef {Object} OrderRow
 * @property {string} id
 * @property {string} order_number
 * @property {string | null} buyer_id
 * @property {string} seller_id
 * @property {'license_purchase' | 'contest_prize' | 'refund' | 'manual'} source_type
 * @property {string | null} source_id
 * @property {'pending' | 'paid' | 'fulfilled' | 'refunded' | 'disputed' | 'failed'} status
 * @property {string} currency
 * @property {number} subtotal_cents
 * @property {number} platform_fee_cents
 * @property {number} tax_cents
 * @property {number} total_cents
 * @property {string | null} stripe_payment_intent_id
 * @property {string | null} stripe_charge_id
 * @property {string | null} invoice_pdf_url
 * @property {string | null} invoice_number
 * @property {string | null} paid_at
 * @property {string | null} fulfilled_at
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} OrderItemRow
 * @property {string} id
 * @property {string} order_id
 * @property {string | null} artwork_id
 * @property {string | null} license_type
 * @property {number} unit_price_cents
 * @property {number} quantity
 * @property {string | null} description
 * @property {object | null} metadata
 */

/**
 * @typedef {Object} RefundRow
 * @property {string} id
 * @property {string} order_id
 * @property {number} amount_cents
 * @property {string | null} reason
 * @property {string} status
 * @property {string | null} stripe_refund_id
 * @property {string | null} approved_by
 * @property {string | null} processed_at
 * @property {string} created_at
 */

/**
 * @typedef {Object} LicenseRow
 * @property {string} id
 * @property {string} order_item_id
 * @property {string} artwork_id
 * @property {string} buyer_id
 * @property {string} seller_id
 * @property {string} license_type
 * @property {string} contract_pdf_url
 * @property {string | null} expires_at
 * @property {boolean} is_active
 * @property {string | null} revoked_at
 * @property {string} created_at
 */

/**
 * @typedef {Object} ModerationQueueRow
 * @property {string} id
 * @property {string} entity_type
 * @property {string} entity_id
 * @property {string} status
 * @property {number} priority
 * @property {string | null} assigned_to
 * @property {string | null} reviewed_by
 * @property {string | null} reviewed_at
 * @property {string | null} decision
 * @property {string | null} notes
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} UserViolationRow
 * @property {string} id
 * @property {string} user_id
 * @property {string | null} reported_by
 * @property {string | null} entity_type
 * @property {string | null} entity_id
 * @property {string} violation_type
 * @property {string | null} description
 * @property {string} status
 * @property {boolean} strike_issued
 * @property {string | null} resolved_by
 * @property {string | null} resolved_at
 * @property {string} created_at
 */

/**
 * @typedef {Object} FavoriteRow
 * @property {string} user_id
 * @property {string} favoritable_type
 * @property {string} favoritable_id
 * @property {string} created_at
 */

/**
 * @typedef {Object} NotificationRow
 * @property {string} id
 * @property {string} user_id
 * @property {string} type
 * @property {string} title
 * @property {string | null} body
 * @property {object | null} data
 * @property {string | null} read_at
 * @property {string} created_at
 */

/**
 * @typedef {Object} AuditedEventRow
 * @property {string} id
 * @property {string | null} actor_id
 * @property {string} action
 * @property {string | null} entity_type
 * @property {string | null} entity_id
 * @property {object | null} old_values
 * @property {object | null} new_values
 * @property {string | null} ip_address
 * @property {string | null} user_agent
 * @property {string} created_at
 */
/**
 * @typedef {Object} BrandRow
 * @property {string} id                  UUID
 * @property {string} user_id             References UserRow.id (the owning user)
 * @property {string} name
 * @property {string} slug
 * @property {string | null} description
 * @property {string | null} logo_url
 * @property {string | null} banner_url
 * @property {string | null} website
 * @property {object | null} social_links JSONB (e.g. {twitter: '...', instagram: '...'})
 * @property {'active' | 'suspended' | 'pending' | 'deactivated'} status
 * @property {string | null} verification_request_id References BrandVerificationRequestRow.id
 * @property {number} followers_count
 * @property {string} created_at          timestamptz ISO string
 * @property {string} updated_at          timestamptz ISO string
 * @property {string | null} deleted_at   timestamptz ISO string (soft delete)
 */

/**
 * @typedef {Object} BrandArtworkRow
 * @property {string} brand_id
 * @property {string} artwork_id          References ArtworkRow.id (licensed or owned artworks for storefront)
 * @property {boolean} is_featured        Whether featured in storefront
 * @property {number} sort_order
 * @property {string} added_at
 */

/**
 * @typedef {Object} BrandPostRow
 * @property {string} id                  UUID
 * @property {string} brand_id            References BrandRow.id
 * @property {string} title
 * @property {string | null} content      Markdown or HTML content
 * @property {string[] | null} media_urls JSONB array of URLs (images/videos)
 * @property {'draft' | 'published' | 'archived'} status
 * @property {boolean} is_pinned          Whether pinned to brand timeline
 * @property {number} likes_count
 * @property {number} comments_count
 * @property {number} upvotes_count
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string | null} deleted_at
 */

/**
 * @typedef {Object} BrandPostLikeRow
 * @property {string} post_id
 * @property {string} user_id
 * @property {string} created_at
 */

/**
 * @typedef {Object} BrandPostCommentRow
 * @property {string} id                  UUID
 * @property {string} post_id
 * @property {string} user_id
 * @property {string | null} parent_id   For threaded comments
 * @property {string} content
 * @property {number} likes_count
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string | null} deleted_at
 */

/**
 * @typedef {Object} BrandPostUpvoteRow
 * @property {string} post_id
 * @property {string} user_id
 * @property {number} vote_weight         e.g., 1 for upvote
 * @property {string} created_at
 */
/**
 * @typedef {Object} BrandManagerRow
 * @property {string} id                  UUID
 * @property {string} user_id             References UserRow.id (human manager)
 * @property {string} brand_id            References BrandRow.id (managed brand)
 * @property {'owner' | 'manager' | 'editor'} role
 * @property {string} created_at          timestamptz ISO string
 */
/**
 * @typedef {Object} CollectionRow
 * @property {string} id
 * @property {'user'|'brand'} owner_type
 * @property {string} owner_id
 * @property {string} name
 * @property {string} slug
 * @property {string|null} description
 * @property {boolean} is_public
 * @property {string|null} cover_image_url
 * @property {number} sort_order
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string|null} deleted_at
 */

/**
 * @typedef {Object} CollectionItemRow
 * @property {string} id
 * @property {string} collection_id
 * @property {string} artwork_id
 * @property {number} sort_order
 * @property {string} added_at
 */
/**
 * @typedef {Object} BrandFollowerRow
 * @property {string} brand_id
 * @property {string} user_id
 * @property {string} followed_at
 */
/**
 * @typedef {Object} NotificationRow
 * @property {string} id                  UUID primary key
 * @property {string} user_id             References users.id
 * @property {string} type                e.g. 'contest_winner', 'new_entry', 'account_suspended', 'brand_verified', etc.
 * @property {string} title
 * @property {string | null} body         Optional longer message
 * @property {object | null} data         JSONB for extra context (e.g. { contestId, artworkId, link })
 * @property {string | null} read_at      When user read the notification
 * @property {string} created_at          timestamptz
 * @property {string | null} deleted_at   Soft delete support
 */
module.exports = {};
// This file is only for type documentation / IntelliSense
// No runtime code is needed