require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const PORT = process.env.PORT || 5000;

async function main() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Connect DB
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (err) {
    console.error('Failed to connect to DB, exiting');
    process.exit(1);
  }

  app.use('/api/auth', authRoutes);

  app.get('/', (req, res) => res.send('CineScope server is running'));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();
