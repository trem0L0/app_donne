import { associations, donations, users, type Association, type InsertAssociation, type Donation, type InsertDonation, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserType(userId: string, userType: "donor" | "association"): Promise<void>;
  
  // Associations
  getAssociations(): Promise<Association[]>;
  getAssociation(id: number): Promise<Association | undefined>;
  createAssociation(association: InsertAssociation): Promise<Association>;
  searchAssociations(query: string): Promise<Association[]>;
  getAssociationsByCategory(category: string): Promise<Association[]>;
  
  // Donations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByEmail(email: string): Promise<Donation[]>;
  getDonationsByUserId(userId: string): Promise<Donation[]>;
  getDonationById(id: number): Promise<Donation | undefined>;
  getAllDonations(): Promise<Donation[]>;
  updateAssociationStats(associationId: number, amount: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserType(userId: string, userType: "donor" | "association"): Promise<void> {
    await db
      .update(users)
      .set({ 
        userType, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async getAssociations(): Promise<Association[]> {
    return await db.select().from(associations);
  }

  async getAssociation(id: number): Promise<Association | undefined> {
    const [association] = await db.select().from(associations).where(eq(associations.id, id));
    return association || undefined;
  }

  async createAssociation(insertAssociation: InsertAssociation): Promise<Association> {
    const [association] = await db
      .insert(associations)
      .values({
        ...insertAssociation,
        website: insertAssociation.website || null,
      })
      .returning();
    return association;
  }

  async searchAssociations(query: string): Promise<Association[]> {
    const allAssociations = await db.select().from(associations);
    return allAssociations.filter(assoc => 
      assoc.name.toLowerCase().includes(query.toLowerCase()) ||
      assoc.mission.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getAssociationsByCategory(category: string): Promise<Association[]> {
    if (category === "all") {
      return await db.select().from(associations);
    }
    return await db.select().from(associations).where(eq(associations.category, category));
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const transactionId = `DN${new Date().getFullYear()}-${Date.now()}`;
    
    const [donation] = await db
      .insert(donations)
      .values({
        ...insertDonation,
        donorPhone: insertDonation.donorPhone || null,
        transactionId,
        status: "completed",
      })
      .returning();
    
    await this.updateAssociationStats(insertDonation.associationId, parseFloat(insertDonation.amount));
    return donation;
  }

  async getDonationsByEmail(email: string): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.donorEmail, email));
  }

  async getDonationsByUserId(userId: string): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.donorUserId, userId));
  }

  async getDonationById(id: number): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation || undefined;
  }

  async getAllDonations(): Promise<Donation[]> {
    return await db.select().from(donations);
  }

  async updateAssociationStats(associationId: number, amount: number): Promise<void> {
    const [association] = await db.select().from(associations).where(eq(associations.id, associationId));
    if (association) {
      await db
        .update(associations)
        .set({
          donorCount: (association.donorCount || 0) + 1,
          totalRaised: (parseFloat(association.totalRaised || "0") + amount).toString(),
        })
        .where(eq(associations.id, associationId));
    }
  }
}

export const storage = new DatabaseStorage();
