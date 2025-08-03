// components/shared/Navigation.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Package2, LogOut, ArrowLeft, Sun, Moon, Palette, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, THEMES } from '../../hooks/useTheme';

// Context per gestire lo stato del sidebar
const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const Navigation = ({ title = "Giacenze Personali", showBackToDashboard = false, showSidebarToggle = false }) => {
  const { user, logout, setCurrentPage } = useAuth();
  const { currentTheme, toggleTheme, isDefault, isLight, isDark } = useTheme();
  
  // Usa useSidebar solo se showSidebarToggle è true
  let sidebarState = null;
  try {
    if (showSidebarToggle) {
      sidebarState = useSidebar();
    }
  } catch (error) {
    // Se non è dentro SidebarProvider, ignora
  }
  
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
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Interactive Light Effect */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            filter: 'blur(40px)',
          }}
        />
      </div>

      <nav className="relative z-10 glass-nav border-b border-white/10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              {showSidebarToggle && sidebarState && (
                <button
                  onClick={() => sidebarState.setIsSidebarOpen(!sidebarState.isSidebarOpen)}
                  className={`glass-button p-2 rounded-2xl hover:scale-105 transition-all duration-300 ${
                    isLight ? 'text-black' : 'text-white'
                  }`}
                  title="Menu di navigazione"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <div className="glass-icon p-2 rounded-xl">
                <Package2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">{title}</h1>
              {showBackToDashboard && (
                <button
                  onClick={() => setCurrentPage(user?.role === 'admin' ? 'admin' : 'dashboard')}
                  className="glass-button px-3 py-1 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{user?.role === 'admin' ? 'Dashboard Admin' : 'Dashboard'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-user-info px-3 py-2 rounded-xl">
                <span className="text-sm text-white/90">
                  {user?.username} ({user?.role === 'admin' ? 'Amministratore' : 'Operatore'})
                </span>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="glass-button-admin px-3 py-1 rounded-xl text-white hover:scale-105 transition-all duration-300"
                >
                  Vista Operatore
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="glass-button p-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
                title={`Tema: ${isDefault ? 'Colorato' : isLight ? 'Chiaro' : 'Scuro'} (Click per cambiare)`}
              >
                {isDefault && <Palette className="w-5 h-5" />}
                {isLight && <Sun className="w-5 h-5" />}
                {isDark && <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={logout}
                className="glass-button p-2 rounded-xl text-white hover:scale-105 hover:text-red-300 transition-all duration-300"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Styles */}
        <style jsx>{`
          .glass-nav {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          }

          .glass-icon {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .glass-button {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .glass-button-admin {
            background: rgba(59, 130, 246, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(59, 130, 246, 0.3);
          }

          .glass-user-info {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.15);
          }

          .bg-gradient-radial {
            background: radial-gradient(circle, var(--tw-gradient-stops));
          }
        `}</style>
      </nav>
    </div>
  );
};

export const BackButton = ({ onClick, label = "← Torna al Dashboard" }) => {
  return (
    <button
      onClick={onClick}
      className="glass-back-button px-3 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label.replace('←', '').trim()}</span>
      
      <style jsx>{`
        .glass-back-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </button>
  );
};

export default Navigation;

