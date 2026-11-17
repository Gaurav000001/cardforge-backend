import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type {
  StorageService,
  UploadFileInput,
  UploadFileResult,
} from "./storage.interface.js";

const UPLOAD_DIRECTORY = path.resolve("uploads");
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";

export class LocalStorageService implements StorageService {
  async upload(input: UploadFileInput): Promise<UploadFileResult> {
    await mkdir(UPLOAD_DIRECTORY, { recursive: true });

    const extension = input.fileExtension;
    const filename = `${randomUUID()}${extension}`;
    const filePath = path.join(UPLOAD_DIRECTORY, filename);

    await writeFile(filePath, input.buffer);

    return {
      path: filePath,
      url: `${PUBLIC_BASE_URL}/uploads/${filename}`,
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      sizeBytes: input.buffer.length,
    };
  }

  async delete(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return;
      }

      throw error;
    }
  }
}
