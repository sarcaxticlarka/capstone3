const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

 
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });

   const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);

   console.time('signup:hash');
  const hashed = await bcrypt.hash(password, saltRounds);
  console.timeEnd('signup:hash');

  const user = new User({ name, email, password: hashed });
  console.time('signup:save');
  await user.save();
  console.timeEnd('signup:save');

   console.log('signup:completed', { email: user.email, id: user._id });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/google-login
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, googleId, image } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ message: 'Email and Google ID required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        if (image) user.image = image;
        if (name) user.name = name;
        await user.save();
      }
    } else {
      // Create new user for Google login
      user = new User({
        name: name || 'Google User',
        email,
        googleId,
        image,
        provider: 'google',
        password: 'google-oauth-no-password', // placeholder, won't be used
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        image: user.image,
        provider: user.provider 
      } 
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
