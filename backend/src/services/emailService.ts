import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailService = process.env.EMAIL_SERVICE;

    if (emailService === 'resend') {
      // Resend SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.EMAIL_API_KEY,
        },
      });
    } else if (emailService === 'gmail') {
      // Gmail configuration
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      console.warn('No email service configured');
    }
  }

  async sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ Email transporter not initialized. Check EMAIL_SERVICE in .env');
      return false;
    }

    try {
      console.log(`📧 Attempting to send email to: ${to}`);
      console.log(`📧 Subject: ${subject}`);
      console.log(`📧 From: ${process.env.EMAIL_FROM}`);
      
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@socialapp.com',
        to,
        subject,
        html,
      });

      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      console.log('📧 Response:', info.response);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending email:');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 32px; font-weight: bold; color: #3B82F6; }
            .content { background: #f9fafb; border-radius: 12px; padding: 30px; margin: 20px 0; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .button:hover { background: #2563EB; }
            .footer { text-align: center; color: #6B7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SocialApp</div>
            </div>
            <div class="content">
              <h2>Welcome to SocialApp! 🎉</h2>
              <p>Thanks for signing up! We're excited to have you on board.</p>
              <p>Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #3B82F6;">${verificationUrl}</a>
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                This link will expire in 24 hours.
              </p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>&copy; 2024 SocialApp. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your email address',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 32px; font-weight: bold; color: #3B82F6; }
            .content { background: #f9fafb; border-radius: 12px; padding: 30px; margin: 20px 0; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; color: #6B7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SocialApp</div>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password.</p>
              <p>Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #3B82F6;">${resetUrl}</a>
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                This link will expire in 1 hour.
              </p>
            </div>
            <div class="footer">
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p>&copy; 2024 SocialApp. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your password',
      html,
    });
  }
}

export default new EmailService();
