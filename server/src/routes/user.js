const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Authorization required' });
  const parts = header.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'Invalid auth header' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// GET /api/user/favorites
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('favorites');
    return res.json({ favorites: user ? user.favorites || [] : [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user/favorites/:tmdbId - check single favorite exists
router.get('/favorites/:tmdbId', verifyToken, async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    if (Number.isNaN(tmdbId)) return res.status(400).json({ message: 'Invalid tmdbId' });
    const user = await User.findById(req.userId).select('favorites');
    const exists = user ? user.favorites.some(f => f.tmdbId === tmdbId) : false;
    return res.json({ tmdbId, exists });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/user/favorites
router.post('/favorites', verifyToken, async (req, res) => {
  try {
    const { tmdbId, media_type, title, poster_path, backdrop_path } = req.body;
    if (!tmdbId) return res.status(400).json({ message: 'tmdbId required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const exists = user.favorites.some((f) => f.tmdbId === tmdbId);
    if (exists) return res.status(409).json({ message: 'Already in favorites' });

    user.favorites.push({ tmdbId, media_type, title, poster_path, backdrop_path });
    await user.save();
    return res.status(201).json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/user/favorites/:tmdbId
router.delete('/favorites/:tmdbId', verifyToken, async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.favorites = user.favorites.filter((f) => f.tmdbId !== tmdbId);
    await user.save();
    return res.json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// WATCHLIST endpoints (mirror favorites)
router.get('/watchlist', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('watchlist');
    return res.json({ watchlist: user ? user.watchlist || [] : [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/watchlist', verifyToken, async (req, res) => {
  try {
    const { tmdbId, media_type, title, poster_path, backdrop_path } = req.body;
    if (!tmdbId) return res.status(400).json({ message: 'tmdbId required' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const exists = user.watchlist.some((f) => f.tmdbId === tmdbId);
    if (exists) return res.status(409).json({ message: 'Already in watchlist' });
    user.watchlist.push({ tmdbId, media_type, title, poster_path, backdrop_path });
    await user.save();
    return res.status(201).json({ watchlist: user.watchlist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/watchlist/:tmdbId', verifyToken, async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.watchlist = user.watchlist.filter((f) => f.tmdbId !== tmdbId);
    await user.save();
    return res.json({ watchlist: user.watchlist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// WATCH HISTORY endpoints
router.get('/watch-history', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('watchHistory');
    // Return most recent first
    const history = user ? user.watchHistory || [] : [];
    const sorted = history.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
    return res.json({ watchHistory: sorted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/watch-history', verifyToken, async (req, res) => {
  try {
    const { tmdbId, media_type, title, poster_path, backdrop_path } = req.body;
    if (!tmdbId) return res.status(400).json({ message: 'tmdbId required' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Remove existing entry if present (to update watchedAt)
    user.watchHistory = user.watchHistory.filter((h) => h.tmdbId !== tmdbId);
    
    // Add to beginning of history
    user.watchHistory.unshift({ 
      tmdbId, 
      media_type, 
      title, 
      poster_path, 
      backdrop_path,
      watchedAt: new Date()
    });
    
    // Keep only last 50 items
    if (user.watchHistory.length > 50) {
      user.watchHistory = user.watchHistory.slice(0, 50);
    }
    
    await user.save();
    return res.status(201).json({ watchHistory: user.watchHistory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/watch-history/:tmdbId', verifyToken, async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.watchHistory = user.watchHistory.filter((h) => h.tmdbId !== tmdbId);
    await user.save();
    return res.json({ watchHistory: user.watchHistory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE OPERATIONS

// PUT /api/user/profile - Update user profile (name)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name.trim();
    await user.save();

    return res.json({ 
      message: 'Profile updated successfully',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        image: user.image,
        provider: user.provider
      } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/user/favorites/:tmdbId - Update favorite item (add rating/notes)
router.patch('/favorites/:tmdbId', verifyToken, async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    const { personalRating, notes } = req.body;

    if (Number.isNaN(tmdbId)) {
      return res.status(400).json({ message: 'Invalid tmdbId' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const favoriteItem = user.favorites.find((f) => f.tmdbId === tmdbId);
    if (!favoriteItem) {
      return res.status(404).json({ message: 'Favorite item not found' });
    }

    // Update fields if provided
    if (personalRating !== undefined) {
      if (personalRating < 0 || personalRating > 10) {
        return res.status(400).json({ message: 'Rating must be between 0 and 10' });
      }
      favoriteItem.personalRating = personalRating;
    }

    if (notes !== undefined) {
      if (notes.length > 500) {
        return res.status(400).json({ message: 'Notes cannot exceed 500 characters' });
      }
      favoriteItem.notes = notes;
    }

    await user.save();

    return res.json({ 
      message: 'Favorite updated successfully',
      favorites: user.favorites 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
