import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Film, Search, Plus } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Film className="text-amber-400 w-8 h-8" />
            <h1 className="text-2xl font-bold text-white">Moviary</h1>
          </div>

          <div className="flex items-center space-x-4">
            {location.pathname === "/" && (
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search your films..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent w-64"
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
