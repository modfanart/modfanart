const Project = require('../models/project.model');
const ProjectMember = require('../models/projectMember.model');
const Task = require('../models/task.model'); // if needed for future

class ProjectController {

  // CREATE PROJECT
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const { name, description, slug } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Project name is required' });
      }

      const project = await Project.create(userId, {
        name,
        description,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      });

      // Automatically make creator an admin
      await ProjectMember.add(project.id, userId, 'admin');

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to create project' });
    }
  }

  // GET PROJECT BY ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const isMember = await ProjectMember.hasAccess(id, userId);
      if (!isMember) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.json({ success: true, data: project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error fetching project' });
    }
  }

  // GET ALL USER PROJECTS
  static async getMyProjects(req, res) {
    try {
      const userId = req.user.id;
      const projects = await Project.getUserProjects(userId);

      res.json({ success: true, data: projects });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
  }

  // UPDATE PROJECT
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { name, description, slug, is_active } = req.body;

      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const member = await ProjectMember.getMember(id, userId);
      if (!member || member.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins can update project' });
      }

      const updated = await Project.update(id, { name, description, slug, is_active });

      res.json({ success: true, data: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to update project' });
    }
  }

  // ADD MEMBER
  static async addMember(req, res) {
    try {
      const { projectId } = req.params;
      const { user_id, role = 'member' } = req.body;
      const actorId = req.user.id;

      if (!user_id) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const actor = await ProjectMember.getMember(projectId, actorId);
      if (!actor || actor.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins can add members' });
      }

      await ProjectMember.add(projectId, user_id, role);

      res.json({ success: true, message: 'Member added successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to add member' });
    }
  }

  // REMOVE MEMBER
  static async removeMember(req, res) {
    try {
      const { projectId, userId } = req.params;
      const actorId = req.user.id;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const actor = await ProjectMember.getMember(projectId, actorId);
      if (!actor || actor.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins can remove members' });
      }

      await ProjectMember.remove(projectId, userId);

      res.json({ success: true, message: 'Member removed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to remove member' });
    }
  }

  // UPDATE MEMBER ROLE
  static async updateMemberRole(req, res) {
    try {
      const { projectId, userId } = req.params;
      const { role } = req.body;
      const actorId = req.user.id;

      if (!['admin', 'member', 'viewer'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      const actor = await ProjectMember.getMember(projectId, actorId);
      if (!actor || actor.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admins can change roles' });
      }

      await ProjectMember.updateRole(projectId, userId, role);

      res.json({ success: true, message: 'Role updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to update role' });
    }
  }

  // GET PROJECT MEMBERS
  static async getMembers(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const hasAccess = await ProjectMember.hasAccess(projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const members = await ProjectMember.getMembers(projectId);

      res.json({ success: true, data: members });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to fetch members' });
    }
  }
}

module.exports = ProjectController;