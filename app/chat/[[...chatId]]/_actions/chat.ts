import { getDefaultUserId } from "@lib/account";
import { db } from "@lib/db";
import { SafeChat, chats } from "@lib/db/schema";
import { eq } from "drizzle-orm";

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

export const getChat = async (chatId: string): Promise<SafeChat | null> => {
  try {
    const chat = await db.select().from(chats).where(eq(chats.id, chatId));
    return chat[0]
      ? { ...chat[0], createdAt: chat[0].createdAt.toUTCString() }
      : null;
  } catch (error) {
    return null;
  }
};

export const getCurrentChat = (chats: SafeChat[], chatId: string) => {
  return chatId ? chats.find((chat: SafeChat) => chat.id === chatId) : null;
};
