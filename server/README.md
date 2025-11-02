# CineScope - Express Server

This server provides authentication endpoints for the CineScope project (signup / login) using MongoDB, bcrypt, and JWT.

Quick start:

1. copy `.env.example` to `.env` and fill MONGO_URI and JWT_SECRET
2. npm install
3. npm run dev (requires nodemon) or npm start

Endpoints:
- POST /api/auth/signup  { name?, email, password }
- POST /api/auth/login   { email, password }
