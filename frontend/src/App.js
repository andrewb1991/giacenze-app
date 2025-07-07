// App.js - Componente principale con gestione persistenza
import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppProvider } from './contexts/AppContext';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import GiacenzePage from './components/giacenze/GiacenzePage';
import UtilizziPage from './components/utilizzi/UtilizziPage';
import ReportsPage from './components/reports/ReportsPage';
import AdminPage from './components/admin/AdminPage';
import ErrorMessage from './components/shared/ErrorMessage';

// 🔄 Componente di Loading
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Caricamento...</h2>
        <p className="text-gray-600">Verifica autenticazione in corso</p>
      </div>
    </div>
  </div>
);

// 🎯 Componente principale dell'app (interno al provider)
const AppContent = () => {
  const { user, loading, currentPage, isAuthenticated } = useAuth();

  // 🔄 Mostra loading durante l'inizializzazione
  if (loading) {
    return <LoadingScreen />;
  }

  // 🔐 Se non autenticato, mostra login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 🎨 Renderizza la pagina corrente in base al currentPage
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'giacenze':
        return <GiacenzePage />;
      case 'utilizzi':
        return <UtilizziPage />;
      case 'reports':
        return <ReportsPage />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPage /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
      <ErrorMessage />
    </div>
  );
};

// 🚀 Componente App principale con tutti i provider
const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;