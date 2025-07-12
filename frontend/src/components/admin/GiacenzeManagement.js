// // components/admin/GiacenzeManagement.js
// import React from 'react';
// import { Plus, Users, ChevronRight, Package2 } from 'lucide-react';
// import { useGiacenze } from '../../hooks/useGiacenze';
// import { useAppContext } from '../../contexts/AppContext';
// import { calculatePercentage, formatDate } from '../../utils/formatters';

// const GiacenzeManagement = () => {
//   const { users, allProducts, allGiacenze, assegnazioni, assignGiacenza } = useGiacenze();
//   const { state, dispatch } = useAppContext();
//   const { selectedUser, giacenzeForm } = state;

//   const setSelectedUser = (userId) => {
//     dispatch({ type: 'SET_SELECTED_USER', payload: userId });
//   };

//   const setSelectedUserForGiacenze = (userId) => {
//     dispatch({ type: 'SET_SELECTED_USER_FOR_GIACENZE', payload: userId });
//   };

//   const setAdminView = (view) => {
//     dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
//   };

//   const updateGiacenzeForm = (updates) => {
//     dispatch({ type: 'SET_GIACENZE_FORM', payload: updates });
//   };

//   const handleAssignGiacenza = () => {
//     assignGiacenza(selectedUser, giacenzeForm);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Gestione Giacenze Utenti */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestione Giacenze Utenti</h2>
//         <p className="text-sm text-gray-600 mb-4">
//           Seleziona un utente per gestire le sue giacenze personali e vedere le settimane assegnate
//         </p>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {users.filter(u => u.role === 'user').map(user => {
//             const userGiacenzeCount = allGiacenze.filter(g => g.userId?._id === user._id).length;
//             const userAssignmentsCount = assegnazioni.filter(a => a.userId?._id === user._id).length;
//             const criticalCount = allGiacenze.filter(g => 
//               g.userId?._id === user._id && g.quantitaDisponibile <= g.quantitaMinima
//             ).length;
            
//             return (
//               <button
//                 key={user._id}
//                 onClick={() => {
//                   setSelectedUserForGiacenze(user._id);
//                   setAdminView('user-giacenze');
//                 }}
//                 className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-all text-left"
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center">
//                     <Users className="w-8 h-8 text-blue-600 mr-3" />
//                     <div>
//                       <h3 className="font-semibold text-gray-800">{user.username}</h3>
//                       <p className="text-xs text-gray-600">{user.email}</p>
//                     </div>
//                   </div>
//                   <ChevronRight className="w-5 h-5 text-gray-400" />
//                 </div>
//                 <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
//                   <div className="text-center">
//                     <div className="font-semibold text-gray-700">{userGiacenzeCount}</div>
//                     <div className="text-gray-500">Prodotti</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="font-semibold text-gray-700">{userAssignmentsCount}</div>
//                     <div className="text-gray-500">Settimane</div>
//                   </div>
//                   <div className="text-center">
//                     <div className={`font-semibold ${criticalCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
//                       {criticalCount}
//                     </div>
//                     <div className="text-gray-500">Critici</div>
//                   </div>
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Form Assegnazione Giacenza Veloce */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-lg font-semibold text-gray-800 mb-4">
//           Assegnazione Veloce Giacenza
//         </h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Utente *
//             </label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={selectedUser}
//               onChange={(e) => setSelectedUser(e.target.value)}
//             >
//               <option value="">Seleziona utente</option>
//               {users.filter(u => u.role === 'user').map(user => (
//                 <option key={user._id} value={user._id}>
//                   {user.username} ({user.email})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Prodotto *
//             </label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={giacenzeForm.productId}
//               onChange={(e) => updateGiacenzeForm({ productId: e.target.value })}
//             >
//               <option value="">Seleziona prodotto</option>
//               {allProducts.map(product => (
//                 <option key={product._id} value={product._id}>
//                   {product.nome} ({product.categoria})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Quantità *
//             </label>
//             <input
//               type="number"
//               min="0"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={giacenzeForm.quantitaAssegnata}
//               onChange={(e) => updateGiacenzeForm({ quantitaAssegnata: e.target.value })}
//               placeholder="es. 100"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Soglia Minima
//             </label>
//             <input
//               type="number"
//               min="0"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={giacenzeForm.quantitaMinima}
//               onChange={(e) => updateGiacenzeForm({ quantitaMinima: e.target.value })}
//               placeholder="es. 20"
//             />
//           </div>

