/// components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Download, 
  Settings, 
  Calendar,
  MapPin,
  Truck,
  UserCheck,
  AlertTriangle,
  Package2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import Navigation from '../shared/Navigation';
import { formatWeekRange } from '../../utils/formatters';

const Dashboard = () => {
  const { user, setCurrentPage } = useAuth();
  const { myGiacenze, myAssignments, selectedAssignment, setSelectedAssignment } = useGiacenze();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const giacenzeInScadenza = myGiacenze.filter(g => g.quantitaDisponibile <= g.quantitaMinima);
  const giacenzeOk = myGiacenze.filter(g => g.quantitaDisponibile > g.quantitaMinima);

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
      <Navigation title={user?.role === 'admin' ? 'Dashboard Operatore' : 'Giacenze Personali'} />

      <div className="relative z-10 w-full mx-auto pt-20 pb-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Lista Assegnazioni */}
        {myAssignments.length > 0 ? (
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Le Tue Assegnazioni</h2>
            <div className="space-y-3">
              {myAssignments.map(assignment => (
                <div 
                  key={assignment._id} 
                  className={`glass-assignment-card p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-102 ${
                    selectedAssignment?._id === assignment._id 
                      ? 'glass-assignment-selected' 
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-white">
                      <Calendar className="w-5 h-5 text-blue-300" />
                      <span className="font-medium">
                        {assignment.settimanaId ? formatWeekRange(assignment.settimanaId, assignment.settimanaFineId) : 'Settimana N/A'}
                      </span>
                      <MapPin className="w-5 h-5 text-green-300" />
                      <span>{assignment.poloId?.nome || 'N/A'}</span>
                      <Truck className="w-5 h-5 text-purple-300" />
                      <span>{assignment.mezzoId?.nome || 'N/A'}</span>
                    </div>
                    {selectedAssignment?._id === assignment._id && (
                      <span className="glass-selected-badge px-2 py-1 rounded-lg text-sm text-blue-200 font-medium">
                        Selezionata
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70 mt-3">
              Clicca su un'assegnazione per gestire le giacenze di quella settimana
            </p>
          </div>
        ) : (
          <div className="glass-warning-card p-4 rounded-2xl">
            <div className="flex items-center text-yellow-200">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>Nessuna assegnazione attiva. Contatta l'amministratore.</span>
            </div>
          </div>
        )}

        {/* Statistiche Giacenze */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-stat-card p-6 rounded-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="glass-stat-icon p-3 rounded-xl mr-4">
                <Package className="w-8 h-8 text-blue-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{myGiacenze.length}</div>
                <div className="text-sm text-white/70">Prodotti Assegnati</div>
              </div>
            </div>
          </div>

          <div className="glass-stat-card p-6 rounded-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="glass-stat-icon-success p-3 rounded-xl mr-4">
                <TrendingUp className="w-8 h-8 text-green-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-300">{giacenzeOk.length}</div>
                <div className="text-sm text-white/70">Giacenze OK</div>
              </div>
            </div>
          </div>

          <div className="glass-stat-card p-6 rounded-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="glass-stat-icon-danger p-3 rounded-xl mr-4">
                <TrendingDown className="w-8 h-8 text-red-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-300">{giacenzeInScadenza.length}</div>
                <div className="text-sm text-white/70">Sotto Soglia</div>
              </div>
            </div>
          </div>

          <div className="glass-stat-card p-6 rounded-2xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="glass-stat-icon-purple p-3 rounded-xl mr-4">
                <Calendar className="w-8 h-8 text-purple-300" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{myAssignments.length}</div>
                <div className="text-sm text-white/70">Settimane Assegnate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => setCurrentPage('giacenze')}
            className="glass-menu-card p-6 rounded-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="glass-menu-icon p-4 rounded-2xl mx-auto mb-4 w-fit">
              <Package2 className="w-12 h-12 text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Le Mie Giacenze</h3>
            <p className="text-sm text-white/70 mb-2">Scorte personali</p>
            <p className="text-xs text-white/50">{myGiacenze.length} prodotti assegnati</p>
          </button>

          <button
            onClick={() => setCurrentPage('utilizzi')}
            className="glass-menu-card p-6 rounded-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="glass-menu-icon p-4 rounded-2xl mx-auto mb-4 w-fit">
              <UserCheck className="w-12 h-12 text-green-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">I Miei Utilizzi</h3>
            <p className="text-sm text-white/70">Storico consumi</p>
          </button>

          <button
            onClick={() => setCurrentPage('reports')}
            className="glass-menu-card p-6 rounded-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="glass-menu-icon p-4 rounded-2xl mx-auto mb-4 w-fit">
              <Download className="w-12 h-12 text-purple-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Report</h3>
            <p className="text-sm text-white/70">Scarica Excel</p>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setCurrentPage('admin')}
              className="glass-menu-card p-6 rounded-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="glass-menu-icon p-4 rounded-2xl mx-auto mb-4 w-fit">
                <Settings className="w-12 h-12 text-red-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Amministrazione</h3>
              <p className="text-sm text-white/70">Gestisci sistema</p>
            </button>
          )}
        </div>

        {/* Alert Giacenze Sotto Soglia */}
        {giacenzeInScadenza.length > 0 && (
          <div className="glass-alert-card p-4 rounded-2xl">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-300 mr-2" />
              <h3 className="text-sm font-semibold text-red-200">
                {giacenzeInScadenza.length} prodotti sotto soglia minima
              </h3>
            </div>
            <div className="text-sm text-red-300">
              {giacenzeInScadenza.slice(0, 3).map(g => g.productId?.nome).join(', ')}
              {giacenzeInScadenza.length > 3 && ` e altri ${giacenzeInScadenza.length - 3}...`}
            </div>
          </div>
        )}
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

        .glass-assignment-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-assignment-selected {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
        }

        .glass-selected-badge {
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .glass-warning-card {
          background: rgba(251, 191, 36, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.1);
        }

        .glass-stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .glass-stat-icon {
          background: rgba(59, 130, 246, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .glass-stat-icon-success {
          background: rgba(34, 197, 94, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .glass-stat-icon-danger {
          background: rgba(239, 68, 68, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .glass-stat-icon-purple {
          background: rgba(147, 51, 234, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(147, 51, 234, 0.3);
        }

        .glass-menu-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .glass-menu-card:hover {
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .glass-menu-icon {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-alert-card {
          background: rgba(239, 68, 68, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 8px 32px rgba(239, 68, 68, 0.1);
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

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;


