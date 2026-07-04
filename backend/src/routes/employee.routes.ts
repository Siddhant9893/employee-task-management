import { Router } from "express";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  updateEmployee,
} from "../controllers/employee.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  createEmployee
);

router.get("/", authMiddleware, roleMiddleware(["ADMIN"]), getEmployees);

router.get("/:id", authMiddleware, roleMiddleware(["ADMIN"]), getEmployeeById);

router.put("/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateEmployee);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteEmployee
);

export default router;
