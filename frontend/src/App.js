// App.js - Componente principale con gestione persistenza
import React, { useState, useEffect } from 'react';
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
  // const LoadingScreen = () => (
  //   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
  //     <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <h2 className="text-xl font-semibold text-gray-800 mb-2">Caricamento...</h2>
  //         <p className="text-gray-600">Verifica autenticazione in corso</p>
  //       </div>
  //     </div>
  //   </div>
  // );

  const LoadingScreen = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Interactive Light Effect */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-white/20 to-transparent rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-loading-container p-8 rounded-3xl text-center">
          {/* Loading Spinner con effetto glass */}
          <div className="glass-spinner-container w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center">
            <div className="glass-spinner"></div>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-white mb-3">Caricamento...</h2>
          <p className="text-white/80 mb-6">Verifica autenticazione in corso</p>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            <div className="glass-dot animate-pulse"></div>
            <div className="glass-dot animate-pulse animation-delay-200"></div>
            <div className="glass-dot animate-pulse animation-delay-400"></div>
          </div>

          {/* Pulsing Glow Effect */}
          <div className="absolute inset-0 glass-loading-glow rounded-3xl -z-10 animate-pulse-slow"></div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-loading-container {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .glass-spinner-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          animation: glass-spin 1s linear infinite;
        }

        .glass-dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .glass-loading-glow {
          background: rgba(59, 130, 246, 0.1);
          filter: blur(20px);
        }

        @keyframes glass-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

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