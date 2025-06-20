import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Heart, Check, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { DonationSteps } from "@/components/donation-steps";
import { apiRequest } from "@/lib/queryClient";
import type { Association } from "@shared/schema";
import { formatCurrency, calculateTaxBenefit } from "@/lib/utils";
import { downloadTaxReceipt, type ReceiptData } from "@/lib/pdf-generator";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const donorInfoSchema = z.object({
  donorFirstName: z.string().min(1, "Le prénom est requis"),
  donorLastName: z.string().min(1, "Le nom est requis"),
  donorEmail: z.string().email("Email invalide"),
  donorPhone: z.string().optional(),
  donorAddress: z.string().min(1, "L'adresse est requise"),
  donorPostalCode: z.string().min(5, "Code postal invalide"),
  donorCity: z.string().min(1, "La ville est requise"),
  acceptTerms: z.boolean().refine(val => val === true, "Vous devez accepter les conditions"),
  newsletterOptIn: z.boolean().optional(),
});

type DonorInfo = z.infer<typeof donorInfoSchema>;

export default function DonationFlow() {
  const [match, params] = useRoute("/donate/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  
  // Extract URL parameters for QR code support
  const urlParams = new URLSearchParams(window.location.search);
  const qrAssociationId = urlParams.get('association');
  const qrAmount = urlParams.get('amount');
  const qrCampaign = urlParams.get('campaign');
  const qrDescription = urlParams.get('description');
  
  // Use QR code association ID if available, otherwise use route param
  const associationId = qrAssociationId ? parseInt(qrAssociationId) : (params?.id ? parseInt(params.id) : null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    qrAmount && qrAmount !== "libre" ? parseInt(qrAmount) : null
  );
  const [customAmount, setCustomAmount] = useState("");
  const [donationResult, setDonationResult] = useState<any>(null);
  const [campaignName, setCampaignName] = useState<string>(qrCampaign || "");

  const { data: association } = useQuery<Association>({
    queryKey: [`/api/associations/${associationId}`],
    enabled: !!associationId,
  });

  const form = useForm<DonorInfo>({
    resolver: zodResolver(donorInfoSchema),
    defaultValues: {
      donorFirstName: user?.firstName || "", // Pré-remplir si l'utilisateur est connecté
      donorLastName: user?.lastName || "", // Pré-remplir si l'utilisateur est connecté
      donorEmail: user?.email || "", // Pré-remplir si l'utilisateur est connecté
      donorPhone: "",
      donorAddress: "",
      donorPostalCode: "",
      donorCity: "",
      acceptTerms: false,
      newsletterOptIn: false,
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (donationData: any) => {
      const response = await apiRequest("POST", "/api/donations", donationData);
      return response.json();
    },
    onSuccess: (data) => {
      setDonationResult(data);
      setCurrentStep(4); // Show confirmation
      queryClient.invalidateQueries({ queryKey: ["/api/associations"] });
      toast({
        title: "Don confirmé !",
        description: "Merci pour votre générosité",
      });
    },
    onError: (error: any) => { // Ajouter le type any pour l'erreur
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de votre don",
        variant: "destructive",
      });
    },
  });

  const getDonationAmount = () => {
    return selectedAmount || parseFloat(customAmount) || 0;
  };

  const handleDownloadReceipt = async () => {
    if (!donationResult?.donation) return;
    
    try {
      const response = await apiRequest("GET", `/api/donations/${donationResult.donation.id}/receipt`);
      const receiptData: ReceiptData = await response.json();
      
      downloadTaxReceipt(receiptData);
      
      toast({
        title: "Reçu fiscal téléchargé",
        description: "Votre reçu fiscal a été généré avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le reçu fiscal",
        variant: "destructive",
      });
    }
  };

  const presetAmounts = [
    { amount: 25, description: "Vaccins pour 5 enfants" },
    { amount: 50, description: "Kit médical d'urgence" },
    { amount: 100, description: "Soins pour 10 patients" },
    { amount: 200, description: "Équipement chirurgical" },
  ];

  const handleNextStep = () => {
    if (currentStep === 1) {
      const amount = getDonationAmount();
      if (amount < 1) {
        toast({
          title: "Montant requis",
          description: "Veuillez sélectionner ou saisir un montant",
          variant: "destructive",
        });
        return;
      }
      // Si l'utilisateur est connecté, sauter l'étape des informations personnelles
      if (isAuthenticated && user) {
        setCurrentStep(3); // Aller directement au paiement
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    // Si l'utilisateur est connecté et qu'il revient de l'étape 3 vers l'étape 1, sauter l'étape 2
    if (currentStep === 3 && isAuthenticated && user) {
      setCurrentStep(1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const processPayment = () => {
    if (!associationId) {
      toast({
        title: "Erreur",
        description: "Association non trouvée pour le don.",
        variant: "destructive",
      });
      return;
    }
    
    let donationData: any = {
      associationId,
      amount: getDonationAmount().toString(),
      transactionId: `TXN_${Date.now()}`, // Mock transaction ID, à améliorer
    };

    // Si l'utilisateur est connecté, utiliser ses informations
    if (isAuthenticated && user) {
      // Les champs sont déjà pré-remplis par useForm.defaultValues,
      // mais on peut les forcer ici pour s'assurer qu'ils sont inclus
      // même si non modifiés par l'utilisateur (utile pour l'étape 3 si on saute l'étape 2)
      donationData = {
        ...donationData,
        donorFirstName: user.firstName || 'Prénom',
        donorLastName: user.lastName || 'Nom',
        donorEmail: user.email || '',
        // Les informations d'adresse et de téléphone ne sont pas stockées dans l'objet user de useAuth.
        // Il faudrait les récupérer d'un profil utilisateur plus complet ou les demander spécifiquement.
        // Pour l'instant, on les met en "Non renseigné" si l'étape 2 est sautée.
        donorAddress: 'Non renseignée', 
        donorPostalCode: '00000',
        donorCity: 'Non renseignée',
        donorPhone: '',
      };
    } 
    // Si l'utilisateur n'est PAS connecté et arrive ici (via un bug ou un chemin non prévu),
    // on devrait théoriquement avoir les infos du formulaire à l'étape 2.
    // Cependant, pour éviter une erreur si currentStep est 3 sans infos de l'étape 2,
    // on vérifie la validation complète du formulaire.
    else {
      // Normalement, cette branche ne devrait pas être atteinte si l'étape 2 a été validée.
      // Mais si elle l'est, c'est que l'utilisateur n'est pas connecté et n'a pas rempli les champs.
      // On redirige vers la page d'authentification pour qu'il se connecte ou s'inscrive.
      setLocation("/auth"); // Rediriger vers la page /auth unifiée
      toast({
        title: "Action requise",
        description: "Veuillez vous connecter ou fournir vos informations pour continuer le don.",
        variant: "info",
      });
      return;
    }

    createDonationMutation.mutate(donationData);
  };

  const onSubmit = (data: DonorInfo) => {
    if (!associationId) {
      toast({
        title: "Erreur",
        description: "Association non trouvée pour le don.",
        variant: "destructive",
      });
      return;
    }
    
    const donationData = {
      ...data,
      associationId,
      amount: getDonationAmount().toString(),
      transactionId: `TXN_${Date.now()}`, // Mock transaction ID, à améliorer
    };
    
    createDonationMutation.mutate(donationData);
  };

  if (!association) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Association non trouvée</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center mb-2">
          <button
            className="mr-3 p-2 rounded-full hover:bg-gray-100"
            onClick={() => currentStep > 1 ? handlePreviousStep() : setLocation("/")}
          >
            <ArrowLeft className="text-gray-700" size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {currentStep === 4 ? "Confirmation" : "Faire un don"}
          </h1>
        </div>
        {currentStep < 4 && <DonationSteps currentStep={currentStep} />}
      </div>

      {/* Step 1: Amount Selection */}
      {currentStep === 1 && (
        <div className="p-4">
          {/* Association Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{association.name}</h3>
                <p className="text-sm text-gray-600">Don sécurisé et défiscalisable</p>
              </div>
            </div>
          </div>

          {/* Amount Selection */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choisissez votre montant</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {presetAmounts.map((preset) => (
              <button
                key={preset.amount}
                className={`p-4 border-2 rounded-xl text-center transition-colors ${
                  selectedAmount === preset.amount
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary"
                }`}
                onClick={() => {
                  setSelectedAmount(preset.amount);
                  setCustomAmount("");
                }}
              >
                <div className="text-xl font-bold text-gray-900">{preset.amount}€</div>
                <div className="text-xs text-gray-600">{preset.description}</div>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Ou entrez un montant personnalisé
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Montant en euros"
                min="1"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="text-lg pr-8"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
            </div>
          </div>

          {/* Tax Benefit Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <Check className="text-green-600 mt-0.5" size={16} />
              <div className="text-sm">
                <div className="font-medium text-green-800">Avantage fiscal</div>
                <div className="text-green-700">
                  66% de votre don est déductible de vos impôts dans la limite de 20% de votre revenu imposable.
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full py-4"
            onClick={handleNextStep}
          >
            Continuer
          </Button>
        </div>
      )}

      {/* Step 2: Donor Information */}
      {currentStep === 2 && (
        <div className="p-4">
          {/* Donation Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Montant du don</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(getDonationAmount())}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Après déduction fiscale</span>
              <span className="text-green-600 font-medium">
                {formatCurrency(getDonationAmount() - calculateTaxBenefit(getDonationAmount()))}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => setCurrentStep(3))} className="space-y-4"> {/* Passe à l'étape 3 après validation */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="donorFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="donorLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="donorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="donorPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="donorAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse *</FormLabel>
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
                  name="donorPostalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="donorCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3 pt-4">
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
                          J'accepte les conditions générales et la politique de confidentialité *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newsletterOptIn"
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
                          Je souhaite recevoir des informations sur les actions de l'association
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full py-4 mt-6">
                Procéder au paiement
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <div className="p-4">
          {/* Final Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif de votre don</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Association</span>
                <span className="font-medium">{association.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Donateur</span>
                <span className="font-medium">
                  {isAuthenticated && user 
                    ? `${user.firstName || 'Prénom'} ${user.lastName || 'Nom'}`
                    : `${form.getValues("donorFirstName")} ${form.getValues("donorLastName")}`
                  }
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Montant total</span>
                <span>{formatCurrency(getDonationAmount())}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Coût réel après déduction</span>
                <span>
                  {formatCurrency(getDonationAmount() - calculateTaxBenefit(getDonationAmount()))}
                </span>
              </div>
            </div>
          </div>

          {/* Mock Payment Form */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Informations de paiement</h3>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">VISA</div>
                <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center">MC</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de carte
                </Label>
                <Input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="font-mono"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration
                  </Label>
                  <Input
                    type="text"
                    placeholder="MM/AA"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </Label>
                  <Input
                    type="text"
                    placeholder="123"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="text-green-600" size={16} />
              <span>Paiement 100% sécurisé via Stripe</span>
            </div>
          </div>

          <Button
            className="w-full bg-green-500 hover:bg-green-600 py-4"
            onClick={processPayment} // Appel direct de processPayment
            disabled={createDonationMutation.isPending}
          >
            <Heart className="mr-2" size={16} />
            {createDonationMutation.isPending ? "Traitement..." : `Confirmer mon don de ${formatCurrency(getDonationAmount())}`}
          </Button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 && donationResult && (
        <div className="p-4 text-center">
          <div className="mb-8 mt-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-4xl text-green-600" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci pour votre don !</h1>
            <p className="text-gray-600">Votre générosité fait la différence</p>
          </div>

          {/* Donation Confirmation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Détails de votre don</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Numéro de transaction</span>
                <span className="font-mono text-sm">#{donationResult.donation?.transactionId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Association</span>
                <span className="font-medium">{donationResult.association?.name || association?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant</span>
                <span className="font-bold text-lg">{formatCurrency(parseFloat(donationResult.donation?.amount || '0'))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span>{donationResult.donation?.createdAt ? new Date(donationResult.donation.createdAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Tax Receipt Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <Check className="text-blue-600 mt-0.5" size={16} />
              <div className="text-sm text-left flex-1">
                <div className="font-medium text-blue-800">Reçu fiscal disponible</div>
                <div className="text-blue-700">
                  Téléchargez votre reçu fiscal pour votre déclaration d'impôts (déduction de 66%).
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={handleDownloadReceipt}
            >
              <Download size={16} className="mr-2" />
              Télécharger le reçu fiscal
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-black"
              onClick={() => setLocation("/")}
            >
              <Heart className="mr-2" size={16} />
              Faire un autre don
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}