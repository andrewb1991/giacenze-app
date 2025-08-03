// components/shared/SidebarMenu.js
import React, { useEffect } from 'react';
import { X, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSidebar } from './Navigation';

const SidebarMenu = () => {
  const { setCurrentPage } = useAuth();
  const { currentTheme, isDark, isLight } = useTheme();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const adminSections = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '🏠',
      description: 'Panoramica generale del sistema',
      color: 'from-gray-400 to-gray-600'
    },
    { 
      id: 'giacenze', 
      label: 'Gestione Giacenze', 
      icon: '📦',
      description: 'Gestisci giacenze, assegnazioni e scorte',
      color: 'from-blue-400 to-purple-600'
    },
    { 
      id: 'assegnazioni', 
      label: 'Assegnazioni', 
      icon: '📋',
      description: 'Assegna operatori a poli e mezzi',
      color: 'from-green-400 to-blue-600'
    },
    { 
      id: 'utilizzi', 
      label: 'Gestione Utilizzi', 
      icon: '📊',
      description: 'Monitora utilizzi dei prodotti',
      color: 'from-yellow-400 to-orange-600'
    },
    { 
      id: 'operatori', 
      label: 'Gestione Operatori', 
      icon: '👥',
      description: 'Gestisci utenti e permessi',
      color: 'from-purple-400 to-pink-600'
    },
    { 
      id: 'prodotti', 
      label: 'Gestione Prodotti', 
      icon: '🏷️',
      description: 'Crea e modifica prodotti',
      color: 'from-teal-400 to-cyan-600'
    },
    { 
      id: 'postazioni', 
      label: 'Gestione Postazioni', 
      icon: '🏢',
      description: 'Gestisci poli, mezzi e postazioni',
      color: 'from-red-400 to-pink-600'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: '📈',
      description: 'Genera report dettagliati',
      color: 'from-indigo-400 to-purple-600'
    },
    { 
      id: 'ordini', 
      label: 'Gestione Ordini', 
      icon: '🛒',
      description: 'Gestisci ordini e rifornimenti',
      color: 'from-emerald-400 to-teal-600'
    }
  ];

  const handleSectionClick = (sectionId) => {
    if (sectionId === 'dashboard') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage(`admin-${sectionId}`);
    }
    setIsSidebarOpen(false); // Chiudi menu dopo la navigazione
  };

  // Chiudi menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar-menu')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, setIsSidebarOpen]);

  // Non renderizzare nulla se il sidebar è chiuso
  if (!isSidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 transition-all duration-300"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* iOS-style Menu */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 p-6 animate-menu-appear"
      >
        {/* iOS Menu Container */}
        <div className="ios-menu-container max-w-sm w-full max-h-[80vh] overflow-hidden">
          {/* Header Card */}
          <div className="ios-menu-header mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-semibold ${isLight ? 'text-black' : 'text-white'}`}>
                  Menu Admin
                </h2>
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-white/70'}`}>
                  Navigazione rapida
                </p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="ios-close-button"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="ios-menu-grid grid grid-cols-2 gap-3 mb-4 max-h-[60vh] overflow-y-auto">
            {adminSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className="ios-menu-tile group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon Circle */}
                  <div className={`ios-app-icon bg-gradient-to-br ${section.color} mb-2`}>
                    <span className="text-2xl">{section.icon}</span>
                  </div>
                  
                  {/* Label */}
                  <h3 className={`text-xs font-medium leading-tight ${
                    isLight ? 'text-black' : 'text-white'
                  }`}>
                    {section.label}
                  </h3>
                </div>
              </button>
            ))}
          </div>

          {/* Footer Action */}
          <div className="ios-menu-footer">
            <button
              onClick={() => {
                setCurrentPage('dashboard');
                setIsSidebarOpen(false);
              }}
              className="ios-footer-button group w-full"
            >
              <Home className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-white/80'}`} />
              <span className={`${isLight ? 'text-gray-700' : 'text-white/90'}`}>
                Dashboard Principale
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Apple Liquid Glass Styles */}
      <style jsx>{`
        /* Apple-inspired liquid glass toggle button */
        .apple-glass-button {
          background: ${isLight 
            ? 'rgba(255, 255, 255, 0.8)' 
            : isDark 
              ? 'rgba(30, 30, 30, 0.8)' 
              : 'rgba(255, 255, 255, 0.1)'
          };
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid ${isLight 
            ? 'rgba(255, 255, 255, 0.9)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.2)'
          };
          border-radius: 1.5rem; /* 24px - più stondato */
          box-shadow: ${isLight
            ? '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            : isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          };
        }

        .apple-glass-button:hover {
          background: ${isLight 
            ? 'rgba(255, 255, 255, 0.9)' 
            : isDark 
              ? 'rgba(45, 45, 45, 0.9)' 
              : 'rgba(255, 255, 255, 0.15)'
          };
          border: 1px solid ${isLight 
            ? 'rgba(255, 255, 255, 1)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'rgba(255, 255, 255, 0.3)'
          };
          transform: scale(1.05) translateY(-1px);
        }

        /* Apple-inspired liquid glass sidebar */
        .apple-glass-sidebar {
          background: ${isLight 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)' 
            : isDark 
              ? 'linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)' 
              : 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(40, 40, 70, 0.95) 100%)'
          };
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border-top-right-radius: 2rem; /* 32px - bordi stondati solo a destra */
          border-bottom-right-radius: 2rem;
          border-right: 1px solid ${isLight 
            ? 'rgba(0, 0, 0, 0.08)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(255, 255, 255, 0.1)'
          };
          box-shadow: ${isLight
            ? '20px 0 60px rgba(0, 0, 0, 0.08), inset -1px 0 0 rgba(255, 255, 255, 0.9)'
            : isDark
              ? '20px 0 60px rgba(0, 0, 0, 0.6), inset -1px 0 0 rgba(255, 255, 255, 0.05)'
              : '20px 0 60px rgba(0, 0, 0, 0.3), inset -1px 0 0 rgba(255, 255, 255, 0.1)'
          };
        }

        /* Apple-inspired liquid glass menu items */
        .apple-glass-menu-item {
          background: ${isLight 
            ? 'rgba(255, 255, 255, 0.6)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.03)' 
              : 'rgba(255, 255, 255, 0.05)'
          };
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid ${isLight 
            ? 'rgba(0, 0, 0, 0.06)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(255, 255, 255, 0.1)'
          };
          border-radius: 1.5rem; /* 24px - più stondato */
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: ${isLight
            ? '0 4px 20px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            : isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          };
        }

        .apple-glass-menu-item:hover {
          background: ${isLight 
            ? 'rgba(255, 255, 255, 0.8)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.06)' 
              : 'rgba(255, 255, 255, 0.1)'
          };
          border: 1px solid ${isLight 
            ? 'rgba(59, 130, 246, 0.2)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(255, 255, 255, 0.2)'
          };
          transform: translateX(6px) scale(1.02);
          box-shadow: ${isLight
            ? '0 12px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)'
            : isDark
              ? '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              : '0 12px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          };
        }

        .apple-glass-menu-item:active {
          transform: translateX(4px) scale(0.98);
          transition: all 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Apple-style scrollbar */
        .sidebar-menu::-webkit-scrollbar {
          width: 8px;
        }

        .sidebar-menu::-webkit-scrollbar-track {
          background: ${isLight 
            ? 'rgba(0, 0, 0, 0.05)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(255, 255, 255, 0.1)'
          };
          border-radius: 4px;
          margin: 8px 0;
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
          background: ${isLight 
            ? 'rgba(0, 0, 0, 0.2)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'rgba(255, 255, 255, 0.3)'
          };
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: content-box;
        }

        .sidebar-menu::-webkit-scrollbar-thumb:hover {
          background: ${isLight 
            ? 'rgba(0, 0, 0, 0.3)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.3)' 
              : 'rgba(255, 255, 255, 0.5)'
          };
          background-clip: content-box;
        }

        /* Smooth appearance animation */
        .animate-slide-in {
          animation: slideInLiquid 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes slideInLiquid {
          from {
            transform: translateX(-100%) scale(0.98);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default SidebarMenu;