// components/shared/Navigation.js
import React from 'react';
import { Package2, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navigation = ({ title = "Giacenze Personali", showBackToDashboard = false }) => {
  const { user, logout, setCurrentPage } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Package2 className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            {showBackToDashboard && user?.role !== 'admin' && (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="ml-4 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                ← Dashboard
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.username} ({user?.role === 'admin' ? 'Amministratore' : 'Operatore'})
            </span>
            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
              >
                Vista Operatore
              </button>
            )}
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const BackButton = ({ onClick, label = "← Torna al Dashboard" }) => {
  return (
    <button
      onClick={onClick}
      className="text-blue-600 hover:text-blue-800 mr-4 underline"
    >
      {label}
    </button>
  );
};

export default Navigation;