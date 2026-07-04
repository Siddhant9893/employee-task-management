import { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  next
) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  console.error(err);

  const statusCode =
    err.status || err.statusCode || (err.name === "MulterError" ? 400 : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
