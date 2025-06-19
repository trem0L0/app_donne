import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AssociationCard } from "@/components/association-card";
import type { Association } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: associations, isLoading } = useQuery<Association[]>({
    queryKey: ["/api/associations"],
  });

  const filteredAssociations = associations?.filter((association) => {
    const matchesSearch = !searchQuery || 
      association.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      association.mission.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || association.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", label: "Toutes" },
    { id: "education", label: "Éducation" },
    { id: "health", label: "Santé" },
    { id: "environment", label: "Environnement" },
    { id: "social", label: "Social" },
    { id: "culture", label: "Culture" },
    { id: "sport", label: "Sport" },
  ];

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="p-4 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Rechercher une association..."
            className="pl-10 py-3 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 bg-white">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Catégories</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={`flex-shrink-0 rounded-full ${
                selectedCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Association Cards */}
      <div className="p-4 space-y-4">
        {filteredAssociations?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune association trouvée</p>
          </div>
        ) : (
          filteredAssociations?.map((association) => (
            <AssociationCard key={association.id} association={association} />
          ))
        )}
      </div>
    </div>
  );
}
