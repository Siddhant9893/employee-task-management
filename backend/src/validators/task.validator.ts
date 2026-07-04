import { z } from "zod";

const dateSchema = z
  .union([z.string().min(1), z.date()])
  .transform((value) => (value instanceof Date ? value : new Date(value)))
  .refine((value) => !Number.isNaN(value.getTime()), {
    message: "Invalid date",
  });

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const taskStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
]);

export const createTaskSchema = z
  .object({
    title: z.string().min(3),
    description: z.string().min(5),
    priority: taskPrioritySchema,
    status: taskStatusSchema,
    startDate: dateSchema,
    dueDate: dateSchema,
    assignedToId: z.string().uuid(),
  })
  .refine((data) => data.dueDate >= data.startDate, {
    path: ["dueDate"],
    message: "Due date must be greater than or equal to start date",
  });

export const updateTaskSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
    startDate: dateSchema.optional(),
    dueDate: dateSchema.optional(),
    assignedToId: z.string().uuid().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .refine(
    (data) =>
      !data.startDate || !data.dueDate || data.dueDate >= data.startDate,
    {
      path: ["dueDate"],
      message: "Due date must be greater than or equal to start date",
    }
  );

export const taskIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
