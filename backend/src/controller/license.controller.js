// src/controllers/license.controller.js
const License = require('../models/license.model');
const { sql } = require('kysely');
const { db } = require('../config');
class LicenseController {
  // GET /licenses/me — already good
  static async getMyLicenses(req, res) {
    try {
      const licenses = await License.getLicensesForBuyer(req.user.id);
      res.json({ licenses });
    } catch (err) {
      console.error('Get my licenses error:', err);
      res.status(500).json({ error: 'Failed to fetch licenses' });
    }
  }

  // GET /licenses/:id — already good
  static async getLicense(req, res) {
    try {
      const { id } = req.params;
      const license = await License.findById(id);

      if (!license || license.buyer_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'Not authorized to view this license' });
      }

      // TODO: in production, generate a signed S3 URL instead of exposing public URL
      // const signedUrl = await generateSignedS3Url(license.contract_pdf_url, 3600); // 1 hour expiry

      res.json({
        ...license,
        contract_url: license.contract_pdf_url, // or signedUrl
      });
    } catch (err) {
      console.error('Get license error:', err);
      res.status(500).json({ error: 'Failed to fetch license' });
    }
  }

  // ────────────────────────────────────────────────
  // Optional: new methods
  // ────────────────────────────────────────────────

  // GET /licenses/issued — licenses issued by current user (seller)
  static async getIssuedLicenses(req, res) {
    try {
      const licenses = await db
        .selectFrom('licenses')
        .innerJoin('order_items', 'order_items.id', 'licenses.order_item_id')
        .innerJoin('orders', 'orders.id', 'order_items.order_id')
        .select([
          'licenses.*',
          'orders.order_number',
          'orders.created_at as order_date',
        ])
        .where('licenses.seller_id', '=', req.user.id)
        .where('licenses.is_active', '=', true)
        .orderBy('licenses.created_at', 'desc')
        .execute();

      res.json({ issuedLicenses: licenses });
    } catch (err) {
      console.error('Get issued licenses error:', err);
      res.status(500).json({ error: 'Failed to fetch issued licenses' });
    }
  }

  // PATCH /licenses/:id/revoke
  static async revokeLicense(req, res) {
    try {
      const { id } = req.params;

      const license = await License.findById(id);
      if (!license) return res.status(404).json({ error: 'License not found' });

      // Only seller or admin can revoke
      if (
        license.seller_id !== req.user.id &&
        !req.user.permissions?.['licenses.manage']
      ) {
        return res
          .status(403)
          .json({ error: 'Not authorized to revoke this license' });
      }

      if (!license.is_active) {
        return res.status(400).json({ error: 'License already revoked' });
      }

      await License.revoke(id);

      res.json({ message: 'License revoked successfully', licenseId: id });
    } catch (err) {
      console.error('Revoke license error:', err);
      res.status(500).json({ error: 'Failed to revoke license' });
    }
  }

  // GET /licenses (admin only)
  static async getAllLicenses(req, res) {
    try {
      // You can add query params for filtering later
      const licenses = await db
        .selectFrom('licenses')
        .selectAll()
        .orderBy('created_at', 'desc')
        .limit(100) // pagination later
        .execute();

      res.json({ licenses });
    } catch (err) {
      console.error('Get all licenses error:', err);
      res.status(500).json({ error: 'Failed to fetch licenses' });
    }
  }
}

module.exports = LicenseController;
