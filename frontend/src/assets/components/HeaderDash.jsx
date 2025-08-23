import { ChevronRight, Search, Bell, Plus, Settings } from "lucide-react";

export default function DashboardTopBar({ breadcrumbs = [], onSearch }) {
  return (
    <header className="flex items-center justify-between bg-white border-b px-4 py-2">
      
      {/* Left : Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={14} className="mx-1 text-gray-400" />
            )}
            {index < breadcrumbs.length - 1 ? (
              <span className="hover:underline cursor-pointer">{crumb}</span>
            ) : (
              <span className="font-medium text-gray-800">{crumb}</span>
            )}
          </div>
        ))}
      </div>

      {/* Middle : Search (hidden on small screens) */}
      <div className="hidden md:block w-1/3 relative">
        <Search
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Rechercher..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full pl-8 pr-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Right : Actions */}
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Settings size={18} />
        </button>

        {/* Profile avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
          <img
            src="https://i.pravatar.cc/40"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
