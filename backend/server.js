const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const globalErrorHandler = require('./middleware/errorMiddleware');
const chatRoutes = require('./routes/chatRoutes');
const esewaRoutes = require('./routes/esewaRoutes');

// Basic environment check
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Please verify your .env file.');
}

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket connection management
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Accessibility for socket instance
app.set('io', io);

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Database connected');
    
    // Seed basic data if the collection is empty
    try {
      const Destination = require('./models/Destination');
      const count = await Destination.countDocuments({ approved: true });
      if (count === 0) {
        console.log('Seeding initial destination data...');
        const seedDestinations = require('./scripts/seedDestinations');
        await seedDestinations();
      }
    } catch (err) {
      console.error('Seeding check failed:', err);
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// CORS configuration for local development and Google Auth
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Request middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/guides', require('./routes/guideRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/contributors', require('./routes/contributorRoutes'));
app.use('/api/chats', chatRoutes);
app.use('/api/esewa', esewaRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/tours', require('./routes/tourRoutes'));

// Health check and root endpoints
app.get('/', (req, res) => {
  res.json({
    name: 'Nepal Hidden Gems API',
    status: 'online',
    version: '1.0.0'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API connection active' });
});

app.get('/api/auth/google-config', (req, res) => {
  res.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasMongoUri: !!process.env.MONGO_URI,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Post-route error handling
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});



