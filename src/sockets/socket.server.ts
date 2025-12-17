import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Server as HttpServer } from 'http';

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Socket middleware for authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
      const decoded = jwt.verify(token, secret) as { userId: string };
      (socket as any).userId = decoded.userId;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    
    console.log(`User ${userId} connected`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Handle task subscription
    socket.on('task:subscribe', (taskId: string) => {
      socket.join(`task:${taskId}`);
    });

    // Handle task unsubscription
    socket.on('task:unsubscribe', (taskId: string) => {
      socket.leave(`task:${taskId}`);
    });

    // Handle user typing
    socket.on('task:typing', ({ taskId, isTyping }: { 
      taskId: string; 
      isTyping: boolean 
    }) => {
      socket.to(`task:${taskId}`).emit('task:typing', {
        userId,
        isTyping,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

export { io };