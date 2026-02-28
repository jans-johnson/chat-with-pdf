import fs from "fs";
import path from "path";
import { logger } from "./logger";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export async function saveFileLocally(
  file: Buffer,
  fileName: string
): Promise<{ file_key: string; file_name: string }> {
  ensureUploadsDir();

  const fileKey =
    "uploads/" + Date.now().toString() + fileName.replace(/ /g, "-");
  const filePath = path.join(process.cwd(), fileKey);

  fs.writeFileSync(filePath, file);
  logger.debug("Success saving file locally", fileKey);

  return { file_key: fileKey, file_name: fileName };
}

export function getLocalFilePath(fileKey: string): string {
  const filePath = path.resolve(process.cwd(), fileKey);
  const uploadsPath = path.resolve(UPLOADS_DIR);

  // Path traversal protection
  if (!filePath.startsWith(uploadsPath)) {
    throw new Error("Invalid file key");
  }

  return filePath;
}

export function readLocalFile(fileKey: string): Buffer {
  const filePath = getLocalFilePath(fileKey);
  return fs.readFileSync(filePath);
}

export function removeLocalFile(fileKey: string): void {
  try {
    const filePath = getLocalFilePath(fileKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug("Success removing local file", fileKey);
    }
  } catch (error) {
    logger.error("Error removing local file:", { fileKey, error });
    throw error;
  }
}

export function getLocalPdfUrl(fileKey: string): string {
  return `/api/serve-pdf/${fileKey}`;
}
