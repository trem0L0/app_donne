import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import type { Donation, Association } from "@shared/schema";
import { formatCurrency, formatDate, calculateTaxBenefit } from "@/lib/utils";

export default function DonationHistory() {
  const [email, setEmail] = useState("test@example.com"); // In real app, get from auth

  const { data: donations, isLoading } = useQuery<Donation[]>({
    queryKey: [`/api/donations/email/${email}`],
    enabled: !!email,
  });

  const { data: associations } = useQuery<Association[]>({
    queryKey: ["/api/associations"],
  });

  const getAssociationName = (associationId: number) => {
    return associations?.find(a => a.id === associationId)?.name || "Association inconnue";
  };

  const totalDonations = donations?.reduce((sum, donation) => sum + parseFloat(donation.amount), 0) || 0;
  const totalTaxBenefit = calculateTaxBenefit(totalDonations);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="h-16 bg-gray-200 rounded-xl"></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!donations?.length) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Historique des dons</h1>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❤️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun don pour le moment</h3>
          <p className="text-gray-600 mb-6">Commencez à faire des dons pour voir votre historique ici</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entrez votre email pour voir vos dons
            </label>
            <Input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-sm mx-auto"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Historique des dons</h1>

      {/* Email Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email du donateur
        </label>
        <Input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-primary">{formatCurrency(totalDonations)}</div>
          <div className="text-sm text-gray-600">Total des dons</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-primary">{donations.length}</div>
          <div className="text-sm text-gray-600">Associations aidées</div>
        </div>
      </div>

      {/* Donation History */}
      <div className="space-y-4">
        {donations.map((donation) => (
          <div key={donation.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {getAssociationName(donation.associationId)}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(donation.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(donation.amount)}
                </div>
                <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                  {donation.status === "completed" ? "Confirmé" : donation.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Transaction #{donation.transactionId}
              </span>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                <Download size={16} className="mr-1" />
                Reçu
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Annual Summary */}
      <div className="mt-8 bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif {new Date().getFullYear()}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total des dons</span>
            <span className="font-medium">{formatCurrency(totalDonations)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Déduction fiscale estimée</span>
            <span className="font-medium text-green-600">{formatCurrency(totalTaxBenefit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Coût réel</span>
            <span className="font-medium">{formatCurrency(totalDonations - totalTaxBenefit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
