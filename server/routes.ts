import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssociationSchema, insertDonationSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all associations
  app.get("/api/associations", async (_req, res) => {
    try {
      const associations = await storage.getAssociations();
      res.json(associations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch associations" });
    }
  });

  // Get association by ID
  app.get("/api/associations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const association = await storage.getAssociation(id);
      if (!association) {
        return res.status(404).json({ message: "Association not found" });
      }
      res.json(association);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch association" });
    }
  });

  // Search associations
  app.get("/api/associations/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const associations = await storage.searchAssociations(query);
      res.json(associations);
    } catch (error) {
      res.status(500).json({ message: "Failed to search associations" });
    }
  });

  // Get associations by category
  app.get("/api/associations/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const associations = await storage.getAssociationsByCategory(category);
      res.json(associations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch associations by category" });
    }
  });

  // Create association
  app.post("/api/associations", async (req, res) => {
    try {
      const validatedData = insertAssociationSchema.parse(req.body);
      const association = await storage.createAssociation(validatedData);
      res.status(201).json(association);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create association" });
    }
  });

  // Create donation
  app.post("/api/donations", async (req, res) => {
    try {
      const validatedData = insertDonationSchema.parse(req.body);
      
      // If user is authenticated, associate donation with user
      if (req.isAuthenticated && req.isAuthenticated()) {
        const user = req.user as any;
        validatedData.donorUserId = user.claims.sub;
      }
      
      const donation = await storage.createDonation(validatedData);
      
      // Return receipt data for immediate PDF generation
      const association = await storage.getAssociation(donation.associationId);
      if (!association) {
        return res.status(404).json({ message: "Association not found" });
      }

      const receiptData = {
        donation,
        association,
        donorInfo: {
          firstName: donation.donorFirstName,
          lastName: donation.donorLastName,
          email: donation.donorEmail,
          address: donation.donorAddress,
          postalCode: donation.donorPostalCode,
          city: donation.donorCity,
        }
      };

      res.json(receiptData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process donation" });
    }
  });

  // Get donations by email
  app.get("/api/donations/email/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const donations = await storage.getDonationsByEmail(email);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  // Get donations by user (authenticated)
  app.get("/api/donations/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const donations = await storage.getDonationsByUserId(userId);
      res.json(donations);
    } catch (error) {
      console.error("Error fetching user donations:", error);
      res.status(500).json({ message: "Failed to fetch user donations" });
    }
  });

  // Get receipt data for a donation
  app.get("/api/donations/:id/receipt", async (req, res) => {
    try {
      const donationId = parseInt(req.params.id);
      const donation = await storage.getDonationById(donationId);
      
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }

      const association = await storage.getAssociation(donation.associationId);
      if (!association) {
        return res.status(404).json({ message: "Association not found" });
      }

      const receiptData = {
        donation,
        association,
        donorInfo: {
          firstName: donation.donorFirstName,
          lastName: donation.donorLastName,
          email: donation.donorEmail,
          address: donation.donorAddress,
          postalCode: donation.donorPostalCode,
          city: donation.donorCity,
        },
      };

      res.json(receiptData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch receipt data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
