import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth.routes';
import profileRoutes from './src/routes/profile.routes';
import uploadRoutes from './src/routes/upload.routes';
import connectionRoutes from './src/routes/connection.routes';
import campaignRoutes from './src/routes/campaign.routes';
import chatRoutes from './src/routes/chat.routes';
import { socketAuth } from './src/middleware/socket.middleware';
import { registerChatHandlers } from './src/sockets/chat.sockets';
import { ensureDemoUsersExist } from './src/utils/seed';

dotenv.config();

// Auto-seed demo accounts on startup
ensureDemoUsersExist();

// Startup Failsafe Check
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET || !process.env.DATABASE_URL) {
  console.error("FATAL EXCEPTION: Missing critical environment variables.");
  process.exit(1);
}

const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const FRONTEND_URL = rawFrontendUrl.endsWith('/') ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});


app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Global Default-Deny Authentication
import { verifyToken } from './src/middleware/auth.middleware';
const publicRoutes = [
  /^\/health$/,
  /^\/api\/auth\/.*/,           // Auth endpoints
  /^\/api\/users\/@[^/]+$/,     // Public profiles
  /^\/api\/upload\/signature$/  // Mock uploads
];

app.use((req, res, next) => {
  const isPublic = publicRoutes.some(regex => regex.test(req.path));
  if (isPublic) {
    return next();
  }
  // Otherwise, strictly verify token
  verifyToken(req, res, next);
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/conversations', chatRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'INFLUX Backend is running' });
});

// Socket.IO secure setup
io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`Socket authenticated and connected: ${socket.id} (User: ${(socket as any).user?.username})`);
  
  registerChatHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
