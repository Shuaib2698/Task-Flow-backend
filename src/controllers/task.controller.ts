import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async createTask(req: Request, res: Response) {
    try {
      const task = await this.taskService.createTask({
        ...req.body,
        creatorId: req.userId!,
      });

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTasks(req: Request, res: Response) {
    try {
      const tasks = await this.taskService.getTasks(req.query, req.userId!);

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const taskData = await this.taskService.getTaskById(taskId);

      res.json({
        success: true,
        data: taskData,
      });
    } catch (error: any) {
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const task = await this.taskService.updateTask(
        taskId,
        req.body,
        req.userId!
      );

      res.json({
        success: true,
        data: task,
        message: 'Task updated successfully',
      });
    } catch (error: any) {
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      await this.taskService.deleteTask(taskId, req.userId!);

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getDashboard(req: Request, res: Response) {
    try {
      const dashboardData = await this.taskService.getDashboardData(req.userId!);

      res.json({
        success: true,
        data: dashboardData,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getUsers(_req: Request, res: Response) {
    try {
      const users = await this.taskService.getUsers();

      res.json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}