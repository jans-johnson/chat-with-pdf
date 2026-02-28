import { readLocalFile, getLocalFilePath } from "@/lib/local-storage";
import { logger } from "@lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileKey: string[] } }
) {
  try {
    const fileKey = params.fileKey.join("/");

    // Validate the file exists via path traversal-safe getter
    getLocalFilePath(fileKey);

    const buffer = readLocalFile(fileKey);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    logger.error("Error serving PDF:", { error });
    return new NextResponse("File not found", { status: 404 });
  }
}
