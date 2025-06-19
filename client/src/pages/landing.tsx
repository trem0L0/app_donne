import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, FileText } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">DonVie</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Plateforme de dons pour associations françaises
          </p>
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg w-full max-w-sm"
              onClick={() => window.location.href = '/api/login'}
            >
              Se connecter avec Replit
            </Button>
            
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-6 py-3"
                onClick={() => window.location.href = '/api/auth/google'}
              >
                <SiGoogle className="w-5 h-5" />
                Google
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-6 py-3"
                onClick={() => window.location.href = '/api/auth/apple'}
              >
                <SiApple className="w-5 h-5" />
                Apple
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Associations vérifiées</CardTitle>
              <CardDescription>
                Découvrez des associations françaises reconnues et vérifiées
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Dons sécurisés</CardTitle>
              <CardDescription>
                Plateforme sécurisée avec traçabilité complète de vos dons
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Reçus fiscaux</CardTitle>
              <CardDescription>
                Reçus fiscaux automatiques pour bénéficier de 66% de réduction d'impôt
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Commencez à faire la différence</CardTitle>
              <CardDescription className="text-lg">
                Connectez-vous pour accéder à votre espace personnel, suivre vos dons 
                et télécharger vos reçus fiscaux
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full max-w-sm"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Créer mon compte gratuitement
                </Button>
                
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.location.href = '/api/auth/google'}
                  >
                    <SiGoogle className="w-4 h-4" />
                    Google
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.location.href = '/api/auth/apple'}
                  >
                    <SiApple className="w-4 h-4" />
                    Apple
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}