import { z } from 'zod';

export const CreateTaskDto = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  assignedToId: z.string().optional(),
});

export const UpdateTaskDto = z.object({
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().optional(),
  dueDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  status: z.enum(['ToDo', 'InProgress', 'Review', 'Completed']).optional(),
  assignedToId: z.string().nullable().optional(),
});

export const TaskQueryDto = z.object({
  status: z.enum(['ToDo', 'InProgress', 'Review', 'Completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
  assignedTo: z.enum(['me', 'others']).optional(),
  sortBy: z.enum(['dueDate', 'priority', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateTaskDtoType = z.infer<typeof CreateTaskDto>;
export type UpdateTaskDtoType = z.infer<typeof UpdateTaskDto>;
export type TaskQueryDtoType = z.infer<typeof TaskQueryDto>;