// // components/admin/UserGiacenzeView.js
// import React from 'react';
// import { Calendar, MapPin, Truck, Plus } from 'lucide-react';
// import { useGiacenze } from '../../hooks/useGiacenze';
// import { useAppContext } from '../../contexts/AppContext';
// import { formatWeek } from '../../utils/formatters';

// const UserGiacenzeView = () => {
//   const { users, allProducts, allGiacenze, assegnazioni, assignGiacenza } = useGiacenze();
//   const { state, dispatch } = useAppContext();
//   const { selectedUserForGiacenze, giacenzeForm } = state;

//   const setSelectedUserForGiacenze = (userId) => {
//     dispatch({ type: 'SET_SELECTED_USER_FOR_GIACENZE', payload: userId });
//   };

//   const setAdminView = (view) => {
//     dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
//   };

//   const updateGiacenzeForm = (updates) => {
//     dispatch({ type: 'SET_GIACENZE_FORM', payload: updates });
//   };

//   const selectedUser = users.find(u => u._id === selectedUserForGiacenze);
//   const userAssignments = assegnazioni.filter(a => a.userId?._id === selectedUserForGiacenze);
//   const userGiacenze = allGiacenze.filter(g => g.userId?._id === selectedUserForGiacenze);

//   const handleAssignGiacenza = () => {
//     assignGiacenza(selectedUserForGiacenze, giacenzeForm);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header con info utente */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">
//               Gestione Giacenze: {selectedUser?.username}
//             </h2>
//             <p className="text-sm text-gray-600">
//               {selectedUser?.email}
//             </p>
//           </div>
//           <button
//             onClick={() => {
//               setAdminView('overview');
//               setSelectedUserForGiacenze('');
//             }}
//             className="text-blue-600 hover:text-blue-800 underline"
//           >
//             ← Torna alla lista utenti
//           </button>
//         </div>

//         {/* Settimane assegnate all'utente */}
//         <div className="mb-4">
//           <h3 className="font-medium text-gray-700 mb-2">Settimane Assegnate:</h3>
//           <div className="space-y-2">
//             {userAssignments.map(assignment => (
//               <div key={assignment._id} className="p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-4 text-sm">
//                     <Calendar className="w-4 h-4 text-blue-600" />
//                     <span>{formatWeek(assignment.settimanaId)}</span>
//                     <MapPin className="w-4 h-4 text-green-600" />
//                     <span>{assignment.poloId?.nome}</span>
//                     <Truck className="w-4 h-4 text-purple-600" />
//                     <span>{assignment.mezzoId?.nome}</span>
//                   </div>
//                   <span className={`text-xs px-2 py-1 rounded-full ${
//                     assignment.attiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                   }`}>
//                     {assignment.attiva ? 'Attiva' : 'Inattiva'}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Form assegnazione giacenza */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">
//           Assegna/Aggiorna Giacenza Prodotto
//         </h3>
//         <form onSubmit={(e) => e.preventDefault()}>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Prodotto *
//               </label>
//               <select
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 value={giacenzeForm.productId}
//                 onChange={(e) => updateGiacenzeForm({ productId: e.target.value })}
//                 onClick={(e) => e.stopPropagation()}
//                 onFocus={(e) => e.stopPropagation()}
//               >
//                 <option value="">Seleziona prodotto</option>
//                 {allProducts.map(product => (
//                   <option key={product._id} value={product._id}>
//                     {product.nome} ({product.categoria})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Quantità *
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 value={giacenzeForm.quantitaAssegnata}
//                 onChange={(e) => updateGiacenzeForm({ quantitaAssegnata: e.target.value })}
//                 onClick={(e) => e.stopPropagation()}
//                 onFocus={(e) => e.stopPropagation()}
//                 placeholder="es. 100"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Soglia Minima
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 value={giacenzeForm.quantitaMinima}
//                 onChange={(e) => updateGiacenzeForm({ quantitaMinima: e.target.value })}
//                 onClick={(e) => e.stopPropagation()}
//                 onFocus={(e) => e.stopPropagation()}
//                 placeholder="es. 20"
//               />
//             </div>

//             <div className="lg:col-span-3">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Tipo di giacenza
//               </label>
//               <div className="mb-3">
//                 <input
//                   type="checkbox"
//                   id="isGlobal"
//                   checked={giacenzeForm.isGlobal !== false}
//                   onChange={(e) => updateGiacenzeForm({ isGlobal: e.target.checked })}
//                   onClick={(e) => e.stopPropagation()}
//                   onFocus={(e) => e.stopPropagation()}
//                   className="mr-2"
//                 />
//                 <label htmlFor="isGlobal" className="text-sm text-gray-700">
//                   Giacenza globale (valida per tutte le settimane)
//                 </label>
//               </div>

