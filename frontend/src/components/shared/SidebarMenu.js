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
      label: 'Dashboard Admin', 
      icon: '🏠',
      description: 'Panoramica generale del sistema admin',
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
      setCurrentPage('admin');
    } else {
      setCurrentPage(`admin-${sectionId}`);
    }
    setIsSidebarOpen(false); // Chiudi menu dopo la navigazione
  };

  // Chiudi menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.ios-speech-bubble')) {
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
      {/* iOS-style Menu */}
      <div 
        className="fixed top-[60px] left-4 z-[60] animate-menu-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Menu Container with Speech Bubble */}
        <div 
          className="ios-speech-bubble w-80 max-h-[90vh] overflow-hidden" 
          onClick={(e) => e.stopPropagation()}
        >
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
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>


          {/* Menu List */}
          <div className="ios-menu-list mb-4 max-h-[60vh] overflow-y-auto">
            {adminSections.map((section, index) => (
              <div key={section.id}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSectionClick(section.id);
                  }}
                  className="ios-menu-item group w-full"
                  type="button"
                  style={{ 
                    minHeight: '50px',
                    display: 'block',
                    position: 'relative',
                    zIndex: 100
                  }}
                >
                  <div className="flex items-center">
                    {/* Icon */}
                    <div className="ios-menu-icon mr-3">
                      <span className="text-xl">{section.icon}</span>
                    </div>
                    
                    {/* Label */}
                    <span className={`text-base font-normal ${
                      isLight ? 'text-black' : 'text-white'
                    }`}>
                      {section.label}
                    </span>
                  </div>
                </button>
                
                {/* Separator */}
                {index < adminSections.length - 1 && (
                  <div className={`ios-menu-separator ${
                    isLight ? 'border-gray-200' : 'border-white/10'
                  }`} />
                )}
              </div>
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
              type="button"
            >
              <Home className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-white/80'}`} />
              <span className={`${isLight ? 'text-gray-700' : 'text-white/90'}`}>
                Dashboard Principale
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Native Menu Styles */}
      <style jsx>{`
        /* iOS Speech Bubble */
        .ios-speech-bubble {
          background: ${isLight 
            ? 'rgba(255, 255, 255, 0.98)' 
            : isDark 
              ? 'rgba(40, 40, 42, 0.98)' 
              : 'rgba(30, 30, 40, 0.98)'
          };
          backdrop-filter: blur(50px) saturate(200%);
          -webkit-backdrop-filter: blur(50px) saturate(200%);
          box-shadow: ${isLight
            ? '0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)'
            : isDark
              ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)'
              : '0 20px 60px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)'
          };
          position: relative;
          z-index: 70;
          pointer-events: auto;
          border-radius: 24px;
          overflow: visible;
        }

        .ios-speech-bubble::before {
          content: '';
          position: absolute;
          top: -15px;
          left: 20px;
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-bottom: 15px solid ${isLight 
            ? 'rgba(255, 255, 255, 0.98)' 
            : isDark 
              ? 'rgba(40, 40, 42, 0.98)' 
              : 'rgba(30, 30, 40, 0.98)'
          };
          filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1));
          z-index: 72;
        }

        .ios-speech-bubble::after {
          content: '';
          position: absolute;
          top: -17px;
          left: 19px;
          width: 0;
          height: 0;
          border-left: 17px solid transparent;
          border-right: 17px solid transparent;
          border-bottom: 17px solid ${isLight 
            ? 'rgba(0, 0, 0, 0.08)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(255, 255, 255, 0.15)'
          };
          z-index: 71;
        }

        /* iOS Menu Header */
        .ios-menu-header {
          background: transparent;
          padding: 16px 20px 12px 20px;
          border-bottom: 1px solid ${isLight 
            ? 'rgba(0, 0, 0, 0.08)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(255, 255, 255, 0.1)'
          };
        }

        /* iOS Close Button */
        .ios-close-button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${isLight 
            ? 'rgba(120, 120, 128, 0.16)' 
            : isDark 
              ? 'rgba(120, 120, 128, 0.24)' 
              : 'rgba(255, 255, 255, 0.15)'
          };
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          color: ${isLight ? '#000' : '#fff'};
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .ios-close-button:hover {
          background: ${isLight 
            ? 'rgba(120, 120, 128, 0.24)' 
            : isDark 
              ? 'rgba(120, 120, 128, 0.32)' 
              : 'rgba(255, 255, 255, 0.2)'
          };
          transform: scale(1.05);
        }

        .ios-close-button:active {
          transform: scale(0.95);
        }

        /* iOS Menu List */
        .ios-menu-list {
          padding: 8px 0;
        }

        /* iOS Menu Items */
        .ios-menu-item {
          background: transparent;
          padding: 12px 20px;
          text-align: left;
          transition: all 0.15s ease-out;
          cursor: pointer !important;
          pointer-events: auto !important;
          z-index: 80;
          width: 100%;
        }

        .ios-menu-item:hover {
          background: ${isLight 
            ? 'rgba(120, 120, 128, 0.08)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.04)' 
              : 'rgba(255, 255, 255, 0.06)'
          } !important;
        }

        .ios-menu-item:active {
          background: ${isLight 
            ? 'rgba(120, 120, 128, 0.16)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(255, 255, 255, 0.1)'
          } !important;
          transform: scale(0.98);
        }

        /* iOS Menu Icon */
        .ios-menu-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: ${isLight 
            ? 'rgba(0, 0, 0, 0.8)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)'
          };
        }

        /* iOS Menu Separator */
        .ios-menu-separator {
          height: 1px;
          margin-left: 51px;
          border-bottom: 1px solid;
        }

        /* iOS Menu Footer */
        .ios-menu-footer {
          background: transparent;
          padding: 8px 0 0 0;
          border-top: 1px solid ${isLight 
            ? 'rgba(0, 0, 0, 0.08)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(255, 255, 255, 0.1)'
          };
        }

        /* iOS Footer Button */
        .ios-footer-button {
          background: transparent !important;
          border: none !important;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 400;
          text-align: left;
          width: 100%;
          transition: all 0.15s ease-out;
          cursor: pointer;
        }

        .ios-footer-button:hover {
          background: ${isLight 
            ? 'rgba(120, 120, 128, 0.08)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.04)' 
              : 'rgba(255, 255, 255, 0.06)'
          } !important;
        }

        .ios-footer-button:active {
          transform: scale(0.98);
          background: ${isLight 
            ? 'rgba(120, 120, 128, 0.16)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(255, 255, 255, 0.1)'
          } !important;
        }

        /* iOS Scrollbar */
        .ios-menu-list::-webkit-scrollbar {
          width: 6px;
        }

        .ios-menu-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .ios-menu-list::-webkit-scrollbar-thumb {
          background: ${isLight 
            ? 'rgba(0, 0, 0, 0.2)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.3)' 
              : 'rgba(255, 255, 255, 0.4)'
          };
          border-radius: 3px;
        }

        .ios-menu-list::-webkit-scrollbar-thumb:hover {
          background: ${isLight 
            ? 'rgba(0, 0, 0, 0.3)' 
            : isDark 
              ? 'rgba(255, 255, 255, 0.4)' 
              : 'rgba(255, 255, 255, 0.5)'
          };
        }

        /* iOS Menu Slide Down Animation */
        .animate-menu-slide-down {
          animation: menuSlideDown 0.2s ease-out;
        }

        .animate-menu-slide-down .ios-speech-bubble::before,
        .animate-menu-slide-down .ios-speech-bubble::after {
          animation: bubbleArrowSlide 0.2s ease-out;
        }

        @keyframes menuSlideDown {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-5px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bubbleArrowSlide {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.7) rotate(-5deg);
          }
          50% {
            opacity: 0.7;
            transform: translateY(-2px) scale(0.95) rotate(2deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        /* Backdrop fade animation */
        .animate-backdrop-fade {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .ios-menu-container {
            width: 280px;
          }
          
          .ios-menu-item {
            padding: 10px 16px;
          }
          
          .ios-footer-button {
            padding: 10px 16px;
          }
        }

        @media (max-width: 320px) {
          .ios-menu-container {
            width: 260px;
          }
          
          .animate-menu-slide-down {
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
};

export default SidebarMenu;