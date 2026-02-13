# Email Setup Guide - SourcePay Payroll Portal

## Overview
The system now sends welcome emails to users when they sign up. This guide explains how to configure email settings.

## Email Service Configuration

### Option 1: Gmail (For Development/Testing)

1. **Create/Use a Gmail Account**
   - Use an existing Gmail account or create a new one for the application

2. **Enable 2-Factor Authentication**
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - Enable it

3. **Generate App Password**
   - Go to Google Account Settings
   - Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "SourcePay Portal"
   - Copy the generated 16-character password

4. **Update Backend/.env File**
   ```env
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up for SendGrid**
   - Go to https://sendgrid.com/
   - Create a free account (100 emails/day free)

2. **Create API Key**
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Update Backend/.env File**
   ```env
   # Email Configuration
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   ```

### Option 3: AWS SES (For Production)

1. **Set up AWS SES**
   - Go to AWS Console → SES
   - Verify your domain or email address
   - Get SMTP credentials

2. **Update Backend/.env File**
   ```env
   # Email Configuration
   EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
   EMAIL_PORT=587
   EMAIL_USER=your-aws-smtp-username
   EMAIL_PASSWORD=your-aws-smtp-password
   ```

### Option 4: Other SMTP Services

You can use any SMTP service (Mailgun, Postmark, etc.):

```env
# Email Configuration
EMAIL_HOST=smtp.your-service.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

## Testing Email Functionality

### 1. Using Mailtrap (For Development Testing)

Mailtrap catches all emails without sending them to real addresses:

1. Sign up at https://mailtrap.io/
2. Get SMTP credentials from your inbox
3. Update `.env`:
   ```env
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your-mailtrap-username
   EMAIL_PASSWORD=your-mailtrap-password
   ```

### 2. Test Signup

1. Start the backend server:
   ```bash
   cd Backend
   node server.js
   ```

2. Go to http://localhost:3000/signup
3. Create a new account
4. Check your email inbox (or Mailtrap inbox)

## Email Template

The welcome email includes:
- SourcePay branding
- Personalized greeting
- Feature highlights
- Getting started guide
- Call-to-action button
- Professional footer

## Troubleshooting

### Email Not Sending

1. **Check Console Logs**
   - Look for email sending errors in the backend console
   - Check if EMAIL_USER and EMAIL_PASSWORD are set

2. **Verify SMTP Settings**
   - Ensure EMAIL_HOST and EMAIL_PORT are correct
   - Test SMTP credentials separately

3. **Check Firewall/Network**
   - Ensure port 587 is not blocked
   - Try port 465 with `secure: true` if 587 doesn't work

4. **Gmail Specific Issues**
   - Make sure "Less secure app access" is OFF (use App Password instead)
   - Check if 2FA is enabled
   - Verify the App Password is correct

### Email Goes to Spam

1. **For Production:**
   - Set up SPF, DKIM, and DMARC records for your domain
   - Use a verified domain email address
   - Use a reputable email service (SendGrid, AWS SES)

2. **For Development:**
   - This is normal for development emails
   - Check spam folder
   - Use Mailtrap for testing

## Production Recommendations

1. **Use Professional Email Service**
   - SendGrid, AWS SES, or Mailgun
   - Better deliverability
   - Analytics and tracking

2. **Set Up Domain Authentication**
   - SPF records
   - DKIM signing
   - DMARC policy

3. **Monitor Email Delivery**
   - Track bounce rates
   - Monitor spam complaints
   - Set up webhooks for delivery status

4. **Update Email Content**
   - Change `http://localhost:3000` to your production URL
   - Update company contact information
   - Add unsubscribe link if required

## Environment Variables Summary

Add these to your `Backend/.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Other existing variables
DB_USER=postgres
DB_HOST=localhost
DB_NAME=payroll
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_secret_key_here
PORT=5001
```

## Features

- ✅ Automatic welcome email on signup
- ✅ Professional HTML email template
- ✅ Plain text fallback
- ✅ SourcePay branding
- ✅ Non-blocking (signup succeeds even if email fails)
- ✅ Error logging for debugging

## Future Enhancements

Consider adding:
- Password reset emails
- Payslip notification emails
- Document upload confirmation emails
- Monthly payslip reminders
- Email preferences/unsubscribe
