import { Role, TaskStatus } from "@prisma/client";
import prisma from "../config/prisma";

export type DashboardActor = {
  id: string;
  role: Role;
};

export const getDashboard = async (actor: DashboardActor) => {
  if (actor.role === Role.ADMIN) {
    const [totalEmployees, totalTasks, completedTasks] = await Promise.all([
      prisma.user.count({
        where: { role: Role.EMPLOYEE },
      }),
      prisma.task.count(),
      prisma.task.count({
        where: { status: TaskStatus.COMPLETED },
      }),
    ]);

    return {
      totalEmployees,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
    };
  }

  const now = new Date();
  const [myTasks, completed, pending, overdue] = await Promise.all([
    prisma.task.count({
      where: { assignedToId: actor.id },
    }),
    prisma.task.count({
      where: {
        assignedToId: actor.id,
        status: TaskStatus.COMPLETED,
      },
    }),
    prisma.task.count({
      where: {
        assignedToId: actor.id,
        status: { not: TaskStatus.COMPLETED },
        dueDate: { gte: now },
      },
    }),
    prisma.task.count({
      where: {
        assignedToId: actor.id,
        status: { not: TaskStatus.COMPLETED },
        dueDate: { lt: now },
      },
    }),
  ]);

  return {
    myTasks,
    completed,
    pending,
    overdue,
  };
};
