import { associations, donations, type Association, type InsertAssociation, type Donation, type InsertDonation } from "@shared/schema";

export interface IStorage {
  // Associations
  getAssociations(): Promise<Association[]>;
  getAssociation(id: number): Promise<Association | undefined>;
  createAssociation(association: InsertAssociation): Promise<Association>;
  searchAssociations(query: string): Promise<Association[]>;
  getAssociationsByCategory(category: string): Promise<Association[]>;
  
  // Donations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByEmail(email: string): Promise<Donation[]>;
  getDonationById(id: number): Promise<Donation | undefined>;
  getAllDonations(): Promise<Donation[]>;
  updateAssociationStats(associationId: number, amount: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private associations: Map<number, Association>;
  private donations: Map<number, Donation>;
  private currentAssociationId: number;
  private currentDonationId: number;

  constructor() {
    this.associations = new Map();
    this.donations = new Map();
    this.currentAssociationId = 1;
    this.currentDonationId = 1;
    this.seedData();
  }

  private seedData() {
    // Seed with some associations
    const seedAssociations: InsertAssociation[] = [
      {
        name: "Médecins Sans Frontières",
        mission: "Aide médicale d'urgence aux populations en détresse",
        fullMission: "Médecins Sans Frontières est une organisation humanitaire internationale qui apporte une aide médicale d'urgence aux populations en détresse : victimes de conflits armés, d'épidémies, de catastrophes naturelles ou d'exclusion des soins.",
        category: "health",
        email: "contact@msf.fr",
        phone: "01 40 21 29 29",
        website: "www.msf.fr",
        address: "8 rue Saint-Sabin, 75011 Paris",
        siret: "78432158200034"
      },
      {
        name: "Unicef France",
        mission: "Protection et éducation des enfants dans le monde",
        fullMission: "L'UNICEF œuvre dans plus de 190 pays et territoires pour atteindre les enfants et les adolescents les plus défavorisés, ainsi que pour protéger les droits de tous les enfants, partout dans le monde.",
        category: "education",
        email: "contact@unicef.fr",
        phone: "01 44 39 77 77",
        website: "www.unicef.fr",
        address: "3 rue Duguay-Trouin, 75006 Paris",
        siret: "78432158200035"
      },
      {
        name: "WWF France",
        mission: "Conservation de la nature et protection de l'environnement",
        fullMission: "Le WWF est l'une des toutes premières organisations indépendantes de protection de l'environnement dans le monde. Nous agissons pour un monde où les humains vivent en harmonie avec la nature.",
        category: "environment",
        email: "contact@wwf.fr",
        phone: "01 55 25 84 84",
        website: "www.wwf.fr",
        address: "35-37 rue Baudin, 93310 Le Pré-Saint-Gervais",
        siret: "78432158200036"
      }
    ];

    seedAssociations.forEach(assoc => {
      const id = this.currentAssociationId++;
      const association: Association = {
        ...assoc,
        id,
        website: assoc.website || null,
        verified: true,
        donorCount: Math.floor(Math.random() * 20000) + 1000,
        totalRaised: (Math.floor(Math.random() * 900000) + 100000).toString(),
        createdAt: new Date(),
      };
      this.associations.set(id, association);
    });
  }

  async getAssociations(): Promise<Association[]> {
    return Array.from(this.associations.values());
  }

  async getAssociation(id: number): Promise<Association | undefined> {
    return this.associations.get(id);
  }

  async createAssociation(insertAssociation: InsertAssociation): Promise<Association> {
    const id = this.currentAssociationId++;
    const association: Association = {
      ...insertAssociation,
      id,
      website: insertAssociation.website || null,
      verified: false,
      donorCount: 0,
      totalRaised: "0",
      createdAt: new Date(),
    };
    this.associations.set(id, association);
    return association;
  }

  async searchAssociations(query: string): Promise<Association[]> {
    const allAssociations = Array.from(this.associations.values());
    return allAssociations.filter(assoc => 
      assoc.name.toLowerCase().includes(query.toLowerCase()) ||
      assoc.mission.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getAssociationsByCategory(category: string): Promise<Association[]> {
    const allAssociations = Array.from(this.associations.values());
    if (category === "all") return allAssociations;
    return allAssociations.filter(assoc => assoc.category === category);
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.currentDonationId++;
    const transactionId = `DN${new Date().getFullYear()}-${String(id).padStart(6, '0')}`;
    
    const donation: Donation = {
      ...insertDonation,
      id,
      donorPhone: insertDonation.donorPhone || null,
      transactionId,
      status: "completed",
      createdAt: new Date(),
    };
    
    this.donations.set(id, donation);
    await this.updateAssociationStats(insertDonation.associationId, parseFloat(insertDonation.amount));
    return donation;
  }

  async getDonationsByEmail(email: string): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(donation => 
      donation.donorEmail === email
    );
  }

  async getDonationById(id: number): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async getAllDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values());
  }

  async updateAssociationStats(associationId: number, amount: number): Promise<void> {
    const association = this.associations.get(associationId);
    if (association) {
      const updatedAssociation: Association = {
        ...association,
        donorCount: (association.donorCount || 0) + 1,
        totalRaised: (parseFloat(association.totalRaised || "0") + amount).toString(),
      };
      this.associations.set(associationId, updatedAssociation);
    }
  }
}

export const storage = new MemStorage();
