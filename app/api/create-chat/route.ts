import { db } from "@/lib/db";
import { chats, chat_files } from "@/lib/db/schema";
import { loadFileIntoPinecone } from "@/lib/pinecone";
import { getLocalPdfUrl } from "@/lib/local-storage";
import { getDefaultUserId } from "@lib/account";
import { logger } from "@lib/logger";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const userId = await getDefaultUserId();

  try {
    const body = await req.json();
    const { files } = body as {
      files: { file_key: string; file_name: string }[];
    };

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Create the chat row first (no single-file columns for new chats)
    const newChat = await db
      .insert(chats)
      .values({
        pdfName: files[0].file_name,
        pdfUrl: getLocalPdfUrl(files[0].file_key),
        fileKey: files[0].file_key,
        userId,
      })
      .returning();

    const chatId = newChat[0].id;

    // Create chat_files rows and index each file into Pinecone
    for (const file of files) {
      await db.insert(chat_files).values({
        chatId,
        fileKey: file.file_key,
        fileName: file.file_name,
        fileUrl: getLocalPdfUrl(file.file_key),
      });

      await loadFileIntoPinecone(file.file_key, chatId);
    }

    return NextResponse.json({ chat: newChat[0] }, { status: 200 });
  } catch (error) {
    logger.error("Error creating chat:", {
      userId,
      error,
    });
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
