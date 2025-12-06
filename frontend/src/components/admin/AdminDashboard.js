// components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navigation from '../shared/Navigation';
import { Grid, List } from 'lucide-react';

const AdminDashboard = () => {
  const { setCurrentPage } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const adminSections = [
    { 
      id: 'giacenze', 
      label: 'Gestione Giacenze', 
      icon: '📦',
      description: 'Gestisci giacenze, assegnazioni e scorte dei prodotti',
      color: 'from-blue-400 to-purple-600'
    },
    { 
      id: 'assegnazioni', 
      label: 'Assegnazioni', 
      icon: '📋',
      description: 'Assegna operatori a poli e mezzi per settimane specifiche',
      color: 'from-green-400 to-blue-600'
    },
    { 
      id: 'utilizzi', 
      label: 'Gestione Utilizzi', 
      icon: '📊',
      description: 'Monitora e gestisci gli utilizzi dei prodotti',
      color: 'from-yellow-400 to-orange-600'
    },
    { 
      id: 'operatori', 
      label: 'Gestione Operatori', 
      icon: '👥',
      description: 'Gestisci utenti operatori e loro permessi',
      color: 'from-purple-400 to-pink-600'
    },
    { 
      id: 'prodotti', 
      label: 'Gestione Prodotti', 
      icon: '🏷️',
      description: 'Crea e modifica prodotti, categorie e specifiche',
      color: 'from-teal-400 to-cyan-600'
    },
    { 
      id: 'postazioni', 
      label: 'Gestione Postazioni', 
      icon: '🏢',
      description: 'Gestisci Clienti, mezzi e postazioni di lavoro',
      color: 'from-red-400 to-pink-600'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: '📈',
      description: 'Genera e visualizza report dettagliati',
      color: 'from-indigo-400 to-purple-600'
    },
    {
      id: 'ordini',
      label: 'Gestione Ordini',
      icon: '🛒',
      description: 'Gestisci ordini e rifornimenti',
      color: 'from-emerald-400 to-teal-600'
    },
    {
      id: 'clienti',
      label: 'Gestione Clienti',
      icon: '👔',
      description: 'Gestisci anagrafica clienti e informazioni di contatto',
      color: 'from-amber-400 to-orange-600'
    }
  ];

  const handleSectionClick = (sectionId) => {
    setCurrentPage(`admin-${sectionId}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div
          className="absolute w-96 h-96 bg-gradient-radial from-white/20 to-transparent rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Navigation */}
      <Navigation title="Dashboard Amministratore" />

      <div className="relative z-10 w-full mx-auto pt-20 pb-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="glass-card p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-white mb-1">
                🛠️ Pannello di Amministrazione
              </h1>
              <p className="text-white/70 text-sm">
                Seleziona una sezione per iniziare a gestire il sistema
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 glass-card p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-blue-500/30 text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
                title="Vista a griglia"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-500/30 text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
                title="Vista a elenco"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Admin Sections Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adminSections.map((section) => (
              <div
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className="glass-card p-6 rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 group"
              >
                {/* Icon and Gradient */}
                <div className="relative mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {section.icon}
                  </div>
                  <div className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300`}></div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                  {section.label}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                  {section.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center text-white/50 group-hover:text-white/80 transition-colors duration-300">
                  <span className="text-sm font-medium">Accedi</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {adminSections.map((section) => (
              <div
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className="glass-card p-4 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon and Gradient */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
                      {section.icon}
                    </div>
                    <div className={`absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-r ${section.color} opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300`}></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-200 transition-colors duration-300">
                      {section.label}
                    </h3>
                    <p className="text-white/70 text-xs leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                      {section.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center text-white/50 group-hover:text-white/80 transition-colors duration-300 flex-shrink-0">
                    <span className="text-xs font-medium mr-1">Accedi</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats Section */}
        <div className="glass-card p-6 rounded-2xl mt-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Accesso Rapido</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleSectionClick('giacenze')}
              className="glass-button p-4 rounded-xl text-white hover:scale-105 transition-all duration-300"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm">Giacenze</div>
            </button>
            <button
              onClick={() => handleSectionClick('assegnazioni')}
              className="glass-button p-4 rounded-xl text-white hover:scale-105 transition-all duration-300"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm">Assegnazioni</div>
            </button>
            <button
              onClick={() => handleSectionClick('utilizzi')}
              className="glass-button p-4 rounded-xl text-white hover:scale-105 transition-all duration-300"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm">Utilizzi</div>
            </button>
            <button
              onClick={() => handleSectionClick('reports')}
              className="glass-button p-4 rounded-xl text-white hover:scale-105 transition-all duration-300"
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm">Reports</div>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
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
      `}</style>
    </div>
  );
};

export default AdminDashboard;