//               {!giacenzeForm.isGlobal && (
//                 <div className="mb-3">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Settimana specifica
//                   </label>
//                   <select
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     value={giacenzeForm.settimanaId || ''}
//                     onChange={(e) => updateGiacenzeForm({ settimanaId: e.target.value })}
//                     onClick={(e) => e.stopPropagation()}
//                     onFocus={(e) => e.stopPropagation()}
//                   >
//                     <option value="">Seleziona settimana</option>
//                     {userAssignments.map(assignment => (
//                       <option key={assignment.settimanaId._id} value={assignment.settimanaId._id}>
//                         {formatWeek(assignment.settimanaId)}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               <div className="mb-3">
//                 <input
//                   type="checkbox"
//                   id="applicaATutteLeSettimane"
//                   checked={giacenzeForm.applicaATutteLeSettimane || false}
//                   onChange={(e) => updateGiacenzeForm({ applicaATutteLeSettimane: e.target.checked })}
//                   onClick={(e) => e.stopPropagation()}
//                   onFocus={(e) => e.stopPropagation()}
//                   className="mr-2"
//                   disabled={giacenzeForm.isGlobal}
//                 />
//                 <label htmlFor="applicaATutteLeSettimane" className="text-sm text-gray-700">
//                   Applica a tutte le settimane assegnate all'utente
//                 </label>
//               </div>

//               <div className="mb-3">
//                 <input
//                   type="checkbox"
//                   id="aggiungiAlla"
//                   checked={giacenzeForm.aggiungiAlla}
//                   onChange={(e) => updateGiacenzeForm({ aggiungiAlla: e.target.checked })}
//                   onClick={(e) => e.stopPropagation()}
//                   onFocus={(e) => e.stopPropagation()}
//                   className="mr-2"
//                 />
//                 <label htmlFor="aggiungiAlla" className="text-sm text-gray-700">
//                   Aggiungi alla quantità esistente (invece di sostituire)
//                 </label>
//               </div>
//             </div>
//           </div>
//         </form>
//         <button
//           type="button"
//           onClick={handleAssignGiacenza}
//           disabled={!giacenzeForm.productId || !giacenzeForm.quantitaAssegnata}
//           className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
//         >
//           <Plus className="w-4 h-4 inline mr-2" />
//           {giacenzeForm.aggiungiAlla ? 'Ricarica Giacenza' : 'Assegna Giacenza'}
//         </button>
//       </div>

