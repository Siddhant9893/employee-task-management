import { Response } from "express";
import { ZodError } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import * as taskService from "../services/task.service";
import {
  createTaskSchema,
  taskIdParamSchema,
  updateTaskSchema,
} from "../validators/task.validator";

const getActor = (req: AuthRequest): taskService.TaskActor | null => {
  if (!req.user?.id || !req.user?.role) {
    return null;
  }

  return {
    id: req.user.id,
    role: req.user.role,
  };
};

const sendTaskError = (res: Response, error: unknown): void => {
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

  if (error instanceof taskService.TaskServiceError) {
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

export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const actor = getActor(req);

    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const payload = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(payload, actor);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    sendTaskError(res, error);
  }
};

export const getTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const actor = getActor(req);

    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const tasks = await taskService.getTasks(actor);

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    sendTaskError(res, error);
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const actor = getActor(req);

    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = taskIdParamSchema.parse(req.params);
    const task = await taskService.getTaskById(id, actor);

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    sendTaskError(res, error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const actor = getActor(req);

    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = taskIdParamSchema.parse(req.params);
    const payload = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(id, payload, actor);

    res.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    sendTaskError(res, error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const actor = getActor(req);

    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = taskIdParamSchema.parse(req.params);
    const task = await taskService.deleteTask(id, actor);

    res.json({
      success: true,
      message: "Task deleted successfully",
      data: task,
    });
  } catch (error) {
    sendTaskError(res, error);
  }
};

export const uploadTaskAttachment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const actor = getActor(req);

    if (!actor) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Attachment file is required",
      });
      return;
    }

    const { id } = taskIdParamSchema.parse(req.params);
    const attachment = await taskService.addTaskAttachment(
      id,
      req.file,
      actor
    );

    res.status(201).json({
      success: true,
      message: "Attachment uploaded successfully",
      data: attachment,
    });
  } catch (error) {
    sendTaskError(res, error);
  }
};
