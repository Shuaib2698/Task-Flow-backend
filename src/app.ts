import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import { initializeSocket } from './sockets/socket.server';
import { authMiddleware } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { AuthController } from './controllers/auth.controller';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Initialize TaskService with Socket.io
TaskService.setIo(io);

// Initialize controllers
const authController = new AuthController();
const taskController = new TaskController();

// Update CORS middleware in app.ts
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(helmet());


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Debug endpoint to check cookies
app.get('/api/debug/cookies', (req, res) => {
  console.log('Cookies received:', req.cookies);
  console.log('Headers:', req.headers);
  
  res.json({
    cookies: req.cookies,
    headers: {
      cookie: req.headers.cookie,
      origin: req.headers.origin,
      referer: req.headers.referer,
    },
    environment: process.env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.post('/api/auth/logout', (req, res) => authController.logout(req, res));

// Test cookie setting endpoint (NO auth required)
app.get('/api/test-set-cookie', (_req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('test_cookie', 'test_value_' + Date.now(), {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });
  
  res.json({
    success: true,
    message: 'Test cookie set',
    environment: process.env.NODE_ENV,
    cookieOptions: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    }
  });
});

// Test cookie reading endpoint (NO auth required)
app.get('/api/test-read-cookie', (req, res) => {
  res.json({
    success: true,
    cookies: req.cookies,
    headers: {
      cookie: req.headers.cookie,
      origin: req.headers.origin,
    }
  });
});

// Protected routes
app.use(authMiddleware);

app.get('/api/auth/me', (req, res) => authController.getProfile(req, res));
app.put('/api/auth/me', (req, res) => authController.updateProfile(req, res));

// Task routes
app.get('/api/tasks', (req, res) => taskController.getTasks(req, res));
app.post('/api/tasks', (req, res) => taskController.createTask(req, res));
app.get('/api/tasks/dashboard', (req, res) => taskController.getDashboard(req, res));
app.get('/api/tasks/users', (req, res) => taskController.getUsers(req, res));
app.get('/api/tasks/:taskId', (req, res) => taskController.getTask(req, res));
app.put('/api/tasks/:taskId', (req, res) => taskController.updateTask(req, res));
app.delete('/api/tasks/:taskId', (req, res) => taskController.deleteTask(req, res));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server - ONLY ONCE!
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
  console.log(`Socket.io initialized`);
});