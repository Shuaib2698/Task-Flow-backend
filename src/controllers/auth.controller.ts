import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response) {
    try {
      const { user, token } = await this.authService.register(req.body);

      // Get the origin from request or environment
      const origin = req.get('origin') || process.env.CORS_ORIGIN;
      const isProduction = process.env.NODE_ENV === 'production';

      // Set JWT in HTTP-only cookie with proper production settings
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction, // true in production (HTTPS)
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        domain: isProduction ? '.onrender.com' : undefined, // For subdomain cookies
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'Registration successful',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
  try {
    const { user, token } = await this.authService.login(req.body);

    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set JWT in HTTP-only cookie with proper production settings
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction, // true in production (HTTPS)
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      // DO NOT set domain for Render - let browser determine
      // domain: isProduction ? '.onrender.com' : undefined, // REMOVE THIS LINE
    });

    res.json({
      success: true,
      data: user,
      message: 'Login successful',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}

  async logout(_req: Request, res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: isProduction ? '.onrender.com' : undefined,
    });
    
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await this.authService.getProfile(req.userId!);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const user = await this.authService.updateProfile(req.userId!, req.body);
      
      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}