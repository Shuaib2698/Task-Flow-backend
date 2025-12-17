import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
    const decoded = jwt.verify(token, secret) as { userId: string };
    
    // Attach user ID to request
    req.userId = decoded.userId;
    
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};