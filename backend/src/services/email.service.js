const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  static async sendEmail({ to, subject, html }) {
    try {
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        html,
      });
    } catch (error) {
      console.error('SendGrid Error:', error.response?.body || error.message);
      throw new Error('Email sending failed');
    }
  }

  static async sendVerificationEmail(user, token) {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    const html = `
      <div style="font-family:Arial;background:#f5f5f5;padding:40px;">
        <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:10px;">
          <h2 style="color:#1e1e1e;">Welcome, ${user.username} 👋</h2>
          <p>Please verify your account:</p>
          <a href="${url}" 
             style="background:#9747ff;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
             Verify Account
          </a>
          <p style="font-size:12px;color:#999;margin-top:20px;">
            If you didn’t request this, ignore this email.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Verify your account',
      html,
    });
  }

  static async sendPasswordResetEmail(user, token) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    const html = `
      <div style="font-family:Arial;background:#f5f5f5;padding:40px;">
        <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:10px;">
          <h2 style="color:#1e1e1e;">Reset your password</h2>
          <p>Click below to reset your password:</p>
          <a href="${url}" 
             style="background:#df403e;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
             Reset Password
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html,
    });
  }
}

module.exports = EmailService;
