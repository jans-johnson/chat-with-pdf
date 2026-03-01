import { NextResponse } from "next/server";
import {
  ensureUserExists,
  getDefaultUserId,
} from "@lib/account";
import { db } from "@lib/db";
import { eq, desc } from "drizzle-orm";
import { chats } from "@lib/db/schema";
import { logger } from "@lib/logger";

export const dynamic = "force-dynamic";

export async function POST() {
  const userId = await getDefaultUserId();

  try {
    await ensureUserExists();
    const _chats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt));

    const safeChats = _chats.map((d) => ({
      ...d,
      createdAt: d.createdAt.toUTCString(),
    }));

    return NextResponse.json({
      chats: safeChats,
    });
  } catch (error) {
    logger.error("Error initializing user:", {
      error: error,
      userId,
    });
    return NextResponse.json(
      { error: "Failed to initialize user" },
      { status: 500 }
    );
  }
}
