'use strict';

const WorkspaceLoginService = require('../workspace-login.service');

class WorkspaceAuthController {
  /**
   * POST /api/workspace/auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body || {};

      const result = await WorkspaceLoginService.login({
        email,
        password,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error('Workspace login error:', err);

      return res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Workspace login failed',
      });
    }
  }
}

module.exports = WorkspaceAuthController;
