import { db } from "./db";
import { associations, type InsertAssociation } from "@shared/schema";

export async function seedDatabase() {
  // Check if we already have data
  const existingAssociations = await db.select().from(associations);
  if (existingAssociations.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

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
    },
    {
      name: "Secours Populaire Français",
      mission: "Lutte contre la pauvreté et l'exclusion sociale",
      fullMission: "Le Secours populaire français agit contre la pauvreté et l'exclusion en France et dans le monde. L'association développe des actions d'urgence et d'insertion qui permettent de répondre aux besoins élémentaires des personnes en difficulté.",
      category: "social",
      email: "contact@secourspopulaire.fr",
      phone: "01 44 78 21 00",
      website: "www.secourspopulaire.fr",
      address: "9-11 rue Froissart, 75003 Paris",
      siret: "78432158200037"
    },
    {
      name: "Les Restos du Cœur",
      mission: "Aide alimentaire et insertion sociale",
      fullMission: "Les Restos du Cœur ont pour but d'aider et d'apporter une assistance bénévole aux personnes démunies, notamment dans le domaine alimentaire par l'accès à des repas gratuits, et par la participation à leur insertion sociale et économique.",
      category: "social",
      email: "contact@restosducoeur.org",
      phone: "01 53 32 23 23",
      website: "www.restosducoeur.org",
      address: "35 rue de Trévise, 75009 Paris",
      siret: "78432158200038"
    },
    {
      name: "Fondation Abbé Pierre",
      mission: "Lutte contre le mal-logement et l'exclusion",
      fullMission: "La Fondation Abbé Pierre agit pour que le droit au logement devienne une réalité pour tous. Elle lutte contre les causes du mal-logement et vient en aide aux personnes sans abri ou mal logées.",
      category: "social",
      email: "contact@fondation-abbe-pierre.fr",
      phone: "01 55 56 37 00",
      website: "www.fondation-abbe-pierre.fr",
      address: "3 avenue du Père Lachaise, 75020 Paris",
      siret: "78432158200039"
    }
  ];

  console.log("Seeding database with sample associations...");
  
  for (const assoc of seedAssociations) {
    await db.insert(associations).values({
      ...assoc,
      verified: true,
      donorCount: Math.floor(Math.random() * 15000) + 5000,
      totalRaised: (Math.floor(Math.random() * 800000) + 200000).toString(),
    });
  }

  console.log(`Seeded ${seedAssociations.length} associations successfully!`);
}