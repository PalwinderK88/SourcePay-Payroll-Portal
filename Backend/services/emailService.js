const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development, you can use Gmail or any SMTP service
  // For production, use a proper email service like SendGrid, AWS SES, etc.
  
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
  });
};

// Send welcome email to new users
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SourcePay International" <${process.env.EMAIL_USER || 'noreply@sourcepay.com'}>`,
      to: userEmail,
      subject: 'Welcome to SourcePay International - Payroll Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%);
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .logo {
              color: #ffffff;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: -1px;
            }
            .subtitle {
              color: #6B7C5D;
              font-size: 12px;
              letter-spacing: 4px;
              margin-top: 5px;
            }
            .content {
              background: #ffffff;
              padding: 40px 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .greeting {
              font-size: 24px;
              color: #2C3E2E;
              margin-bottom: 20px;
            }
            .message {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 20px;
            }
            .features {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .feature-item {
              display: flex;
              align-items: center;
              margin: 15px 0;
            }
            .feature-icon {
              font-size: 24px;
              margin-right: 15px;
            }
            .feature-text {
              font-size: 14px;
              color: #2C3E2E;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%);
              color: #ffffff;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .footer-text {
              font-size: 12px;
              color: #6B7C5D;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">SOURCEPAY</div>
            <div class="subtitle">INTERNATIONAL</div>
          </div>
          
          <div class="content">
            <div class="greeting">Welcome, ${userName}! 👋</div>
            
            <div class="message">
              Thank you for joining SourcePay International's Payroll Portal. We're excited to have you on board!
            </div>
            
            <div class="message">
              Your account has been successfully created and you now have access to our secure payroll management system.
            </div>
            
            <div class="features">
              <div class="feature-item">
                <span class="feature-icon">📄</span>
                <span class="feature-text">Access your payslips anytime, anywhere</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📁</span>
                <span class="feature-text">Upload and manage your documents securely</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔒</span>
                <span class="feature-text">Bank-level encryption for your data</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📱</span>
                <span class="feature-text">24/7 access from any device</span>
              </div>
            </div>
            
            <div class="message">
              <strong>Getting Started:</strong>
            </div>
            <div class="message">
              1. Log in to your account using your email and password<br>
              2. Complete your profile information<br>
              3. Upload any required documents<br>
              4. Access your payslips and financial information
            </div>
            
            <center>
              <a href="http://localhost:3000/login" class="cta-button">
                Access Your Portal
              </a>
            </center>
            
            <div class="message" style="margin-top: 30px;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </div>
            
            <div class="message">
              Best regards,<br>
              <strong>The SourcePay Team</strong>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">
              © ${new Date().getFullYear()} SourcePay International. All rights reserved.
            </div>
            <div class="footer-text" style="margin-top: 10px;">
              This is an automated message. Please do not reply to this email.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to SourcePay International, ${userName}!

Thank you for joining our Payroll Portal. Your account has been successfully created.

What you can do:
- Access your payslips anytime, anywhere
- Upload and manage your documents securely
- Bank-level encryption for your data
- 24/7 access from any device

Getting Started:
1. Log in to your account using your email and password
2. Complete your profile information
3. Upload any required documents
4. Access your payslips and financial information

Access your portal: http://localhost:3000/login

If you have any questions, please contact our support team.

Best regards,
The SourcePay Team

© ${new Date().getFullYear()} SourcePay International. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error - we don't want signup to fail if email fails
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SourcePay International" <${process.env.EMAIL_USER || 'noreply@sourcepay.com'}>`,
      to: userEmail,
      subject: 'Reset Your Password - SourcePay Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6B7C5D 0%, #556B4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #2C3E2E; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              
              <p>We received a request to reset your password for your SourcePay Portal account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2C3E2E;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                </ul>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>
              <strong>SourcePay International Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} SourcePay International. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${userName},

We received a request to reset your password for your SourcePay Portal account.

Click this link to reset your password:
${resetUrl}

Important:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password will remain unchanged until you create a new one

If you have any questions, please contact our support team.

Best regards,
SourcePay International Team

© ${new Date().getFullYear()} SourcePay International. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send document reminder email
const sendDocumentReminderEmail = async (userEmail, userName, docType, expiryDate, daysUntilExpiry) => {
  try {
    const transporter = createTransporter();

    const urgencyLevel = daysUntilExpiry <= 3 ? 'URGENT' : daysUntilExpiry <= 7 ? 'Important' : 'Reminder';
    const urgencyColor = daysUntilExpiry <= 3 ? '#d32f2f' : daysUntilExpiry <= 7 ? '#f57c00' : '#1976d2';

    const mailOptions = {
      from: `"SourcePay International" <${process.env.EMAIL_USER || 'noreply@sourcepay.com'}>`,
      to: userEmail,
      subject: `${urgencyLevel}: ${docType} Expiring in ${daysUntilExpiry} Day${daysUntilExpiry !== 1 ? 's' : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6B7C5D 0%, #556B4A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .alert-box { background: ${urgencyColor}15; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .alert-title { color: ${urgencyColor}; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
            .doc-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .doc-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .doc-label { font-weight: 600; color: #2C3E2E; }
            .doc-value { color: #4b5563; }
            .cta-button { display: inline-block; background: ${urgencyColor}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
            .footer-text { font-size: 12px; color: #6B7C5D; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Document Expiry ${urgencyLevel}</h1>
            </div>
            
            <div class="content">
              <p>Hello ${userName},</p>
              
              <div class="alert-box">
                <div class="alert-title">⚠️ ${urgencyLevel}: Document Expiring Soon</div>
                <p>Your <strong>${docType}</strong> document will expire in <strong>${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}</strong>.</p>
              </div>
              
              <div class="doc-details">
                <div class="doc-row">
                  <span class="doc-label">Document Type:</span>
                  <span class="doc-value">${docType}</span>
                </div>
                <div class="doc-row">
                  <span class="doc-label">Expiry Date:</span>
                  <span class="doc-value">${new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="doc-row" style="border-bottom: none;">
                  <span class="doc-label">Days Remaining:</span>
                  <span class="doc-value" style="color: ${urgencyColor}; font-weight: bold;">${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <p><strong>Action Required:</strong></p>
              <p>Please upload a renewed version of this document to avoid any disruption to your payroll processing.</p>
              
              <center>
                <a href="http://localhost:3000/dashboard" class="cta-button">
                  Upload Document Now
                </a>
              </center>
              
              <p style="margin-top: 30px; font-size: 14px; color: #6B7C5D;">
                <strong>Why is this important?</strong><br>
                Valid documents are required for compliance and to ensure uninterrupted payroll processing. Expired documents may delay your payments.
              </p>
            </div>
            
            <div class="footer">
              <div class="footer-text">
                © ${new Date().getFullYear()} SourcePay International. All rights reserved.
              </div>
              <div class="footer-text" style="margin-top: 10px;">
                This is an automated reminder. Please do not reply to this email.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${userName},

${urgencyLevel}: Document Expiring Soon

Your ${docType} document will expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}.

Document Details:
- Document Type: ${docType}
- Expiry Date: ${new Date(expiryDate).toLocaleDateString('en-GB')}
- Days Remaining: ${daysUntilExpiry}

Action Required:
Please upload a renewed version of this document to avoid any disruption to your payroll processing.

Upload your document: http://localhost:3000/dashboard

Why is this important?
Valid documents are required for compliance and to ensure uninterrupted payroll processing. Expired documents may delay your payments.

© ${new Date().getFullYear()} SourcePay International. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Document reminder email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending document reminder email:', error);
    return { success: false, error: error.message };
  }
};

// Send document expired notification
const sendDocumentExpiredEmail = async (userEmail, userName, docType, expiryDate) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SourcePay International" <${process.env.EMAIL_USER || 'noreply@sourcepay.com'}>`,
      to: userEmail,
      subject: `URGENT: ${docType} Has Expired - Action Required`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .alert-box { background: #ffebee; border-left: 4px solid #d32f2f; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .alert-title { color: #d32f2f; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
            .doc-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #d32f2f; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Document Expired</h1>
            </div>
            
            <div class="content">
              <p>Hello ${userName},</p>
              
              <div class="alert-box">
                <div class="alert-title">⚠️ URGENT: Document Has Expired</div>
                <p>Your <strong>${docType}</strong> document expired on <strong>${new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.</p>
              </div>
              
              <p><strong>Immediate Action Required:</strong></p>
              <ul>
                <li>Upload a renewed version of your ${docType} immediately</li>
                <li>Expired documents may cause delays in payroll processing</li>
                <li>Compliance requirements mandate up-to-date documentation</li>
              </ul>
              
              <center>
                <a href="http://localhost:3000/dashboard" class="cta-button">
                  Upload Document Now
                </a>
              </center>
              
              <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 8px;">
                <strong>⚠️ Important:</strong> Until you upload a valid replacement document, your account may be restricted and payments may be delayed.
              </p>
              
              <p style="margin-top: 20px;">
                If you need assistance or have questions, please contact our support team immediately.
              </p>
            </div>
            
            <div class="footer">
              <div style="font-size: 12px; color: #6B7C5D;">
                © ${new Date().getFullYear()} SourcePay International. All rights reserved.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${userName},

URGENT: Document Has Expired

Your ${docType} document expired on ${new Date(expiryDate).toLocaleDateString('en-GB')}.

Immediate Action Required:
- Upload a renewed version of your ${docType} immediately
- Expired documents may cause delays in payroll processing
- Compliance requirements mandate up-to-date documentation

Upload your document: http://localhost:3000/dashboard

Important: Until you upload a valid replacement document, your account may be restricted and payments may be delayed.

If you need assistance or have questions, please contact our support team immediately.

© ${new Date().getFullYear()} SourcePay International. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Document expired email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending document expired email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendDocumentReminderEmail,
  sendDocumentExpiredEmail,
};
