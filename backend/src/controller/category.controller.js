// src/controllers/category.controller.js
const Category = require('../models/category.model');
const { sql } = require('kysely');
const { db } = require('../config');
class CategoryController {
  // ────────────────────────────────────────────────
  // Public: Get all active categories (with optional tree view)
  // GET /categories
  static async getAllCategories(req, res) {
    try {
      const { flat = 'false', parentId } = req.query;
      const isFlat = flat === 'true';

      let query = db
        .selectFrom('categories')
        .select(['id', 'name', 'slug', 'parent_id', 'description', 'icon_url', 'sort_order'])
        .where('is_active', '=', true)
        .orderBy('sort_order', 'asc')
        .orderBy('name', 'asc');

      if (parentId) {
        query = query.where('parent_id', '=', parentId);
      } else if (!isFlat) {
        // Default: top-level categories (no parent)
        query = query.where('parent_id', 'is', null);
      }

      const categories = await query.execute();

      if (isFlat || parentId) {
        return res.json({ categories });
      }

      // Build simple tree (only one level deep for simplicity)
      // You can make this recursive if you need deeper nesting
      const tree = categories.filter(c => !c.parent_id);
      const subMap = new Map();

      categories.forEach(cat => {
        if (cat.parent_id) {
          if (!subMap.has(cat.parent_id)) subMap.set(cat.parent_id, []);
          subMap.get(cat.parent_id).push(cat);
        }
      });

      const enriched = tree.map(parent => ({
        ...parent,
        children: subMap.get(parent.id) || [],
      }));

      res.json({ categories: enriched });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  // ────────────────────────────────────────────────
  // Public: Get single category by slug or ID
  // GET /categories/:identifier
  static async getCategory(req, res) {
    try {
      const { identifier } = req.params;

      let category;
      if (identifier.includes('-') || identifier.length > 30) {
        // treat as slug
        category = await Category.findBySlug(identifier);
      } else {
        category = await Category.findById(identifier);
      }

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  }

  // ────────────────────────────────────────────────
  // Admin: Create new category
  // POST /categories
  static async createCategory(req, res) {
    try {
      // Requires admin/moderator permission
      if (!req.user.permissions?.['categories.manage']) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      const { name, slug, parent_id, description, icon_url, sort_order = 0 } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: 'name and slug are required' });
      }

      // Optional: validate slug uniqueness
      if (await db
        .selectFrom('categories')
        .select('id')
        .where('slug', '=', slug)
        .executeTakeFirst()) {
        return res.status(409).json({ error: 'Slug already in use' });
      }

      const category = await Category.create({
        name,
        slug,
        parent_id: parent_id || null,
        description,
        icon_url,
        sort_order: Number(sort_order),
        is_active: true,
      });

      res.status(201).json(category);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  // ────────────────────────────────────────────────
  // Admin: Update category
  // PATCH /categories/:id
  static async updateCategory(req, res) {
    try {
      if (!req.user.permissions?.['categories.manage']) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      const { id } = req.params;
      const { name, slug, parent_id, description, icon_url, sort_order, is_active } = req.body;

      const existing = await Category.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (parent_id !== undefined) updateData.parent_id = parent_id || null;
      if (description !== undefined) updateData.description = description;
      if (icon_url !== undefined) updateData.icon_url = icon_url;
      if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
      if (is_active !== undefined) updateData.is_active = !!is_active;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const updated = await Category.update(id, updateData);

      res.json(updated);
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  // ────────────────────────────────────────────────
  // Admin: Delete / deactivate category
  // DELETE /categories/:id
  static async deleteCategory(req, res) {
    try {
      if (!req.user.permissions?.['categories.manage']) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Soft deactivate instead of hard delete (safer)
      await db
        .updateTable('categories')
        .set({
          is_active: false,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', id)
        .execute();

      // Optional: cascade deactivate children if needed
      // await db.updateTable('categories').set({ is_active: false }).where('parent_id', '=', id).execute();

      res.status(204).send();
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Failed to deactivate category' });
    }
  }

static async getCategoryBySlug(req, res) {
  try {
    const { slug } = req.params;
    const { page = '1', limit = '12' } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Valid slug is required' });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const normalizedSlug = slug.trim().toLowerCase();

    const category = await Category.findBySlug(normalizedSlug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const offset = (pageNum - 1) * limitNum;

    const artworksQuery = db
      .selectFrom('artworks')
      .innerJoin('artwork_categories', 'artworks.id', 'artwork_categories.artwork_id')
      .innerJoin('categories', 'artwork_categories.category_id', 'categories.id')
      .select([
        'artworks.id',
        'artworks.title',
        'artworks.description',
        'artworks.file_url',
        'artworks.thumbnail_url',
        'artworks.views_count',
        'artworks.favorites_count',
        'artworks.created_at',
      ])
      .where('categories.slug', '=', normalizedSlug)
      .where('artworks.status', '=', 'published')
      .where('artworks.deleted_at', 'is', null)
      .orderBy('artworks.created_at', 'desc')
      .limit(limitNum)
      .offset(offset);

    const artworks = await artworksQuery.execute();

    // Fixed count query
    const countResult = await db
      .selectFrom('artworks')
      .innerJoin('artwork_categories', 'artworks.id', 'artwork_categories.artwork_id')
      .innerJoin('categories', 'artwork_categories.category_id', 'categories.id')
      .select(({ fn }) => [fn.countAll().as('total')])
      .where('categories.slug', '=', normalizedSlug)
      .where('artworks.status', '=', 'published')
      .where('artworks.deleted_at', 'is', null)
      .executeTakeFirst();

    const total = Number(countResult?.total ?? 0);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      category,
      artworks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch category data' });
  }
}

}

module.exports = CategoryController;