//       {/* Lista giacenze utente */}
//       <div className="bg-white rounded-lg shadow-md">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-800">Giacenze Attuali</h3>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Prodotto
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Quantità Assegnata
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Disponibile
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Soglia Min
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Stato
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {userGiacenze.map(giacenza => {
//                 const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                
//                 return (
//                   <tr key={giacenza._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">
//                         {giacenza.productId?.nome}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {giacenza.productId?.categoria}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className={`text-sm font-medium ${
//                         isSottoSoglia ? 'text-red-600' : 'text-gray-900'
//                       }`}>
//                         {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {giacenza.quantitaMinima} {giacenza.productId?.unita}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         isSottoSoglia ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
//                       }`}>
//                         {isSottoSoglia ? 'CRITICO' : 'OK'}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserGiacenzeView;

// components/admin/UserGiacenzeView.js
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Truck, Plus, User, Package, ArrowLeft, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { formatWeek } from '../../utils/formatters';

const UserGiacenzeView = () => {
  const { users, allProducts, allGiacenze, assegnazioni, assignGiacenza } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { selectedUserForGiacenze, giacenzeForm } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const setSelectedUserForGiacenze = (userId) => {
    dispatch({ type: 'SET_SELECTED_USER_FOR_GIACENZE', payload: userId });
  };

  const setAdminView = (view) => {
    dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
  };

  const updateGiacenzeForm = (updates) => {
    dispatch({ type: 'SET_GIACENZE_FORM', payload: updates });
  };

  const selectedUser = users.find(u => u._id === selectedUserForGiacenze);
  const userAssignments = assegnazioni.filter(a => a.userId?._id === selectedUserForGiacenze);
  const userGiacenze = allGiacenze.filter(g => g.userId?._id === selectedUserForGiacenze);

  const handleAssignGiacenza = () => {
    assignGiacenza(selectedUserForGiacenze, giacenzeForm);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
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

      {/* Main Content */}
      <div className="relative z-10 space-y-6">
        {/* Header con info utente */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="glass-avatar w-12 h-12 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Gestione Giacenze: {selectedUser?.username}
                </h2>
                <p className="text-white/70">
                  {selectedUser?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAdminView('overview');
                setSelectedUserForGiacenze('');
              }}
              className="glass-button px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna alla lista utenti</span>
            </button>
          </div>

          {/* Settimane assegnate all'utente */}
          <div className="mb-4">
            <h3 className="font-semibold text-white/90 mb-3">Settimane Assegnate:</h3>
            <div className="space-y-2">
              {userAssignments.map(assignment => (
                <div key={assignment._id} className="glass-card-interactive p-3 rounded-xl hover:scale-102 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-white">
                      <Calendar className="w-4 h-4 text-blue-300" />
                      <span>{formatWeek(assignment.settimanaId)}</span>
                      <MapPin className="w-4 h-4 text-green-300" />
                      <span>{assignment.poloId?.nome}</span>
                      <Truck className="w-4 h-4 text-purple-300" />
                      <span>{assignment.mezzoId?.nome}</span>
                    </div>
                    <span className={`glass-badge text-xs px-2 py-1 rounded-full ${
                      assignment.attiva 
                        ? 'text-green-200 border-green-300/20 bg-green-400/10' 
                        : 'text-red-200 border-red-300/20 bg-red-400/10'
                    }`}>
                      {assignment.attiva ? 'Attiva' : 'Inattiva'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form assegnazione giacenza */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="glass-icon p-3 rounded-xl">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Assegna/Aggiorna Giacenza Prodotto
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Prodotto *
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={giacenzeForm.productId}
                onChange={(e) => updateGiacenzeForm({ productId: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              >
                <option value="" className="bg-gray-800">Seleziona prodotto</option>
                {allProducts.map(product => (
                  <option key={product._id} value={product._id} className="bg-gray-800">
                    {product.nome} ({product.categoria})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Quantità *
              </label>
              <input
                type="number"
                min="0"
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={giacenzeForm.quantitaAssegnata}
                onChange={(e) => updateGiacenzeForm({ quantitaAssegnata: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="es. 100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Soglia Minima
              </label>
              <input
                type="number"
                min="0"
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={giacenzeForm.quantitaMinima}
                onChange={(e) => updateGiacenzeForm({ quantitaMinima: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="es. 20"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tipo di giacenza
              </label>
              <div className="mb-3">
                <div className="glass-checkbox-container p-3 rounded-xl mb-3">
                  <input
                    type="checkbox"
                    id="isGlobal"
                    checked={giacenzeForm.isGlobal !== false}
                    onChange={(e) => updateGiacenzeForm({ isGlobal: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="mr-2 accent-blue-400"
                  />
                  <label htmlFor="isGlobal" className="text-sm text-white/90">
                    Giacenza globale (valida per tutte le settimane)
                  </label>
                </div>
              </div>

              {!giacenzeForm.isGlobal && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Settimana specifica
                  </label>
                  <select
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={giacenzeForm.settimanaId || ''}
                    onChange={(e) => updateGiacenzeForm({ settimanaId: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  >
                    <option value="" className="bg-gray-800">Seleziona settimana</option>
                    {userAssignments.map(assignment => (
                      <option key={assignment.settimanaId._id} value={assignment.settimanaId._id} className="bg-gray-800">
                        {formatWeek(assignment.settimanaId)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <div className="glass-checkbox-container p-3 rounded-xl mb-3">
                  <input
                    type="checkbox"
                    id="applicaATutteLeSettimane"
                    checked={giacenzeForm.applicaATutteLeSettimane || false}
                    onChange={(e) => updateGiacenzeForm({ applicaATutteLeSettimane: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="mr-2 accent-blue-400"
                    disabled={giacenzeForm.isGlobal}
                  />
                  <label htmlFor="applicaATutteLeSettimane" className="text-sm text-white/90">
                    Applica a tutte le settimane assegnate all'utente
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <div className="glass-checkbox-container p-3 rounded-xl">
                  <input
                    type="checkbox"
                    id="aggiungiAlla"
                    checked={giacenzeForm.aggiungiAlla}
                    onChange={(e) => updateGiacenzeForm({ aggiungiAlla: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="mr-2 accent-blue-400"
                  />
                  <label htmlFor="aggiungiAlla" className="text-sm text-white/90">
                    Aggiungi alla quantità esistente (invece di sostituire)
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleAssignGiacenza}
            disabled={!giacenzeForm.productId || !giacenzeForm.quantitaAssegnata}
            className="glass-button-primary px-4 py-2 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{giacenzeForm.aggiungiAlla ? 'Ricarica Giacenza' : 'Assegna Giacenza'}</span>
          </button>
        </div>

        {/* Lista giacenze utente */}
        <div className="glass-card-large rounded-2xl">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Giacenze Attuali
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="glass-table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Prodotto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Quantità Assegnata
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Disponibile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Soglia Min
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Stato
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userGiacenze.map(giacenza => {
                  const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                  
                  return (
                    <tr key={giacenza._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {giacenza.productId?.nome}
                        </div>
                        <div className="text-sm text-white/50">
                          {giacenza.productId?.categoria}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          isSottoSoglia ? 'text-red-300' : 'text-white'
                        }`}>
                          {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {giacenza.quantitaMinima} {giacenza.productId?.unita}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`glass-status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isSottoSoglia 
                            ? 'text-red-200 border-red-300/30 bg-red-400/20' 
                            : 'text-green-200 border-green-300/30 bg-green-400/20'
                        }`}>
                          {isSottoSoglia ? 'CRITICO' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

        .glass-card-interactive {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
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

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-button-primary {
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .glass-avatar {
          background: rgba(255, 255, 255, 0.15);
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

        .glass-checkbox-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-badge {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-status-badge {
          backdrop-filter: blur(10px);
          border: 1px solid;
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

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default UserGiacenzeView;