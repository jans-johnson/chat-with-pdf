import { getDefaultUserId } from "@lib/account";
import { db } from "@lib/db";
import { SafeChat, SafeChatFile, chats, chat_files } from "@lib/db/schema";
import { eq } from "drizzle-orm";

export type ChatWithFiles = SafeChat & { files: SafeChatFile[] };

export const getChats = async (): Promise<SafeChat[]> => {
  try {
    const userId = await getDefaultUserId();

    const _chats = (
      await db.select().from(chats).where(eq(chats.userId, userId))
    ).map((d) => ({ ...d, createdAt: d.createdAt.toUTCString() }));
    return _chats;
  } catch (error) {
    return [];
  }
};

export const getChat = async (
  chatId: string
): Promise<ChatWithFiles | null> => {
  try {
    const chat = await db.select().from(chats).where(eq(chats.id, chatId));
    if (!chat[0]) return null;

    const safeChat: SafeChat = {
      ...chat[0],
      createdAt: chat[0].createdAt.toUTCString(),
    };

    // Get chat_files for this chat
    const chatFilesRows = await db
      .select()
      .from(chat_files)
      .where(eq(chat_files.chatId, chatId));

    let files: SafeChatFile[];
    if (chatFilesRows.length > 0) {
      files = chatFilesRows.map((f) => ({
        ...f,
        createdAt: f.createdAt.toUTCString(),
      }));
    } else if (safeChat.fileKey && safeChat.pdfName && safeChat.pdfUrl) {
      // Backward compat: synthesize from old columns
      files = [
        {
          id: "legacy-" + chatId,
          chatId,
          fileKey: safeChat.fileKey,
          fileName: safeChat.pdfName,
          fileUrl: safeChat.pdfUrl,
          fileSize: null,
          createdAt: safeChat.createdAt,
        },
      ];
    } else {
      files = [];
    }

    return { ...safeChat, files };
  } catch (error) {
    return null;
  }
};

export const getCurrentChat = (chats: SafeChat[], chatId: string) => {
  return chatId ? chats.find((chat: SafeChat) => chat.id === chatId) : null;
};
