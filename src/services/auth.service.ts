import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { SafeUser } from '../repositories/user.repository';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(registerData: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: SafeUser; token: string }> {
    const validatedData = RegisterDto.parse(registerData);
    const existingUser = await this.userRepository.findByEmail(validatedData.email);
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    const user = await this.userRepository.create({
      ...validatedData,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id);
    return { user, token };
  }

  async login(loginData: { 
    email: string; 
    password: string 
  }): Promise<{ 
    user: SafeUser; 
    token: string 
  }> {
    const validatedData = LoginDto.parse(loginData);
    const user = await this.userRepository.findByEmail(validatedData.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(
      validatedData.password, 
      user.password
    );
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    const { password, ...userWithoutPassword } = user;

    return { 
      user: userWithoutPassword as SafeUser, 
      token 
    };
  }

  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    // Simple fix: use type assertion
    return jwt.sign({ userId }, secret, { expiresIn } as any);
  }

  async getProfile(userId: string): Promise<SafeUser | null> {
    return this.userRepository.findById(userId);
  }

  async updateProfile(
    userId: string, 
    data: { name?: string; avatar?: string }
  ): Promise<SafeUser> {
    return this.userRepository.update(userId, data);
  }
}