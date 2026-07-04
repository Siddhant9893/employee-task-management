import { Prisma, Role, TaskStatus } from "@prisma/client";
import prisma from "../config/prisma";
import {
  createTaskAssignedNotification,
  createTaskCompletedNotification,
} from "./notification.service";
import {
  CreateTaskInput,
  UpdateTaskInput,
} from "../validators/task.validator";

export type TaskActor = {
  id: string;
  role: Role;
};

export class TaskServiceError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}

const userSummarySelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
};

const taskSelect = {
  id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  startDate: true,
  dueDate: true,
  assignedToId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: {
    select: userSummarySelect,
  },
  createdBy: {
    select: userSummarySelect,
  },
} satisfies Prisma.TaskSelect;

const attachmentSelect = {
  id: true,
  taskId: true,
  fileName: true,
  storedPath: true,
  mimeType: true,
  sizeBytes: true,
  uploadedBy: true,
  createdAt: true,
} satisfies Prisma.TaskAttachmentSelect;

const ensureAdmin = (actor: TaskActor) => {
  if (actor.role !== Role.ADMIN) {
    throw new TaskServiceError("Forbidden", 403);
  }
};

const ensureDateRange = (startDate: Date, dueDate: Date) => {
  if (dueDate < startDate) {
    throw new TaskServiceError(
      "Due date must be greater than or equal to start date",
      400
    );
  }
};

const ensureAssignedEmployeeExists = async (assignedToId: string) => {
  const employee = await prisma.user.findFirst({
    where: {
      id: assignedToId,
      role: Role.EMPLOYEE,
    },
    select: { id: true },
  });

  if (!employee) {
    throw new TaskServiceError("Assigned employee not found", 404);
  }
};

const getTaskForUpdate = async (id: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      startDate: true,
      dueDate: true,
      assignedToId: true,
      createdById: true,
      title: true,
    },
  });

  if (!task) {
    throw new TaskServiceError("Task not found", 404);
  }

  return task;
};

export const createTask = async (data: CreateTaskInput, actor: TaskActor) => {
  ensureAdmin(actor);
  ensureDateRange(data.startDate, data.dueDate);
  await ensureAssignedEmployeeExists(data.assignedToId);

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      startDate: data.startDate,
      dueDate: data.dueDate,
      assignedToId: data.assignedToId,
      createdById: actor.id,
    },
    select: taskSelect,
  });

  await createTaskAssignedNotification(
    task.id,
    task.assignedToId,
    task.title
  );

  return task;
};

export const getTasks = async (actor: TaskActor) => {
  return prisma.task.findMany({
    where:
      actor.role === Role.ADMIN
        ? {}
        : {
            assignedToId: actor.id,
          },
    orderBy: { createdAt: "desc" },
    select: taskSelect,
  });
};

export const getTaskById = async (id: string, actor: TaskActor) => {
  const task = await prisma.task.findFirst({
    where:
      actor.role === Role.ADMIN
        ? { id }
        : {
            id,
            assignedToId: actor.id,
          },
    select: taskSelect,
  });

  if (!task) {
    throw new TaskServiceError("Task not found", 404);
  }

  return task;
};

export const updateTask = async (
  id: string,
  data: UpdateTaskInput,
  actor: TaskActor
) => {
  const task = await getTaskForUpdate(id);

  if (task.status === TaskStatus.COMPLETED) {
    throw new TaskServiceError("Completed tasks cannot be edited", 409);
  }

  if (actor.role !== Role.ADMIN) {
    if (task.assignedToId !== actor.id) {
      throw new TaskServiceError("Forbidden", 403);
    }

    const fields = Object.keys(data);
    if (fields.some((field) => field !== "status")) {
      throw new TaskServiceError("Employees can only update task status", 403);
    }
  }

  const nextStartDate = data.startDate ?? task.startDate;
  const nextDueDate = data.dueDate ?? task.dueDate;
  ensureDateRange(nextStartDate, nextDueDate);

  if (data.assignedToId) {
    ensureAdmin(actor);
    await ensureAssignedEmployeeExists(data.assignedToId);
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      startDate: data.startDate,
      dueDate: data.dueDate,
      assignedToId: data.assignedToId,
    },
    select: taskSelect,
  });

  if (data.status === TaskStatus.COMPLETED) {
    await createTaskCompletedNotification(
      updatedTask.id,
      task.createdById,
      updatedTask.title
    );
  }

  return updatedTask;
};

export const deleteTask = async (id: string, actor: TaskActor) => {
  ensureAdmin(actor);

  const task = await prisma.task.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!task) {
    throw new TaskServiceError("Task not found", 404);
  }

  return prisma.task.delete({
    where: { id },
    select: taskSelect,
  });
};

export const addTaskAttachment = async (
  id: string,
  file: Express.Multer.File,
  actor: TaskActor
) => {
  const task = await prisma.task.findFirst({
    where:
      actor.role === Role.ADMIN
        ? { id }
        : {
            id,
            assignedToId: actor.id,
          },
    select: { id: true },
  });

  if (!task) {
    throw new TaskServiceError("Task not found", 404);
  }

  return prisma.taskAttachment.create({
    data: {
      taskId: id,
      fileName: file.originalname,
      storedPath: file.path,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: actor.id,
    },
    select: attachmentSelect,
  });
};
