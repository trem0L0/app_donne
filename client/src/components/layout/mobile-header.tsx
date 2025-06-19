import { Heart, Menu } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Heart className="text-white" size={16} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">DonVie</h1>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Menu className="text-gray-600" size={20} />
        </button>
      </div>
    </header>
  );
}
