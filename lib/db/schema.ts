import { randomUUID } from "crypto";
import {
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, "createdAt"> & {
  createdAt: string;
};

export const user_settings = sqliteTable("user_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  messageCount: integer("message_count").notNull().default(0),
  freeChats: integer("free_chats"),
  freeMessages: integer("free_messages"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
export type UserSettings = typeof user_settings.$inferSelect;

export const chats = sqliteTable("chats", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  pdfName: text("pdf_name"),
  pdfUrl: text("pdf_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  userId: text("user_id").notNull(),
  fileKey: text("file_key"),
});
export type Chat = typeof chats.$inferSelect;
export type SafeChat = Omit<Chat, "createdAt"> & {
  createdAt: string;
};

export const chat_files = sqliteTable("chat_files", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  chatId: text("chat_id")
    .references(() => chats.id)
    .notNull(),
  fileKey: text("file_key").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
export type ChatFile = typeof chat_files.$inferSelect;
export type SafeChatFile = Omit<ChatFile, "createdAt"> & {
  createdAt: string;
};

export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  chatId: text("chat_id")
    .references(() => chats.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  role: text("role", { enum: ["system", "user"] }).notNull(),
  model: text("model"),
});
export type Message = typeof messages.$inferSelect;
export type SafeMessage = Omit<Message, "createdAt"> & {
  createdAt: string;
};

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id")
    .notNull()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: integer("stripe_current_period_end", {
    mode: "timestamp",
  }),
});

export const sources = sqliteTable("sources", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  messageId: text("message_id")
    .references(() => messages.id)
    .notNull(),
  chatId: text("chat_id")
    .references(() => chats.id)
    .notNull(),
  data: text("data"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
export type SafeSource = Omit<typeof sources.$inferSelect, "createdAt"> & {
  createdAt: string;
};

export const feature_flags = sqliteTable("feature_flags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  flag: text("flag").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).default(false),
});

export const app_settings = sqliteTable("app_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  value: text("value").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
