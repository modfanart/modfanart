const Tag = require("../models/tag.model");
const { slugifyTag } = require("../models/tag.model");
const Tagging = require("../models/tagging.model");
const Artwork = require("../../artworks/models/artwork.model");
const { db } = require("../../../config");
class TaggingController {
  // POST /artworks/:artworkId/tags
  static async addTag(req, res) {
    try {
      const { artworkId } = req.params;
      // Accept either key: the client sends `name`, older callers send
      // `tagName`. Supporting both avoids a lockstep frontend/backend deploy.
      const tagName = req.body.tagName ?? req.body.name;

      if (
        !tagName ||
        typeof tagName !== "string" ||
        tagName.trim().length < 2
      ) {
        return res
          .status(400)
          .json({ error: "Valid tag name required (min 2 characters)" });
      }

      const artwork = await Artwork.findById(artworkId);
      if (!artwork) return res.status(404).json({ error: "Artwork not found" });

      // Ownership or permission check
      if (
        artwork.creator_id !== req.user.id &&
        !req.user.permissions?.["tags.manage"]
      ) {
        return res
          .status(403)
          .json({ error: "Not authorized to tag this artwork" });
      }

      const trimmed = tagName.trim();
      let tag = await Tag.findByNameOrSlug(trimmed);

      if (!tag) {
        const slug = slugifyTag(trimmed);

        if (!slug) {
          return res
            .status(400)
            .json({ error: "Tag name must contain letters or numbers" });
        }

        try {
          tag = await Tag.create(trimmed, slug, req.user.id);
        } catch (err) {
          // Two requests can race the tags_slug_key unique index. Losing that
          // race is not an error — the tag we wanted now exists.
          if (err?.code !== "23505") throw err;
          tag = await Tag.findByNameOrSlug(slug);
          if (!tag) throw err;
        }
      }

      // Count a usage only when the tag was genuinely newly attached to this
      // artwork. Incrementing before the insert meant replaying the same
      // request inflated usage_count without attaching anything, which skews
      // the autocomplete ordering, and newly created tags never counted at all.
      const attached = await Tagging.addTag(
        tag.id,
        "artwork",
        artworkId,
        req.user.id
      );

      if (attached) {
        await Tag.incrementUsage(tag.id);
      }

      res.status(201).json({
        message: "Tag added",
        tag: {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          approved: tag.approved,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add tag" });
    }
  }

  // DELETE /artworks/:artworkId/tags/:tagId
  static async removeTag(req, res) {
    try {
      const { artworkId, tagId } = req.params;

      const artwork = await Artwork.findById(artworkId);
      if (!artwork) return res.status(404).json({ error: "Artwork not found" });

      if (
        artwork.creator_id !== req.user.id &&
        !req.user.permissions?.["tags.manage"]
      ) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await Tagging.removeTag(tagId, "artwork", artworkId);

      res.json({ message: "Tag removed" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to remove tag" });
    }
  }

  // GET /artworks/:artworkId/tags
  static async getTags(req, res) {
    try {
      const { artworkId } = req.params;

      const tags = await Tagging.getTagsForEntity("artwork", artworkId);

      res.json({ tags });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  }
}

module.exports = TaggingController;
