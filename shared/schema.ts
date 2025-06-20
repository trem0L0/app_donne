import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, index } from "drizzle-orm/pg-core";
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
  verified: boolean("verified").default(false).notNull(), // S'assurer que verified est notNull
  donorCount: integer("donor_count").default(0).notNull(), // Rendre non-nullable
  totalRaised: decimal("total_raised", { precision: 10, scale: 2 }).default("0").notNull(), // Rendre non-nullable
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
  donorUserId: varchar("donor_user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  transactionId: text("transaction_id").notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssociationSchema = createInsertSchema(associations).omit({
  id: true,
  verified: true, // `verified` sera géré par le backend après vérification
  donorCount: true, // `donorCount` sera géré par le backend
  totalRaised: true, // `totalRaised` sera géré par le backend
  createdAt: true,
}).extend({
  // Ajouter des validations pour les champs obligatoires du formulaire
  name: z.string().min(1, "Le nom de l'association est requis."),
  mission: z.string().min(1, "La mission courte est requise."),
  fullMission: z.string().min(1, "La description complète est requise."),
  category: z.string().min(1, "La catégorie est requise."),
  email: z.string().email("Email invalide.").min(1, "L'email est requis."),
  phone: z.string().min(1, "Le téléphone est requis."),
  address: z.string().min(1, "L'adresse est requise."),
  siret: z.string().length(14, "Le numéro SIRET doit contenir 14 chiffres.").regex(/^\d+$/, "Le SIRET ne doit contenir que des chiffres.").min(1, "Le SIRET est requis."),
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  transactionId: true,
  status: true,
  createdAt: true,
});

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type", { enum: ["donor", "association"] }),
  associationId: integer("association_id").references(() => associations.id),
  passwordHash: varchar("password_hash"), // For email/password auth
  authProvider: varchar("auth_provider").default("replit"), // "replit", "email", "google", "apple"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertAssociation = z.infer<typeof insertAssociationSchema>;
export type Association = typeof associations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;