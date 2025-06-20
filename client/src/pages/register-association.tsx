import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAssociationSchema } from "@shared/schema";
import { CloudUpload, Image, CheckCircle } from "lucide-react"; // Ajout de CheckCircle pour l'upload simulé
import { z } from "zod";

const registrationSchema = insertAssociationSchema.extend({
  acceptTerms: z.boolean().refine(val => val === true, "Vous devez accepter les conditions"),
  certifyInfo: z.boolean().refine(val => val === true, "Vous devez certifier les informations"),
  // Champs pour les fichiers. Ils ne seront pas réellement envoyés dans le schéma InsertAssociation pour l'instant.
  // Ils seront gérés séparément ou simulés comme uploadés.
  statutesFile: z.any().optional(), // Pour simuler le fichier sélectionné
  logoFile: z.any().optional(), // Pour simuler le fichier sélectionné
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegisterAssociation() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statutesFileName, setStatutesFileName] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      mission: "",
      fullMission: "",
      category: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      siret: "",
      acceptTerms: false,
      certifyInfo: false,
    },
  });

  const createAssociationMutation = useMutation({
    mutationFn: async (data: any) => {
      // Dans une vraie application, ici vous enverriez les fichiers via FormData
      // et ensuite les données de l'association.
      // Pour l'instant, nous faisons comme si les fichiers étaient "téléchargés".
      // const formData = new FormData();
      // formData.append('statutes', data.statutesFile);
      // formData.append('logo', data.logoFile);
      // for (const key in data) {
      //   if (key !== 'statutesFile' && key !== 'logoFile') {
      //     formData.append(key, data[key]);
      //   }
      // }
      // const response = await fetch("/api/associations", {
      //   method: "POST",
      //   body: formData, // Envoi de FormData
      // });

      // Simuler l'envoi de données sans les fichiers réels pour le backend actuel
      const { statutesFile, logoFile, ...associationData } = data;
      const response = await apiRequest("POST", "/api/associations", associationData);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Demande soumise !",
        description: "Votre demande d'inscription a été envoyée avec succès et est en attente de vérification.",
      });
    },
    onError: (error: any) => { // Ajouter le type any pour l'erreur
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    // Valider que les fichiers "requis" ont été "sélectionnés" (simulés)
    if (!statutesFileName) {
      toast({
        title: "Fichier manquant",
        description: "Veuillez glisser ou sélectionner les statuts de l'association.",
        variant: "destructive",
      });
      return;
    }

    const { acceptTerms, certifyInfo, ...associationData } = data;
    createAssociationMutation.mutate(associationData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'statutesFile' | 'logoFile') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fieldName === 'statutesFile') {
        if (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024) {
          toast({
            title: "Fichier invalide",
            description: "Le fichier des statuts doit être un PDF de moins de 5MB.",
            variant: "destructive",
          });
          setStatutesFileName(null);
          form.setValue(fieldName, null);
          return;
        }
        setStatutesFileName(file.name);
      } else { // logoFile
        if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024) {
          toast({
            title: "Fichier invalide",
            description: "Le logo doit être une image (PNG/JPG) de moins de 2MB.",
            variant: "destructive",
          });
          setLogoFileName(null);
          form.setValue(fieldName, null);
          return;
        }
        setLogoFileName(file.name);
      }
      form.setValue(fieldName, file); // Stocker le fichier dans le formulaire (peut être un File object)
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-4 text-center">
        <div className="mb-8 mt-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-4xl text-green-600" /> {/* Icône mise à jour */}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demande soumise !</h1>
          <p className="text-gray-600">Nous examinerons votre dossier dans les plus brefs délais</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Prochaines étapes</h3>
          <ol className="text-sm text-gray-600 space-y-1 text-left">
            <li>✓ Réception de votre demande</li>
            <li>⏳ Vérification des documents (2-5 jours ouvrés)</li>
            <li>⏳ Validation par notre équipe</li>
            <li>⏳ Activation de votre profil</li>
          </ol>
        </div>

        <Button
          onClick={() => {
            setIsSubmitted(false);
            form.reset();
            setStatutesFileName(null);
            setLogoFileName(null);
          }}
          variant="outline"
          className="w-full"
        >
          Soumettre une nouvelle demande
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Inscrire votre association</h1>
      <p className="text-gray-600 mb-6">Rejoignez notre plateforme pour recevoir des dons</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'association *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro SIRET *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 12345678901234" /> {/* Ajout d'un placeholder */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="health">Santé</SelectItem>
                      <SelectItem value="environment">Environnement</SelectItem>
                      <SelectItem value="social">Action sociale</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="sport">Sport</SelectItem>
                      <SelectItem value="humanitarian">Humanitaire</SelectItem> {/* Ajout d'options */}
                      <SelectItem value="animals">Protection animale</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission (courte description) *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Description courte de votre mission..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullMission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description complète de la mission *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Décrivez en détail les actions de votre association..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="contact@association.fr" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone *</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} placeholder="01 23 45 67 89" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site web (optionnel)</FormLabel>
                  <FormControl>
                    <Input type="url" {...field} placeholder="https://www.association.fr" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 rue de la Paix" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            
            <div>
              <Label htmlFor="statutesFile" className="block text-sm font-medium text-gray-700 mb-1">
                Statuts de l'association *
              </Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
                  ${statutesFileName ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => document.getElementById('statutesFileInput')?.click()}
              >
                <input
                  id="statutesFileInput"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'statutesFile')}
                />
                {statutesFileName ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                    <p className="text-sm text-green-700 font-medium">{statutesFileName}</p>
                    <p className="text-xs text-gray-500 mt-1">Fichier prêt pour l'envoi</p>
                  </div>
                ) : (
                  <>
                    <CloudUpload className="mx-auto text-2xl text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600">
                      Glissez votre fichier ici ou <span className="text-primary">cliquez pour parcourir</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF uniquement, max 5MB</p>
                  </>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="logoFile" className="block text-sm font-medium text-gray-700 mb-1">
                Logo de l'association
              </Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
                  ${logoFileName ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => document.getElementById('logoFileInput')?.click()}
              >
                <input
                  id="logoFileInput"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'logoFile')}
                />
                {logoFileName ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                    <p className="text-sm text-green-700 font-medium">{logoFileName}</p>
                    <p className="text-xs text-gray-500 mt-1">Fichier prêt pour l'envoi</p>
                  </div>
                ) : (
                  <>
                    <Image className="mx-auto text-2xl text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600">
                      Glissez votre logo ici ou <span className="text-primary">cliquez pour parcourir</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG max 2MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="certifyInfo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm">
                      Je certifie que toutes les informations fournies sont exactes et que l'association est légalement constituée *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm">
                      J'accepte les conditions d'utilisation de la plateforme *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full py-4"
            disabled={createAssociationMutation.isPending}
          >
            {createAssociationMutation.isPending ? "Envoi en cours..." : "Soumettre ma demande"}
          </Button>
        </form>
      </Form>

      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h3 className="font-medium text-gray-900 mb-2">Processus de validation</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Soumission de votre demande</li>
          <li>2. Vérification des documents (2-5 jours ouvrés)</li>
          <li>3. Validation par notre équipe</li>
          <li>4. Activation de votre profil</li>
        </ol>
      </div>
    </div>
  );
}