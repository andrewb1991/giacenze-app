// components/reports/ReportsPage.js
import React, { useEffect, useState } from 'react';
import { Download, ArrowLeft, FileText, Calendar, MapPin, Truck, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { BackButton } from '../shared/Navigation';
import { downloadExcelReport } from '../../services/api';
import { formatWeek, getCurrentWeekFromList, sortWeeksChronologically } from '../../utils/formatters';

const ReportsPage = () => {
  const { user, token, setCurrentPage, setError } = useAuth();
  const { settimane, poli, mezzi, users } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { reportFilters } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set default current week for reports (only on first load)
  useEffect(() => {
    if (settimane.length > 0 && reportFilters.settimanaId === undefined) {
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        updateReportFilters({ settimanaId: currentWeek._id });
      }
    }
  }, [settimane]);

  // Sort weeks chronologically for dropdown
  const sortedSettimane = sortWeeksChronologically(settimane);

  const updateReportFilters = (updates) => {
    dispatch({ type: 'SET_REPORT_FILTERS', payload: updates });
  };

  const handleDownloadReport = async () => {
    try {
      setError('');
      await downloadExcelReport(reportFilters, token);
      console.log('Report scaricato con successo');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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

      {/* Navigation */}
      <nav className="relative z-10 glass-nav border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="glass-button p-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="glass-icon p-3 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Report Giacenze</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="glass-icon p-3 rounded-xl">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Genera Report Excel</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Settimana
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={reportFilters.settimanaId}
                onChange={(e) => updateReportFilters({ settimanaId: e.target.value })}
              >
                <option value="" className="bg-gray-800">🌍 Tutte le settimane</option>
                {sortedSettimane.length > 0 ? (
                  sortedSettimane.map(settimana => (
                    <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                      {formatWeek(settimana)}
                    </option>
                  ))
                ) : (
                  <option disabled className="bg-gray-800">Caricamento settimane...</option>
                )}
              </select>
              {reportFilters.settimanaId && (
                <button
                  onClick={() => updateReportFilters({ settimanaId: '' })}
                  className="mt-2 text-xs text-blue-300 hover:text-blue-200 transition-colors"
                >
                  📅 Mostra tutte le settimane
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Polo
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={reportFilters.poloId}
                onChange={(e) => updateReportFilters({ poloId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti i poli</option>
                {poli.map(polo => (
                  <option key={polo._id} value={polo._id} className="bg-gray-800">
                    {polo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Mezzo
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={reportFilters.mezzoId}
                onChange={(e) => updateReportFilters({ mezzoId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti i mezzi</option>
                {mezzi.map(mezzo => (
                  <option key={mezzo._id} value={mezzo._id} className="bg-gray-800">
                    {mezzo.nome}
                  </option>
                ))}
              </select>
            </div>

            {user.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Utente
                </label>
                <select
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={reportFilters.userId}
                  onChange={(e) => updateReportFilters({ userId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Tutti gli utenti</option>
                  {users.filter(u => u.role === 'user').map(user => (
                    <option key={user._id} value={user._id} className="bg-gray-800">
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={handleDownloadReport}
              className="glass-button-success px-6 py-3 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 flex items-center mx-auto space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Scarica Report Excel</span>
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
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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

        .glass-button-success {
          background: rgba(34, 197, 94, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.3);
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
      `}</style>
    </div>
  );
};

export default ReportsPage;