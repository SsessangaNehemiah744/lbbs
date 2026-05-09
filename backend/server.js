require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bookRoutes = require('./routes/books');
const memberRoutes = require('./routes/members');
const borrowRoutes = require('./routes/borrows');
const authRoutes = require('./routes/auth');
const borrowRequestRoutes = require('./routes/borrowRequests');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
  ]
}));
app.use(express.json());

// Request logging (dev only)
if (process.env.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/borrow-requests', borrowRequestRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in your .env file");
    }

    await mongoose.connect(MONGO_URI);
    
    console.log('✅ MongoDB connected successfully to Atlas');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB connection failed:');
    console.error(err.message);
    
    if (err.message.includes('ECONNREFUSED')) {
      console.error('👉 TIP: Your app is still trying to connect to localhost. Check your .env file format!');
    }
    
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
