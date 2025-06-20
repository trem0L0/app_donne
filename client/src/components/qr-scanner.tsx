import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Camera, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useLocation } from "wouter";

interface QRScannerProps {
  onClose?: () => void;
}

export function QRScanner({ onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const startScanning = async () => {
    try {
      console.log("Starting QR scan...");
      setError(null);
      setIsScanning(true);

      // Check if camera permission is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès à la caméra n'est pas supporté sur cet appareil");
      }

      // Request camera permission first
      try {
        console.log("Requesting camera permission...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Camera permission granted");
        
        // Stop the stream immediately as Html5QrcodeScanner will handle it
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionError) {
        console.error("Camera permission error:", permissionError);
        throw new Error("Permission d'accès à la caméra refusée. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.");
      }

      // Wait a bit to ensure the DOM is ready
      setTimeout(() => {
        try {
          // Clear any existing content in the scanner element
          const scannerElement = document.getElementById("qr-reader");
          if (scannerElement) {
            scannerElement.innerHTML = "";
            console.log("Scanner element found and cleared");
          } else {
            console.error("Scanner element not found");
            throw new Error("Élément scanner non trouvé");
          }

          const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              rememberLastUsedCamera: true,
              showTorchButtonIfSupported: true,
            },
            false
          );

          scannerRef.current = scanner;
          console.log("Scanner created, starting render...");

          scanner.render(
            (decodedText) => {
              console.log("QR Code detected:", decodedText);
              handleQRCodeDetected(decodedText);
              stopScanning();
            },
            (error) => {
              // Error callback - we can ignore most scanning errors
              if (error.includes("NotFoundException") || error.includes("No MultiFormat Readers")) {
                // No QR code found, this is normal
                return;
              }
              console.log("QR scan error:", error);
            }
          );
          
          console.log("Scanner render completed");
        } catch (renderError) {
          console.error("Scanner render error:", renderError);
          setError("Erreur lors de l'initialisation du scanner");
          setIsScanning(false);
        }
      }, 100);

    } catch (err: any) {
      setError(err.message || "Erreur lors de l'accès à la caméra");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRCodeDetected = (decodedText: string) => {
    try {
      const url = new URL(decodedText);
      
      // Check if it's a donation URL from our domain
      if (url.origin === window.location.origin) {
        // Handle both /donate/:id and /donation-flow URLs
        if (url.pathname.startsWith('/donate/') || url.pathname === '/donation-flow') {
          toast({
            title: "QR Code détecté",
            description: "Redirection vers la page de don...",
          });
          
          // Redirect to the donation page with any parameters
          const fullPath = url.pathname + url.search;
          setLocation(fullPath);
          onClose?.();
          return;
        }
        
        // Handle other valid internal URLs
        if (url.pathname.startsWith('/association/')) {
          toast({
            title: "QR Code détecté",
            description: "Redirection vers la page de l'association...",
          });
          
          const fullPath = url.pathname + url.search;
          setLocation(fullPath);
          onClose?.();
          return;
        }
      }
      
      // If it's not a recognized URL, show an error
      toast({
        title: "QR Code non reconnu",
        description: "Ce QR Code ne correspond pas à une page valide de l'application",
        variant: "destructive",
      });
      
    } catch (err) {
      // If it's not a URL, maybe it's just text content
      toast({
        title: "QR Code détecté",
        description: `Contenu: ${decodedText.substring(0, 50)}${decodedText.length > 50 ? '...' : ''}`,
      });
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      stopScanning();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Scanner QR Code
        </CardTitle>
        <CardDescription>
          Scannez un QR Code d'association pour accéder rapidement à la page de don
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Camera className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Appuyez sur le bouton ci-dessous pour commencer le scan
            </p>
            <Button onClick={startScanning} className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Démarrer le scan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Caméra activée - Placez le QR code dans le cadre
              </p>
            </div>
            <div 
              id="qr-reader" 
              className="w-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-lg"
            >
              {/* Scanner will be rendered here by Html5QrcodeScanner */}
            </div>
            <div className="flex gap-2">
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Arrêter
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="outline">
                  Fermer
                </Button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Conseils :</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Placez le QR Code dans le cadre de la caméra</li>
            <li>Assurez-vous d'avoir un bon éclairage</li>
            <li>Tenez votre appareil stable pour une meilleure lecture</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}