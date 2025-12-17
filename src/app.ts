import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import dotenv from 'dotenv';

import { initializeSocket } from './sockets/socket.server';
import { authMiddleware } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { AuthController } from './controllers/auth.controller';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize controllers FIRST
const authController = new AuthController();
const taskController = new TaskController();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes (public)
app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.post('/api/auth/logout', authController.logout.bind(authController));

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

// Initialize Socket.io AFTER routes
const io = initializeSocket(server);
TaskService.setIo(io);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io initialized`);
});