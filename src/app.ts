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
const PORT = process.env.PORT || 5000;  // <-- Keep this one
const server = createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Initialize TaskService with Socket.io
TaskService.setIo(io);

// Initialize controllers
const authController = new AuthController();
const taskController = new TaskController();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
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

// Auth routes
app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.post('/api/auth/logout', (req, res) => authController.logout(req, res));

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

// Remove the duplicate PORT declaration below:
// const PORT = process.env.PORT || 5000;  <-- DELETE THIS LINE

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Socket.io initialized`);
});
// Add at the very end of app.ts, before server.listen
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
});