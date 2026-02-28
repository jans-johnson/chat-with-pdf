import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
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
    const { file_key, file_name } = body;

    await loadFileIntoPinecone(file_key);
    const newChat = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getLocalPdfUrl(file_key),
        userId,
      })
      .returning();

    return NextResponse.json({ chat: newChat[0] }, { status: 200 });
  } catch (error) {
    logger.error("Error creating chat:", {
      userId,
      error,
    });
    return NextResponse.json({
      error: "internal server error",
      status: 500,
    });
  }
}
