const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const destinationRoutes = require('./routes/destinationRoutes');

// Configuration check on startup
console.log('\n=== BACKEND CONFIGURATION CHECK ===');
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n⚠️  Please check your backend/.env file!\n');
} else {
  console.log('✅ All required environment variables are set');
  console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '***SET***' : 'MISSING'}`);
  console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '***SET***' : 'MISSING'}`);
}
console.log('===================================\n');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// CORS - Enhanced for Google FedCM support
app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept',
    'Origin',
    'X-Requested-With',
    'Sec-Fetch-Dest',
    'Sec-Fetch-Mode',
    'Sec-Fetch-Site',
    'Sec-Fetch-User'
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Note: We don't set Cross-Origin-Opener-Policy headers
// as they can interfere with Google Sign-In popups

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  if (req.path === '/api/auth/google-login' && req.method === 'POST') {
    console.log(`\n=== INCOMING REQUEST ===`);
    console.log(`Method: ${req.method}`);
    console.log(`Path: ${req.path}`);
    console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
  }
  next();
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Existing auth routes (includes google-login route)
app.use('/api/auth', authRoutes);

// Destination routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));

// Profile routes
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));

// Guide and Booking routes
app.use('/api/guides', require('./routes/guideRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Test routes
app.get('/', (req, res) => {
  res.json({
    message: 'Nepal Hidden Gems API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      home: '/',
      auth: '/api/auth',
      authTest: '/api/auth/test',
      googleLogin: '/api/auth/google-login',
      destinations: '/api/destinations',
      destinationBySlug: '/api/destinations/:slug'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API test successful!' });
});

// Google OAuth configuration test endpoint
app.get('/api/auth/google-config', (req, res) => {
  res.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasMongoUri: !!process.env.MONGO_URI,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`   Server running at http://localhost:${PORT}`);
  console.log('   Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/test`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   POST http://localhost:${PORT}/api/auth/google-login`);
    console.log(`   GET  http://localhost:${PORT}/api/destinations`);
    console.log(`   GET  http://localhost:${PORT}/api/destinations/:slug`);
    console.log(`   CORS enabled for: http://localhost:5173`);
});
