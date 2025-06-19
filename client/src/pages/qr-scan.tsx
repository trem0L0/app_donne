import { QRScanner } from "@/components/qr-scanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ArrowLeft, Lightbulb } from "lucide-react";
import { Link } from "wouter";

export default function QRScan() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scanner QR Code</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Scannez un QR code d'association pour faire un don rapidement
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>

        {/* Scanner Component */}
        <div className="mb-8">
          <QRScanner />
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Comment utiliser le scanner QR
            </CardTitle>
            <CardDescription>
              Suivez ces étapes simples pour scanner un QR code et faire un don
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-medium mb-2">Trouvez un QR code</h3>
                <p className="text-sm text-muted-foreground">
                  Recherchez un QR code sur les supports de communication d'une association
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-medium mb-2">Scannez le code</h3>
                <p className="text-sm text-muted-foreground">
                  Utilisez le scanner ci-dessus pour capturer le QR code avec votre caméra
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-medium mb-2">Faites votre don</h3>
                <p className="text-sm text-muted-foreground">
                  Vous serez automatiquement redirigé vers la page de don de l'association
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Avantages du don par QR code</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Accès instantané à la page de don</li>
                <li>• Montants pré-configurés pour certaines campagnes</li>
                <li>• Process simplifié et sécurisé</li>
                <li>• Reçu fiscal automatique par email</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Problèmes de scan ?</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Assurez-vous d'avoir un bon éclairage</li>
                <li>• Tenez votre appareil stable</li>
                <li>• Placez le QR code entièrement dans le cadre</li>
                <li>• Nettoyez l'objectif de votre caméra si nécessaire</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}