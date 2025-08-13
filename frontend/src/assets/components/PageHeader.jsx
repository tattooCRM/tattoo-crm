import { ChevronRight, Search } from "lucide-react";

export default function PageHeader({ breadcrumbs = [], onSearch }) {
  return (
    <div className="flex items-center justify-between bg-white border-b px-4 py-2">
      {/* Breadcrumb */}
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

      {/* Barre de recherche + boutons */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-8 pr-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Boutons */}
        <button className="text-sm px-3 py-1 border rounded-md hover:bg-gray-100">
          Manage
        </button>
        <button className="text-sm px-3 py-1 border rounded-md hover:bg-gray-100">
          Share
        </button>
        <button className="text-sm px-3 py-1 bg-black text-white rounded-md hover:bg-gray-800">
          Create task
        </button>
      </div>
    </div>
  );
}
