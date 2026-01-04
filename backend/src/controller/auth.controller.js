// backend/src/controllers/auth.controller.js
const { findOrCreateUser, generateToken } = require('../services/auth.service');
const { logger } = require('../utils/logger');
const axios = require('axios');

async function googleLogin(req, res, next) {
  // This endpoint is called after Google redirects back
  // For full OAuth flow, use passport-google-oauth20 (recommended)
  // Here is a simplified version using code flow

  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ success: false, error: 'No code provided' });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.FRONTEND_URL}/auth/callback`,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = profileResponse.data;

    // Find or create user
    const user = await findOrCreateUser(profile);

    // Generate JWT
    const token = generateToken(user);

    // Redirect to frontend with token (or set cookie)
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/success?token=${token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Google login failed', { error: error.message });
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
}

async function getMe(req, res, next) {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
}

module.exports = { googleLogin, getMe };