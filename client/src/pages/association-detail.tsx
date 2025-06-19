import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Users, Euro, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Association } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function AssociationDetail() {
  const [match, params] = useRoute("/association/:id");
  const associationId = params?.id ? parseInt(params.id) : null;

  const { data: association, isLoading } = useQuery<Association>({
    queryKey: [`/api/associations/${associationId}`],
    enabled: !!associationId,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!association) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Association non trouvée</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    );
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "health": return "🏥";
      case "education": return "📚";
      case "environment": return "🌱";
      case "social": return "🤝";
      case "culture": return "🎨";
      case "sport": return "⚽";
      default: return "❤️";
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
          <div className="text-6xl">{getCategoryEmoji(association.category)}</div>
        </div>
        <Link href="/">
          <button className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <ArrowLeft className="text-gray-700" size={20} />
          </button>
        </Link>
      </div>

      <div className="p-4">
        {/* Association Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{association.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Users size={16} className="mr-1" />
                {association.donorCount.toLocaleString()} donateurs
              </span>
              <span className="flex items-center">
                <Euro size={16} className="mr-1" />
                {formatCurrency(association.totalRaised)} collectés
              </span>
            </div>
          </div>
          {association.verified && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              Vérifiée
            </Badge>
          )}
        </div>

        {/* Mission */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Notre mission</h2>
          <p className="text-gray-700 leading-relaxed">{association.fullMission}</p>
        </div>

        {/* Impact Stats */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Notre impact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {association.category === "health" && "12M+"}
                {association.category === "education" && "500K+"}
                {association.category === "environment" && "1M+"}
                {association.category === "social" && "50K+"}
                {association.category === "culture" && "200K+"}
                {association.category === "sport" && "100K+"}
              </div>
              <div className="text-sm text-gray-600">
                {association.category === "health" && "Patients soignés"}
                {association.category === "education" && "Enfants éduqués"}
                {association.category === "environment" && "Arbres plantés"}
                {association.category === "social" && "Personnes aidées"}
                {association.category === "culture" && "Événements organisés"}
                {association.category === "sport" && "Jeunes formés"}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {association.category === "health" && "70"}
                {association.category === "education" && "45"}
                {association.category === "environment" && "35"}
                {association.category === "social" && "25"}
                {association.category === "culture" && "15"}
                {association.category === "sport" && "20"}
              </div>
              <div className="text-sm text-gray-600">
                {association.category === "health" && "Pays d'intervention"}
                {association.category === "education" && "Écoles construites"}
                {association.category === "environment" && "Projets actifs"}
                {association.category === "social" && "Centres d'aide"}
                {association.category === "culture" && "Partenariats"}
                {association.category === "sport" && "Clubs soutenus"}
              </div>
            </div>
          </div>
        </div>

        {/* Donation CTA */}
        <Link href={`/donate/${association.id}`}>
          <Button className="w-full bg-accent hover:bg-accent/90 text-black py-4 rounded-xl font-semibold text-lg mb-4">
            Faire un don maintenant
          </Button>
        </Link>

        {/* Contact Info */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {association.website && (
              <div className="flex items-center">
                <Globe size={16} className="mr-2 w-4" />
                <span>{association.website}</span>
              </div>
            )}
            <div className="flex items-center">
              <Mail size={16} className="mr-2 w-4" />
              <span>{association.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
