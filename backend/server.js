const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// **IMPORTANT: UPDATE CORS LIKE THIS**
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// **OR USE THIS FOR DEVELOPMENT (SIMPLER)**
// app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/guides', require('./routes/guideRoutes'));
app.use('/api', require('./routes/userRoutes')); // Mounts /api/favorites
app.use('/api/admin', adminRoutes); // Admin routes

// Test routes
app.get('/', (req, res) => {
  res.json({
    message: 'Nepal Hidden Gems API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      home: '/',
      auth: '/api/auth',
      authTest: '/api/auth/test'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API test successful!' });
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
  console.log(`   CORS enabled for: http://localhost:5173`);
});