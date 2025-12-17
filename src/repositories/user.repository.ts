import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define User type without password for security
export type SafeUser = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
};

export class UserRepository {
  async findByEmail(email: string): Promise<any | null> {
    return prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        avatar: true,
        createdAt: true,
      }
    });
  }

  async findById(id: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      }
    });
  }

  async create(userData: { 
    email: string; 
    password: string; 
    name: string 
  }): Promise<SafeUser> {
    return prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      }
    });
  }

  async update(
    id: string, 
    data: { name?: string; avatar?: string }
  ): Promise<SafeUser> {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      }
    });
  }

  async getAllUsers(): Promise<Array<{ 
    id: string; 
    name: string; 
    email: string 
  }>> {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}