import { Link, useLocation } from "wouter";

interface NavigationTabsProps {
  className?: string;
}

export function NavigationTabs({ className }: NavigationTabsProps) {
  const [location] = useLocation();

  const tabs = [
    { path: "/", label: "Associations" },
    { path: "/register", label: "S'inscrire" },
    { path: "/history", label: "Historique" },
  ];

  return (
    <nav className={`bg-white border-b border-gray-200 px-4 ${className}`}>
      <div className="flex space-x-6">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          return (
            <Link key={tab.path} href={tab.path}>
              <button
                className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
