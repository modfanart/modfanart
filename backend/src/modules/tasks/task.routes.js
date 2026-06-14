const express = require('express');
const TaskController = require('./controller/task.controller');
const TaskCommentController = require('./controller/taskComment.controller');
const { authenticateToken } = require('../../common/middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

// Task CRUD & Management
router.post('/', TaskController.create);
router.get('/my-tasks', TaskController.getMyTasks);
router.get('/project/:projectId', TaskController.getByProject);
router.get('/:id', TaskController.getById);
router.put('/:id', TaskController.update);
router.put('/:id/status', TaskController.updateStatus);
router.put('/:id/assign', TaskController.assign);

// Task Comments
router.post('/comments', TaskCommentController.create);
router.get('/:taskId/comments', TaskCommentController.getByTask);

module.exports = router;