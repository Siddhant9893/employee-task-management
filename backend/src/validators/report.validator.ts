import { z } from "zod";

export const reportQuerySchema = z.object({
  type: z.enum(["completed", "pending", "employee-wise"]),
  format: z.enum(["csv", "excel"]),
});

export type ReportType = z.infer<typeof reportQuerySchema>["type"];
export type ReportFormat = z.infer<typeof reportQuerySchema>["format"];
