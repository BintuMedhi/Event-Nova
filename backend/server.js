const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Route files
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const campaignRoutes = require('./src/routes/campaignRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const seatRoutes = require('./src/routes/seatRoutes');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for the MCA project demo
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json());

// Set up Socket.io for Real-Time Features
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 New WebSocket client connected: ${socket.id}`);

  // Group clients into event channels for target updates
  socket.on('joinEvent', (eventId) => {
    socket.join(eventId);
    console.log(`👤 Client joined channel for event: ${eventId}`);
  });

  // Client updates ticket sales live
  socket.on('ticketPurchased', (data) => {
    // data: { eventId, tierId, soldSeats, totalSeats }
    io.to(data.eventId).emit('seatsUpdated', data);
    // Broadcast globally for general live feed
    io.emit('globalLiveFeed', {
      type: 'purchase',
      message: `🎉 Someone just booked tickets for an event!`,
      timestamp: new Date(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
  });
});

// Attach Socket.io to express request so we can trigger events from controllers!
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Map routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/seats', seatRoutes);

// Base route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EventNova REST API is online and running!',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventnova';

mongoose.set('bufferCommands', false); // Disable command buffering when DB is offline

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 2500, // Timeout after 2.5 seconds
  })
  .then(() => {
    global.dbOffline = false;
    console.log('\n====================================================');
    console.log('💚 Connected to MongoDB database successfully!');
    console.log(`🔗 Database URI: ${MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);
    console.log('====================================================\n');
    if (process.env.NODE_ENV !== 'production') {
      server.listen(PORT, () => {
        console.log(`🔥 Server running in development mode on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    global.dbOffline = true;
    console.log('\n====================================================');
    console.log('❌ DATABASE CONNECTION OFFLINE');
    console.log(`Tried URI: ${MONGODB_URI}`);
    console.log('----------------------------------------------------');
    console.log('💡 How to connect MongoDB and see user registrations:');
    console.log('Option A: Use MongoDB Atlas (Cloud - Highly Recommended & 100% Free)');
    console.log('  1. Create a free cluster on mongodb.com');
    console.log('  2. Copy your connection string (looks like mongodb+srv://...)');
    console.log('  3. Open backend/.env and set MONGODB_URI=your_atlas_connection_string');
    console.log('  4. Restart this server!');
    console.log('');
    console.log('Option B: Run Local MongoDB Community Server');
    console.log('  1. Ensure MongoDB Community Server is installed on your Windows machine');
    console.log('  2. Run MongoDB Compass to view collections visually');
    console.log('  3. Start the MongoDB service via Services app or administrative cmd:');
    console.log('     net start MongoDB');
    console.log('====================================================\n');
    // Fallback so the server can run offline if MongoDB is not started yet! Extremely robust!
    if (process.env.NODE_ENV !== 'production') {
      server.listen(PORT, () => {
        console.log(`🔥 Server running in DATABASE-OFFLINE-MODE on port ${PORT}`);
      });
    }
  });

module.exports = app;
