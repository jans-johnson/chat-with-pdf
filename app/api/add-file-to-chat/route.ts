import { db } from "@/lib/db";
import { chat_files } from "@/lib/db/schema";
import { loadFileIntoPinecone } from "@/lib/pinecone";
import { getLocalPdfUrl } from "@/lib/local-storage";
import { logger } from "@lib/logger";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { chatId, file_key, file_name } = await req.json();

    if (!chatId || !file_key || !file_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert into chat_files
    await db.insert(chat_files).values({
      chatId,
      fileKey: file_key,
      fileName: file_name,
      fileUrl: getLocalPdfUrl(file_key),
    });

    // Index the file into Pinecone with chatId as namespace
    await loadFileIntoPinecone(file_key, chatId);

    // Return the updated file list
    const files = await db
      .select()
      .from(chat_files)
      .where(eq(chat_files.chatId, chatId));

    const safeFiles = files.map((f) => ({
      ...f,
      createdAt: f.createdAt.toUTCString(),
    }));

    return NextResponse.json({ files: safeFiles }, { status: 200 });
  } catch (error) {
    logger.error("Error adding file to chat:", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
