// components/admin/AdminPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppContext } from '../../contexts/AppContext';
import Navigation from '../shared/Navigation';
import UserGiacenzeView from './UserGiacenzeView';
import GiacenzeManagement from './GiacenzeManagement';
import AssignmentsManagement from './AssigmentsManagement';
import PostazioniManagement from './PostazioniManagement';
import AdminStats from './AdminStats';
import UtilizziManagement from './UtilizziManagement';
import OperatoriManagement from './OperatoriManagement';
import ProdottiManagement from './ProdottiManagement';
import ReportsPage from '../reports/ReportsPage';
import OrdiniManagement from './OrdiniManagement';

const AdminPage = () => {
  const { setCurrentPage } = useAuth();
  const { state, dispatch } = useAppContext();
  const { adminView, activeTab } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const setActiveTab = (tab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const tabs = [
    { id: 'giacenze', label: 'Gestione Giacenze', icon: '📦' },
    { id: 'assegnazioni', label: 'Assegnazioni', icon: '📋' },
    { id: 'utilizzi', label: 'Gestione Utilizzi', icon: '📊' },
    { id: 'operatori', label: 'Gestione Operatori', icon: '👥' },
    { id: 'postazioni', label: 'Gestione Postazioni', icon: '🏢' },
    { id: 'prodotti', label: 'Gestione Prodotti', icon: '🏷️' },
    {id: 'reports', label: 'Genera Report', icon:'📑'},
    {id: 'ordini', label: 'Gestione Ordini', icon:'📑'}

  ];

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Background Effects */}
        <div className="absolute inset-0">
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

        <div className="relative z-10">
          <Navigation title="Amministrazione Giacenze" fixed="true"/>

          <div className="w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
            {adminView === 'user-giacenze' ? (
              <UserGiacenzeView />
            ) : (
              <>
                {/* Tab Navigation Glass */}
                <div className="glass-nav-container mb-8 p-2 rounded-3xl overflow-x-auto">
                  <nav className="flex space-x-2 min-w-max">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`glass-tab px-6 py-4 rounded-2xl font-medium text-sm whitespace-nowrap transition-all duration-300 hover:scale-105 ${
                          activeTab === tab.id
                            ? 'glass-tab-active text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="mr-2 text-lg">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'giacenze' && <GiacenzeManagement />}
                  {activeTab === 'assegnazioni' && <AssignmentsManagement />}
                  {activeTab === 'utilizzi' && <UtilizziManagement />}
                  {activeTab === 'operatori' && <OperatoriManagement />}
                  {activeTab === 'prodotti' && <ProdottiManagement />}
                  {activeTab === 'postazioni' && <PostazioniManagement />}
                  {activeTab === 'reports' && <ReportsPage/>}
                  {activeTab === 'ordini' && <OrdiniManagement/>}


                  {/* Statistiche Admin */}
                  <AdminStats />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-nav-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .glass-tab {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-tab:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
        }

        .glass-tab-active {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
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

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        /* Smooth transitions */
        * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default AdminPage;