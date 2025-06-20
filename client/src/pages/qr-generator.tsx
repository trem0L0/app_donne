import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeGenerator } from "@/components/qr-code-generator";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function QRGeneratorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [amount, setAmount] = useState("");
  const [campaign, setCampaign] = useState("");
  const [description, setDescription] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Get user's association
  const { data: association } = useQuery({
    queryKey: ["/api/user/association"],
    enabled: !!user && user.userType === "association",
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

  const generateQRCode = () => {
    if (!association) return;

    const params = new URLSearchParams();
    params.set("association", association.id.toString());
    
    if (amount) {
      params.set("amount", amount);
    }
    if (campaign) {
      params.set("campaign", campaign);
    }
    if (description) {
      params.set("description", description);
    }

    const baseUrl = window.location.origin;
    const donationUrl = `${baseUrl}/donation-flow?${params.toString()}`;
    setQrCodeUrl(donationUrl);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      toast({
        title: "Lien copié",
        description: "Le lien de donation a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Faire un don à ${association?.name}`,
          text: `Soutenez ${association?.name} en faisant un don`,
          url: qrCodeUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard();
    }
  };

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
            <h1 className="text-xl font-semibold">Générateur QR Code</h1>
            <p className="text-sm text-gray-600">
              Créez des QR codes personnalisés pour vos campagnes
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration du QR Code</CardTitle>
            <CardDescription>
              Personnalisez votre QR code de donation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Montant suggéré (€)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Ex: 20"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Laissez vide pour permettre au donateur de choisir
              </p>
            </div>

            <div>
              <Label htmlFor="campaign">Nom de la campagne</Label>
              <Input
                id="campaign"
                placeholder="Ex: Collecte de Noël 2025"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez brièvement l'objectif de cette collecte"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={generateQRCode} className="w-full">
              Générer le QR Code
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        {qrCodeUrl && association && (
          <Card>
            <CardHeader>
              <CardTitle>Votre QR Code</CardTitle>
              <CardDescription>
                Partagez ce QR code pour faciliter les dons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <QRCodeGenerator 
                  associationId={association.id}
                  associationName={association.name}
                  amount={amount ? parseFloat(amount) : undefined}
                  campaign={campaign || undefined}
                  description={description || undefined}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <Label className="text-xs font-medium text-gray-700">
                  Lien de donation :
                </Label>
                <p className="text-sm text-gray-600 break-all mt-1">
                  {qrCodeUrl}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier le lien
                </Button>
                <Button 
                  variant="outline" 
                  onClick={shareQRCode}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Conseils d'utilisation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Imprimez le QR code sur vos supports de communication</li>
              <li>• Affichez-le lors de vos événements</li>
              <li>• Partagez-le sur vos réseaux sociaux</li>
              <li>• Intégrez-le dans vos newsletters</li>
              <li>• Plus le QR code est grand, plus il est facile à scanner</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}