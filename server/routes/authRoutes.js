const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, adminOnly } = require('../middleware/auth');

// Public login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
      res.json({ token, user: { id: user._id, username: user.username, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all sub-admins
router.get('/subadmins', protect, adminOnly, async (req, res) => {
  try {
    const subadmins = await User.find({ role: 'sub-admin' }).select('-password');
    res.json(subadmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create new sub-admin
router.post('/subadmins', protect, adminOnly, async (req, res) => {
  const { username, password, name } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      username,
      password,
      name,
      role: 'sub-admin'
    });
    res.status(201).json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update sub-admin password
router.put('/subadmins/:id/password', protect, adminOnly, async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.password = password;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
