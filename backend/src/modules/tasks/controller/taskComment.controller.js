const TaskComment = require('../models/taskComment.model');
const Task = require('../models/task.model');
const ProjectMember = require('../models/projectMember.model');
const TaskActivity = require('../models/taskActivity.model');

class TaskCommentController {
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const { task_id, content, mentions = [] } = req.body;

      if (!content?.trim()) {
        return res.status(400).json({ success: false, message: 'Comment content is required' });
      }

      const task = await Task.findById(task_id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const hasAccess = await ProjectMember.hasAccess(task.project_id, userId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const comment = await TaskComment.create(task_id, userId, content, mentions);

      await TaskActivity.log(task_id, userId, 'commented', null, { comment_id: comment.id, content });

      res.status(201).json({ success: true, data: comment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
  }

  static async getByTask(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const hasAccess = await ProjectMember.hasAccess(task.project_id, userId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const comments = await TaskComment.getByTask(taskId);

      res.json({ success: true, data: comments });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
  }
}

module.exports = TaskCommentController;