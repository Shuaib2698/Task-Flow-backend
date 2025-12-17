import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Handle known error types
  if (error.message.includes('not found')) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  if (error.message.includes('Unauthorized')) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error',
  });
};