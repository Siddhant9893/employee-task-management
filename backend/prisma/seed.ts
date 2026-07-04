import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import {
  NotificationType,
  PrismaClient,
  Role,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

dotenv.config();
dotenv.config({
  path: path.resolve(__dirname, "../src/.env"),
});

const prisma = new PrismaClient();

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date;
};

const seed = async () => {
  const passwordHash = await bcrypt.hash("Password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      fullName: "System Admin",
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      fullName: "System Admin",
      email: "admin@example.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const employees = await Promise.all(
    [
      ["Anika Sharma", "anika@example.com", "Engineering", "Frontend Developer"],
      ["Rahul Mehta", "rahul@example.com", "Engineering", "Backend Developer"],
      ["Priya Nair", "priya@example.com", "Design", "Product Designer"],
      ["Kabir Singh", "kabir@example.com", "QA", "QA Analyst"],
      ["Meera Iyer", "meera@example.com", "Operations", "Project Coordinator"],
    ].map(([fullName, email, department, designation], index) =>
      prisma.user.upsert({
        where: { email },
        update: {
          fullName,
          passwordHash,
          role: Role.EMPLOYEE,
          department,
          designation,
        },
        create: {
          id: `00000000-0000-4000-8000-00000000000${index + 2}`,
          fullName,
          email,
          passwordHash,
          role: Role.EMPLOYEE,
          department,
          designation,
        },
      })
    )
  );

  const taskBlueprints = [
    ["Prepare onboarding checklist", TaskPriority.MEDIUM, TaskStatus.PENDING, 0, 3],
    ["Build dashboard cards", TaskPriority.HIGH, TaskStatus.IN_PROGRESS, -1, 2],
    ["Design task detail view", TaskPriority.MEDIUM, TaskStatus.COMPLETED, -7, -2],
    ["Test employee CRUD", TaskPriority.HIGH, TaskStatus.PENDING, -2, -1],
    ["Create report filters", TaskPriority.MEDIUM, TaskStatus.IN_PROGRESS, 0, 1],
    ["Write upload test cases", TaskPriority.LOW, TaskStatus.PENDING, 1, 5],
    ["Review auth edge cases", TaskPriority.HIGH, TaskStatus.COMPLETED, -8, -4],
    ["Document API examples", TaskPriority.LOW, TaskStatus.PENDING, 0, 7],
    ["Optimize task queries", TaskPriority.MEDIUM, TaskStatus.IN_PROGRESS, -1, 4],
    ["Verify notification flow", TaskPriority.HIGH, TaskStatus.PENDING, 0, 1],
    ["Create employee profile form", TaskPriority.MEDIUM, TaskStatus.PENDING, 2, 8],
    ["Refine empty states", TaskPriority.LOW, TaskStatus.COMPLETED, -6, -1],
    ["Validate date rules", TaskPriority.HIGH, TaskStatus.IN_PROGRESS, -3, 2],
    ["Prepare demo data", TaskPriority.MEDIUM, TaskStatus.PENDING, 0, 2],
    ["Audit role permissions", TaskPriority.HIGH, TaskStatus.COMPLETED, -9, -3],
    ["Add CSV export checks", TaskPriority.MEDIUM, TaskStatus.PENDING, 1, 6],
    ["Polish login errors", TaskPriority.LOW, TaskStatus.IN_PROGRESS, -1, 3],
    ["Test overdue dashboard", TaskPriority.HIGH, TaskStatus.PENDING, -4, -1],
    ["Write README checklist", TaskPriority.LOW, TaskStatus.COMPLETED, -5, -2],
    ["Verify Excel exports", TaskPriority.MEDIUM, TaskStatus.PENDING, 0, 1],
  ] as const;

  const tasks = await Promise.all(
    taskBlueprints.map(
      async ([title, priority, status, startOffset, dueOffset], index) =>
        prisma.task.upsert({
          where: {
            id: `00000000-0000-4000-9000-${String(index + 1).padStart(
              12,
              "0"
            )}`,
          },
          update: {
            title,
            description: `${title} for the employee task management project.`,
            priority,
            status,
            startDate: addDays(startOffset),
            dueDate: addDays(dueOffset),
            assignedToId: employees[index % employees.length].id,
            createdById: admin.id,
          },
          create: {
            id: `00000000-0000-4000-9000-${String(index + 1).padStart(
              12,
              "0"
            )}`,
            title,
            description: `${title} for the employee task management project.`,
            priority,
            status,
            startDate: addDays(startOffset),
            dueDate: addDays(dueOffset),
            assignedToId: employees[index % employees.length].id,
            createdById: admin.id,
          },
        })
    )
  );

  await Promise.all(
    tasks.slice(0, 10).map((task, index) =>
      prisma.notification.upsert({
        where: {
          id: `00000000-0000-4000-a000-${String(index + 1).padStart(
            12,
            "0"
          )}`,
        },
        update: {
          type:
            task.status === TaskStatus.COMPLETED
              ? NotificationType.TASK_COMPLETED
              : NotificationType.TASK_ASSIGNED,
          message:
            task.status === TaskStatus.COMPLETED
              ? `Task completed: ${task.title}`
              : `New task assigned: ${task.title}`,
          isRead: index % 3 === 0,
          userId:
            task.status === TaskStatus.COMPLETED ? admin.id : task.assignedToId,
          taskId: task.id,
        },
        create: {
          id: `00000000-0000-4000-a000-${String(index + 1).padStart(
            12,
            "0"
          )}`,
          type:
            task.status === TaskStatus.COMPLETED
              ? NotificationType.TASK_COMPLETED
              : NotificationType.TASK_ASSIGNED,
          message:
            task.status === TaskStatus.COMPLETED
              ? `Task completed: ${task.title}`
              : `New task assigned: ${task.title}`,
          isRead: index % 3 === 0,
          userId:
            task.status === TaskStatus.COMPLETED ? admin.id : task.assignedToId,
          taskId: task.id,
        },
      })
    )
  );

  console.log("Seed data created");
  console.log("Admin login: admin@example.com / Password123");
  console.log("Employee login example: anika@example.com / Password123");
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
