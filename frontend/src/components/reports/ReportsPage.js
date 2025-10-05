// components/reports/ReportsPage.js
import React, { useEffect, useState } from 'react';
import { Download, FileText, Calendar, MapPin, Truck, User, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import Navigation from '../shared/Navigation';
import { downloadExcelReport } from '../../services/api';
import { formatWeek, getCurrentWeekFromList, sortWeeksChronologically, sortWeeksCenteredOnCurrent } from '../../utils/formatters';

const ReportsPage = () => {
  const { user, token, setCurrentPage, setError } = useAuth();
  const { settimane, poli, mezzi, users, postazioni } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { reportFilters } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showAllWeeks, setShowAllWeeks] = useState(true);

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set default current week for reports when showAllWeeks is false
  useEffect(() => {
    if (settimane.length > 0 && !showAllWeeks && (!reportFilters.settimanaId || reportFilters.settimanaId === '')) {
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        updateReportFilters({ settimanaId: currentWeek._id });
      }
    }
  }, [settimane, showAllWeeks]);

  // Handle showAllWeeks toggle
  useEffect(() => {
    if (showAllWeeks) {
      // When showing all weeks, clear the week filter
      updateReportFilters({ settimanaId: '' });
    } else {
      // When not showing all weeks, set current week as default
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        updateReportFilters({ settimanaId: currentWeek._id });
      }
    }
  }, [showAllWeeks, settimane]);

  // Sort weeks centered on current week for dropdown
  const sortedSettimane = React.useMemo(() => {
    if (!settimane.length) return [];
    return sortWeeksCenteredOnCurrent(settimane);
  }, [settimane]);

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
      <Navigation title="Report Giacenze" />

      <div className="relative z-10 w-full mx-auto pt-20 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="glass-icon p-3 rounded-xl">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Genera Report Excel</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Settimana
              </label>
              
              {/* Dropdown settimane */}
              <select
                className={`glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50 ${
                  showAllWeeks ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={showAllWeeks}
                value={showAllWeeks ? '' : reportFilters.settimanaId}
                onChange={(e) => updateReportFilters({ settimanaId: e.target.value })}
              >
                {showAllWeeks ? (
                  <option value="" className="bg-gray-800">🌍 Tutte le settimane selezionate</option>
                ) : (
                  <>
                    {sortedSettimane.length > 0 ? (
                      sortedSettimane.map((settimana) => {
                        const currentWeek = getCurrentWeekFromList(settimane);
                        const isCurrentWeek = currentWeek && settimana._id === currentWeek._id;
                        return (
                          <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                            {isCurrentWeek ? '📅 ' : ''}{formatWeek(settimana)}{isCurrentWeek ? ' (Corrente)' : ''}
                          </option>
                        );
                      })
                    ) : (
                      <option disabled className="bg-gray-800">Caricamento settimane...</option>
                    )}
                  </>
                )}
              </select>

              {/* Checkbox "Tutte le settimane" */}
              <div className="mt-3">
                <label className="glass-checkbox-container flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllWeeks}
                    onChange={(e) => setShowAllWeeks(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`glass-checkbox w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                    showAllWeeks 
                      ? 'border-blue-400 bg-blue-400/20' 
                      : 'border-white/30 bg-transparent'
                  }`}>
                    {showAllWeeks && (
                      <svg className="w-3 h-3 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="ml-2 text-sm text-white/80">🌍 Tutte le settimane</span>
                </label>
              </div>
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

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Postazione
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={reportFilters.postazioneId}
                onChange={(e) => updateReportFilters({ postazioneId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutte le postazioni</option>
                {postazioni.map(postazione => (
                  <option key={postazione._id} value={postazione._id} className="bg-gray-800">
                    {postazione.nome}
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