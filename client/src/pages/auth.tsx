import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Building, Shield, FileText } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("donor");

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch('/api/auth/google');
      if (response.status === 503) {
        const data = await response.json();
        alert(data.message);
      } else {
        window.location.href = '/api/auth/google';
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  const handleAppleAuth = async () => {
    try {
      const response = await fetch('/api/auth/apple');
      if (response.status === 503) {
        const data = await response.json();
        alert(data.message);
      } else {
        window.location.href = '/api/auth/apple';
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DonVie</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Rejoignez notre communauté de donateurs et d'associations
          </p>
        </div>

        {/* Auth Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="donor">Donateur</TabsTrigger>
            <TabsTrigger value="association">Association</TabsTrigger>
          </TabsList>

          {/* Donor Tab */}
          <TabsContent value="donor">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Espace Donateur</CardTitle>
                <CardDescription>
                  Soutenez les causes qui vous tiennent à cœur et suivez l'impact de vos dons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Dons sécurisés et traçables</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Reçus fiscaux automatiques (66% de déduction)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-gray-600">Suivi de l'impact de vos dons</span>
                  </div>
                </div>

                {/* Auth Buttons */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Se connecter avec Replit
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Ou continuer avec</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleGoogleAuth}>
                    <SiGoogle className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                  <Button variant="outline" onClick={handleAppleAuth}>
                    <SiApple className="w-4 h-4 mr-2" />
                    Apple
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Association Tab */}
          <TabsContent value="association">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Espace Association</CardTitle>
                <CardDescription>
                  Présentez votre mission et recevez des dons pour vos projets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Plateforme sécurisée et gratuite</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Accès à une communauté de donateurs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Gestion automatique des reçus fiscaux</span>
                  </div>
                </div>

                {/* Auth Buttons */}
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Se connecter avec Replit
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Ou continuer avec</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleGoogleAuth}>
                    <SiGoogle className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                  <Button variant="outline" onClick={handleAppleAuth}>
                    <SiApple className="w-4 h-4 mr-2" />
                    Apple
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 text-center">
                    Après connexion, vous pourrez enregistrer votre association
                    et commencer à recevoir des dons
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}