const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  /**
   * Base sender
   */
  static async sendEmail({ to, subject, html, attachments = [] }) {
    try {
      await sgMail.send({
        to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL,
          name: process.env.APP_NAME || "ModFan",
        },
        subject,
        html,
        attachments,
      });

      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error("SendGrid Error:", error.response?.body || error.message);
      throw new Error("Email sending failed");
    }
  }

  /**
   * Reusable template wrapper
   */
  static generateTemplate({
    title,
    content,
    buttonText,
    buttonUrl,
    color = "#9747ff",
  }) {
    return `
      <div style="background:#f4f6f8;padding:40px;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:auto;background:#fff;border-radius:12px;padding:30px;">
          
          <h2 style="margin-top:0;color:#111;">
            ${title}
          </h2>

          ${content}

          ${
            buttonText && buttonUrl
              ? `
              <div style="margin:30px 0;">
                <a href="${buttonUrl}"
                   style="
                     background:${color};
                     color:#fff;
                     padding:12px 24px;
                     text-decoration:none;
                     border-radius:8px;
                     display:inline-block;
                   ">
                   ${buttonText}
                </a>
              </div>
            `
              : ""
          }

          <hr style="margin:30px 0;border:none;border-top:1px solid #eee;" />

          <p style="font-size:12px;color:#777;">
            © ${new Date().getFullYear()} ${
      process.env.APP_NAME || "ModFan"
    }. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Email Verification
   */
  static async sendVerificationEmail(user, token) {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    const html = this.generateTemplate({
      title: `Welcome ${user.username} 👋`,
      content: `
        <p>Thank you for joining us.</p>
        <p>Please verify your email address to activate your account.</p>
      `,
      buttonText: "Verify Email",
      buttonUrl: url,
      color: "#9747ff",
    });

    return this.sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html,
    });
  }

  /**
   * Welcome Email
   */
  static async sendWelcomeEmail(user) {
    const html = this.generateTemplate({
      title: `Welcome ${user.username}!`,
      content: `
        <p>Your account has been successfully verified.</p>
        <p>You can now start using all platform features.</p>
      `,
    });

    return this.sendEmail({
      to: user.email,
      subject: "Welcome to ModFan",
      html,
    });
  }

  /**
   * Password Reset
   */
  static async sendPasswordResetEmail(user, token) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    const html = this.generateTemplate({
      title: "Password Reset Request",
      content: `
        <p>We received a request to reset your password.</p>
        <p>Click below to continue.</p>
      `,
      buttonText: "Reset Password",
      buttonUrl: url,
      color: "#df403e",
    });

    return this.sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html,
    });
  }

  /**
   * Password Changed Confirmation
   */
  static async sendPasswordChangedEmail(user) {
    const html = this.generateTemplate({
      title: "Password Updated",
      content: `
        <p>Your password was successfully changed.</p>
        <p>If this wasn't you, contact support immediately.</p>
      `,
    });

    return this.sendEmail({
      to: user.email,
      subject: "Password Changed",
      html,
    });
  }

  /**
   * Login Alert
   */
  static async sendLoginAlertEmail(user, ipAddress) {
    const html = this.generateTemplate({
      title: "New Login Detected",
      content: `
        <p>A new login was detected on your account.</p>
        <p><strong>IP Address:</strong> ${ipAddress}</p>
      `,
    });

    return this.sendEmail({
      to: user.email,
      subject: "Security Alert",
      html,
    });
  }

  /**
   * Order Confirmation
   */
  static async sendOrderConfirmation(user, order) {
    const html = this.generateTemplate({
      title: "Order Confirmed",
      content: `
        <p>Your order has been successfully processed.</p>

        <p>
          <strong>Order ID:</strong> ${order.id}
        </p>

        <p>
          <strong>Total:</strong> $${order.total}
        </p>
      `,
    });

    return this.sendEmail({
      to: user.email,
      subject: "Order Confirmation",
      html,
    });
  }

  /**
   * License Delivery
   */
  static async sendLicenseEmail(user, licenseKey, pdfBuffer) {
    const html = this.generateTemplate({
      title: "Your License Key",
      content: `
        <p>Thank you for your purchase.</p>

        <p>
          <strong>License Key:</strong>
        </p>

        <p style="
          background:#f5f5f5;
          padding:12px;
          border-radius:6px;
          font-family:monospace;
        ">
          ${licenseKey}
        </p>
      `,
    });

    return this.sendEmail({
      to: user.email,
      subject: "License Delivered",
      html,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: "license.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });
  }

  /**
   * Invoice Email
   */
  static async sendInvoiceEmail(user, pdfBuffer) {
    const html = this.generateTemplate({
      title: "Invoice",
      content: `
        <p>Your invoice is attached to this email.</p>
      `,
    });

    return this.sendEmail({
      to: user.email,
      subject: "Invoice",
      html,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: "invoice.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });
  }

  /**
   * Admin Notification
   */
  static async notifyAdmin(subject, message) {
    const html = this.generateTemplate({
      title: subject,
      content: `<p>${message}</p>`,
    });

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject,
      html,
    });
  }
}

module.exports = EmailService;
