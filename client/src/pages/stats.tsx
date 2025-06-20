import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, Users, Euro, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StatsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Get association stats
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/associations/stats"],
    enabled: !!user && user.userType === "association",
  });

  // Get recent donations
  const { data: donations = [] } = useQuery<any[]>({
    queryKey: ["/api/donations/association"],
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

  const recentDonations = donations.slice(0, 5);

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
            <h1 className="text-xl font-semibold">Statistiques</h1>
            <p className="text-sm text-gray-600">
              Suivez l'évolution de vos collectes
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Euro className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total collecté</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(stats?.totalRaised || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Donateurs</p>
                  <p className="text-lg font-semibold">
                    {stats?.donorCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dons totaux</p>
                  <p className="text-lg font-semibold">
                    {stats?.totalDonations || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Euro className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Don moyen</p>
                  <p className="text-lg font-semibold">
                    {stats?.totalDonations > 0 
                      ? formatCurrency((stats?.totalRaised || 0) / stats.totalDonations)
                      : "0 €"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle>Dons récents</CardTitle>
            <CardDescription>
              Les 5 derniers dons reçus
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDonations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun don reçu pour le moment</p>
                <p className="text-sm text-gray-400 mt-1">
                  Partagez votre QR code pour commencer à recevoir des dons
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((donation: any) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {donation.donorFirstName} {donation.donorLastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(donation.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(donation.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {donation.status === "completed" ? "Confirmé" : "En attente"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Conseils</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {stats?.totalDonations === 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800">Commencez votre première collecte</p>
                  <p className="text-blue-600 mt-1">
                    Créez un QR code et partagez-le pour recevoir vos premiers dons
                  </p>
                </div>
              )}
              
              {(stats?.totalDonations || 0) > 0 && (stats?.totalDonations || 0) < 10 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800">Très bon début !</p>
                  <p className="text-green-600 mt-1">
                    Continuez à partager votre QR code pour atteindre plus de donateurs
                  </p>
                </div>
              )}

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-800">Optimisez vos collectes</p>
                <ul className="text-gray-600 mt-1 space-y-1">
                  <li>• Partagez vos QR codes sur les réseaux sociaux</li>
                  <li>• Organisez des événements de collecte</li>
                  <li>• Communiquez régulièrement sur vos actions</li>
                  <li>• Remerciez vos donateurs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}