import fs from "fs";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const uploadDir = path.resolve(__dirname, "../../uploads");
const maxFileSize = 5 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "-");

    cb(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.has(file.mimetype) &&
    allowedExtensions.has(extension)
  ) {
    cb(null, true);
    return;
  }

  const error = new Error("Only PDF, JPG, and PNG files are allowed") as Error & {
    status?: number;
  };
  error.status = 400;
  cb(error);
};

export const taskAttachmentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
});
