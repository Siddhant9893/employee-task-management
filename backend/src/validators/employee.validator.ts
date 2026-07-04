import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8)
  .regex(/(?=.*[A-Z])/, "Must contain uppercase")
  .regex(/(?=.*[a-z])/, "Must contain lowercase")
  .regex(/(?=.*\d)/, "Must contain number");

export const createEmployeeSchema = z.object({
  fullName: z.string().min(3),
  email: z.email(),
  password: passwordSchema,
  department: z.string().min(2),
  designation: z.string().min(2),
});

export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const employeeIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(["fullName", "email", "department", "designation", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;
