import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const staffUsersTable = pgTable("staff_users", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  role: text("role").notNull().default("staff"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const adminClientsTable = pgTable("admin_clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company").notNull(),
  branch: text("branch").notNull(),
  odooExternalId: text("odoo_external_id"),
  odooSyncStatus: text("odoo_sync_status").notNull().default("not_synced"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const clientDocumentsTable = pgTable("client_documents", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => adminClientsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  objectPath: text("object_path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  expiresAt: text("expires_at"),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const documentRequestsTable = pgTable("document_requests", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => adminClientsTable.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  documentIds: jsonb("document_ids").$type<number[]>().notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  sentBy: text("sent_by").notNull(),
  deliveryStatus: text("delivery_status").notNull().default("logged"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const integrationStateTable = pgTable("integration_state", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull().unique(),
  enabled: integer("enabled").notNull().default(0),
  connected: integer("connected").notNull().default(0),
  message: text("message").notNull(),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAdminClientSchema = createInsertSchema(adminClientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientDocumentSchema = createInsertSchema(clientDocumentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentRequestSchema = createInsertSchema(documentRequestsTable).omit({ id: true, sentAt: true });

export type StaffUser = typeof staffUsersTable.$inferSelect;
export type AdminClient = typeof adminClientsTable.$inferSelect;
export type ClientDocument = typeof clientDocumentsTable.$inferSelect;
export type DocumentRequest = typeof documentRequestsTable.$inferSelect;
export type InsertAdminClient = z.infer<typeof insertAdminClientSchema>;
export type InsertClientDocument = z.infer<typeof insertClientDocumentSchema>;
export type InsertDocumentRequest = z.infer<typeof insertDocumentRequestSchema>;