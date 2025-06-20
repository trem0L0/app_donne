import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Download, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  associationId: number;
  associationName: string;
  amount?: number;
  campaign?: string;
  description?: string;
}

export function QRCodeGenerator({ 
  associationId, 
  associationName, 
  amount: initialAmount, 
  campaign: initialCampaign,
  description: initialDescription 
}: QRCodeGeneratorProps) {
  const [amount, setAmount] = useState(initialAmount ? initialAmount.toString() : "");
  const [campaign, setCampaign] = useState(initialCampaign || "");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const baseUrl = window.location.origin;
      let donationUrl = `${baseUrl}/donate/${associationId}`;
      
      // Add parameters if specified
      const params = new URLSearchParams();
      if (amount) params.append('amount', amount);
      if (campaign) params.append('campaign', campaign);
      
      if (params.toString()) {
        donationUrl += `?${params.toString()}`;
      }

      const qrCodeDataUrl = await QRCode.toDataURL(donationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
      toast({
        title: "QR Code généré",
        description: "Le QR Code pour les dons a été créé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le QR Code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${associationName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const copyDonationLink = async () => {
    const baseUrl = window.location.origin;
    let donationUrl = `${baseUrl}/donate/${associationId}`;
    
    const params = new URLSearchParams();
    if (amount) params.append('amount', amount);
    if (campaign) params.append('campaign', campaign);
    
    if (params.toString()) {
      donationUrl += `?${params.toString()}`;
    }

    try {
      await navigator.clipboard.writeText(donationUrl);
      toast({
        title: "Lien copié",
        description: "Le lien de don a été copié dans le presse-papiers",
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
    if (!navigator.share || !qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], `qr-code-${associationName}.png`, { type: 'image/png' });

      await navigator.share({
        title: `QR Code - ${associationName}`,
        text: `Scannez ce QR Code pour faire un don à ${associationName}`,
        files: [file]
      });
    } catch (error) {
      // Fallback: copy link instead
      copyDonationLink();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Générateur de QR Code
        </CardTitle>
        <CardDescription>
          Créez un QR Code pour faciliter les dons à votre association
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Montant suggéré (optionnel)</Label>
            <Select value={amount} onValueChange={setAmount}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un montant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Montant libre</SelectItem>
                <SelectItem value="10">10 €</SelectItem>
                <SelectItem value="25">25 €</SelectItem>
                <SelectItem value="50">50 €</SelectItem>
                <SelectItem value="100">100 €</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="campaign">Nom de la campagne (optionnel)</Label>
            <Input
              id="campaign"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="Ex: Collecte de Noël 2024"
            />
          </div>

          <Button 
            onClick={generateQRCode} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Génération..." : "Générer le QR Code"}
          </Button>
        </div>

        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={qrCodeUrl} 
                alt="QR Code pour donation" 
                className="border rounded-lg shadow-sm"
              />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Scannez ce QR Code pour accéder directement</p>
              <p>à la page de don de votre association</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadQRCode} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
              
              <Button variant="outline" onClick={copyDonationLink} className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copier le lien
              </Button>
              
              {typeof navigator !== 'undefined' && navigator.share && (
                <Button variant="outline" onClick={shareQRCode}>
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Conseils d'utilisation :</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Imprimez le QR Code sur vos supports de communication</li>
            <li>Partagez-le sur vos réseaux sociaux</li>
            <li>Utilisez-le lors d'événements pour faciliter les dons</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}