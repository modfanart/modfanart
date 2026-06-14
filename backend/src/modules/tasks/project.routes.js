const express = require('express');
const ProjectController = require('./controller/project.controller');
const { authenticateToken } = require('../../common/middleware/auth.middleware');
const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Project CRUD
router.post('/', ProjectController.create);
router.get('/my-projects', ProjectController.getMyProjects);
router.get('/:id', ProjectController.getById);
router.put('/:id', ProjectController.update);

// Project Members Management
router.get('/:projectId/members', ProjectController.getMembers);
router.post('/:projectId/members', ProjectController.addMember);
router.put('/:projectId/members/:userId/role', ProjectController.updateMemberRole);
router.delete('/:projectId/members/:userId', ProjectController.removeMember);

module.exports = router;