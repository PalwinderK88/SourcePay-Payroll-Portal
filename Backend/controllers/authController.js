const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../services/emailService');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, agency_name } = req.body;
    
    // Validate agency_name for contractors
    if (role === 'contractor' && !agency_name) {
      return res.status(400).json({ message: 'Agency name is required for contractors' });
    }
    
    // Create user with agency_name
    const user = await User.create(name, email, password, role, null, agency_name);
    
    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(email, name).then(result => {
      if (result.success) {
        console.log(`✅ Welcome email sent to ${email}`);
      } else {
        console.log(`⚠️ Failed to send welcome email to ${email}:`, result.error);
      }
    });
    
    res.json({ message: 'User created successfully! Check your email for welcome message.', user });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, agency_id: user.agency_id }, 
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role,
        agency_id: user.agency_id,
        agency_name: user.agency_name
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token to user
    await User.saveResetToken(user.id, resetTokenHash, resetTokenExpiry);

    // Send reset email
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    const { sendPasswordResetEmail } = require('../services/emailService');
    
    await sendPasswordResetEmail(email, user.name, resetUrl);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error sending reset email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findByResetToken(resetTokenHash);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(user.id, hashedPassword);

    // Clear reset token
    await User.clearResetToken(user.id);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists and is pending activation
    const pendingUser = await User.findPendingByEmail(email);
    
    if (!pendingUser) {
      return res.status(400).json({ 
        message: 'No pending account found with this email. Please contact your administrator or sign up.' 
      });
    }

    // Activate the account
    await User.activateAccount(email, password);

    // Get the updated user
    const user = await User.findByEmail(email);

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({ 
      message: 'Account activated successfully!',
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('❌ Account activation error:', err);
    res.status(500).json({ message: 'Error activating account', error: err.message });
  }
};

exports.preRegisterUser = async (req, res) => {
  try {
    const { name, email, agency_name } = req.body;

    if (!name || !email || !agency_name) {
      return res.status(400).json({ message: 'Name, email, and agency name are required' });
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Create pending user
    const user = await User.createPending(name, email, 'contractor', agency_name);

    res.json({ 
      message: 'User pre-registered successfully! They can now activate their account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        agency_name: user.agency_name,
        status: user.status
      }
    });
  } catch (err) {
    console.error('❌ Pre-register user error:', err);
    res.status(500).json({ message: 'Error pre-registering user', error: err.message });
  }
};
