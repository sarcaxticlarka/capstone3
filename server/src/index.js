require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const PORT = process.env.PORT || 5000;

async function main() {
  const app = express();

  // CORS Configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'https://capstone3-lemon.vercel.app',
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowedOrigins or is a Vercel deployment
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        console.warn('CORS: Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
  
  // Parse JSON bodies
  app.use(express.json());
  
  // Security headers
  app.use(helmet({ 
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false 
  }));
  
  // Rate limiting
  const apiLimiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 requests per windowMs
    standardHeaders: true, 
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', apiLimiter);

  // Connect to MongoDB
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (err) {
    console.error('Failed to connect to DB, exiting:', err);
    process.exit(1);
  }

  // Routes
  app.use('/api/auth', authRoutes);
  const userRoutes = require('./routes/user');
  app.use('/api/user', userRoutes);

  // Health check
  app.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

  // Root route
  app.get('/', (req, res) => res.json({ message: 'CineScope API Server', version: '1.0.0' }));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
      res.status(403).json({ error: 'CORS: Origin not allowed' });
    } else {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
  });
}

main();
