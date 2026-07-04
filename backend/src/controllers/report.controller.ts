import { Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateReport } from "../services/report.service";
import { reportQuerySchema } from "../validators/report.validator";

const sendReportError = (res: Response, error: unknown): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

export const getReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type, format } = reportQuerySchema.parse(req.query);
    const report = await generateReport(type, format);

    res.setHeader("Content-Type", report.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report.filename}"`
    );
    res.send(report.buffer);
  } catch (error) {
    sendReportError(res, error);
  }
};
