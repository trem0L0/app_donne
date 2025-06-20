import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Building, Users, Euro, TrendingUp, Eye, Settings, Plus, FileText, QrCode } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { QRCodeGenerator } from "@/components/qr-code-generator";

export default function AssociationDashboard() {
  const { data: userAssociation, isLoading: associationLoading } = useQuery({
    queryKey: ["/api/user/association"],
  });

  const { data: donations = [], isLoading: donationsLoading } = useQuery({
    queryKey: ["/api/donations/association"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/associations/stats"],
  });

  if (associationLoading || donationsLoading || statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userAssociation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <CardTitle>Aucune association enregistrée</CardTitle>
            <CardDescription>
              Vous devez d'abord enregistrer votre association pour accéder au tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/register">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Enregistrer mon association
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRaised = donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);
  const donorCount = new Set(donations.map(d => d.donorEmail)).size;
  const thisMonthDonations = donations.filter(d => 
    new Date(d.createdAt).getMonth() === new Date().getMonth() &&
    new Date(d.createdAt).getFullYear() === new Date().getFullYear() // S'assurer de la même année
  );
  const thisMonthAmount = thisMonthDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);

  // Valeurs par défaut pour les stats si elles sont nulles
  const defaultStats = { totalDonations: 0, donorCount: 0, avgDonation: 0, donationCount: 0 };
  const actualStats = stats || defaultStats;

  // Objectif mensuel (exemple, pourrait être configurable dans le futur)
  const monthlyGoal = 5000; 
  const progressValue = (thisMonthAmount / monthlyGoal) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{userAssociation.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={userAssociation.verified ? "default" : "secondary"}>
              {userAssociation.verified ? "Vérifiée" : "En attente de vérification"}
            </Badge>
            <Badge variant="outline">{userAssociation.category}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/settings"> {/* Lien vers la page des paramètres pour modifier */}
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total collecté</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRaised)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(thisMonthAmount)} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donorCount}</div>
            <p className="text-xs text-muted-foreground">
              +{thisMonthDonations.length} dons ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de dons</CardTitle> {/* Titre mis à jour */}
            <TrendingUp className="h-4 w-4 text-muted-foreground" /> {/* Icône ajustée */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actualStats.donationCount}</div> {/* Utilisation de actualStats.donationCount */}
            <p className="text-xs text-muted-foreground">
              {/* Le calcul précis d'un pourcentage par rapport au mois dernier nécessiterait des données du mois précédent */}
              {thisMonthDonations.length > 0 ? `+${thisMonthDonations.length} ce mois` : "Aucun don ce mois"} 
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Objectif de financement */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Objectif de financement mensuel</CardTitle>
          <CardDescription>
            Vous avez collecté {formatCurrency(thisMonthAmount)} sur un objectif de {formatCurrency(monthlyGoal)} ce mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressValue > 100 ? 100 : progressValue} className="w-full" /> {/* Limiter la barre de progression à 100% */}
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{Math.round(progressValue)}% atteint</span>
            <span>Objectif: {formatCurrency(monthlyGoal)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="donations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="donations">Dons récents</TabsTrigger>
          <TabsTrigger value="campaign">Campagne</TabsTrigger>
          <TabsTrigger value="qrcode">QR Codes</TabsTrigger>
          <TabsTrigger value="receipts">Reçus fiscaux</TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>Dons récents</CardTitle>
              <CardDescription>
                Liste des dons reçus récemment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Aucun don reçu pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.slice(0, 10).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {donation.donorFirstName} {donation.donorLastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(donation.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(parseFloat(donation.amount))}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {donation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaign">
          <Card>
            <CardHeader>
              <CardTitle>Gérer votre campagne</CardTitle>
              <CardDescription>
                Modifiez la présentation de votre association pour attirer plus de donateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Mission actuelle</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {userAssociation.mission}
                  </p>
                  <Link href="/settings">
                    <Button size="sm" variant="outline">Modifier</Button>
                  </Link>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Photos et médias</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ajoutez des photos pour illustrer votre mission
                  </p>
                  <Button size="sm" variant="outline" disabled>Ajouter des photos</Button> {/* Désactivé car non implémenté */}
                </div>
              </div>
              
              <Link href={`/association/${userAssociation.id}`}>
                <Button className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Voir la page publique
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Génération de QR Codes
              </CardTitle>
              <CardDescription>
                Créez des QR codes pour faciliter les dons à votre association
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userAssociation && (
                <QRCodeGenerator 
                  associationId={userAssociation.id} 
                  associationName={userAssociation.name} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des reçus fiscaux</CardTitle>
              <CardDescription>
                Les reçus fiscaux sont générés automatiquement pour chaque don
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Reçus générés ce mois</h3>
                    <p className="text-sm text-muted-foreground">
                      {thisMonthDonations.length} reçus pour {formatCurrency(thisMonthAmount)}
                    </p>
                  </div>
                  <Button variant="outline" disabled> {/* Désactivé car le rapport n'est pas implémenté */}
                    <FileText className="mr-2 h-4 w-4" />
                    Télécharger le rapport
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>
                    ℹ️ Les reçus fiscaux sont automatiquement envoyés par email aux donateurs
                    après chaque don. Ils permettent une déduction fiscale de 66% du montant donné.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}