// src/controllers/contestCategory.controller.js
const Contest = require('../models/contest.model');
const ContestCategory = require('../models/contestCategory.model');
const Category = require('../models/category.model');
const { db } = require('../config');
class ContestCategoryController {
  static async addCategory(req, res) {
    try {
      const { contestId } = req.params;
      const { categoryId } = req.body;

      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      if (contest.brand_id !== req.user.id && !req.user.permissions?.['contests.manage']) {
        return res.status(403).json({ error: 'Not authorized to modify categories' });
      }

      await ContestCategory.assign(contestId, categoryId);

      const category = await Category.findById(categoryId);
      res.status(201).json({
        message: 'Category added to contest',
        category: { id: categoryId, name: category?.name, slug: category?.slug },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add category' });
    }
  }

  static async removeCategory(req, res) {
    try {
      const { contestId, categoryId } = req.params;

      const contest = await Contest.findById(contestId);
      if (!contest) return res.status(404).json({ error: 'Contest not found' });

      if (contest.brand_id !== req.user.id && !req.user.permissions?.['contests.manage']) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await ContestCategory.remove(contestId, categoryId);

      res.json({ message: 'Category removed from contest', categoryId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to remove category' });
    }
  }

  static async getCategories(req, res) {
    try {
      const { contestId } = req.params;

      const categoryIds = await ContestCategory.getCategoryIdsForContest(contestId);

      if (categoryIds.length === 0) {
        return res.json({ categories: [] });
      }

      const categories = await db
        .selectFrom('categories')
        .select(['id', 'name', 'slug', 'description', 'icon_url'])
        .where('id', 'in', categoryIds)
        .where('is_active', '=', true)
        .execute();

      res.json({ categories });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch contest categories' });
    }
  }
}

module.exports = ContestCategoryController;