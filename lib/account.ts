"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  app_settings,
  chats,
  feature_flags,
  messages,
  subscriptions,
  user_settings,
  users,
  UserSettings,
} from "./db/schema";
import { AppSettings, FeatureFlags } from "@types";
import { logger } from "./logger";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_USER_ID = "default-user";

export async function getDefaultUserId() {
  return DEFAULT_USER_ID;
}

export async function checkSubscription() {
  try {
    const userId = DEFAULT_USER_ID;

    const _subscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    if (_subscriptions.length === 0) {
      return false;
    }

    const subscription = _subscriptions[0];
    const isValid =
      subscription.stripePriceId &&
      subscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();
    return !!isValid;
  } catch (err) {
    logger.error("Error checking subscription:", {
      error: err,
    });
    return false;
  }
}

export const getUserMetadata = async () => {
  return null;
};

export const getFeatureFlags = async (): Promise<Record<
  FeatureFlags,
  boolean
> | null> => {
  try {
    const flags = await db.select().from(feature_flags);
    return flags.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.flag as FeatureFlags]: curr.enabled,
      };
    }, {} as any);
  } catch (err) {
    logger.error("Error getting feature flags:", {
      error: err,
    });
    return null;
  }
};

export const getAppSettings = async (): Promise<Record<
  AppSettings,
  string
> | null> => {
  try {
    const settings = await db.select().from(app_settings);
    return settings.reduce((acc, curr) => {
      return { ...acc, [curr.name as AppSettings]: curr.value };
    }, {} as any);
  } catch (err) {
    logger.error("Error getting app settings:", {
      error: err,
    });
    return null;
  }
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

    const settings = await getAppSettings();
    await db.insert(user_settings).values({
      userId: newUser[0].id,
      messageCount: 0,
      freeChats: Number(settings?.free_chats || 0),
      freeMessages: Number(settings?.free_messages || 0),
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
