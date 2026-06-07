const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow connections from extension and mobile app
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Make io accessible in controllers
app.set('io', io);

const jwt = require('jsonwebtoken');

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Clients will emit 'join' with their JWT token
  socket.on('join', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(decoded.id);
      console.log(`Socket ${socket.id} joined room ${decoded.id}`);
    } catch (err) {
      console.log(`Socket join failed: Invalid token`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
