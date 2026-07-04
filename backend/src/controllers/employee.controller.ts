import { Request, Response } from "express";
import { ZodError } from "zod";
import * as employeeService from "../services/employee.service";
import {
  createEmployeeSchema,
  employeeIdParamSchema,
  employeeQuerySchema,
  updateEmployeeSchema,
} from "../validators/employee.validator";

const sendEmployeeError = (res: Response, error: unknown): void => {
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

  if (error instanceof Error) {
    const statusCode =
      error.message === "Employee not found"
        ? 404
        : error.message === "Email already exists"
        ? 409
        : 400;

    res.status(statusCode).json({
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

export const createEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = createEmployeeSchema.parse(req.body);
    const employee = await employeeService.createEmployee(payload);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    sendEmployeeError(res, error);
  }
};

export const getEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = employeeQuerySchema.parse(req.query);
    const result = await employeeService.getEmployees(query);

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    sendEmployeeError(res, error);
  }
};

export const getEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = employeeIdParamSchema.parse(req.params);
    const employee = await employeeService.getEmployeeById(id);

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    sendEmployeeError(res, error);
  }
};

export const updateEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = employeeIdParamSchema.parse(req.params);
    const payload = updateEmployeeSchema.parse(req.body);
    const employee = await employeeService.updateEmployee(id, payload);

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    sendEmployeeError(res, error);
  }
};

export const deleteEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = employeeIdParamSchema.parse(req.params);
    const employee = await employeeService.deleteEmployee(id);

    res.json({
      success: true,
      message: "Employee deleted successfully",
      data: employee,
    });
  } catch (error) {
    sendEmployeeError(res, error);
  }
};