//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Note
//             </label>
//             <input
//               type="text"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={giacenzeForm.note}
//               onChange={(e) => updateGiacenzeForm({ note: e.target.value })}
//               placeholder="Note opzionali per l'assegnazione"
//             />
//           </div>
//         </div>

//         <div className="flex items-center mb-4">
//           <input
//             type="checkbox"
//             id="aggiungiAlla"
//             checked={giacenzeForm.aggiungiAlla}
//             onChange={(e) => updateGiacenzeForm({ aggiungiAlla: e.target.checked })}
//             className="mr-2"
//           />
//           <label htmlFor="aggiungiAlla" className="text-sm text-gray-700">
//             Aggiungi alla quantità esistente (invece di sostituire)
//           </label>
//         </div>

//         <button
//           onClick={handleAssignGiacenza}
//           disabled={!selectedUser || !giacenzeForm.productId || !giacenzeForm.quantitaAssegnata}
//           className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
//         >
//           <Plus className="w-4 h-4 inline mr-2" />
//           {giacenzeForm.aggiungiAlla ? 'Ricarica Giacenza' : 'Assegna/Aggiorna Giacenza'}
//         </button>
//       </div>

//       {/* Lista Giacenze Globale */}
//       <div className="bg-white rounded-lg shadow-md">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-800">Tutte le Giacenze</h2>
//           <p className="text-sm text-gray-600">Panoramica completa delle giacenze di tutti gli operatori</p>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Utente
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Prodotto
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Assegnata
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
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Data Assegnazione
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {allGiacenze.map(giacenza => {
//                 const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
//                 const percentualeRimasta = calculatePercentage(giacenza.quantitaDisponibile, giacenza.quantitaAssegnata);
                
//                 return (
//                   <tr key={giacenza._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">
//                         {giacenza.userId?.username}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         {giacenza.userId?.email}
//                       </div>
//                     </td>
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
//                       <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
//                         <div 
//                           className={`h-1 rounded-full ${
//                             percentualeRimasta <= 20 ? 'bg-red-500' : 
//                             percentualeRimasta <= 40 ? 'bg-yellow-500' : 'bg-green-500'
//                           }`}
//                           style={{ width: `${Math.max(percentualeRimasta, 5)}%` }}
//                         ></div>
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
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         {formatDate(giacenza.dataAssegnazione)}
//                       </div>
//                       <div className="text-sm text-gray-500">
//                         da {giacenza.assegnatoDa?.username}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {allGiacenze.length === 0 && (
//             <div className="text-center py-8">
//               <div className="text-gray-400 mb-2">
//                 <Package2 className="w-12 h-12 mx-auto" />
//               </div>
//               <p className="text-gray-500">Nessuna giacenza assegnata</p>
//               <p className="text-sm text-gray-400">Usa il form sopra per assegnare prodotti agli operatori</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GiacenzeManagement;

// components/admin/GiacenzeManagement.js
// import React from 'react';
// import { Plus, Users, ChevronRight, Package2, UserPlus, AlertCircle } from 'lucide-react';
// import { useGiacenze } from '../../hooks/useGiacenze';
// import { useAppContext } from '../../contexts/AppContext';
// import { calculatePercentage, formatDate } from '../../utils/formatters';

// const GiacenzeManagement = () => {
//   const { users, allProducts, allGiacenze, assegnazioni, assignGiacenza } = useGiacenze();
//   const { state, dispatch } = useAppContext();
//   const { selectedUser, giacenzeForm } = state;

//   const setSelectedUser = (userId) => {
//     dispatch({ type: 'SET_SELECTED_USER', payload: userId });
//   };

//   const setSelectedUserForGiacenze = (userId) => {
//     dispatch({ type: 'SET_SELECTED_USER_FOR_GIACENZE', payload: userId });
//   };

//   const setAdminView = (view) => {
//     dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
//   };

//   const updateGiacenzeForm = (updates) => {
//     dispatch({ type: 'SET_GIACENZE_FORM', payload: updates });
//   };

//   const handleAssignGiacenza = () => {
//     assignGiacenza(selectedUser, giacenzeForm);
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Gestione Giacenze Utenti */}
//         <div className="glass-management-card p-8 rounded-3xl">
//           <div className="glass-card-header mb-6">
//             <div className="flex items-center mb-4">
//               <div className="glass-icon p-3 rounded-2xl mr-4">
//                 <Users className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-semibold text-white">Gestione Giacenze Utenti</h2>
//                 <p className="text-white/70">
//                   Seleziona un utente per gestire le sue giacenze personali e vedere le settimane assegnate
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {users.filter(u => u.role === 'user').map(user => {
//               const userGiacenzeCount = allGiacenze.filter(g => g.userId?._id === user._id).length;
//               const userAssignmentsCount = assegnazioni.filter(a => a.userId?._id === user._id).length;
//               const criticalCount = allGiacenze.filter(g => 
//                 g.userId?._id === user._id && g.quantitaDisponibile <= g.quantitaMinima
//               ).length;
              
//               return (
//                 <button
//                   key={user._id}
//                   onClick={() => {
//                     setSelectedUserForGiacenze(user._id);
//                     setAdminView('user-giacenze');
//                   }}
//                   className="glass-user-card group p-6 rounded-2xl transition-all duration-300 hover:scale-105 text-left"
//                 >
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center">
//                       <div className="glass-avatar w-12 h-12 rounded-xl flex items-center justify-center mr-4">
//                         <Users className="w-6 h-6 text-white" />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-white text-lg group-hover:text-blue-200 transition-colors">{user.username}</h3>
//                         <p className="text-xs text-white/60">{user.email}</p>
//                       </div>
//                     </div>
//                     <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
//                   </div>
                  
//                   <div className="grid grid-cols-3 gap-4 mt-4">
//                     <div className="glass-stat-mini p-3 rounded-xl text-center">
//                       <div className="text-xl font-bold text-white">{userGiacenzeCount}</div>
//                       <div className="text-xs text-white/70">Prodotti</div>
//                     </div>
//                     <div className="glass-stat-mini p-3 rounded-xl text-center">
//                       <div className="text-xl font-bold text-white">{userAssignmentsCount}</div>
//                       <div className="text-xs text-white/70">Settimane</div>
//                     </div>
//                     <div className="glass-stat-mini p-3 rounded-xl text-center">
//                       <div className={`text-xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
//                         {criticalCount}
//                       </div>
//                       <div className="text-xs text-white/70">Critici</div>
//                     </div>
//                   </div>

//                   {/* Status indicator */}
//                   <div className="mt-4 flex items-center justify-center">
//                     <div className={`glass-status-badge px-3 py-1 rounded-full text-xs font-medium ${
//                       criticalCount === 0 
//                         ? 'bg-green-500/20 text-green-300 border border-green-400/30'
//                         : 'bg-red-500/20 text-red-300 border border-red-400/30'
//                     }`}>
//                       {criticalCount === 0 ? '✅ Tutto OK' : `⚠️ ${criticalCount} critici`}
//                     </div>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Form Assegnazione Giacenza Veloce */}
//         <div className="glass-management-card p-8 rounded-3xl">
//           <div className="glass-card-header mb-6">
//             <div className="flex items-center mb-4">
//               <div className="glass-icon p-3 rounded-2xl mr-4">
//                 <UserPlus className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-semibold text-white">Assegnazione Veloce Giacenza</h2>
//                 <p className="text-white/70">Assegna rapidamente prodotti agli operatori</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 Utente *
//               </label>
//               <div className="glass-input-container">
//                 <select
//                   className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
//                   value={selectedUser}
//                   onChange={(e) => setSelectedUser(e.target.value)}
//                 >
//                   <option value="" className="bg-gray-800">Seleziona utente</option>
//                   {users.filter(u => u.role === 'user').map(user => (
//                     <option key={user._id} value={user._id} className="bg-gray-800">
//                       {user.username} ({user.email})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 Prodotto *
//               </label>
//               <div className="glass-input-container">
//                 <select
//                   className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
//                   value={giacenzeForm.productId}
//                   onChange={(e) => updateGiacenzeForm({ productId: e.target.value })}
//                 >
//                   <option value="" className="bg-gray-800">Seleziona prodotto</option>
//                   {allProducts.map(product => (
//                     <option key={product._id} value={product._id} className="bg-gray-800">
//                       {product.nome} ({product.categoria})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 Quantità *
//               </label>
//               <div className="glass-input-container">
//                 <input
//                   type="number"
//                   min="0"
//                   className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                   value={giacenzeForm.quantitaAssegnata}
//                   onChange={(e) => updateGiacenzeForm({ quantitaAssegnata: e.target.value })}
//                   placeholder="es. 100"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 Soglia Minima
//               </label>
//               <div className="glass-input-container">
//                 <input
//                   type="number"
//                   min="0"
//                   className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                   value={giacenzeForm.quantitaMinima}
//                   onChange={(e) => updateGiacenzeForm({ quantitaMinima: e.target.value })}
//                   placeholder="es. 20"
//                 />
//               </div>
//             </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 Note
//               </label>
//               <div className="glass-input-container">
//                 <input
//                   type="text"
//                   className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                   value={giacenzeForm.note}
//                   onChange={(e) => updateGiacenzeForm({ note: e.target.value })}
//                   placeholder="Note opzionali per l'assegnazione"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center mb-6">
//             <input
//               type="checkbox"
//               id="aggiungiAlla"
//               checked={giacenzeForm.aggiungiAlla}
//               onChange={(e) => updateGiacenzeForm({ aggiungiAlla: e.target.checked })}
//               className="mr-3 w-4 h-4 text-blue-600 bg-transparent border-white/30 rounded focus:ring-blue-500"
//             />
//             <label htmlFor="aggiungiAlla" className="text-sm text-white/80">
//               Aggiungi alla quantità esistente (invece di sostituire)
//             </label>
//           </div>

//           <button
//             onClick={handleAssignGiacenza}
//             disabled={!selectedUser || !giacenzeForm.productId || !giacenzeForm.quantitaAssegnata}
//             className="glass-button-primary flex items-center gap-3 px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
//           >
//             <Plus className="w-5 h-5" />
//             <span className="font-medium">
//               {giacenzeForm.aggiungiAlla ? 'Ricarica Giacenza' : 'Assegna/Aggiorna Giacenza'}
//             </span>
//           </button>
//         </div>

//         {/* Lista Giacenze Globale */}
//         <div className="glass-management-card rounded-3xl overflow-hidden">
//           <div className="glass-table-header px-8 py-6">
//             <div className="flex items-center">
//               <div className="glass-icon p-3 rounded-2xl mr-4">
//                 <Package2 className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-xl font-semibold text-white">Tutte le Giacenze</h2>
//                 <p className="text-white/60">Panoramica completa delle giacenze di tutti gli operatori</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="glass-table-header-row">
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Utente
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Prodotto
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Assegnata
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Disponibile
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Soglia Min
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Stato
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Data Assegnazione
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="glass-table-body">
//                 {allGiacenze.map(giacenza => {
//                   const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
//                   const percentualeRimasta = calculatePercentage(giacenza.quantitaDisponibile, giacenza.quantitaAssegnata);
                  
//                   return (
//                     <tr key={giacenza._id} className="glass-table-row hover:bg-white/5 transition-colors">
//                       <td className="px-8 py-6">
//                         <div className="flex items-center">
//                           <div className="glass-mini-avatar w-8 h-8 rounded-lg flex items-center justify-center mr-3">
//                             <Users className="w-4 h-4 text-white" />
//                           </div>
//                           <div>
//                             <div className="text-sm font-medium text-white">
//                               {giacenza.userId?.username}
//                             </div>
//                             <div className="text-sm text-white/60">
//                               {giacenza.userId?.email}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-8 py-6">
//                         <div>
//                           <div className="text-sm font-medium text-white">
//                             {giacenza.productId?.nome}
//                           </div>
//                           <div className="text-sm text-white/60">
//                             {giacenza.productId?.categoria}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-8 py-6">
//                         <div className="text-sm text-white">
//                           {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
//                         </div>
//                       </td>
//                       <td className="px-8 py-6">
//                         <div className={`text-sm font-medium ${
//                           isSottoSoglia ? 'text-red-400' : 'text-white'
//                         }`}>
//                           {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
//                         </div>
//                         <div className="glass-progress-container w-20 mt-2">
//                           <div className="glass-progress-bar h-1 rounded-full overflow-hidden">
//                             <div 
//                               className={`h-1 rounded-full transition-all duration-500 ${
//                                 percentualeRimasta <= 20 ? 'bg-gradient-to-r from-red-400 to-red-600' : 
//                                 percentualeRimasta <= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
//                                 'bg-gradient-to-r from-green-400 to-green-600'
//                               }`}
//                               style={{ width: `${Math.max(percentualeRimasta, 5)}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-8 py-6">
//                         <div className="text-sm text-white">
//                           {giacenza.quantitaMinima} {giacenza.productId?.unita}
//                         </div>
//                       </td>
//                       <td className="px-8 py-6">
//                         <span className={`glass-status-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                           isSottoSoglia 
//                             ? 'bg-red-500/20 text-red-300 border border-red-400/30'
//                             : 'bg-green-500/20 text-green-300 border border-green-400/30'
//                         }`}>
//                           {isSottoSoglia ? (
//                             <>
//                               <AlertCircle className="w-3 h-3 mr-1" />
//                               CRITICO
//                             </>
//                           ) : (
//                             '✅ OK'
//                           )}
//                         </span>
//                       </td>
//                       <td className="px-8 py-6">
//                         <div className="text-sm text-white">
//                           {formatDate(giacenza.dataAssegnazione)}
//                         </div>
//                         <div className="text-sm text-white/60">
//                           da {giacenza.assegnatoDa?.username}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>

//             {allGiacenze.length === 0 && (
//               <div className="glass-empty-state text-center py-16">
//                 <div className="glass-icon w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
//                   <Package2 className="w-8 h-8 text-white/50" />
//                 </div>
//                 <p className="text-white/70 text-lg mb-2">Nessuna giacenza assegnata</p>
//                 <p className="text-white/50 text-sm">Usa il form sopra per assegnare prodotti agli operatori</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Custom Styles */}
//       <style jsx>{`
//         .glass-management-card {
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(20px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//           box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
//         }

//         .glass-card-header {
//           border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//           padding-bottom: 1.5rem;
//         }

//         .glass-icon {
//           background: rgba(255, 255, 255, 0.15);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//         }

//         .glass-user-card {
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(15px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//           box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
//         }

//         .glass-user-card:hover {
//           background: rgba(255, 255, 255, 0.12);
//           border-color: rgba(255, 255, 255, 0.25);
//           box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
//         }

//         .glass-avatar {
//           background: rgba(255, 255, 255, 0.15);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//         }

//         .glass-mini-avatar {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(8px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//         }

//         .glass-stat-mini {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//         }

//         .glass-input-container {
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(15px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//           border-radius: 1rem;
//           transition: all 0.3s ease;
//         }

//         .glass-input {
//           transition: all 0.3s ease;
//         }

//         .glass-input:focus {
//           background: rgba(255, 255, 255, 0.12);
//         }

//         .glass-input-container:focus-within {
//           border-color: rgba(59, 130, 246, 0.5);
//           box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
//           background: rgba(255, 255, 255, 0.12);
//         }

//         .glass-button-primary {
//           background: rgba(59, 130, 246, 0.3);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(59, 130, 246, 0.4);
//           box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
//           color: white;
//         }

//         .glass-button-primary:hover:not(:disabled) {
//           background: rgba(59, 130, 246, 0.4);
//           box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3);
//         }

//         .glass-table-header {
//           background: rgba(255, 255, 255, 0.05);
//           backdrop-filter: blur(10px);
//           border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//         }

//         .glass-table-header-row {
//           background: rgba(255, 255, 255, 0.05);
//           backdrop-filter: blur(10px);
//         }

//         .glass-table-body {
//           background: rgba(255, 255, 255, 0.02);
//         }

//         .glass-table-row {
//           border-bottom: 1px solid rgba(255, 255, 255, 0.05);
//         }

//         .glass-status-badge {
//           backdrop-filter: blur(10px);
//         }

//         .glass-progress-container {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(5px);
//           border-radius: 0.5rem;
//           padding: 1px;
//         }

//         .glass-progress-bar {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(5px);
//         }

//         .glass-empty-state {
//           background: rgba(255, 255, 255, 0.02);
//           backdrop-filter: blur(10px);
//         }

//         /* Responsive */
//         @media (max-width: 768px) {
//           .glass-management-card {
//             padding: 1rem;
//           }
          
//           .glass-user-card {
//             padding: 1rem;
//           }
          
//           .glass-table-header, .glass-table-row {
//             padding: 0.5rem;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default GiacenzeManagement;

// components/admin/GiacenzeManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Users, ChevronRight, Package2, UserPlus, AlertCircle, Filter, Search, User, Calendar, Package, BarChart3 } from 'lucide-react';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { calculatePercentage, formatDate } from '../../utils/formatters';

const GiacenzeManagement = () => {
  const { users, allProducts, allGiacenze, assegnazioni, assignGiacenza } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { selectedUser, giacenzeForm } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Stati per filtri
  const [filters, setFilters] = useState({
    userId: '',
    productId: '',
    stato: '', // 'critico', 'ok', ''
    searchTerm: '',
    dataFrom: '',
    dataTo: '',
    quantitaMin: '',
    quantitaMax: ''
  });

  // Stati per giacenze filtrate
  const [filteredGiacenze, setFilteredGiacenze] = useState([]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Applica filtri alle giacenze
  useEffect(() => {
    let filtered = [...allGiacenze];

    // Filtro per utente
    if (filters.userId) {
      filtered = filtered.filter(g => g.userId?._id === filters.userId);
    }

    // Filtro per prodotto
    if (filters.productId) {
      filtered = filtered.filter(g => g.productId?._id === filters.productId);
    }

    // Filtro per stato
    if (filters.stato === 'critico') {
      filtered = filtered.filter(g => g.quantitaDisponibile <= g.quantitaMinima);
    } else if (filters.stato === 'ok') {
      filtered = filtered.filter(g => g.quantitaDisponibile > g.quantitaMinima);
    }

    // Filtro ricerca libera
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        g.userId?.username.toLowerCase().includes(term) ||
        g.userId?.email.toLowerCase().includes(term) ||
        g.productId?.nome.toLowerCase().includes(term) ||
        g.productId?.categoria.toLowerCase().includes(term) ||
        g.assegnatoDa?.username.toLowerCase().includes(term)
      );
    }

    // Filtro per data assegnazione
    if (filters.dataFrom) {
      const fromDate = new Date(filters.dataFrom);
      filtered = filtered.filter(g => {
        const assignDate = new Date(g.dataAssegnazione);
        return assignDate >= fromDate;
      });
    }

    if (filters.dataTo) {
      const toDate = new Date(filters.dataTo);
      toDate.setHours(23, 59, 59, 999); // Fine giornata
      filtered = filtered.filter(g => {
        const assignDate = new Date(g.dataAssegnazione);
        return assignDate <= toDate;
      });
    }

    // Filtro per quantità disponibile
    if (filters.quantitaMin) {
      filtered = filtered.filter(g => g.quantitaDisponibile >= parseInt(filters.quantitaMin));
    }

    if (filters.quantitaMax) {
      filtered = filtered.filter(g => g.quantitaDisponibile <= parseInt(filters.quantitaMax));
    }

    setFilteredGiacenze(filtered);
  }, [allGiacenze, filters]);

  // Inizializza filteredGiacenze
  useEffect(() => {
    setFilteredGiacenze(allGiacenze);
  }, [allGiacenze]);

  const setSelectedUser = (userId) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: userId });
  };

  const setSelectedUserForGiacenze = (userId) => {
    dispatch({ type: 'SET_SELECTED_USER_FOR_GIACENZE', payload: userId });
  };

  const setAdminView = (view) => {
    dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
  };

  const updateGiacenzeForm = (updates) => {
    dispatch({ type: 'SET_GIACENZE_FORM', payload: updates });
  };

  const handleAssignGiacenza = () => {
    assignGiacenza(selectedUser, giacenzeForm);
  };

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filtri
  const resetFilters = () => {
    setFilters({
      userId: '',
      productId: '',
      stato: '',
      searchTerm: '',
      dataFrom: '',
      dataTo: '',
      quantitaMin: '',
      quantitaMax: ''
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
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

      <div className="relative z-10 space-y-6">
        {/* Gestione Giacenze Utenti */}
        <div className="glass-management-card p-8 rounded-3xl">
          <div className="glass-card-header mb-6">
            <div className="flex items-center mb-4">
              <div className="glass-icon p-3 rounded-2xl mr-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Gestione Giacenze Utenti</h2>
                <p className="text-white/70">
                  Seleziona un utente per gestire le sue giacenze personali e vedere le settimane assegnate
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.filter(u => u.role === 'user').map(user => {
              const userGiacenzeCount = allGiacenze.filter(g => g.userId?._id === user._id).length;
              const userAssignmentsCount = assegnazioni.filter(a => a.userId?._id === user._id).length;
              const criticalCount = allGiacenze.filter(g => 
                g.userId?._id === user._id && g.quantitaDisponibile <= g.quantitaMinima
              ).length;
              
              return (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUserForGiacenze(user._id);
                    setAdminView('user-giacenze');
                  }}
                  className="glass-user-card group p-6 rounded-2xl transition-all duration-300 hover:scale-105 text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="glass-avatar w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg group-hover:text-blue-200 transition-colors">{user.username}</h3>
                        <p className="text-xs text-white/60">{user.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="glass-stat-mini p-3 rounded-xl text-center">
                      <div className="text-xl font-bold text-white">{userGiacenzeCount}</div>
                      <div className="text-xs text-white/70">Prodotti</div>
                    </div>
                    <div className="glass-stat-mini p-3 rounded-xl text-center">
                      <div className="text-xl font-bold text-white">{userAssignmentsCount}</div>
                      <div className="text-xs text-white/70">Settimane</div>
                    </div>
                    <div className="glass-stat-mini p-3 rounded-xl text-center">
                      <div className={`text-xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {criticalCount}
                      </div>
                      <div className="text-xs text-white/70">Critici</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center">
                    <div className={`glass-status-badge px-3 py-1 rounded-full text-xs font-medium ${
                      criticalCount === 0 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                        : 'bg-red-500/20 text-red-300 border border-red-400/30'
                    }`}>
                      {criticalCount === 0 ? '✅ Tutto OK' : `⚠️ ${criticalCount} critici`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Assegnazione Giacenza Veloce */}
        <div className="glass-management-card p-8 rounded-3xl">
          <div className="glass-card-header mb-6">
            <div className="flex items-center mb-4">
              <div className="glass-icon p-3 rounded-2xl mr-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Assegnazione Veloce Giacenza</h2>
                <p className="text-white/70">Assegna rapidamente prodotti agli operatori</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Utente *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="" className="bg-gray-800">Seleziona utente</option>
                  {users.filter(u => u.role === 'user').map(user => (
                    <option key={user._id} value={user._id} className="bg-gray-800">
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Prodotto *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={giacenzeForm.productId}
                  onChange={(e) => updateGiacenzeForm({ productId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona prodotto</option>
                  {allProducts.map(product => (
                    <option key={product._id} value={product._id} className="bg-gray-800">
                      {product.nome} ({product.categoria})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Quantità *
              </label>
              <div className="glass-input-container">
                <input
                  type="number"
                  min="0"
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={giacenzeForm.quantitaAssegnata}
                  onChange={(e) => updateGiacenzeForm({ quantitaAssegnata: e.target.value })}
                  placeholder="es. 100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Soglia Minima
              </label>
              <div className="glass-input-container">
                <input
                  type="number"
                  min="0"
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={giacenzeForm.quantitaMinima}
                  onChange={(e) => updateGiacenzeForm({ quantitaMinima: e.target.value })}
                  placeholder="es. 20"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Note
              </label>
              <div className="glass-input-container">
                <input
                  type="text"
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={giacenzeForm.note}
                  onChange={(e) => updateGiacenzeForm({ note: e.target.value })}
                  placeholder="Note opzionali per l'assegnazione"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="aggiungiAlla"
              checked={giacenzeForm.aggiungiAlla}
              onChange={(e) => updateGiacenzeForm({ aggiungiAlla: e.target.checked })}
              className="mr-3 w-4 h-4 text-blue-600 bg-transparent border-white/30 rounded focus:ring-blue-500"
            />
            <label htmlFor="aggiungiAlla" className="text-sm text-white/80">
              Aggiungi alla quantità esistente (invece di sostituire)
            </label>
          </div>

          <button
            onClick={handleAssignGiacenza}
            disabled={!selectedUser || !giacenzeForm.productId || !giacenzeForm.quantitaAssegnata}
            className="glass-button-primary flex items-center gap-3 px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">
              {giacenzeForm.aggiungiAlla ? 'Ricarica Giacenza' : 'Assegna/Aggiorna Giacenza'}
            </span>
          </button>
        </div>

        {/* Lista Giacenze Globale con Filtri */}
        <div className="glass-management-card rounded-3xl overflow-hidden">
          <div className="glass-table-header px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="glass-icon p-3 rounded-2xl mr-4">
                  <Package2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Tutte le Giacenze</h2>
                  <p className="text-white/60">Panoramica completa delle giacenze di tutti gli operatori</p>
                </div>
              </div>
              <div className="text-white/70">
                {filteredGiacenze.length} di {allGiacenze.length} giacenze
              </div>
            </div>
          </div>

          {/* Sezione Filtri */}
          <div className="glass-filter-section px-8 py-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtri Avanzati
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Filtro Utente */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Utente
                </label>
                <select
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                  value={filters.userId}
                  onChange={(e) => updateFilters({ userId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Tutti gli utenti</option>
                  {users.filter(u => u.role === 'user').map(user => (
                    <option key={user._id} value={user._id} className="bg-gray-800">
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Prodotto */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Prodotto
                </label>
                <select
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                  value={filters.productId}
                  onChange={(e) => updateFilters({ productId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Tutti i prodotti</option>
                  {allProducts.map(product => (
                    <option key={product._id} value={product._id} className="bg-gray-800">
                      {product.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Stato */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Stato
                </label>
                <select
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                  value={filters.stato}
                  onChange={(e) => updateFilters({ stato: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Tutti gli stati</option>
                  <option value="ok" className="bg-gray-800">Solo OK</option>
                  <option value="critico" className="bg-gray-800">Solo Critici</option>
                </select>
              </div>

              {/* Ricerca Libera */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Ricerca
                </label>
                <div className="glass-input-container rounded-xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cerca..."
                      className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={filters.searchTerm}
                      onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filtri Avanzati - Seconda Riga */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Range Data */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Data Da
                </label>
                <input
                  type="date"
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                  value={filters.dataFrom}
                  onChange={(e) => updateFilters({ dataFrom: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Data A
                </label>
                <input
                  type="date"
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                  value={filters.dataTo}
                  onChange={(e) => updateFilters({ dataTo: e.target.value })}
                />
              </div>

              {/* Range Quantità */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Quantità Min
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="es. 10"
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={filters.quantitaMin}
                  onChange={(e) => updateFilters({ quantitaMin: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Quantità Max
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="es. 100"
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={filters.quantitaMax}
                  onChange={(e) => updateFilters({ quantitaMax: e.target.value })}
                />
              </div>
            </div>

            {/* Bottone Reset Filtri */}
            <div className="flex justify-end mt-4">
              <button
                onClick={resetFilters}
                className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Reset Filtri
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="glass-table-header-row">
                  <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Prodotto
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Assegnata
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Disponibile
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Soglia Min
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Data Assegnazione
                  </th>
                </tr>
              </thead>
              <tbody className="glass-table-body">
                {filteredGiacenze.map(giacenza => {
                  const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                  const percentualeRimasta = calculatePercentage(giacenza.quantitaDisponibile, giacenza.quantitaAssegnata);
                  
                  return (
                    <tr key={giacenza._id} className="glass-table-row hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="glass-mini-avatar w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {giacenza.userId?.username}
                            </div>
                            <div className="text-sm text-white/60">
                              {giacenza.userId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {giacenza.productId?.nome}
                          </div>
                          <div className="text-sm text-white/60">
                            {giacenza.productId?.categoria}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-white">
                          {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`text-sm font-medium ${
                          isSottoSoglia ? 'text-red-400' : 'text-white'
                        }`}>
                          {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
                        </div>
                        <div className="glass-progress-container w-20 mt-2">
                          <div className="glass-progress-bar h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-1 rounded-full transition-all duration-500 ${
                                percentualeRimasta <= 20 ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                                percentualeRimasta <= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                                'bg-gradient-to-r from-green-400 to-green-600'
                              }`}
                              style={{ width: `${Math.max(percentualeRimasta, 5)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-white">
                          {giacenza.quantitaMinima} {giacenza.productId?.unita}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`glass-status-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          isSottoSoglia 
                            ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                            : 'bg-green-500/20 text-green-300 border border-green-400/30'
                        }`}>
                          {isSottoSoglia ? (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              CRITICO
                            </>
                          ) : (
                            '✅ OK'
                          )}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-white">
                          {formatDate(giacenza.dataAssegnazione)}
                        </div>
                        <div className="text-sm text-white/60">
                          da {giacenza.assegnatoDa?.username}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredGiacenze.length === 0 && (
              <div className="glass-empty-state text-center py-16">
                <div className="glass-icon w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                  <Package2 className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-white/70 text-lg mb-2">
                  {allGiacenze.length === 0 ? 'Nessuna giacenza assegnata' : 'Nessuna giacenza trovata con i filtri selezionati'}
                </p>
                <p className="text-white/50 text-sm">
                  {allGiacenze.length === 0 
                    ? 'Usa il form sopra per assegnare prodotti agli operatori'
                    : 'Prova a modificare i filtri per vedere più risultati'
                  }
                </p>
                {Object.values(filters).some(filter => filter !== '') && (
                  <button
                    onClick={resetFilters}
                    className="glass-button-secondary mt-4 px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
                  >
                    Reset Filtri
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-management-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        .glass-card-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 1.5rem;
        }

        .glass-filter-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-user-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .glass-user-card:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
        }

        .glass-avatar {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-mini-avatar {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-stat-mini {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-input-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 1rem;
          transition: all 0.3s ease;
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .glass-input-container:focus-within {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
          background: rgba(255, 255, 255, 0.12);
        }

        .glass-button-primary {
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
          color: white;
        }

        .glass-button-primary:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.4);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3);
        }

        .glass-button-secondary {
          background: rgba(107, 114, 128, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 114, 128, 0.4);
          color: white;
        }

        .glass-button-secondary:hover {
          background: rgba(107, 114, 128, 0.4);
        }

        .glass-table-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-table-header-row {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-table-body {
          background: rgba(255, 255, 255, 0.02);
        }

        .glass-table-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .glass-status-badge {
          backdrop-filter: blur(10px);
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

        .glass-empty-state {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
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

        /* Responsive */
        @media (max-width: 768px) {
          .glass-management-card {
            padding: 1rem;
          }
          
          .glass-user-card {
            padding: 1rem;
          }
          
          .glass-table-header, .glass-table-row {
            padding: 0.5rem;
          }

          .glass-filter-section {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default GiacenzeManagement;