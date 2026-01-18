const express = require('express');
const TaggingController = require('../controller/tagging.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

const router = express.Router({ mergeParams: true });

// router.use(authenticateToken);

router.post('/:artworkId/tags', hasPermission('tags.add'), TaggingController.addTag);
router.delete('/:artworkId/tags/:tagId', hasPermission('tags.remove'), TaggingController.removeTag);
router.get('/:artworkId/tags', TaggingController.getTags); // public read ok

module.exports = router;