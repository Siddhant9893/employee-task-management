import { Router } from "express";
import {
  getNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getNotifications);
router.put("/:id/read", authMiddleware, markNotificationAsRead);

export default router;
