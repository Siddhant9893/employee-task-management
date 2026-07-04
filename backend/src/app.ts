import "./config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import { login, register } from "./controllers/auth.controller";
import dashboardRoutes from "./routes/dashboard.routes";
import employeeRoutes from "./routes/employee.routes";
import notificationRoutes from "./routes/notification.routes";
import reportRoutes from "./routes/report.routes";
import taskRoutes from "./routes/task.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(express.json());

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.post("/api/register", register);
app.post("/api/login", login);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/tasks", taskRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running 🚀",
  });
});

app.use(errorMiddleware);

export default app;
