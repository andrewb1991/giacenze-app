// // components/utilizzi/UtilizziPage.js
// import React, { useState, useEffect } from 'react';
// import { AlertTriangle } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';
// import { useGiacenze } from '../../hooks/useGiacenze';
// import { BackButton } from '../shared/Navigation';
// import { formatWeek } from '../../utils/formatters';

// const UtilizziPage = () => {
//   const { setCurrentPage } = useAuth();
//   const { myAssignments, myUtilizzi, selectedAssignment, loadUtilizzi } = useGiacenze();
//   const [selectedWeek, setSelectedWeek] = useState('');
//   const [debugData, setDebugData] = useState(null);

//   useEffect(() => {
//     if (!selectedWeek && selectedAssignment?._id) {
//       setSelectedWeek(selectedAssignment._id);
//     }
//   }, [selectedAssignment, selectedWeek]);

//   useEffect(() => {
//     if (selectedWeek) {
//       loadUtilizzi(selectedWeek);
//     }
//   }, [selectedWeek]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <BackButton onClick={() => setCurrentPage('dashboard')} />
//               <h1 className="text-xl font-semibold text-gray-800">I Miei Utilizzi</h1>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//         {/* Selettore settimana */}
//         {myAssignments.length > 0 && (
//           <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Seleziona Settimana
//             </label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               value={selectedWeek}
//               onChange={(e) => setSelectedWeek(e.target.value)}
//             >
//               <option value="">Seleziona una settimana</option>
//               {myAssignments.map(assignment => (
//                 <option key={assignment._id} value={assignment._id}>
//                   {formatWeek(assignment.settimanaId)} - {assignment.poloId?.nome} - {assignment.mezzoId?.nome}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* Tabella o fallback */}
//         {selectedWeek && myUtilizzi.length > 0 ? (
//           <div className="bg-white rounded-lg shadow-md overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantità Usata</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rimasta</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Ora</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {myUtilizzi.map(utilizzo => (
//                   <tr key={utilizzo._id}>
//                     <td className="px-6 py-4">
//                       <div className="text-sm font-medium text-gray-900">
//                         {utilizzo.productId?.nome || 'N/D'}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {utilizzo.productId?.categoria || ''}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-red-600 font-medium">
//                       -{utilizzo.quantitaUtilizzata} {utilizzo.productId?.unita}
//                     </td>
//                     <td className="px-6 py-4">{utilizzo.quantitaPrimaDellUso ?? 'N/A'}</td>
//                     <td className="px-6 py-4">{utilizzo.quantitaRimasta ?? 'N/A'}</td>
//                     <td className="px-6 py-4">
//                       <div>{new Date(utilizzo.dataUtilizzo).toLocaleDateString('it-IT')}</div>
//                       <div className="text-sm text-gray-500">
//                         {new Date(utilizzo.dataUtilizzo).toLocaleTimeString('it-IT')}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : selectedWeek ? (
//           <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
//             <AlertTriangle className="w-5 h-5 inline mr-2" />
//             Nessun utilizzo registrato per questa settimana.
//           </div>
//         ) : (
//           <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
//             <AlertTriangle className="w-5 h-5 inline mr-2" />
//             Seleziona una settimana per visualizzare gli utilizzi.
//           </div>
//         )}

//         {/* 🔍 DEBUG VIEW (solo dev) */}
//         {debugData && (
//           <pre className="mt-6 text-xs bg-gray-100 p-4 rounded overflow-auto">
//             {JSON.stringify(debugData, null, 2)}
//           </pre>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UtilizziPage;

// components/utilizzi/UtilizziPage.js
import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, FileText, Calendar, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { BackButton } from '../shared/Navigation';
import { formatWeek } from '../../utils/formatters';

const UtilizziPage = () => {
  const { setCurrentPage } = useAuth();
  const { myAssignments, myUtilizzi, selectedAssignment, loadUtilizzi } = useGiacenze();
  const [selectedWeek, setSelectedWeek] = useState('');
  const [debugData, setDebugData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!selectedWeek && selectedAssignment?._id) {
      setSelectedWeek(selectedAssignment._id);
    }
  }, [selectedAssignment, selectedWeek]);

  useEffect(() => {
    if (selectedWeek) {
      loadUtilizzi(selectedWeek);
    }
  }, [selectedWeek]);

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
              <h1 className="text-xl font-semibold text-white">I Miei Utilizzi</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Selettore settimana */}
        {myAssignments.length > 0 && (
          <div className="glass-card p-6 rounded-2xl">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Seleziona Settimana
            </label>
            <select
              className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="" className="bg-gray-800">Seleziona una settimana</option>
              {myAssignments.map(assignment => (
                <option key={assignment._id} value={assignment._id} className="bg-gray-800">
                  {formatWeek(assignment.settimanaId)} - {assignment.poloId?.nome} - {assignment.mezzoId?.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabella o fallback */}
        {selectedWeek && myUtilizzi.length > 0 ? (
          <div className="glass-card-large rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="glass-table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Prodotto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Quantità Usata</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Prima</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Rimasta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Data/Ora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {myUtilizzi.map(utilizzo => (
                    <tr key={utilizzo._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="glass-icon-small w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {utilizzo.productId?.nome || 'N/D'}
                            </div>
                            <div className="text-sm text-white/50">
                              {utilizzo.productId?.categoria || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-red-300 font-medium">
                        -{utilizzo.quantitaUtilizzata} {utilizzo.productId?.unita}
                      </td>
                      <td className="px-6 py-4 text-white">{utilizzo.quantitaPrimaDellUso ?? 'N/A'}</td>
                      <td className="px-6 py-4 text-white">{utilizzo.quantitaRimasta ?? 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="text-white">{new Date(utilizzo.dataUtilizzo).toLocaleDateString('it-IT')}</div>
                        <div className="text-sm text-white/50">
                          {new Date(utilizzo.dataUtilizzo).toLocaleTimeString('it-IT')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedWeek ? (
          <div className="glass-warning-card p-4 rounded-2xl">
            <div className="flex items-center text-yellow-200">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>Nessun utilizzo registrato per questa settimana.</span>
            </div>
          </div>
        ) : (
          <div className="glass-warning-card p-4 rounded-2xl">
            <div className="flex items-center text-yellow-200">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>Seleziona una settimana per visualizzare gli utilizzi.</span>
            </div>
          </div>
        )}

        {/* 🔍 DEBUG VIEW (solo dev) */}
        {debugData && (
          <div className="glass-card p-4 rounded-2xl">
            <pre className="text-xs text-white/70 overflow-auto">
              {JSON.stringify(debugData, null, 2)}
            </pre>
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

        .glass-card-large {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-icon-small {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
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

        .glass-warning-card {
          background: rgba(251, 191, 36, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.1);
        }

        .glass-table-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-table-row {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
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

export default UtilizziPage;