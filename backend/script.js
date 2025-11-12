import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import warrantiesRoutes2 from './routes/warrantyRoutes2.js';
import dotenv from 'dotenv';
import googleRoutes from './routes/googleRoutes.js'
import warrantyDocumentRoutes from './routes/warrantyDocumentRoutes.js';
import session from "express-session";
dotenv.config();

const app = express();
const httpServer = createServer(app);

// MongoDB connection with better error handling and timeout settings
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
    });
    
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected, attempting to reconnect...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"]
  },
  path: '/socket.io/',
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Make io accessible to routes
app.set('io', io);

app.set("trust proxy", 1);

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));
app.use(bodyParser.json());

// Middleware to ensure MongoDB connection
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️ MongoDB not connected, attempting to reconnect...');
    try {
      await connectDB();
      next();
    } catch (error) {
      console.error('❌ Failed to reconnect to MongoDB:', error.message);
      return res.status(503).json({ 
        success: false, 
        error: 'Database connection unavailable. Please try again.' 
      });
    }
  } else {
    next();
  }
});

app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/',googleRoutes);
app.use('/api', warrantiesRoutes2);
app.use('/api', warrantyDocumentRoutes);

// Connect to MongoDB on startup
connectDB();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Socket.IO is ready for connections`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || "*"}`);
});
