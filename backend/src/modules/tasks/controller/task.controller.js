const Task = require('../models/task.model');
const Project = require('../models/project.model');
const ProjectMember = require('../models/projectMember.model');
const TaskActivity = require('../models/taskActivity.model');

class TaskController {
  // CREATE TASK
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const { project_id, title, description, priority, due_date, status = 'todo', labels } = req.body;

      if (!project_id) {
        return res.status(400).json({ success: false, message: 'Project ID is required' });
      }

      // Check if project exists and user has permission
      const project = await Project.findById(project_id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const member = await ProjectMember.getMember(project_id, userId); // You'll need to add this method
      if (!member) {
        return res.status(403).json({ success: false, message: 'You do not have access to this project' });
      }

      const task = await Task.create(project_id, {
        title,
        description,
        priority: priority || 'medium',
        due_date,
        status,
        labels: labels || null,
        created_by: userId,
      });

      await TaskActivity.log(task.id, userId, 'created', null, task);

      return res.status(201).json({ success: true, data: task });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to create task' });
    }
  }

  // GET TASK BY ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      // Check project access
      const hasAccess = await ProjectMember.hasAccess(task.project_id, userId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.json({ success: true, data: task });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error fetching task' });
    }
  }

  // UPDATE TASK
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const hasAccess = await ProjectMember.hasAccess(task.project_id, userId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const updated = await Task.update(id, req.body);

      await TaskActivity.log(id, userId, 'updated', task, updated);

      res.json({ success: true, data: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Update failed' });
    }
  }

  // ASSIGN TASK
  static async assign(req, res) {
    try {
      const { id } = req.params;
      const { user_id: assigneeId } = req.body;
      const actorId = req.user.id;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const hasAccess = await ProjectMember.hasAccess(task.project_id, actorId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      await Task.assign(id, assigneeId);

      await TaskActivity.log(id, actorId, 'assigned', {
        assigned_to: task.assigned_to,
      }, {
        assigned_to: assigneeId,
      });

      res.json({ success: true, message: 'Task assigned successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Assignment failed' });
    }
  }

  // UPDATE STATUS
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const actorId = req.user.id;

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const hasAccess = await ProjectMember.hasAccess(task.project_id, actorId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      await Task.updateStatus(id, status);

      await TaskActivity.log(id, actorId, 'status_changed', {
        status: task.status,
      }, { status });

      res.json({ success: true, message: 'Status updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Status update failed' });
    }
  }

  // GET TASKS BY PROJECT
  static async getByProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const isMember = await ProjectMember.hasAccess(projectId, userId);
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const tasks = await Task.getByProject(projectId);

      res.json({ success: true, data: tasks });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }
  }

  // GET MY TASKS (across all projects)
  static async getMyTasks(req, res) {
    try {
      const userId = req.user.id;
      const tasks = await Task.getAssignedTo(userId);

      res.json({ success: true, data: tasks });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }
  }
}

module.exports = TaskController;