import { Heart, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast"; // Importer useToast

export function MobileHeader() {
  const { user } = useAuth();
  const { toast } = useToast(); // Initialiser useToast

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST", // Utiliser POST pour la déconnexion unifiée
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté de votre compte.",
        });
        // Rediriger après un court délai pour que le toast soit visible
        setTimeout(() => {
          window.location.href = "/"; // Rediriger vers la page d'accueil
        }, 500);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur de déconnexion",
          description: errorData.message || "Une erreur est survenue lors de la déconnexion.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur réseau est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Heart className="text-white" size={16} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">DonVie</h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 rounded-full">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <User className="text-gray-600" size={20} />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              {user?.firstName || user?.email || 'Utilisateur'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}> {/* Appel de la fonction handleLogout */}
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}