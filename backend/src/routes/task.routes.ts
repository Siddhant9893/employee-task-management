import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  uploadTaskAttachment,
  updateTask,
} from "../controllers/task.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { taskAttachmentUpload } from "../middleware/upload.middleware";

const router = Router();

router.post("/", authMiddleware, createTask);
router.get("/", authMiddleware, getTasks);
router.post(
  "/:id/attachments",
  authMiddleware,
  taskAttachmentUpload.single("file"),
  uploadTaskAttachment
);
router.get("/:id", authMiddleware, getTaskById);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

export default router;
