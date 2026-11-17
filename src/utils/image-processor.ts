import sharp from "sharp";
import { AppError } from "./app-error.js";

const ALLOWED_FORMATS = ["jpeg", "png", "webp"];

const WEBP_QUALITY = 85;
const WEBP_EFFORT = 4;

export async function processOrganizationLogo(buffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(buffer, {
      limitInputPixels: 25_000_000,
      failOn: "error",
    });

    const metadata = await image.metadata();

    if (!metadata.format || !ALLOWED_FORMATS.includes(metadata.format)) {
      throw new AppError(
        400,
        "INVALID_IMAGE_FORMAT",
        "Only JPEG, PNG, and WebP images are allowed.",
      );
    }

    if (!metadata.width || !metadata.height) {
      throw new AppError(
        400,
        "INVALID_IMAGE",
        "The uploaded image is invalid.",
      );
    }

    return await image
      .rotate()
      .webp({
        quality: WEBP_QUALITY,
        effort: WEBP_EFFORT,
      })
      .toBuffer();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      400,
      "INVALID_IMAGE",
      "The uploaded file could not be processed as an image.",
    );
  }
}
