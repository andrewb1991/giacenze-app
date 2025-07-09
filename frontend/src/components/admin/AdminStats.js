// // components/admin/AdminStats.js
// import React from 'react';
// import { useGiacenze } from '../../hooks/useGiacenze';

// const AdminStats = () => {
//   const { users, allProducts, allGiacenze, assegnazioni } = useGiacenze();

//   const operatorsCount = users.filter(u => u.role === 'user').length;
//   const criticalGiacenzeCount = allGiacenze.filter(g => g.quantitaDisponibile <= g.quantitaMinima).length;

//   return (
//     <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <div className="text-2xl font-bold text-blue-600">{operatorsCount}</div>
//         <div className="text-sm text-gray-600">Operatori</div>
//       </div>
//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <div className="text-2xl font-bold text-green-600">{allProducts.length}</div>
//         <div className="text-sm text-gray-600">Prodotti</div>
//       </div>
//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <div className="text-2xl font-bold text-purple-600">{allGiacenze.length}</div>
//         <div className="text-sm text-gray-600">Giacenze Assegnate</div>
//       </div>
//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <div className="text-2xl font-bold text-red-600">{criticalGiacenzeCount}</div>
//         <div className="text-sm text-gray-600">Sotto Soglia</div>
//       </div>
//       <div className="bg-white p-4 rounded-lg shadow-md">
//         <div className="text-2xl font-bold text-yellow-600">{assegnazioni.length}</div>
//         <div className="text-sm text-gray-600">Assegnazioni</div>
//       </div>
//     </div>
//   );
// };

// export default AdminStats;

