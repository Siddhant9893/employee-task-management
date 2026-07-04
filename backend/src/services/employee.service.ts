import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { hashPassword } from "../utils/bcrypt";
import {
  CreateEmployeeInput,
  EmployeeQueryInput,
  UpdateEmployeeInput,
} from "../validators/employee.validator";

const employeeSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  department: true,
  designation: true,
  createdAt: true,
  updatedAt: true,
};

export const createEmployee = async (data: CreateEmployeeInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new Error("Email already exists");
  }

  const passwordHash = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      role: "EMPLOYEE",
      department: data.department,
      designation: data.designation,
    },
    select: employeeSelect,
  });
};

export const getEmployees = async (query: EmployeeQueryInput) => {
  const { page, limit, search, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    role: "EMPLOYEE",
    ...(search
      ? {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } },
            { department: { contains: search } },
            { designation: { contains: search } },
          ],
        }
      : {}),
  };

  const [total, employees] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: employeeSelect,
    }),
  ]);

  return {
    data: employees,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      sortBy,
      sortOrder,
      search: search || null,
    },
  };
};

export const getEmployeeById = async (id: string) => {
  const employee = await prisma.user.findFirst({
    where: { id, role: "EMPLOYEE" },
    select: employeeSelect,
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};

export const updateEmployee = async (
  id: string,
  data: UpdateEmployeeInput
) => {
  const employee = await prisma.user.findFirst({
    where: { id, role: "EMPLOYEE" },
    select: { id: true },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id },
      },
    });

    if (existing) {
      throw new Error("Email already exists");
    }
  }

  const updateData: {
    fullName?: string;
    email?: string;
    passwordHash?: string;
    department?: string;
    designation?: string;
  } = {};

  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.designation !== undefined) updateData.designation = data.designation;
  if (data.password !== undefined) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: employeeSelect,
  });
};

export const deleteEmployee = async (id: string) => {
  const employee = await prisma.user.findFirst({
    where: { id, role: "EMPLOYEE" },
    select: { id: true },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  return prisma.user.delete({
    where: { id },
    select: employeeSelect,
  });
};
