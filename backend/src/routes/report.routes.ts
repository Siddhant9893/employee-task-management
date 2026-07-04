import { Router } from "express";
import { getReport } from "../controllers/report.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";

const router = Router();

router.get("/", authMiddleware, roleMiddleware(["ADMIN"]), getReport);

export default router;
