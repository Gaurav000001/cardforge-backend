import multer from "multer";
import { AppError } from "../utils/app-error.js";

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter: (req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return callback(
        new AppError(
          400,
          "INVALID_FILE_TYPE",
          "Only JPEG, PNG, and WebP images are allowed.",
        ),
      );
    }

    callback(null, true);
  },
});

export const uploadOrganizationLogo = upload.single("logo");
