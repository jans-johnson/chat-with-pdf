"use server";

import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  chats,
  messages,
  user_settings,
  users,
  UserSettings,
} from "./db/schema";
import { logger } from "./logger";

const DEFAULT_USER_ID = "default-user";

export async function getDefaultUserId() {
  return DEFAULT_USER_ID;
}

export const getUserMetadata = async () => {
  return null;
};

export const ensureUserExists = async () => {
  try {
    const userId = DEFAULT_USER_ID;

    logger.debug("Ensuring user exists", { userId });

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (existingUser.length > 0) {
      return existingUser[0];
    }

    logger.info("Creating default user in database");

    const newUser = await db
      .insert(users)
      .values({
        id: userId,
        email: "user@local",
        name: "User",
      })
      .returning();

    await db.insert(user_settings).values({
      userId: newUser[0].id,
      messageCount: 0,
    });

    return newUser[0];
  } catch (err) {
    logger.error("Error ensuring user exists:", {
      error: err,
    });
    return null;
  }
};

export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const userId = DEFAULT_USER_ID;

    const settings = await db
      .select()
      .from(user_settings)
      .where(eq(user_settings.userId, userId));

    return settings[0] || null;
  } catch (err) {
    logger.error("Error getting user settings:", {
      error: err,
    });
    return null;
  }
};

export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  try {
    const userId = DEFAULT_USER_ID;

    await db
      .update(user_settings)
      .set(settings)
      .where(eq(user_settings.userId, userId));
  } catch (err) {
    logger.error("Error updating user settings:", {
      error: err,
    });
  }
};
