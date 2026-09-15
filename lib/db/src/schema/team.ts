import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teamMembersTable = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  level: text("level").notNull(),
  accent: text("accent").notNull().default("teal"),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  imageObjectPath: text("image_object_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TeamMemberRecord = typeof teamMembersTable.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;