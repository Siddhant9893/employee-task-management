import { Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import * as notificationService from "../services/notification.service";
import { AppError } from "../utils/app-error";
import { notificationIdParamSchema } from "../validators/notification.validator";

const getActor = (
  req: AuthRequest
): notificationService.NotificationActor | null => {
  if (!req.user?.id || !req.user?.role) {
    return null;
  }

  return {
    id: req.user.id,
    role: req.user.role,
  };
};

const sendNotificationError = (res: Response, error: unknown): void => {
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

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const actor = getActor(req);

    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const notifications = await notificationService.getNotifications(actor);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    sendNotificationError(res, error);
  }
};

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const actor = getActor(req);

    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = notificationIdParamSchema.parse(req.params);
    const notification = await notificationService.markNotificationAsRead(
      id,
      actor
    );

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    sendNotificationError(res, error);
  }
};
