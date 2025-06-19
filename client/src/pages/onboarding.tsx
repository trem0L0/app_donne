import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { insertAssociationSchema } from "@shared/schema";
import { Users, Building, ArrowRight, Check } from "lucide-react";

const userTypeSchema = z.object({
  userType: z.enum(["donor", "association"]),
});

const associationRegistrationSchema = insertAssociationSchema.extend({
  userType: z.literal("association"),
});

type UserTypeForm = z.infer<typeof userTypeSchema>;
type AssociationRegistrationForm = z.infer<typeof associationRegistrationSchema>;

export default function Onboarding() {
  const [step, setStep] = useState<"type" | "association-details" | "complete">("type");
  const [selectedType, setSelectedType] = useState<"donor" | "association" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userTypeForm = useForm<UserTypeForm>({
    resolver: zodResolver(userTypeSchema),
  });

  const associationForm = useForm<AssociationRegistrationForm>({
    resolver: zodResolver(associationRegistrationSchema),
    defaultValues: {
      userType: "association",
      name: "",
      mission: "",
      fullMission: "",
      category: "",
      email: user?.email || "",
      phone: "",
      website: "",
      address: "",
      siret: "",
    },
  });

  const updateUserTypeMutation = useMutation({
    mutationFn: async (userType: "donor" | "association") => {
      const response = await fetch("/api/user/update-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType }),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const createAssociationMutation = useMutation({
    mutationFn: async (data: AssociationRegistrationForm) => {
      const response = await fetch("/api/associations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de l'enregistrement");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/associations"] });
      setStep("complete");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const handleTypeSelection = async (data: UserTypeForm) => {
    setSelectedType(data.userType);
    
    if (data.userType === "donor") {
      // Pour les donateurs, on met à jour le type et on redirige
      await updateUserTypeMutation.mutateAsync("donor");
      setStep("complete");
    } else {
      // Pour les associations, on passe à l'étape suivante
      setStep("association-details");
    }
  };

  const handleAssociationRegistration = async (data: AssociationRegistrationForm) => {
    await createAssociationMutation.mutateAsync(data);
  };

  const handleComplete = () => {
    setLocation("/");
    window.location.reload(); // Pour actualiser le contexte utilisateur
  };

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Inscription terminée !</CardTitle>
            <CardDescription>
              {selectedType === "donor" 
                ? "Votre compte donateur a été créé avec succès"
                : "Votre association a été enregistrée et est en attente de vérification"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleComplete} className="w-full">
              Accéder à l'application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "association-details") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Informations de votre association</CardTitle>
              <CardDescription>
                Complétez ces informations pour enregistrer votre association
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...associationForm}>
                <form onSubmit={associationForm.handleSubmit(handleAssociationRegistration)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={associationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l'association *</FormLabel>
                          <FormControl>
                            <Input placeholder="Association ABC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={associationForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catégorie *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir une catégorie" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="education">Éducation</SelectItem>
                              <SelectItem value="health">Santé</SelectItem>
                              <SelectItem value="environment">Environnement</SelectItem>
                              <SelectItem value="social">Social</SelectItem>
                              <SelectItem value="culture">Culture</SelectItem>
                              <SelectItem value="sport">Sport</SelectItem>
                              <SelectItem value="humanitarian">Humanitaire</SelectItem>
                              <SelectItem value="animals">Protection animale</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={associationForm.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission (courte description) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Aider les personnes en difficulté..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={associationForm.control}
                    name="fullMission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description complète de votre mission *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez en détail les actions de votre association..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={associationForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de contact *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@association.fr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={associationForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input placeholder="01 23 45 67 89" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={associationForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site web (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.association.fr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={associationForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 rue de la Paix" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={associationForm.control}
                      name="siret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro SIRET *</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678901234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep("type")}>
                      Retour
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createAssociationMutation.isPending}
                    >
                      {createAssociationMutation.isPending ? "Enregistrement..." : "Enregistrer l'association"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenue sur DonVie
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Quel type de compte souhaitez-vous créer ?
          </p>
        </div>

        <Form {...userTypeForm}>
          <form onSubmit={userTypeForm.handleSubmit(handleTypeSelection)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donateur */}
              <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-blue-500">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-blue-600" />
                  </div>
                  <CardTitle>Je suis un donateur</CardTitle>
                  <CardDescription>
                    Je souhaite soutenir des associations et faire des dons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Découvrir des associations vérifiées</li>
                    <li>• Faire des dons sécurisés</li>
                    <li>• Obtenir des reçus fiscaux automatiques</li>
                    <li>• Suivre l'historique de mes dons</li>
                  </ul>
                  <Button 
                    type="button"
                    className="w-full mt-4"
                    onClick={() => {
                      userTypeForm.setValue("userType", "donor");
                      userTypeForm.handleSubmit(handleTypeSelection)();
                    }}
                    disabled={updateUserTypeMutation.isPending}
                  >
                    Créer mon compte donateur
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Association */}
              <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-green-500">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-10 w-10 text-green-600" />
                  </div>
                  <CardTitle>Je représente une association</CardTitle>
                  <CardDescription>
                    Je souhaite enregistrer mon association et recevoir des dons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Présenter notre mission et nos projets</li>
                    <li>• Recevoir des dons en ligne</li>
                    <li>• Gérer automatiquement les reçus fiscaux</li>
                    <li>• Accéder aux statistiques de donations</li>
                  </ul>
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full mt-4 border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => {
                      userTypeForm.setValue("userType", "association");
                      userTypeForm.handleSubmit(handleTypeSelection)();
                    }}
                  >
                    Enregistrer mon association
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}