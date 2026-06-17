import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  real,          // float4 — supports decimal chapter indexes like 29.1
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  seriesSlug: varchar("series_slug", { length: 255 }).notNull(),
  // real (float4) to support decimal chapters e.g. 29.1 — null = series-level comment
  chapterIndex: real("chapter_index"),
  content: text("content").notNull(),
  parentId: integer("parent_id"),
  isEdited: boolean("is_edited").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const commentReactions = pgTable("comment_reactions", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id")
    .references(() => comments.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seriesReactions = pgTable("series_reactions", {
  id: serial("id").primaryKey(),
  seriesSlug: varchar("series_slug", { length: 255 }).notNull(),
  // real (float4) — -1 sentinel means "series-level" (no chapter)
  chapterIndex: real("chapter_index").notNull().default(-1),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  seriesSlug: varchar("series_slug", { length: 255 }).notNull(),
  seriesTitle: text("series_title").notNull(),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const readHistory = pgTable("read_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  seriesSlug: varchar("series_slug", { length: 255 }).notNull(),
  // real (float4) to support decimal chapters
  chapterIndex: real("chapter_index").notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

export type User      = typeof users.$inferSelect;
export type NewUser   = typeof users.$inferInsert;
export type Comment   = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Bookmark  = typeof bookmarks.$inferSelect;
