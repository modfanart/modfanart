const Tag = require("../models/tag.model");

class TagController {
  // GET /api/tags?search=&limit=&approved=
  static async searchTags(req, res) {
    try {
      const { search = "", limit, approved } = req.query;

      const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

      const tags = await Tag.search({
        query: search,
        limit: parsedLimit,
        approvedOnly: approved !== "false",
      });

      res.json({ tags });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to search tags" });
    }
  }
}

module.exports = TagController;
