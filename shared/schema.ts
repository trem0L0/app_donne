import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const associations = pgTable("associations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mission: text("mission").notNull(),
  fullMission: text("full_mission").notNull(),
  category: text("category").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  website: text("website"),
  address: text("address").notNull(),
  siret: text("siret").notNull(),
  verified: boolean("verified").default(false),
  donorCount: integer("donor_count").default(0),
  totalRaised: decimal("total_raised", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  associationId: integer("association_id").notNull(),
  donorFirstName: text("donor_first_name").notNull(),
  donorLastName: text("donor_last_name").notNull(),
  donorEmail: text("donor_email").notNull(),
  donorPhone: text("donor_phone"),
  donorAddress: text("donor_address").notNull(),
  donorPostalCode: text("donor_postal_code").notNull(),
  donorCity: text("donor_city").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  transactionId: text("transaction_id").notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssociationSchema = createInsertSchema(associations).omit({
  id: true,
  verified: true,
  donorCount: true,
  totalRaised: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  transactionId: true,
  status: true,
  createdAt: true,
});

export type InsertAssociation = z.infer<typeof insertAssociationSchema>;
export type Association = typeof associations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;
