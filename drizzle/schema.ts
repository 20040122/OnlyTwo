import {
  type AnyPgColumn,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  nickname: text("nickname").notNull(),
  avatarUrl: text("avatar_url"),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const relationshipInvites = pgTable("relationship_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  inviterUserId: uuid("inviter_user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  inviteeUserId: uuid("invitee_user_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at", { mode: "string", withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { mode: "string", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const relationships = pgTable("relationships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAId: uuid("user_a_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  userBId: uuid("user_b_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  status: text("status").default("active").notNull(),
  createdFromInviteId: uuid("created_from_invite_id").references(
    () => relationshipInvites.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  endedAt: timestamp("ended_at", { mode: "string", withTimezone: true }),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  relationshipId: uuid("relationship_id")
    .references(() => relationships.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  type: text("type").default("direct").notNull(),
  lastMessageId: uuid("last_message_id").references(
    (): AnyPgColumn => messages.id,
    { onDelete: "set null" },
  ),
  lastMessageAt: timestamp("last_message_at", {
    mode: "string",
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const conversationMembers = pgTable(
  "conversation_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").default("member").notNull(),
    joinedAt: timestamp("joined_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    lastReadMessageId: uuid("last_read_message_id").references(
      (): AnyPgColumn => messages.id,
      { onDelete: "set null" },
    ),
    lastReadAt: timestamp("last_read_at", {
      mode: "string",
      withTimezone: true,
    }),
  },
  (table) => [unique().on(table.conversationId, table.userId)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    senderUserId: uuid("sender_user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    clientId: text("client_id").notNull(),
    content: text("content").notNull(),
    messageType: text("message_type").default("text").notNull(),
    status: text("status").default("sent").notNull(),
    createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    editedAt: timestamp("edited_at", { mode: "string", withTimezone: true }),
    deletedAt: timestamp("deleted_at", { mode: "string", withTimezone: true }),
  },
  (table) => [unique().on(table.senderUserId, table.clientId)],
);
