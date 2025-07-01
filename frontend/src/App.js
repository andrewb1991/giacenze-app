// App.js
import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import GiacenzePage from './components/giacenze/GiacenzePage';
import UtilizziPage from './components/utilizzi/UtilizziPage';
import ReportsPage from './components/reports/ReportsPage';
import AdminPage from './components/admin/AdminPage';
import ErrorMessage from './components/shared/ErrorMessage';

const AppContent = () => {
  const { user, currentPage, setCurrentPage } = useAuth();

  const renderCurrentPage = () => {
    if (!user && currentPage !== 'login') {
      return <LoginPage />;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return user ? <Dashboard /> : <LoginPage />;
      case 'giacenze':
        return user ? <GiacenzePage /> : <LoginPage />;
      case 'utilizzi':
        return user ? <UtilizziPage /> : <LoginPage />;
      case 'reports':
        return user ? <ReportsPage /> : <LoginPage />;
      case 'admin':
        return user && user.role === 'admin' ? <AdminPage /> : <AccessDenied />;
      default:
        // Homepage diversa in base al ruolo
        if (user) {
          return user.role === 'admin' ? <AdminPage /> : <Dashboard />;
        }
        return <LoginPage />;
    }
  };

  return (
    <div>
      <ErrorMessage />
      {renderCurrentPage()}
    </div>
  );
};

const AccessDenied = () => {
  const { setCurrentPage } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Accesso Negato</h2>
        <p className="text-gray-600 mb-4">
          Non hai i permessi per accedere alla sezione amministrazione.
        </p>
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Torna al Dashboard
        </button>
      </div>
    </div>
  );
};

const GiacenzeApp = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default GiacenzeApp;