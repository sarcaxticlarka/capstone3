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
    'https://capstone3-lemon.vercel.app'
  ];
  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.options('*', cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
