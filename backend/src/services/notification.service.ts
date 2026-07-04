import { NotificationType, Prisma, Role, TaskStatus } from "@prisma/client";
import prisma from "../config/prisma";
import { AppError } from "../utils/app-error";

export type NotificationActor = {
  id: string;
  role: Role;
};

const notificationSelect = {
  id: true,
  type: true,
  message: true,
  isRead: true,
  userId: true,
  taskId: true,
  createdAt: true,
  task: {
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
    },
  },
} satisfies Prisma.NotificationSelect;

export const getNotifications = async (actor: NotificationActor) => {
  return prisma.notification.findMany({
    where: { userId: actor.id },
    orderBy: { createdAt: "desc" },
    select: notificationSelect,
  });
};

export const markNotificationAsRead = async (
  id: string,
  actor: NotificationActor
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId: actor.id,
    },
    select: { id: true },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: notificationSelect,
  });
};

export const createTaskAssignedNotification = async (
  taskId: string,
  userId: string,
  title: string
) => {
  return prisma.notification.create({
    data: {
      type: NotificationType.TASK_ASSIGNED,
      message: `New task assigned: ${title}`,
      userId,
      taskId,
    },
  });
};

export const createTaskCompletedNotification = async (
  taskId: string,
  userId: string,
  title: string
) => {
  return prisma.notification.create({
    data: {
      type: NotificationType.TASK_COMPLETED,
      message: `Task completed: ${title}`,
      userId,
      taskId,
    },
  });
};

export const createDueTomorrowNotifications = async (now = new Date()) => {
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: {
        gte: tomorrowStart,
        lt: tomorrowEnd,
      },
      status: { not: TaskStatus.COMPLETED },
    },
    select: {
      id: true,
      title: true,
      assignedToId: true,
    },
  });

  let created = 0;

  for (const task of tasks) {
    const existing = await prisma.notification.findFirst({
      where: {
        type: NotificationType.TASK_DUE,
        taskId: task.id,
        userId: task.assignedToId,
      },
      select: { id: true },
    });

    if (existing) {
      continue;
    }

    await prisma.notification.create({
      data: {
        type: NotificationType.TASK_DUE,
        message: `Task due tomorrow: ${task.title}`,
        userId: task.assignedToId,
        taskId: task.id,
      },
    });

    created += 1;
  }

  return created;
};
