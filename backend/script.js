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

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"]
  }
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

app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/',googleRoutes);
app.use('/api', warrantiesRoutes2);
app.use('/api', warrantyDocumentRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO is ready for connections`);
});
