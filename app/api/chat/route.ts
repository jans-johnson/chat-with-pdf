import { db } from "@/lib/db";
import {
  messages as _messages,
  sources as _sources,
  user_settings,
  chat_files,
  chats,
} from "@/lib/db/schema";
import { retrieval } from "@/lib/langchain";
import { getUserSettings, updateUserSettings, getDefaultUserId } from "@lib/account";
import { Message } from "ai";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { VALID_MODELS } from "@/constants/models";
import { logger } from "@lib/logger";
import { eq } from "drizzle-orm";


function validateModel(selectedModel?: string): string | undefined {
  if (!selectedModel) return undefined;
  return VALID_MODELS.includes(selectedModel) ? selectedModel : undefined;
}

const formatMessages = (messages: Message[]) => {
  const formattedMessages = messages.map(
    (message) =>
      `${message.role === "user" ? "Human" : "Assistant"}: ${message.content}`
  );
  return formattedMessages.join("/n");
};

export async function POST(req: Request) {
  try {
    const userId = await getDefaultUserId();

    const {
      messages,
      chatId,
      messageCount,
      isAdmin,
      selectedModel,
      apiKeys,
    } = await req.json();

    // Check if users running out of free messages
    const userSettings = await getUserSettings();
    if (
      userSettings?.messageCount &&
      userSettings?.freeMessages &&
      userSettings?.messageCount >= userSettings?.freeMessages
    ) {
      return NextResponse.json(
        { error: "Free messages limit reached" },
        { status: 403 }
      );
    }

    // Determine the Pinecone namespace: use chatId if chat_files exist, else fall back to chats.fileKey
    const chatFilesRows = await db
      .select()
      .from(chat_files)
      .where(eq(chat_files.chatId, chatId));
    let namespace: string;
    if (chatFilesRows.length > 0) {
      namespace = chatId;
    } else {
      const chat = await db
        .select()
        .from(chats)
        .where(eq(chats.id, chatId));
      namespace = chat[0]?.fileKey || chatId;
    }

    const currentMessageContent = messages[messages.length - 1].content;
    const previousMessages = messages.slice(0, -1);
    const chatHistory = formatMessages(previousMessages);

    // Validate the selected model
    const validatedModel = validateModel(selectedModel);
    if (selectedModel && !validatedModel) {
      logger.warn(`Invalid model received: ${selectedModel}. Using default.`);
    }

    let count = 0;
    let sources: { content: string; pageNumber: number }[] = [];

    const streamingtextResponse = await retrieval({
      question: currentMessageContent,
      chatHistory,
      previousMessages,
      namespace,
      isAdmin,
      selectedModel: validatedModel,
      apiKeys,
      streamCallbacks: {
        handleRetrieverEnd: (documents) => {
          sources = documents.map((d) => ({
            content: d.pageContent,
            pageNumber: d.metadata.pageNumber,
          }));
        },
        handleLLMEnd: async (output) => {
          count++;
          if (count == 2) {
            // save user message into db
            await db.insert(_messages).values({
              chatId,
              content: currentMessageContent,
              role: "user",
            });
            await db
              .update(user_settings)
              .set({
                messageCount: messageCount + 1,
              })
              .where(eq(user_settings.userId, userId));

            // save ai message into db
            const completion = output.generations[0][0].text;
            const messageId = await db
              .insert(_messages)
              .values({
                chatId,
                content: completion,
                role: "system",
                model: validatedModel,
              })
              .returning({
                insertedId: _messages.id,
              });
            if (sources.length > 0) {
              await db.insert(_sources).values({
                messageId: messageId[0].insertedId,
                chatId,
                data: JSON.stringify(sources),
              });
            }
          }
        },
      },
    });

    // Return a StreamingTextResponse, which can be consumed by the client
    return streamingtextResponse;
  } catch (err) {
    Sentry.captureException("Error generating reply:", {
      level: "error",
      extra: {
        error: err,
      },
    });
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
