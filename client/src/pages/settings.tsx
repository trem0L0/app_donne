import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, User, Building, Mail, Phone, Globe, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

const settingsSchema = z.object({
  associationName: z.string().min(1, "Le nom est requis"),
  associationDescription: z.string().min(1, "La description est requise"),
  associationMission: z.string().min(1, "La mission est requise"),
  associationCategory: z.string().min(1, "La catégorie est requise"),
  associationAddress: z.string().optional(),
  associationPhone: z.string().optional(),
  associationWebsite: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Get user's association
  const { data: association, isLoading } = useQuery({
    queryKey: ["/api/user/association"],
    enabled: !!user && user.userType === "association",
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      associationName: "",
      associationDescription: "",
      associationMission: "",
      associationCategory: "",
      associationAddress: "",
      associationPhone: "",
      associationWebsite: "",
    },
  });

  // Update form when association data loads
  useState(() => {
    if (association) {
      form.reset({
        associationName: association.name || "",
        associationDescription: association.mission || "",
        associationMission: association.fullMission || "",
        associationCategory: association.category || "",
        associationAddress: association.address || "",
        associationPhone: association.phone || "",
        associationWebsite: association.website || "",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      const response = await fetch(`/api/associations/${association.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.associationName,
          mission: data.associationDescription,
          fullMission: data.associationMission,
          category: data.associationCategory,
          address: data.associationAddress,
          phone: data.associationPhone,
          website: data.associationWebsite,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la mise à jour");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Paramètres mis à jour",
        description: "Les informations de votre association ont été sauvegardées",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/association"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!user || user.userType !== "association") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Cette page est réservée aux associations.
            </p>
            <Button 
              onClick={() => setLocation("/")}
              className="w-full mt-4"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = (data: SettingsForm) => {
    updateMutation.mutate(data);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Paramètres</h1>
            <p className="text-sm text-gray-600">
              Gérez les informations de votre association
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{user.firstName} {user.lastName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Association Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informations de l'association
            </CardTitle>
            <CardDescription>
              Modifiez les informations publiques de votre association
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="associationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'association</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="associationCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <FormControl>
                        <select 
                          {...field}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionnez une catégorie</option>
                          <option value="Santé">Santé</option>
                          <option value="Éducation">Éducation</option>
                          <option value="Environnement">Environnement</option>
                          <option value="Aide sociale">Aide sociale</option>
                          <option value="Culture">Culture</option>
                          <option value="Sport">Sport</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="associationDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description courte</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="associationMission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission complète</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          rows={4}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="associationAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Adresse
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="associationPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Phone className="h-4 w-4 inline mr-1" />
                          Téléphone
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="associationWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Globe className="h-4 w-4 inline mr-1" />
                          Site web
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}