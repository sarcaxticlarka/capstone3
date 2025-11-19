require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const PORT = process.env.PORT || 5000;

async function main() {
  const app = express();

   const allowedOrigins = [
    'http://localhost:3000',
    'https://capstone3-lemon.vercel.app',
    'https://capstone3-lemon.vercel.app/', // with trailing slash
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowedOrigins or matches Vercel pattern
      if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
  
  // Handle preflight requests
  app.options('*', cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  app.use(express.json());

  // Connect DB
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (err) {
    console.error('Failed to connect to DB, exiting');
    process.exit(1);
  }

  app.use('/api/auth', authRoutes);
  const userRoutes = require('./routes/user');
  app.use('/api/user', userRoutes);

  app.get('/health', (req, res) => res.status(200).send('ok'));

  app.get('/', (req, res) => res.send('CineScope server is running'));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();
