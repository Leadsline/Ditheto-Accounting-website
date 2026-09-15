import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactSubmissionsTable = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  clientType: text("client_type").notNull(),
  companyName: text("company_name"),
  companyRegistrationNumber: text("company_registration_number"),
  vatNumber: text("vat_number"),
  serviceRequest: text("service_request").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmissionRecord = typeof contactSubmissionsTable.$inferSelect;