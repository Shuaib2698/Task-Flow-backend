import { TaskRepository, ActivityRepository } from '../repositories/task.repository';
import { UserRepository } from '../repositories/user.repository';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from '../dtos/task.dto';

// Import types from Prisma
import { Priority, Status } from '@prisma/client';

// Import io after it's initialized
let io: any;

export class TaskService {
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;
  private activityRepository: ActivityRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.userRepository = new UserRepository();
    this.activityRepository = new ActivityRepository();
  }

  // Method to set io instance
  static setIo(socketIo: any) {
    io = socketIo;
  }

  async createTask(createData: {
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority; // Use Prisma enum
    creatorId: string;
    assignedToId?: string;
  }) {
    // Validate input
    const validatedData = CreateTaskDto.parse(createData);

    // Check if assigned user exists
    if (validatedData.assignedToId) {
      const assignedUser = await this.userRepository.findById(validatedData.assignedToId);
      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }
    }

    // Create task - ensure priority is correct type
    const task = await this.taskRepository.create({
      ...validatedData,
      dueDate: new Date(validatedData.dueDate),
      creatorId: createData.creatorId,
      priority: validatedData.priority as Priority,
    });

    // Log activity
    await this.activityRepository.create(
      task.id,
      createData.creatorId,
      'TASK_CREATED',
      {
        title: task.title,
        priority: task.priority,
        assignedTo: task.assignedToId,
      }
    );

    // Emit real-time event if io is available
    if (io) {
      io.emit('task:created', task);

      // If task is assigned to someone, send notification
      if (task.assignedToId && task.assignedToId !== createData.creatorId) {
        io.to(`user:${task.assignedToId}`).emit('notification:new', {
          type: 'TASK_ASSIGNED',
          message: `You've been assigned to "${task.title}"`,
          taskId: task.id,
        });
      }
    }

    return task;
  }

  async updateTask(
    taskId: string,
    updateData: {
      title?: string;
      description?: string;
      dueDate?: Date;
      priority?: Priority;
      status?: Status;
      assignedToId?: string | null;
    },
    userId: string
  ) {
    // Validate input
    const validatedData = UpdateTaskDto.parse(updateData);

    // Get current task
    const currentTask = await this.taskRepository.findById(taskId);
    if (!currentTask) {
      throw new Error('Task not found');
    }

    // Check if assigned user exists (if changing assignment)
    if (validatedData.assignedToId !== undefined) {
      if (validatedData.assignedToId) {
        const assignedUser = await this.userRepository.findById(validatedData.assignedToId);
        if (!assignedUser) {
          throw new Error('Assigned user not found');
        }
      }
    }

    // Prepare update payload
    const updatePayload: any = {};
    if (validatedData.dueDate) {
      updatePayload.dueDate = new Date(validatedData.dueDate);
    }
    if (validatedData.title !== undefined) updatePayload.title = validatedData.title;
    if (validatedData.description !== undefined) updatePayload.description = validatedData.description;
    if (validatedData.priority !== undefined) updatePayload.priority = validatedData.priority;
    if (validatedData.status !== undefined) updatePayload.status = validatedData.status;
    if (validatedData.assignedToId !== undefined) updatePayload.assignedToId = validatedData.assignedToId;

    const updatedTask = await this.taskRepository.update(taskId, updatePayload);

    // Log activity
    const changes: Record<string, { from: any; to: any }> = {};

    if (updateData.title && updateData.title !== currentTask.title) {
      changes.title = { from: currentTask.title, to: updateData.title };
    }

    if (updateData.status && updateData.status !== currentTask.status) {
      changes.status = { from: currentTask.status, to: updateData.status };
    }

    if (updateData.assignedToId !== undefined && updateData.assignedToId !== currentTask.assignedToId) {
      changes.assignedTo = { from: currentTask.assignedToId, to: updateData.assignedToId };
    }

    if (Object.keys(changes).length > 0) {
      await this.activityRepository.create(
        taskId,
        userId,
        'TASK_UPDATED',
        { changes }
      );
    }

    // Emit real-time events if io is available
    if (io) {
      io.emit('task:updated', updatedTask);

      // If task was reassigned
      if (
        updateData.assignedToId !== undefined &&
        updateData.assignedToId !== currentTask.assignedToId &&
        updateData.assignedToId
      ) {
        io.to(`user:${updateData.assignedToId}`).emit('notification:new', {
          type: 'TASK_ASSIGNED',
          message: `You've been assigned to "${updatedTask.title}"`,
          taskId: updatedTask.id,
        });
      }
    }

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check permissions (only creator can delete)
    if (task.creatorId !== userId) {
      throw new Error('Unauthorized to delete this task');
    }

    const deletedTask = await this.taskRepository.delete(taskId);

    // Emit real-time event if io is available
    if (io) {
      io.emit('task:deleted', { id: taskId });
    }

    return deletedTask;
  }

  async getTasks(filters: any, userId: string) {
    const validatedFilters = TaskQueryDto.parse(filters);
    return this.taskRepository.findWithFilters(validatedFilters, userId);
  }

  async getDashboardData(userId: string) {
    return this.taskRepository.getDashboardData(userId);
  }

  async getTaskById(taskId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const activities = await this.activityRepository.findByTaskId(taskId);

    return { task, activities };
  }

  async getUsers() {
    return this.userRepository.getAllUsers();
  }
}