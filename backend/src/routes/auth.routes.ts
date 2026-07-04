import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, (req: any, res) => {
  res.json({
    user: req.user,
  });
});

router.post("/register", register);
router.post("/login", login);

export default router;