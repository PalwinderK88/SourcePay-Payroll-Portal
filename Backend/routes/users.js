const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

// Get all users (admin and agency_admin)
router.get('/', auth(['admin', 'agency_admin']), async (req, res) => {
  try {
    const result = await User.getAll();
    
    // If agency_admin, filter to only show users from their agency
    if (req.user.role === 'agency_admin') {
      const currentUser = await User.findById(req.user.id);
      const filteredUsers = result.filter(u => u.agency_name === currentUser.agency_name);
      return res.json(filteredUsers);
    }
    
    // Admin sees all users
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user info (protected route)
router.get('/me', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user agency (admin only)
router.patch('/:id/agency', auth('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { agency_name } = req.body;

    if (!agency_name) {
      return res.status(400).json({ message: 'Agency name is required' });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update agency
    await User.updateAgency(id, agency_name);

    res.json({ message: 'User agency updated successfully' });
  } catch (err) {
    console.error('Error updating user agency:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
