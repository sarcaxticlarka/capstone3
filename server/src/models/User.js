const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    googleId: { type: String, sparse: true },
    image: { type: String },
    provider: { type: String, enum: ['email', 'google'], default: 'email' },
    favorites: [
      {
        tmdbId: { type: Number, required: true },
        media_type: { type: String },
        title: { type: String },
        poster_path: { type: String },
        backdrop_path: { type: String },
      },
    ],
    watchlist: [
      {
        tmdbId: { type: Number, required: true },
        media_type: { type: String },
        title: { type: String },
        poster_path: { type: String },
        backdrop_path: { type: String },
      },
    ],
    watchHistory: [
      {
        tmdbId: { type: Number, required: true },
        media_type: { type: String },
        title: { type: String },
        poster_path: { type: String },
        backdrop_path: { type: String },
        watchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
