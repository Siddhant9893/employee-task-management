import { TaskStatus } from "@prisma/client";
import { createObjectCsvStringifier } from "csv-writer";
import ExcelJS from "exceljs";
import prisma from "../config/prisma";
import { ReportFormat, ReportType } from "../validators/report.validator";

type ReportColumn = {
  id: string;
  title: string;
  width?: number;
};

type ReportRow = Record<string, string | number | null>;

export type ReportFile = {
  filename: string;
  mimeType: string;
  buffer: Buffer;
};

const taskColumns: ReportColumn[] = [
  { id: "id", title: "Task ID", width: 38 },
  { id: "title", title: "Title", width: 28 },
  { id: "priority", title: "Priority", width: 14 },
  { id: "status", title: "Status", width: 16 },
  { id: "startDate", title: "Start Date", width: 24 },
  { id: "dueDate", title: "Due Date", width: 24 },
  { id: "assignedTo", title: "Assigned To", width: 24 },
  { id: "assignedEmail", title: "Assigned Email", width: 30 },
  { id: "createdBy", title: "Created By", width: 24 },
  { id: "createdAt", title: "Created At", width: 24 },
];

const employeeColumns: ReportColumn[] = [
  { id: "id", title: "Employee ID", width: 38 },
  { id: "fullName", title: "Full Name", width: 24 },
  { id: "email", title: "Email", width: 30 },
  { id: "department", title: "Department", width: 18 },
  { id: "designation", title: "Designation", width: 18 },
  { id: "totalTasks", title: "Total Tasks", width: 14 },
  { id: "completedTasks", title: "Completed Tasks", width: 18 },
  { id: "pendingTasks", title: "Pending Tasks", width: 16 },
  { id: "inProgressTasks", title: "In Progress Tasks", width: 20 },
];

const formatDate = (value: Date) => value.toISOString();

const buildCsv = (
  filename: string,
  columns: ReportColumn[],
  rows: ReportRow[]
): ReportFile => {
  const csvStringifier = createObjectCsvStringifier({
    header: columns.map((column) => ({
      id: column.id,
      title: column.title,
    })),
  });

  const csv =
    csvStringifier.getHeaderString() +
    csvStringifier.stringifyRecords(rows);

  return {
    filename,
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf-8"),
  };
};

const buildExcel = async (
  filename: string,
  sheetName: string,
  columns: ReportColumn[],
  rows: ReportRow[]
): Promise<ReportFile> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map((column) => ({
    header: column.title,
    key: column.id,
    width: column.width ?? 20,
  }));

  worksheet.addRows(rows);
  worksheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();

  return {
    filename,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(buffer as unknown as Uint8Array),
  };
};

const getTaskRows = async (status: TaskStatus): Promise<ReportRow[]> => {
  const tasks = await prisma.task.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      priority: true,
      status: true,
      startDate: true,
      dueDate: true,
      createdAt: true,
      assignedTo: {
        select: {
          fullName: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          fullName: true,
        },
      },
    },
  });

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    status: task.status,
    startDate: formatDate(task.startDate),
    dueDate: formatDate(task.dueDate),
    assignedTo: task.assignedTo.fullName,
    assignedEmail: task.assignedTo.email,
    createdBy: task.createdBy.fullName,
    createdAt: formatDate(task.createdAt),
  }));
};

const getEmployeeWiseRows = async (): Promise<ReportRow[]> => {
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      department: true,
      designation: true,
      assignedTasks: {
        select: { status: true },
      },
    },
  });

  return employees.map((employee) => {
    const completedTasks = employee.assignedTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED
    ).length;
    const pendingTasks = employee.assignedTasks.filter(
      (task) => task.status === TaskStatus.PENDING
    ).length;
    const inProgressTasks = employee.assignedTasks.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS
    ).length;

    return {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      totalTasks: employee.assignedTasks.length,
      completedTasks,
      pendingTasks,
      inProgressTasks,
    };
  });
};

export const generateReport = async (
  type: ReportType,
  format: ReportFormat
): Promise<ReportFile> => {
  const isExcel = format === "excel";

  if (type === "employee-wise") {
    const rows = await getEmployeeWiseRows();
    const filename = `employee-wise-report.${isExcel ? "xlsx" : "csv"}`;

    return isExcel
      ? buildExcel(filename, "Employee Wise Report", employeeColumns, rows)
      : buildCsv(filename, employeeColumns, rows);
  }

  const status =
    type === "completed" ? TaskStatus.COMPLETED : TaskStatus.PENDING;
  const rows = await getTaskRows(status);
  const filename = `${type}-tasks-report.${isExcel ? "xlsx" : "csv"}`;

  return isExcel
    ? buildExcel(filename, `${type} Tasks`, taskColumns, rows)
    : buildCsv(filename, taskColumns, rows);
};
