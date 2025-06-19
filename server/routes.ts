import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssociationSchema, insertDonationSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - Combined route for both auth types
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      let userId: string;
      
      // Check for email/password session
      if ((req.session as any).user) {
        userId = (req.session as any).user.id;
      }
      // Check for Replit auth session
      else if (req.user && req.user.claims) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Google Auth placeholder
  app.get('/api/auth/google', (req, res) => {
    res.status(503).json({ 
      message: "L'authentification Google nécessite la configuration des clés API GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET. Contactez l'administrateur." 
    });
  });

  // Apple Auth placeholder  
  app.get('/api/auth/apple', (req, res) => {
    res.status(503).json({ 
      message: "L'authentification Apple nécessite la configuration des clés API APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID et APPLE_PRIVATE_KEY. Contactez l'administrateur." 
    });
  });

  // Update user type
  app.post('/api/user/update-type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userType } = req.body;
      
      if (!userType || !['donor', 'association'].includes(userType)) {
        return res.status(400).json({ message: "Type d'utilisateur invalide" });
      }

      await storage.updateUserType(userId, userType);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user type:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
  });

  // Get user's association (for association dashboard)
  app.get('/api/user/association', async (req: any, res) => {
    try {
      let userId: string;
      
      // Check for email/password session
      if ((req.session as any).user) {
        userId = (req.session as any).user.id;
      }
      // Check for Replit auth session
      else if (req.user && req.user.claims) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      
      if (!user || !user.associationId) {
        return res.json(null);
      }

      const association = await storage.getAssociation(user.associationId);
      res.json(association);
    } catch (error) {
      console.error("Error fetching user association:", error);
      res.status(500).json({ message: "Erreur lors de la récupération" });
    }
  });

  // Get association donations
  app.get('/api/donations/association', async (req: any, res) => {
    try {
      let userId: string;
      
      // Check for email/password session
      if ((req.session as any).user) {
        userId = (req.session as any).user.id;
      }
      // Check for Replit auth session
      else if (req.user && req.user.claims) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      
      if (!user || !user.associationId) {
        return res.json([]);
      }

      const donations = await storage.getDonationsByAssociation(user.associationId);
      res.json(donations);
    } catch (error) {
      console.error("Error fetching association donations:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des dons" });
    }
  });

  // Get association stats
  app.get('/api/associations/stats', async (req: any, res) => {
    try {
      let userId: string;
      
      // Check for email/password session
      if ((req.session as any).user) {
        userId = (req.session as any).user.id;
      }
      // Check for Replit auth session
      else if (req.user && req.user.claims) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      
      if (!user || !user.associationId) {
        return res.json({ totalDonations: 0, donorCount: 0, avgDonation: 0 });
      }

      const donations = await storage.getDonationsByAssociation(user.associationId);
      const totalDonations = donations.reduce((sum: number, donation: any) => sum + parseFloat(donation.amount), 0);
      const donorCount = new Set(donations.map((d: any) => d.donorEmail)).size;
      const avgDonation = donations.length > 0 ? totalDonations / donations.length : 0;

      res.json({
        totalDonations,
        donorCount,
        avgDonation,
        donationCount: donations.length
      });
    } catch (error) {
      console.error("Error fetching association stats:", error);
      res.status(500).json({ message: "Failed to fetch association stats" });
    }
  });

  // Email/Password Authentication Routes
  const registerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    userType: z.enum(["donor", "association"]),
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: validationResult.error.errors 
        });
      }

      const { firstName, lastName, email, password, userType } = validationResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Generate unique ID
      const userId = randomBytes(16).toString('hex');

      // Create user
      const user = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        userType,
        passwordHash,
        authProvider: "email",
      });

      // Create session (simplified version)
      (req.session as any).user = { id: userId, email, userType };

      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Erreur lors de la création de session" });
        }
        
        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email, 
            firstName: user.firstName, 
            lastName: user.lastName,
            userType: user.userType 
          } 
        });
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: validationResult.error.errors 
        });
      }

      const { email, password } = validationResult.data;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      // Check password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      // Create session
      (req.session as any).user = { id: user.id, email: user.email, userType: user.userType };

      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          userType: user.userType 
        } 
      });
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });



  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.json({ success: true });
    });
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
