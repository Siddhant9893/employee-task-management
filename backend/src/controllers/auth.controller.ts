import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { loginSchema, registerSchema } from "../utils/auth.validator";

export const register = async (req: Request, res: Response) => {
  try {
    const payload = registerSchema.parse(req.body);
    const user = await registerUser(payload);
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser(payload);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message });
  }
};
