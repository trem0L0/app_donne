import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Euro } from "lucide-react";
import { Link } from "wouter";
import type { Association } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface AssociationCardProps {
  association: Association;
}

export function AssociationCard({ association }: AssociationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-4xl text-blue-600">
          {association.category === "health" && "🏥"}
          {association.category === "education" && "📚"}
          {association.category === "environment" && "🌱"}
          {association.category === "social" && "🤝"}
          {association.category === "culture" && "🎨"}
          {association.category === "sport" && "⚽"}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex-1">{association.name}</h3>
          {association.verified && (
            <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">
              Vérifiée
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3">{association.mission}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500 flex items-center">
              <Users size={12} className="mr-1" />
              {association.donorCount.toLocaleString()} donateurs
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <Euro size={12} className="mr-1" />
              {formatCurrency(association.totalRaised)} collectés
            </span>
          </div>
          <Link href={`/association/${association.id}`}>
            <Button className="bg-accent hover:bg-accent/90 text-black">
              Faire un don
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