// components/admin/AdminStats.js
import React from 'react';
import { Users, Package, AlertTriangle, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { useGiacenze } from '../../hooks/useGiacenze';

const AdminStats = () => {
  const { users, allProducts, allGiacenze, assegnazioni } = useGiacenze();

  const operatorsCount = users.filter(u => u.role === 'user').length;
  const criticalGiacenzeCount = allGiacenze.filter(g => g.quantitaDisponibile <= g.quantitaMinima).length;
  const totalGiacenzeValue = allGiacenze.reduce((sum, g) => sum + g.quantitaDisponibile, 0);
  const averagePerOperator = operatorsCount > 0 ? (allGiacenze.length / operatorsCount).toFixed(1) : '0';

  const stats = [
    {
      id: 'operators',
      title: 'Operatori Attivi',
      value: operatorsCount,
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30',
      subtitle: 'utenti registrati',
      trend: operatorsCount > 0 ? '+' : '='
    },
    {
      id: 'products',
      title: 'Prodotti Catalogo',
      value: allProducts.length,
      icon: Package,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/30',
      subtitle: 'nel sistema',
      trend: allProducts.length > 0 ? '+' : '='
    },
    {
      id: 'giacenze',
      title: 'Giacenze Totali',
      value: allGiacenze.length,
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30',
      subtitle: 'assegnazioni attive',
      trend: allGiacenze.length > 0 ? '+' : '='
    },
    {
      id: 'critical',
      title: 'Stato Critico',
      value: criticalGiacenzeCount,
      icon: AlertTriangle,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-400/30',
      subtitle: 'sotto soglia minima',
      trend: criticalGiacenzeCount > 0 ? '⚠' : '✓'
    },
    {
      id: 'assignments',
      title: 'Settimane Programmate',
      value: assegnazioni.length,
      icon: Activity,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-400/30',
      subtitle: 'assegnazioni attive',
      trend: assegnazioni.length > 0 ? '+' : '='
    }
  ];

  const healthScore = allGiacenze.length > 0 
    ? Math.round(((allGiacenze.length - criticalGiacenzeCount) / allGiacenze.length) * 100)
    : 100;

  return (
    <>
      <div className="glass-stats-container">
        {/* Header */}
        <div className="glass-stats-header mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="glass-icon-large p-4 rounded-2xl mr-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Dashboard Statistiche</h3>
              <p className="text-white/70">Panoramica completa del sistema di gestione giacenze</p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className={`glass-stat-card group hover:scale-105 transition-all duration-500 p-6 rounded-2xl border ${stat.borderColor} ${stat.bgColor} relative overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon & Trend */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`glass-stat-icon p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`glass-trend-badge px-2 py-1 rounded-full text-xs font-bold ${
                    stat.trend === '+' ? 'text-green-400' :
                    stat.trend === '⚠' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {stat.trend}
                  </div>
                </div>
                
                {/* Value */}
                <div className="mb-3">
                  <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/60">{stat.subtitle}</div>
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-white/90 mb-3">{stat.title}</h4>
                
                {/* Progress Indicator */}
                <div className="glass-progress-container">
                  <div className="glass-progress-bar h-1 rounded-full overflow-hidden">
                    <div 
                      className={`glass-progress-fill h-full rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000 delay-300`}
                      style={{ 
                        width: `${Math.min((stat.value / (Math.max(...stats.map(s => s.value)) || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-3 text-xs">
                  {stat.id === 'critical' && (
                    <span className={stat.value > 0 ? 'text-red-300' : 'text-green-300'}>
                      {stat.value > 0 ? '🔴 Richiede attenzione' : '🟢 Tutto sotto controllo'}
                    </span>
                  )}
                  {stat.id === 'operators' && (
                    <span className="text-blue-300">👥 Team operativo</span>
                  )}
                  {stat.id === 'products' && (
                    <span className="text-green-300">📦 Inventario disponibile</span>
                  )}
                  {stat.id === 'giacenze' && (
                    <span className="text-purple-300">📋 Risorse distribuite</span>
                  )}
                  {stat.id === 'assignments' && (
                    <span className="text-yellow-300">📅 Pianificazione attiva</span>
                  )}
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Health */}
          <div className="glass-analytics-card p-6 rounded-2xl">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              System Health
            </h4>
            
            <div className="space-y-4">
              {/* Health Score */}
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  healthScore >= 90 ? 'text-green-400' :
                  healthScore >= 70 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {healthScore}%
                </div>
                <p className="text-white/70 text-sm">Punteggio di salute generale</p>
              </div>

              {/* Health Bar */}
              <div className="glass-health-container p-4 rounded-xl">
                <div className="flex justify-between text-xs text-white/60 mb-2">
                  <span>Giacenze OK</span>
                  <span>{allGiacenze.length - criticalGiacenzeCount}/{allGiacenze.length}</span>
                </div>
                <div className="glass-progress-bar h-3 rounded-full overflow-hidden">
                  <div 
                    className={`glass-health-fill h-full rounded-full transition-all duration-1000 ${
                      healthScore >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      healthScore >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${healthScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Messages */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Status generale:</span>
                  <span className={`glass-mini-badge px-2 py-1 rounded-full text-xs font-medium ${
                    healthScore >= 90 ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                    healthScore >= 70 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                    'bg-red-500/20 text-red-300 border border-red-400/30'
                  }`}>
                    {healthScore >= 90 ? '🟢 Ottimale' : 
                     healthScore >= 70 ? '🟡 Buono' : '🔴 Critico'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="glass-analytics-card p-6 rounded-2xl">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              Metriche Chiave
            </h4>
            
            <div className="space-y-4">
              <div className="glass-metric-item p-3 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70 text-sm">Media giacenze/operatore</span>
                  <span className="text-white font-semibold">{averagePerOperator}</span>
                </div>
                <div className="glass-mini-progress-bar h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(parseFloat(averagePerOperator) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="glass-metric-item p-3 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70 text-sm">Tasso utilizzo prodotti</span>
                  <span className="text-white font-semibold">
                    {allProducts.length > 0 ? ((allGiacenze.length / allProducts.length) * 100).toFixed(0) : '0'}%
                  </span>
                </div>
                <div className="glass-mini-progress-bar h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-700"
                    style={{ 
                      width: `${allProducts.length > 0 ? (allGiacenze.length / allProducts.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="glass-metric-item p-3 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70 text-sm">Valore totale giacenze</span>
                  <span className="text-white font-semibold">{totalGiacenzeValue}</span>
                </div>
                <div className="glass-mini-progress-bar h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(totalGiacenzeValue / 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-analytics-card p-6 rounded-2xl">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              Azioni Rapide
            </h4>
            
            <div className="space-y-3">
              <div className="glass-action-item p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">Crea Assegnazione</div>
                    <div className="text-white/60 text-xs">Nuova settimana operativa</div>
                  </div>
                  <div className="text-blue-400">→</div>
                </div>
              </div>

              <div className="glass-action-item p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">Aggiungi Prodotto</div>
                    <div className="text-white/60 text-xs">Espandi catalogo</div>
                  </div>
                  <div className="text-green-400">→</div>
                </div>
              </div>

              <div className="glass-action-item p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">Risolvi Critici</div>
                    <div className="text-white/60 text-xs">Gestisci giacenze basse</div>
                  </div>
                  <div className="text-red-400">→</div>
                </div>
              </div>

              <div className="glass-action-item p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">Report Excel</div>
                    <div className="text-white/60 text-xs">Esporta dati</div>
                  </div>
                  <div className="text-yellow-400">→</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-stats-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
          border-radius: 1.5rem;
          padding: 2rem;
        }

        .glass-stats-header {
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 2rem;
        }

        .glass-icon-large {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-stat-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .glass-stat-card:hover {
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .glass-stat-icon {
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .glass-trend-badge {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
        }

        .glass-analytics-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .glass-progress-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          border-radius: 0.5rem;
          padding: 1px;
        }

        .glass-progress-bar {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
        }

        .glass-progress-fill {
          backdrop-filter: blur(5px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .glass-health-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-health-fill {
          backdrop-filter: blur(5px);
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .glass-mini-badge {
          backdrop-filter: blur(10px);
        }

        .glass-metric-item {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-mini-progress-bar {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
        }

        .glass-action-item {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Animations */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          50% {
            box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
          }
        }

        .glass-stat-card:hover {
          animation: pulse-glow 2s infinite;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .glass-stat-card {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .glass-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .glass-stat-card:nth-child(2) { animation-delay: 0.2s; }
        .glass-stat-card:nth-child(3) { animation-delay: 0.3s; }
        .glass-stat-card:nth-child(4) { animation-delay: 0.4s; }
        .glass-stat-card:nth-child(5) { animation-delay: 0.5s; }

        /* Responsive */
        @media (max-width: 768px) {
          .glass-stats-container {
            padding: 1rem;
          }
          
          .glass-stat-card {
            padding: 1rem;
          }
          
          .glass-analytics-card {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default AdminStats;