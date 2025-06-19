import { Link, useLocation } from "wouter";
import { Home, Heart, User, Clock, QrCode } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavigationTabsProps {
  className?: string;
}

export function NavigationTabs({ className }: NavigationTabsProps) {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const { user } = useAuth();

  const tabs = !isAuthenticated 
    ? [
        { path: "/", label: "Accueil", icon: Home },
        { path: "/auth", label: "Connexion", icon: User },
      ]
    : user?.userType === "association"
    ? [
        { path: "/", label: "Tableau de bord", icon: Home },
        { path: "/register", label: "Mon association", icon: Heart },
      ]
    : [
        { path: "/", label: "Associations", icon: Home },
        { path: "/qr-scan", label: "Scanner", icon: QrCode },
        { path: "/history", label: "Historique", icon: Clock },
      ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 ${className}`}>
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;
          return (
            <Link key={tab.path} href={tab.path}>
              <button
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
