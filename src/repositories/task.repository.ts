import { PrismaClient } from '@prisma/client';
import { TaskQueryDtoType } from '../dtos/task.dto';

const prisma = new PrismaClient();

// Import types from Prisma
type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
type Status = 'ToDo' | 'InProgress' | 'Review' | 'Completed';

export class TaskRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async create(taskData: {
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority; // Use the enum type
    creatorId: string;
    assignedToId?: string;
  }): Promise<any> {
    return prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority, // Already the correct type
        creatorId: taskData.creatorId,
        assignedToId: taskData.assignedToId,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      dueDate?: Date;
      priority?: Priority; // Use enum type
      status?: Status;     // Use enum type
      assignedToId?: string | null;
    }
  ): Promise<any> {
    // Build update object
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assignedToId !== undefined) {
      updateData.assignedToId = data.assignedToId;
    }

    return prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async delete(id: string): Promise<any> {
    return prisma.task.delete({
      where: { id },
    });
  }

  async findWithFilters(query: TaskQueryDtoType, userId: string) {
    const where: any = {};

    // Filter by status - cast to Status enum
    if (query.status) {
      where.status = query.status as Status;
    }

    // Filter by priority - cast to Priority enum
    if (query.priority) {
      where.priority = query.priority as Priority;
    }

    // Filter by assignment
    if (query.assignedTo === 'me') {
      where.assignedToId = userId;
    } else if (query.assignedTo === 'others') {
      where.assignedToId = { not: userId };
    }

    // Get tasks where user is either creator or assignee
    const userWhere = {
      OR: [
        { creatorId: userId },
        { assignedToId: userId },
      ],
    };

    const finalWhere = Object.keys(where).length > 0 
      ? { AND: [userWhere, where] }
      : userWhere;

    // Sorting
    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'asc';
    } else {
      orderBy.dueDate = 'asc';
    }

    return prisma.task.findMany({
      where: finalWhere,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy,
    });
  }

  async getDashboardData(userId: string) {
    const now = new Date();

    const [
      totalAssigned,
      totalCreated,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
    ] = await Promise.all([
      // Tasks assigned to user
      prisma.task.count({
        where: { assignedToId: userId },
      }),

      // Tasks created by user
      prisma.task.count({
        where: { creatorId: userId },
      }),

      // Overdue tasks
      prisma.task.findMany({
        where: {
          assignedToId: userId,
          dueDate: { lt: now },
          status: { not: 'Completed' },
        },
        include: {
          creator: {
            select: { id: true, name: true },
          },
        },
        orderBy: { dueDate: 'asc' },
      }),

      // Tasks grouped by status
      prisma.task.groupBy({
        by: ['status'],
        where: { OR: [{ creatorId: userId }, { assignedToId: userId }] },
        _count: true,
      }),

      // Tasks grouped by priority
      prisma.task.groupBy({
        by: ['priority'],
        where: { OR: [{ creatorId: userId }, { assignedToId: userId }] },
        _count: true,
      }),
    ]);

    return {
      totalAssigned,
      totalCreated,
      overdueTasks,
      tasksByStatus,
      tasksByPriority,
    };
  }
}

export class ActivityRepository {
  async create(
    taskId: string,
    userId: string,
    action: string,
    details: Record<string, any>
  ) {
    return prisma.activity.create({
      data: {
        taskId,
        userId,
        action,
        details,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findByTaskId(taskId: string) {
    return prisma.activity.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}