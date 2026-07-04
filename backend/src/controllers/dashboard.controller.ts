import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getDashboard as getDashboardStats } from "../services/dashboard.service";

export const getDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user?.id || !req.user?.role) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const dashboard = await getDashboardStats({
    id: req.user.id,
    role: req.user.role,
  });

  res.json(dashboard);
};
