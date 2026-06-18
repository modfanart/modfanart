// src/controllers/contact.controller.js
const ContactMessage = require("../models/contactMessage.model");

class ContactController {
  static async createMessage(req, res) {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      const newMessage = await ContactMessage.create({
        name,
        email,
        subject,
        message,
      });

      return res.status(201).json(newMessage);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Failed to send message",
      });
    }
  }

  static async getMessages(req, res) {
    try {
      const messages = await ContactMessage.findAll();
      return res.json(messages);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Failed to fetch messages",
      });
    }
  }

  static async getMessageById(req, res) {
    try {
      const message = await ContactMessage.findById(req.params.id);

      if (!message) {
        return res.status(404).json({
          error: "Not found",
        });
      }

      return res.json(message);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Error fetching message",
      });
    }
  }

  static async markAsRead(req, res) {
    try {
      await ContactMessage.markAsRead(req.params.id);

      return res.json({
        success: true,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Failed to update",
      });
    }
  }

  static async deleteMessage(req, res) {
    try {
      await ContactMessage.softDelete(req.params.id);

      return res.json({
        success: true,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Delete failed",
      });
    }
  }
}

module.exports = ContactController;
