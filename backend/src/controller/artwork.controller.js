// src/controllers/artwork.controller.js
const Artwork = require('../models/artwork.model');
const ArtworkCategory = require('../models/artworkCategory.model');
const ArtworkPricingTier = require('../models/artworkPricingTier.model');
const { db } = require('../config');
const path = require('path');
const crypto = require('crypto');
const { s3Client } = require('../config');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

class ArtworkController {
  /**
   * POST /artworks
   * Create a new artwork (draft by default)
   * Requires: multer middleware for file upload (req.file)
   */
  static async createArtwork(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user.id;
      const {
        title,
        description,
        category_ids = [], // array of category UUIDs
        pricing_tiers = [], // array of { license_type, price_inr_cents, price_usd_cents }
      } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4'];
      if (!allowed.includes(ext)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }

      // Upload main file to S3
      const fileKey = `artworks/${userId}/${crypto.randomUUID()}${ext}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          ACL: 'public-read',
        })
      );

      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      // Create artwork record (draft status)
      const artwork = await Artwork.create(userId, {
        title: title.trim(),
        description: description?.trim() || null,
        file_url: fileUrl,
        thumbnail_url: fileUrl, // You can improve this with thumbnail generation later
        source_file_url: fileUrl,
        status: 'draft',
        moderation_status: 'pending', // or 'approved' for trusted users
      });

      if (!artwork) {
        return res.status(500).json({ error: 'Failed to create artwork' });
      }

      // Assign categories (if provided)
      if (Array.isArray(category_ids) && category_ids.length > 0) {
        for (const catId of category_ids) {
          await ArtworkCategory.assign(artwork.id, catId).catch(() => {});
        }
      }

      // Create pricing tiers
      if (Array.isArray(pricing_tiers) && pricing_tiers.length > 0) {
        for (const tier of pricing_tiers) {
          if (['personal', 'commercial', 'exclusive'].includes(tier.license_type)) {
            await ArtworkPricingTier.create(artwork.id, {
              license_type: tier.license_type,
              price_inr_cents: parseInt(tier.price_inr_cents) || 0,
              price_usd_cents: parseInt(tier.price_usd_cents) || 0,
              is_active: true,
            }).catch(() => {});
          }
        }
      }

      res.status(201).json({
        message: 'Artwork created successfully',
        artwork: {
          id: artwork.id,
          title: artwork.title,
          status: artwork.status,
          file_url: artwork.file_url,
          thumbnail_url: artwork.thumbnail_url,
          created_at: artwork.created_at,
        },
      });
    } catch (error) {
      console.error('Create artwork error:', error);
      res.status(500).json({ error: 'Failed to create artwork' });
    }
  }

  /**
   * GET /artworks/:id
   * Get single artwork with pricing and categories
   */
  static async getArtwork(req, res) {
    try {
      const { id } = req.params;
      const artwork = await Artwork.findById(id);

      if (!artwork || artwork.deleted_at) {
        return res.status(404).json({ error: 'Artwork not found' });
      }

      // Increment view count
      await Artwork.incrementView(id);

      // Fetch pricing tiers
      const pricing = await ArtworkPricingTier.findActiveForArtwork(id);

      // Fetch category IDs
      const categoryIds = await ArtworkCategory.getCategoryIdsForArtwork(id);

      res.json({
        id: artwork.id,
        title: artwork.title,
        description: artwork.description,
        file_url: artwork.file_url,
        thumbnail_url: artwork.thumbnail_url,
        source_file_url: artwork.source_file_url,
        status: artwork.status,
        moderation_status: artwork.moderation_status,
        views_count: artwork.views_count + 1, // since we just incremented
        favorites_count: artwork.favorites_count,
        creator_id: artwork.creator_id,
        created_at: artwork.created_at,
        updated_at: artwork.updated_at,
        pricing_tiers: pricing,
        category_ids: categoryIds,
      });
    } catch (error) {
      console.error('Get artwork error:', error);
      res.status(500).json({ error: 'Failed to fetch artwork' });
    }
  }

  /**
   * PATCH /artworks/:id/publish
   * Publish a draft artwork (creator only)
   */
  static async publishArtwork(req, res) {
    try {
      const { id } = req.params;
      const artwork = await Artwork.findById(id);

      if (!artwork || artwork.deleted_at) {
        return res.status(404).json({ error: 'Artwork not found' });
      }

      if (artwork.creator_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only publish your own artwork' });
      }

      if (artwork.status !== 'draft') {
        return res.status(400).json({ error: 'Only draft artworks can be published' });
      }

      await Artwork.publish(id);

      res.json({ message: 'Artwork published successfully', status: 'published' });
    } catch (error) {
      console.error('Publish artwork error:', error);
      res.status(500).json({ error: 'Failed to publish artwork' });
    }
  }

  /**
   * DELETE /artworks/:id
   * Soft delete own artwork
   */
  static async deleteArtwork(req, res) {
    try {
      const { id } = req.params;
      const artwork = await Artwork.findById(id);

      if (!artwork || artwork.deleted_at) {
        return res.status(404).json({ error: 'Artwork not found' });
      }

      if (artwork.creator_id !== req.user.id) {
        return res.status(403).json({ error: 'You can only delete your own artwork' });
      }

      await Artwork.softDelete(id);

      res.json({ message: 'Artwork deleted successfully' });
    } catch (error) {
      console.error('Delete artwork error:', error);
      res.status(500).json({ error: 'Failed to delete artwork' });
    }
  }

  /**
   * GET /artworks
   * List published artworks with pagination, search, category filter
   */
static async getArtworks(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search?.trim();
    const categoryId = req.query.category_id;

    // Main query for fetching artworks
    let query = db
      .selectFrom('artworks')
      .select([
        'id',
        'title',
        'description',
        'thumbnail_url',
        'views_count',
        'favorites_count',
        'creator_id',
        'created_at',
      ])
      .where('status', '=', 'published')
      .where('deleted_at', 'is', null)
      .orderBy('created_at', 'desc');

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb('title', 'ilike', `%${search}%`),
          eb('description', 'ilike', `%${search}%`),
        ])
      );
    }

    if (categoryId) {
      query = query
        .innerJoin('artwork_categories', 'artwork_categories.artwork_id', 'artworks.id')
        .where('artwork_categories.category_id', '=', categoryId);
    }

    // Separate accurate count query
    let countQuery = db
      .selectFrom('artworks')
      .where('status', '=', 'published')
      .where('deleted_at', 'is', null);

    if (search) {
      countQuery = countQuery.where((eb) =>
        eb.or([
          eb('title', 'ilike', `%${search}%`),
          eb('description', 'ilike', `%${search}%`),
        ])
      );
    }

    if (categoryId) {
      countQuery = countQuery
        .innerJoin('artwork_categories', 'artwork_categories.artwork_id', 'artworks.id')
        .where('artwork_categories.category_id', '=', categoryId);
    }

    const countResult = await countQuery
      .select(db.fn.count('artworks.id').distinct().as('total'))
      .executeTakeFirst();

    const total = parseInt(countResult.total || 0);
    const totalPages = Math.ceil(total / limit);

    // Apply pagination to main query
    const artworks = await query
      .limit(limit)
      .offset(offset)
      .execute();

    res.json({
      artworks,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get artworks list error:', error);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
}

  /**
   * GET /artworks/me
   * Get current user's artworks (including drafts)
   */
  static async getMyArtworks(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
      const offset = (page - 1) * limit;

      const query = db
        .selectFrom('artworks')
        .selectAll()
        .where('creator_id', '=', req.user.id)
        .where('deleted_at', 'is', null)
        .orderBy('created_at', 'desc');

      const countResult = await query
        .clearSelect()
        .select(db.fn.countAll().as('total'))
        .executeTakeFirst();

      const total = parseInt(countResult.total);
      const totalPages = Math.ceil(total / limit);

      const artworks = await query
        .limit(limit)
        .offset(offset)
        .execute();

      res.json({
        artworks,
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
        },
      });
    } catch (error) {
      console.error('Get my artworks error:', error);
      res.status(500).json({ error: 'Failed to fetch your artworks' });
    }
  }
}

module.exports = ArtworkController;