'use strict';

const WorkspaceLoginService = require('../workspace-login.service');

class WorkspaceAuthController {
  /**
   * POST /api/auth/workspace/login
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

  /**
   * POST /api/auth/workspace/refresh
   */
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body || {};

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
      }

      const result = await WorkspaceLoginService.refresh({
        refreshToken,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      console.error('Workspace refresh error:', err);

      return res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Workspace refresh failed',
      });
    }
  }
}

module.exports = WorkspaceAuthController;
