import { db } from "@/lib/db";
import { chats, chat_files, messages, sources } from "@/lib/db/schema";
import { logger } from "@lib/logger";
import { deleteAllVectorsForChat, deleteVectors } from "@lib/pinecone";
import { removeLocalFile } from "@lib/local-storage";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { chatId } = await req.json();
  try {
    // Get all chat_files for this chat
    const files = await db
      .select()
      .from(chat_files)
      .where(eq(chat_files.chatId, chatId));

    if (files.length > 0) {
      // New multi-file chat: delete local files for each chat_files entry
      for (const file of files) {
        try {
          await removeLocalFile(file.fileKey);
        } catch (err) {
          logger.warn("Error removing local file, continuing:", {
            fileKey: file.fileKey,
            error: err,
          });
        }
      }
      // Delete all vectors in the chat namespace at once
      await deleteAllVectorsForChat(chatId);
      // Delete chat_files rows
      await db.delete(chat_files).where(eq(chat_files.chatId, chatId));
    } else {
      // Legacy single-file chat: fall back to chats.fileKey
      const chat = await db
        .select()
        .from(chats)
        .where(eq(chats.id, chatId));
      if (chat[0]?.fileKey) {
        await removeLocalFile(chat[0].fileKey);
        await deleteVectors(chat[0].fileKey, chat[0].fileKey);
      }
    }

    await db.delete(sources).where(eq(sources.chatId, chatId));
    await db.delete(messages).where(eq(messages.chatId, chatId));
    await db.delete(chats).where(eq(chats.id, chatId));
    return NextResponse.json({ chatId });
  } catch (err) {
    logger.error("Error removing messages:", {
      chatId,
      error: err,
    });
    return new NextResponse("Internal server error", { status: 500 });
  }
}
