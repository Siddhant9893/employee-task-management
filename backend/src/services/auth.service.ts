import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { loginSchema, registerSchema } from "../utils/auth.validator";
import { z } from "zod";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

const authUserSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  department: true,
  designation: true,
  createdAt: true,
  updatedAt: true,
};

export const registerUser = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new Error("Email already exists");
  }

  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      passwordHash: hashed,
      role: data.role,
    },
    select: authUserSelect,
  });

  return user;
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(data.password, user.passwordHash);

  if (!valid) throw new Error("Invalid credentials");

  const token = generateToken(
    { id: user.id, role: user.role },
    data.rememberMe ? "30d" : "1d"
  );

  const { passwordHash, ...safeUser } = user;

  return { user: safeUser, token };
};
