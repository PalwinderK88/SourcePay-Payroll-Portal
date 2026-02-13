# Password Reset Feature Documentation

## Overview

The Payroll Portal now includes a complete password reset functionality that allows users to reset their passwords via email.

## Features

✅ **Forgot Password Modal** - Clean modal interface on login page  
✅ **Email with Reset Link** - Secure token-based reset links sent via email  
✅ **Reset Password Page** - Dedicated page for setting new password  
✅ **Token Expiration** - Reset links expire after 1 hour for security  
✅ **Email Templates** - Professional branded email templates  

## Setup Instructions

### 1. Add Reset Token Columns to Database

Run this command to add the necessary columns to the users table:

```bash
cd Backend
node addResetTokenColumns.js
```

This will add:
- `reset_token` (TEXT) - Stores hashed reset token
- `reset_token_expiry` (INTEGER) - Stores expiration timestamp

### 2. Configure Email Service

Make sure your `.env` file has email configuration:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the App Password in EMAIL_PASSWORD

See `EMAIL_SETUP.md` for detailed instructions.

### 3. Restart the Backend Server

```bash
cd Backend
node server.js
```

## How It Works

### User Flow

1. **Request Reset**
   - User clicks "Forgot password?" on login page
   - Modal appears asking for email address
   - User enters email and clicks "Send Reset Link"

2. **Receive Email**
   - System generates secure reset token
   - Token is hashed and stored in database with expiration
   - Email sent with reset link containing token
   - Link format: `http://localhost:3000/reset-password?token=...`

3. **Reset Password**
   - User clicks link in email
   - Redirected to reset password page
   - Enters new password (minimum 6 characters)
   - Confirms password
   - Submits form

4. **Success**
   - Password updated in database
   - Reset token cleared
   - User redirected to login page
   - Can now login with new password

### Security Features

- **Token Hashing**: Reset tokens are hashed using SHA-256 before storage
- **Expiration**: Tokens expire after 1 hour
- **One-Time Use**: Tokens are cleared after successful password reset
- **No User Enumeration**: Same response whether email exists or not
- **Secure Password Storage**: Passwords hashed with bcrypt

## API Endpoints

### POST /api/auth/forgot-password

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

### POST /api/auth/reset-password

Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

## Files Modified/Created

### Backend

**New Files:**
- `Backend/addResetTokenColumns.js` - Database migration script

**Modified Files:**
- `Backend/Controllers/authController.js` - Added forgotPassword() and resetPassword()
- `Backend/Models/User.js` - Added reset token methods
- `Backend/services/emailService.js` - Added sendPasswordResetEmail()
- `Backend/routes/authroutes.js` - Added reset endpoints

### Frontend

**New Files:**
- `Frontend/Pages/reset-password.js` - Reset password page

**Modified Files:**
- `Frontend/Pages/login.js` - Added forgot password modal

## Testing

### Test Password Reset Flow

1. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   cd Backend
   node server.js

   # Terminal 2 - Frontend
   cd Frontend
   npm run dev
   ```

2. **Test the flow:**
   - Go to http://localhost:3000/login
   - Click "Forgot password?"
   - Enter a valid user email
   - Check email for reset link
   - Click link or copy URL
   - Enter new password
   - Confirm password matches
   - Submit and verify redirect to login
   - Login with new password

### Test Without Email (Development)

If email is not configured, the reset link will be logged to the console:

```bash
⚠️ Email not configured. Password reset link: http://localhost:3000/reset-password?token=...
```

Copy this link and test the reset flow manually.

## Troubleshooting

### Email Not Sending

**Problem:** Reset email not received

**Solutions:**
1. Check `.env` file has correct email credentials
2. For Gmail, ensure App Password is used (not regular password)
3. Check backend console for email errors
4. Verify EMAIL_HOST and EMAIL_PORT are correct
5. Test email configuration: `node Backend/testEmail.js`

### Invalid Token Error

**Problem:** "Invalid or expired reset token"

**Causes:**
1. Token has expired (>1 hour old)
2. Token already used
3. Token doesn't exist in database

**Solution:** Request a new reset link

### Database Errors

**Problem:** Column errors when resetting password

**Solution:** Run the migration script:
```bash
cd Backend
node addResetTokenColumns.js
```

## Email Template

The password reset email includes:
- SourcePay branding
- Clear call-to-action button
- Plain text link as backup
- Security warnings
- 1-hour expiration notice
- Professional footer

## Security Best Practices

1. **Never log tokens** - Tokens should never appear in logs
2. **Use HTTPS in production** - Reset links should use HTTPS
3. **Rate limiting** - Consider adding rate limiting to prevent abuse
4. **Strong passwords** - Enforce minimum password requirements
5. **Email verification** - Consider requiring email verification for new accounts

## Production Deployment

Before deploying to production:

1. **Update reset URL** in `Backend/Controllers/authController.js`:
   ```javascript
   const resetUrl = `https://yourdomain.com/reset-password?token=${resetToken}`;
   ```

2. **Use production email service** (SendGrid, AWS SES, etc.)

3. **Enable HTTPS** for all pages

4. **Add rate limiting** to prevent abuse

5. **Monitor failed attempts** and suspicious activity

## Future Enhancements

Potential improvements:
- [ ] Add rate limiting to prevent abuse
- [ ] Email verification for new accounts
- [ ] Password strength meter
- [ ] Remember last 5 passwords (prevent reuse)
- [ ] Two-factor authentication
- [ ] Account lockout after failed attempts
- [ ] Password reset history/audit log

## Support

For issues or questions:
- Check `TROUBLESHOOTING.md`
- Review `EMAIL_SETUP.md` for email configuration
- Check backend console logs for errors
- Verify database structure with `node Backend/checkTableStructure.js`
