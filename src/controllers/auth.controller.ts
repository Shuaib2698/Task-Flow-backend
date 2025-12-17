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

      // Set JWT in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'Registration successful',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { user, token } = await this.authService.login(req.body);

      // Set JWT in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: user,
        message: 'Login successful',
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('token');
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
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}