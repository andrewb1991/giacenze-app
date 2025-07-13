// // components/admin/AssignmentsManagement.js
// import React from 'react';
// import { Plus, Edit, Trash2, Settings } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';
// import { useGiacenze } from '../../hooks/useGiacenze';
// import { useAppContext } from '../../contexts/AppContext';
// import { apiCall } from '../../services/api';
// import { formatWeek } from '../../utils/formatters';

// const AssignmentsManagement = () => {
//   const { token, setError } = useAuth();
//   const { users, poli, mezzi, settimane, assegnazioni } = useGiacenze();
//   const { state, dispatch } = useAppContext();
//   const { assegnazioneForm, editAssignmentId, editForm } = state;

//   const updateAssegnazioneForm = (updates) => {
//     dispatch({ type: 'SET_ASSEGNAZIONE_FORM', payload: updates });
//   };

//   const setEditAssignmentId = (id) => {
//     dispatch({ type: 'SET_EDIT_ASSIGNMENT_ID', payload: id });
//   };

//   const updateEditForm = (updates) => {
//     dispatch({ type: 'SET_EDIT_FORM', payload: updates });
//   };

//   const handleCreateAssignment = async () => {
//     try {
//       await apiCall('/assegnazioni', {
//         method: 'POST',
//         body: JSON.stringify(assegnazioneForm)
//       }, token);
      
//       const updatedAssegnazioni = await apiCall('/assegnazioni', {}, token);
//       dispatch({ type: 'SET_ASSEGNAZIONI', payload: updatedAssegnazioni });
      
//       dispatch({ type: 'RESET_ASSEGNAZIONE_FORM' });
//     } catch (err) {
//       setError('Errore nella creazione assegnazione: ' + err.message);
//     }
//   };

//   const handleUpdateAssignment = async (assignmentId) => {
//     try {
//       const response = await fetch(`https://giacenze-app-production.up.railway.app/api/assegnazioni/${assignmentId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(editForm)
//       });

//       if (!response.ok) throw new Error('Errore nella modifica');

//       const updated = await apiCall('/assegnazioni', {}, token);
//       dispatch({ type: 'SET_ASSEGNAZIONI', payload: updated });
//       setEditAssignmentId(null);
//       setError('Assegnazione Modificata');
//     } catch (err) {
//       setError('Errore nella modifica: ' + err.message);
//     }
//   };

//   const handleDeleteAssignment = async (assignmentId) => {
//     if (window.confirm('Sei sicuro di voler eliminare questa assegnazione?')) {
//       try {
//         const response = await fetch(`https://giacenze-app-production.up.railway.app/api/assegnazioni/${assignmentId}`, {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });

//         if (!response.ok) {
//           throw new Error('Errore durante l\'eliminazione');
//         }

//         const updated = await apiCall('/assegnazioni', {}, token);
//         dispatch({ type: 'SET_ASSEGNAZIONI', payload: updated });
//         setError('Assegnazione Eliminata');
//       } catch (err) {
//         setError('Errore nell\'eliminazione: ' + err.message);
//       }
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Form Nuova Assegnazione */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-lg font-semibold text-gray-800 mb-4">Crea Nuova Assegnazione</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Utente *
//             </label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={assegnazioneForm.userId}
//               onChange={(e) => updateAssegnazioneForm({ userId: e.target.value })}
//             >
//               <option value="">Seleziona utente</option>
//               {users.filter(u => u.role === 'user').map(user => (
//                 <option key={user._id} value={user._id}>
//                   {user.username}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Polo *
//             </label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={assegnazioneForm.poloId}
//               onChange={(e) => updateAssegnazioneForm({ poloId: e.target.value })}
//             >
//               <option value="">Seleziona polo</option>
//               {poli.map(polo => (
//                 <option key={polo._id} value={polo._id}>
//                   {polo.nome}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Mezzo *
//             </label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={assegnazioneForm.mezzoId}
//               onChange={(e) => updateAssegnazioneForm({ mezzoId: e.target.value })}
//             >
//               <option value="">Seleziona mezzo</option>
//               {mezzi.map(mezzo => (
//                 <option key={mezzo._id} value={mezzo._id}>
//                   {mezzo.nome}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Settimana *
//             </label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={assegnazioneForm.settimanaId}
//               onChange={(e) => updateAssegnazioneForm({ settimanaId: e.target.value })}
//             >
//               <option value="">Seleziona settimana</option>
//               {settimane.map(settimana => (
//                 <option key={settimana._id} value={settimana._id}>
//                   {formatWeek(settimana)}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <button
//           onClick={handleCreateAssignment}
//           disabled={!assegnazioneForm.userId || !assegnazioneForm.poloId || !assegnazioneForm.mezzoId || !assegnazioneForm.settimanaId}
//           className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
//         >
//           <Plus className="w-4 h-4 inline mr-2" />
//           Crea Assegnazione
//         </button>
//       </div>

//       {/* Lista Assegnazioni */}
//       <div className="bg-white rounded-lg shadow-md">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-800">Assegnazioni Attive</h2>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Utente
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Polo
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Mezzo
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Settimana
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Stato
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Azioni
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {assegnazioni.map(assegnazione => (
//                 <tr key={assegnazione._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">
//                       {assegnazione.userId?.username}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">
//                       {assegnazione.poloId?.nome}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">
//                       {assegnazione.mezzoId?.nome}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">
//                       {assegnazione.settimanaId ? formatWeek(assegnazione.settimanaId) : 'N/A'}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                       assegnazione.attiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                     }`}>
//                       {assegnazione.attiva ? 'Attiva' : 'Disattiva'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center space-x-2">
//                       <button
//                         onClick={(e) => {
//                           e.preventDefault();
//                           setEditAssignmentId(assegnazione._id);
//                           updateEditForm({
//                             poloId: assegnazione.poloId?._id || '',
//                             mezzoId: assegnazione.mezzoId?._id || '',
//                             settimanaId: assegnazione.settimanaId?._id || ''
//                           });
//                         }}
//                         className="text-blue-600 hover:text-blue-900"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.preventDefault();
//                           handleDeleteAssignment(assegnazione._id);
//                         }}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>

//                     {/* Form di Modifica */}
//                     {editAssignmentId === assegnazione._id && (
//                       <div className="bg-gray-100 p-4 rounded mt-2">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                           <select
//                             className="border border-gray-300 rounded p-2"
//                             value={editForm.poloId}
//                             onChange={(e) => {
//                               e.preventDefault();
//                               updateEditForm({ poloId: e.target.value });
//                             }}
//                           >
//                             <option value="">Seleziona Polo</option>
//                             {poli.map(p => (
//                               <option key={p._id} value={p._id}>{p.nome}</option>
//                             ))}
//                           </select>

//                           <select
//                             className="border border-gray-300 rounded p-2"
//                             value={editForm.mezzoId}
//                             onChange={(e) => {
//                               e.preventDefault();
//                               updateEditForm({ mezzoId: e.target.value });
//                             }}
//                           >
//                             <option value="">Seleziona Mezzo</option>
//                             {mezzi.map(m => (
//                               <option key={m._id} value={m._id}>{m.nome}</option>
//                             ))}
//                           </select>

//                           <select
//                             className="border border-gray-300 rounded p-2"
//                             value={editForm.settimanaId}
//                             onChange={(e) => {
//                               e.preventDefault();
//                               updateEditForm({ settimanaId: e.target.value });
//                             }}
//                           >
//                             <option value="">Seleziona Settimana</option>
//                             {settimane.map(s => (
//                               <option key={s._id} value={s._id}>
//                                 {formatWeek(s)}
//                               </option>
//                             ))}
//                           </select>
//                         </div>

//                         <div className="flex space-x-2">
//                           <button
//                             onClick={(e) => {
//                               e.preventDefault();
//                               handleUpdateAssignment(assegnazione._id);
//                             }}
//                             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                           >
//                             Salva
//                           </button>

//                           <button
//                             onClick={(e) => {
//                               e.preventDefault();
//                               setEditAssignmentId(null);
//                             }}
//                             className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//                           >
//                             Annulla
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {assegnazioni.length === 0 && (
//             <div className="text-center py-8">
//               <div className="text-gray-400 mb-2">
//                 <Settings className="w-12 h-12 mx-auto" />
//               </div>
//               <p className="text-gray-500">Nessuna assegnazione creata</p>
//               <p className="text-sm text-gray-400">Crea la prima assegnazione usando il form sopra</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssignmentsManagement;

// components/admin/AssignmentsManagement.js
// import React from 'react';
// import { Plus, Edit, Trash2, Settings, Calendar, MapPin, Truck, UserCheck } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';
// import { useGiacenze } from '../../hooks/useGiacenze';
// import { useAppContext } from '../../contexts/AppContext';
// import { apiCall } from '../../services/api';
// import { formatWeek } from '../../utils/formatters';


// versione 12/07/2025
// const AssignmentsManagement = () => {
//   const { token, setError } = useAuth();
//   const { users, poli, mezzi, settimane, assegnazioni } = useGiacenze();
//   const { state, dispatch } = useAppContext();
//   const { assegnazioneForm, editAssignmentId, editForm } = state;

//   const updateAssegnazioneForm = (updates) => {
//     dispatch({ type: 'SET_ASSEGNAZIONE_FORM', payload: updates });
//   };

//   const setEditAssignmentId = (id) => {
//     dispatch({ type: 'SET_EDIT_ASSIGNMENT_ID', payload: id });
//   };

//   const updateEditForm = (updates) => {
//     dispatch({ type: 'SET_EDIT_FORM', payload: updates });
//   };

//   const handleCreateAssignment = async () => {
//     try {
//       await apiCall('/assegnazioni', {
//         method: 'POST',
//         body: JSON.stringify(assegnazioneForm)
//       }, token);
      
//       const updatedAssegnazioni = await apiCall('/assegnazioni', {}, token);
//       dispatch({ type: 'SET_ASSEGNAZIONI', payload: updatedAssegnazioni });
      
//       dispatch({ type: 'RESET_ASSEGNAZIONE_FORM' });
//     } catch (err) {
//       setError('Errore nella creazione assegnazione: ' + err.message);
//     }
//   };

//   const handleUpdateAssignment = async (assignmentId) => {
//     try {
//       const response = await fetch(`https://giacenze-app-production.up.railway.app/api/assegnazioni/${assignmentId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(editForm)
//       });

//       if (!response.ok) throw new Error('Errore nella modifica');

//       const updated = await apiCall('/assegnazioni', {}, token);
//       dispatch({ type: 'SET_ASSEGNAZIONI', payload: updated });
//       setEditAssignmentId(null);
//       setError('Assegnazione Modificata');
//     } catch (err) {
//       setError('Errore nella modifica: ' + err.message);
//     }
//   };

//   const handleDeleteAssignment = async (assignmentId) => {
//     if (window.confirm('Sei sicuro di voler eliminare questa assegnazione?')) {
//       try {
//         const response = await fetch(`https://giacenze-app-production.up.railway.app/api/assegnazioni/${assignmentId}`, {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });

//         if (!response.ok) {
//           throw new Error('Errore durante l\'eliminazione');
//         }

//         const updated = await apiCall('/assegnazioni', {}, token);
//         dispatch({ type: 'SET_ASSEGNAZIONI', payload: updated });
//         setError('Assegnazione Eliminata');
//       } catch (err) {
//         setError('Errore nell\'eliminazione: ' + err.message);
//       }
//     }
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Form Nuova Assegnazione */}
//         <div className="glass-assignment-card p-8 rounded-3xl">
//           <div className="glass-card-header mb-6">
//             <div className="flex items-center mb-4">
//               <div className="glass-icon p-4 rounded-2xl mr-4">
//                 <Plus className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-semibold text-white">Crea Nuova Assegnazione</h2>
//                 <p className="text-white/70">Assegna operatori a poli, mezzi e settimane specifiche</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 <UserCheck className="w-4 h-4 inline mr-2" />
//                 Utente *
//               </label>
//               <div className="glass-input-container">
//                 <select
//                   className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
//                   value={assegnazioneForm.userId}
//                   onChange={(e) => updateAssegnazioneForm({ userId: e.target.value })}
//                 >
//                   <option value="" className="bg-gray-800">Seleziona utente</option>
//                   {users.filter(u => u.role === 'user').map(user => (
//                     <option key={user._id} value={user._id} className="bg-gray-800">
//                       {user.username}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 <MapPin className="w-4 h-4 inline mr-2" />
//                 Polo *
//               </label>
//               <div className="glass-input-container">
//                 <select
//                   className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
//                   value={assegnazioneForm.poloId}
//                   onChange={(e) => updateAssegnazioneForm({ poloId: e.target.value })}
//                 >
//                   <option value="" className="bg-gray-800">Seleziona polo</option>
//                   {poli.map(polo => (
//                     <option key={polo._id} value={polo._id} className="bg-gray-800">
//                       {polo.nome}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 <Truck className="w-4 h-4 inline mr-2" />
//                 Mezzo *
//               </label>
//               <div className="glass-input-container">
//                 <select
//                   className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
//                   value={assegnazioneForm.mezzoId}
//                   onChange={(e) => updateAssegnazioneForm({ mezzoId: e.target.value })}
//                 >
//                   <option value="" className="bg-gray-800">Seleziona mezzo</option>
//                   {mezzi.map(mezzo => (
//                     <option key={mezzo._id} value={mezzo._id} className="bg-gray-800">
//                       {mezzo.nome}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">
//                 <Calendar className="w-4 h-4 inline mr-2" />
//                 Settimana *
//               </label>
//               <div className="glass-input-container">
//                 <select
//                   className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
//                   value={assegnazioneForm.settimanaId}
//                   onChange={(e) => updateAssegnazioneForm({ settimanaId: e.target.value })}
//                 >
//                   <option value="" className="bg-gray-800">Seleziona settimana</option>
//                   {settimane.map(settimana => (
//                     <option key={settimana._id} value={settimana._id} className="bg-gray-800">
//                       {formatWeek(settimana)}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={handleCreateAssignment}
//             disabled={!assegnazioneForm.userId || !assegnazioneForm.poloId || !assegnazioneForm.mezzoId || !assegnazioneForm.settimanaId}
//             className="glass-button-primary flex items-center gap-3 px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
//           >
//             <Plus className="w-5 h-5" />
//             <span className="font-medium">Crea Assegnazione</span>
//           </button>
//         </div>

//         {/* Lista Assegnazioni */}
//         <div className="glass-assignment-card rounded-3xl overflow-hidden">
//           <div className="glass-table-header px-8 py-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <div className="glass-icon p-3 rounded-2xl mr-4">
//                   <Settings className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-semibold text-white">Assegnazioni Attive</h2>
//                   <p className="text-white/60">Gestisci le assegnazioni esistenti</p>
//                 </div>
//               </div>
//               <div className="glass-stats-mini flex items-center gap-4">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-white">{assegnazioni.length}</div>
//                   <div className="text-xs text-white/60">Totali</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-green-400">
//                     {assegnazioni.filter(a => a.attiva).length}
//                   </div>
//                   <div className="text-xs text-white/60">Attive</div>
//                 </div>
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
//                     Polo
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Mezzo
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Settimana
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Stato
//                   </th>
//                   <th className="px-8 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                     Azioni
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="glass-table-body">
//                 {assegnazioni.map(assegnazione => (
//                   <tr key={assegnazione._id} className="glass-table-row hover:bg-white/5 transition-colors">
//                     <td className="px-8 py-6">
//                       <div className="flex items-center">
//                         <div className="glass-mini-avatar w-10 h-10 rounded-xl flex items-center justify-center mr-3">
//                           <UserCheck className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <div className="text-sm font-medium text-white">
//                             {assegnazione.userId?.username}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-6">
//                       <div className="flex items-center">
//                         <MapPin className="w-4 h-4 mr-2 text-green-400" />
//                         <div className="text-sm text-white">
//                           {assegnazione.poloId?.nome}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-6">
//                       <div className="flex items-center">
//                         <Truck className="w-4 h-4 mr-2 text-blue-400" />
//                         <div className="text-sm text-white">
//                           {assegnazione.mezzoId?.nome}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-6">
//                       <div className="flex items-center">
//                         <Calendar className="w-4 h-4 mr-2 text-purple-400" />
//                         <div className="text-sm text-white">
//                           {assegnazione.settimanaId ? formatWeek(assegnazione.settimanaId) : 'N/A'}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-6">
//                       <span className={`glass-status-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                         assegnazione.attiva 
//                           ? 'bg-green-500/20 text-green-300 border border-green-400/30'
//                           : 'bg-red-500/20 text-red-300 border border-red-400/30'
//                       }`}>
//                         {assegnazione.attiva ? '✅ Attiva' : '❌ Disattiva'}
//                       </span>
//                     </td>
//                     <td className="px-8 py-6">
//                       <div className="flex items-center space-x-3">
//                         <button
//                           onClick={(e) => {
//                             e.preventDefault();
//                             setEditAssignmentId(assegnazione._id);
//                             updateEditForm({
//                               poloId: assegnazione.poloId?._id || '',
//                               mezzoId: assegnazione.mezzoId?._id || '',
//                               settimanaId: assegnazione.settimanaId?._id || ''
//                             });
//                           }}
//                           className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
//                         >
//                           <Edit className="w-4 h-4 text-blue-400" />
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.preventDefault();
//                             handleDeleteAssignment(assegnazione._id);
//                           }}
//                           className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
//                         >
//                           <Trash2 className="w-4 h-4 text-red-400" />
//                         </button>
//                       </div>

//                       {/* Form di Modifica */}
//                       {editAssignmentId === assegnazione._id && (
//                         <div className="glass-edit-form mt-4 p-4 rounded-2xl">
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                             <div className="glass-input-container">
//                               <select
//                                 className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
//                                 value={editForm.poloId}
//                                 onChange={(e) => {
//                                   e.preventDefault();
//                                   updateEditForm({ poloId: e.target.value });
//                                 }}
//                               >
//                                 <option value="" className="bg-gray-800">Seleziona Polo</option>
//                                 {poli.map(p => (
//                                   <option key={p._id} value={p._id} className="bg-gray-800">{p.nome}</option>
//                                 ))}
//                               </select>
//                             </div>

//                             <div className="glass-input-container">
//                               <select
//                                 className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
//                                 value={editForm.mezzoId}
//                                 onChange={(e) => {
//                                   e.preventDefault();
//                                   updateEditForm({ mezzoId: e.target.value });
//                                 }}
//                               >
//                                 <option value="" className="bg-gray-800">Seleziona Mezzo</option>
//                                 {mezzi.map(m => (
//                                   <option key={m._id} value={m._id} className="bg-gray-800">{m.nome}</option>
//                                 ))}
//                               </select>
//                             </div>

//                             <div className="glass-input-container">
//                               <select
//                                 className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
//                                 value={editForm.settimanaId}
//                                 onChange={(e) => {
//                                   e.preventDefault();
//                                   updateEditForm({ settimanaId: e.target.value });
//                                 }}
//                               >
//                                 <option value="" className="bg-gray-800">Seleziona Settimana</option>
//                                 {settimane.map(s => (
//                                   <option key={s._id} value={s._id} className="bg-gray-800">
//                                     {formatWeek(s)}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>
//                           </div>

//                           <div className="flex space-x-3">
//                             <button
//                               onClick={(e) => {
//                                 e.preventDefault();
//                                 handleUpdateAssignment(assegnazione._id);
//                               }}
//                               className="glass-button-success flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300"
//                             >
//                               <Edit className="w-4 h-4" />
//                               <span className="text-sm font-medium">Salva</span>
//                             </button>

//                             <button
//                               onClick={(e) => {
//                                 e.preventDefault();
//                                 setEditAssignmentId(null);
//                               }}
//                               className="glass-button-secondary flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                               <span className="text-sm font-medium">Annulla</span>
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {assegnazioni.length === 0 && (
//               <div className="glass-empty-state text-center py-16">
//                 <div className="glass-icon w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
//                   <Settings className="w-8 h-8 text-white/50" />
//                 </div>
//                 <p className="text-white/70 text-lg mb-2">Nessuna assegnazione creata</p>
//                 <p className="text-white/50 text-sm">Crea la prima assegnazione usando il form sopra</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Custom Styles */}
//       <style jsx>{`
//         .glass-assignment-card {
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

//         .glass-button-success {
//           background: rgba(34, 197, 94, 0.3);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(34, 197, 94, 0.4);
//           box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
//           color: white;
//         }

//         .glass-button-success:hover {
//           background: rgba(34, 197, 94, 0.4);
//           box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
//         }

//         .glass-button-secondary {
//           background: rgba(107, 114, 128, 0.3);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(107, 114, 128, 0.4);
//           box-shadow: 0 4px 16px rgba(107, 114, 128, 0.2);
//           color: white;
//         }

//         .glass-button-secondary:hover {
//           background: rgba(107, 114, 128, 0.4);
//           box-shadow: 0 8px 24px rgba(107, 114, 128, 0.3);
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

//         .glass-mini-avatar {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(8px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//         }

//         .glass-status-badge {
//           backdrop-filter: blur(10px);
//         }

//         .glass-action-button {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//         }

//         .glass-action-button:hover {
//           background: rgba(255, 255, 255, 0.15);
//           box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
//         }

//         .glass-edit-form {
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(15px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//         }

//         .glass-stats-mini {
//           background: rgba(255, 255, 255, 0.05);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           border-radius: 1rem;
//           padding: 1rem;
//         }

//         .glass-empty-state {
//           background: rgba(255, 255, 255, 0.02);
//           backdrop-filter: blur(10px);
//         }

//         /* Responsive */
//         @media (max-width: 768px) {
//           .glass-assignment-card {
//             padding: 1rem;
//           }
          
//           .grid {
//             grid-template-columns: 1fr;
//           }
          
//           .px-8 {
//             padding-left: 1rem;
//             padding-right: 1rem;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default AssignmentsManagement;

  // components/admin/AssegnazioniManagement.js
// components/admin/AssignmentsManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  RotateCcw, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Truck,
  User,
  Plus,
  Edit,
  Settings,
  UserCheck,
  Building
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { apiCall } from '../../services/api';
import { formatWeek } from '../../utils/formatters';
import {PostazioniManagement} from '../admin/PostazioniManagement';

const AssignmentsManagement = () => {
  const { token, setError } = useAuth();
  const { users, poli, mezzi, settimane } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { assegnazioneForm, editAssignmentId, editForm } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [postazioni, setPostazioni] = useState([]);

  
  // Stati per filtri
  const [filters, setFilters] = useState({
    userId: '',
    poloId: '',
    mezzoId: '',
    settimanaId: '',
    attiva: '', // '', 'true', 'false'
    searchTerm: ''
  });
  
  // Stati per dati
  const [assegnazioni, setAssegnazioni] = useState([]);
  const [filteredAssegnazioni, setFilteredAssegnazioni] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mouse tracking
  useEffect(() => {
  const loadPostazioni = async () => {
    try {
      const data = await apiCall('/postazioni', {}, token);
      setPostazioni(data || []);
    } catch (err) {
      console.error('Errore caricamento postazioni:', err);
    }
  };
  
  loadPostazioni();
}, []);
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const updateAssegnazioneForm = (updates) => {
    dispatch({ type: 'SET_ASSEGNAZIONE_FORM', payload: updates });
  };

  const setEditAssignmentId = (id) => {
    dispatch({ type: 'SET_EDIT_ASSIGNMENT_ID', payload: id });
  };

  const updateEditForm = (updates) => {
    dispatch({ type: 'SET_EDIT_FORM', payload: updates });
  };

  const handleCreateAssignment = async () => {
    try {
      await apiCall('/assegnazioni', {
        method: 'POST',
        body: JSON.stringify(assegnazioneForm)
      }, token);
      
      await loadAssegnazioni();
      dispatch({ type: 'RESET_ASSEGNAZIONE_FORM' });
      setError('Assegnazione creata con successo');
    } catch (err) {
      setError('Errore nella creazione assegnazione: ' + err.message);
    }
  };

  const handleUpdateAssignment = async (assignmentId) => {
    try {
      await apiCall(`/assegnazioni/${assignmentId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      }, token);

      await loadAssegnazioni();
      setEditAssignmentId(null);
      setError('Assegnazione modificata con successo');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  // Carica assegnazioni
  const loadAssegnazioni = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.poloId) queryParams.append('poloId', filters.poloId);
      if (filters.mezzoId) queryParams.append('mezzoId', filters.mezzoId);
      if (filters.settimanaId) queryParams.append('settimanaId', filters.settimanaId);
      
      if (filters.attiva !== '') {
        queryParams.append('attiva', filters.attiva);
      }
      
      const data = await apiCall(`/assegnazioni?${queryParams}`, {}, token);
      setAssegnazioni(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Errore nel caricamento assegnazioni: ' + err.message);
      setAssegnazioni([]);
    } finally {
      setLoading(false);
    }
  };

  // Applica filtri locali
  useEffect(() => {
    let filtered = assegnazioni;
    
    if (filters.searchTerm) {
      filtered = filtered.filter(assegnazione => 
        assegnazione.userId?.username.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assegnazione.userId?.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assegnazione.poloId?.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assegnazione.mezzoId?.nome.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    
    setFilteredAssegnazioni(filtered);
  }, [assegnazioni, filters.searchTerm]);

  // Ricarica quando cambiano i filtri principali
  useEffect(() => {
    loadAssegnazioni();
  }, [filters.userId, filters.poloId, filters.mezzoId, filters.settimanaId, filters.attiva]);

  // Carica dati iniziali
  useEffect(() => {
    loadAssegnazioni();
  }, []);

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Soft delete (disattiva)
  const handleSoftDelete = async (assegnazioneId) => {
    if (!window.confirm('Sei sicuro di voler disattivare questa assegnazione?')) return;
    
    try {
      setError('');
      await apiCall(`/assegnazioni/${assegnazioneId}`, { method: 'DELETE' }, token);
      await loadAssegnazioni();
      setError('Assegnazione disattivata con successo');
    } catch (err) {
      setError('Errore nella disattivazione: ' + err.message);
    }
  };

  // Hard delete (eliminazione definitiva)
  const handleHardDelete = async (assegnazioneId) => {
    const confirmed = window.confirm(
      '⚠️ ATTENZIONE: Questa azione eliminerà DEFINITIVAMENTE l\'assegnazione e ripristinerà tutti gli utilizzi correlati. Questa operazione NON può essere annullata. Sei sicuro?'
    );
    
    if (!confirmed) return;
    
    try {
      setError('');
      const response = await apiCall(`/assegnazioni/${assegnazioneId}/permanent`, { method: 'DELETE' }, token);
      await loadAssegnazioni();
      setError(`Eliminazione completata: ${response.utilizziRipristinati} utilizzi ripristinati`);
    } catch (err) {
      setError('Errore nell\'eliminazione definitiva: ' + err.message);
    }
  };

  // Ripristina assegnazione
  const handleRestore = async (assegnazioneId) => {
    if (!window.confirm('Sei sicuro di voler ripristinare questa assegnazione?')) return;
    
    try {
      setError('');
      await apiCall(`/assegnazioni/${assegnazioneId}/restore`, { method: 'PATCH' }, token);
      await loadAssegnazioni();
      setError('Assegnazione ripristinata con successo');
    } catch (err) {
      setError('Errore nel ripristino: ' + err.message);
    }
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

      {/* Main Content */}
      <div className="relative z-10 space-y-6">
        {/* Form Nuova Assegnazione */}
        <div className="glass-assignment-card p-8 rounded-3xl">
          <div className="glass-card-header mb-6">
            <div className="flex items-center mb-4">
              <div className="glass-icon p-4 rounded-2xl mr-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Crea Nuova Assegnazione</h2>
                <p className="text-white/70">Assegna operatori a poli, mezzi e settimane specifiche</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <UserCheck className="w-4 h-4 inline mr-2" />
                Utente *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.userId}
                  onChange={(e) => updateAssegnazioneForm({ userId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona utente</option>
                  {users.filter(u => u.role === 'user').map(user => (
                    <option key={user._id} value={user._id} className="bg-gray-800">
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Polo *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.poloId}
                  onChange={(e) => updateAssegnazioneForm({ poloId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona polo</option>
                  {poli.map(polo => (
                    <option key={polo._id} value={polo._id} className="bg-gray-800">
                      {polo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Truck className="w-4 h-4 inline mr-2" />
                Mezzo *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.mezzoId}
                  onChange={(e) => updateAssegnazioneForm({ mezzoId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona mezzo</option>
                  {mezzi.map(mezzo => (
                    <option key={mezzo._id} value={mezzo._id} className="bg-gray-800">
                      {mezzo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Settimana *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.settimanaId}
                  onChange={(e) => updateAssegnazioneForm({ settimanaId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona settimana</option>
                  {settimane.map(settimana => (
                    <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                      {formatWeek(settimana)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateAssignment}
            disabled={!assegnazioneForm.userId || !assegnazioneForm.poloId || !assegnazioneForm.mezzoId || !assegnazioneForm.settimanaId}
            className="glass-button-primary flex items-center gap-3 px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Crea Assegnazione</span>
          </button>
        </div>

        {/* Header */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="glass-icon p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Gestione Assegnazioni</h2>
                <p className="text-white/70">Visualizza e gestisci tutte le assegnazioni operatori</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtri Avanzati
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Filtro Utente */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Operatore
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.userId}
                onChange={(e) => updateFilters({ userId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti gli operatori</option>
                {users.filter(u => u.role === 'user').map(user => (
                  <option key={user._id} value={user._id} className="bg-gray-800">
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Polo */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Polo
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.poloId}
                onChange={(e) => updateFilters({ poloId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti i poli</option>
                {poli.map(polo => (
                  <option key={polo._id} value={polo._id} className="bg-gray-800">
                    {polo.nome}
                  </option>
                ))}
              </select>
            </div>

        {/* Filtro Postazione */}
            <div>
  <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
    <Building className="w-4 h-4 mr-2" />
    Postazione
  </label>
  <select
    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
    value={filters.postazioneId || ''}
    onChange={(e) => updateFilters({ postazioneId: e.target.value })}
  >
    <option value="" className="bg-gray-800">Tutte le postazioni</option>
    {postazioni.filter(p => p.attiva).map(postazione => (
      <option key={postazione._id} value={postazione._id} className="bg-gray-800">
        {postazione.nome} - Sett. {postazione.settimanaId?.numero}
      </option>
    ))}
  </select>
</div>

            {/* Filtro Mezzo */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Mezzo
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.mezzoId}
                onChange={(e) => updateFilters({ mezzoId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti i mezzi</option>
                {mezzi.map(mezzo => (
                  <option key={mezzo._id} value={mezzo._id} className="bg-gray-800">
                    {mezzo.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Settimana */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Settimana
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.settimanaId}
                onChange={(e) => updateFilters({ settimanaId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutte le settimane</option>
                {settimane.map(settimana => (
                  <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                    Settimana {settimana.numero}/{settimana.anno}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro Stato */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Stato Assegnazione
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.attiva}
                onChange={(e) => updateFilters({ attiva: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti gli stati</option>
                <option value="true" className="bg-gray-800">Solo Attive</option>
                <option value="false" className="bg-gray-800">Solo Inattive</option>
              </select>
            </div>

            {/* Ricerca per Nome */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Ricerca Libera
              </label>
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cerca operatore, polo, mezzo..."
                    className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella Assegnazioni */}
        <div className="glass-card-large rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Assegnazioni Trovate
              {!loading && (
                <span className="ml-2 text-sm text-white/50">
                  ({filteredAssegnazioni.length} risultati)
                </span>
              )}
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-white/70">Caricamento assegnazioni...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="glass-table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Operatore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Polo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
  Postazione
</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Mezzo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Settimana
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAssegnazioni.map(assegnazione => (
                    <tr key={assegnazione._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="glass-avatar w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {assegnazione.userId?.username}
                            </div>
                            <div className="text-sm text-white/50">
                              {assegnazione.userId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {assegnazione.poloId?.nome || 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center">
    <Building className="w-4 h-4 mr-2 text-orange-400" />
    <div className="text-sm text-white">
      {assegnazione.postazioneId?.nome || 'Non assegnata'}
    </div>
  </div>
</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {assegnazione.mezzoId?.nome || 'N/A'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          Settimana {assegnazione.settimanaId?.numero}/{assegnazione.settimanaId?.anno}
                        </div>
                        <div className="text-sm text-white/50">
                          {new Date(assegnazione.settimanaId?.dataInizio).toLocaleDateString('it-IT')} - {new Date(assegnazione.settimanaId?.dataFine).toLocaleDateString('it-IT')}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`glass-status-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          assegnazione.attiva 
                            ? 'text-green-200 border-green-300/30 bg-green-400/20' 
                            : 'text-red-200 border-red-300/30 bg-red-400/20'
                        }`}>
                          {assegnazione.attiva ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              ATTIVA
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              INATTIVA
                            </>
                          )}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {assegnazione.attiva ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditAssignmentId(assegnazione._id);
                                  updateEditForm({
                                    poloId: assegnazione.poloId?._id || '',
                                    mezzoId: assegnazione.mezzoId?._id || '',
                                    settimanaId: assegnazione.settimanaId?._id || ''
                                  });
                                }}
                                className="glass-button-primary p-2 rounded-xl hover:scale-105 transition-all duration-300"
                                title="Modifica assegnazione"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSoftDelete(assegnazione._id)}
                                className="glass-button-warning p-2 rounded-xl hover:scale-105 transition-all duration-300"
                                title="Disattiva assegnazione"
                              >
                                <EyeOff className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleHardDelete(assegnazione._id)}
                                className="glass-button-danger p-2 rounded-xl hover:scale-105 transition-all duration-300"
                                title="Elimina definitivamente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(assegnazione._id)}
                                className="glass-button-success p-2 rounded-xl hover:scale-105 transition-all duration-300"
                                title="Ripristina assegnazione"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleHardDelete(assegnazione._id)}
                                className="glass-button-danger p-2 rounded-xl hover:scale-105 transition-all duration-300"
                                title="Elimina definitivamente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Form di Modifica Inline */}
                        {editAssignmentId === assegnazione._id && (
                          <div className="glass-edit-form mt-4 p-4 rounded-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="glass-input-container">
                                <select
                                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                  value={editForm.poloId}
                                  onChange={(e) => updateEditForm({ poloId: e.target.value })}
                                >
                                  <option value="" className="bg-gray-800">Seleziona Polo</option>
                                  {poli.map(p => (
                                    <option key={p._id} value={p._id} className="bg-gray-800">{p.nome}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="glass-input-container">
                                <select
                                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                  value={editForm.mezzoId}
                                  onChange={(e) => updateEditForm({ mezzoId: e.target.value })}
                                >
                                  <option value="" className="bg-gray-800">Seleziona Mezzo</option>
                                  {mezzi.map(m => (
                                    <option key={m._id} value={m._id} className="bg-gray-800">{m.nome}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="glass-input-container">
                                <select
                                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                  value={editForm.settimanaId}
                                  onChange={(e) => updateEditForm({ settimanaId: e.target.value })}
                                >
                                  <option value="" className="bg-gray-800">Seleziona Settimana</option>
                                  {settimane.map(s => (
                                    <option key={s._id} value={s._id} className="bg-gray-800">
                                      {formatWeek(s)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleUpdateAssignment(assegnazione._id)}
                                className="glass-button-success flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="text-sm font-medium">Salva</span>
                              </button>

                              <button
                                onClick={() => setEditAssignmentId(null)}
                                className="glass-button-secondary flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Annulla</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAssegnazioni.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-white/70 text-lg mb-2">Nessuna assegnazione trovata</p>
                  <p className="text-sm text-white/50">
                    Modifica i filtri per vedere più risultati
                  </p>
                </div>
              )}
            </div>
          )}
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

        .glass-card-large {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        .glass-assignment-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        .glass-card-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 1.5rem;
        }

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-avatar {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
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

        .glass-table-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-table-row {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
        }

        .glass-status-badge {
          backdrop-filter: blur(10px);
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

        .glass-button-success {
          background: rgba(34, 197, 94, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: white;
        }

        .glass-button-success:hover {
          background: rgba(34, 197, 94, 0.4);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
        }

        .glass-button-warning {
          background: rgba(251, 191, 36, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(251, 191, 36, 0.4);
          color: white;
        }

        .glass-button-warning:hover {
          background: rgba(251, 191, 36, 0.4);
          box-shadow: 0 8px 24px rgba(251, 191, 36, 0.3);
        }

        .glass-button-danger {
          background: rgba(239, 68, 68, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: white;
        }

        .glass-button-danger:hover {
          background: rgba(239, 68, 68, 0.4);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
        }

        .glass-button-secondary {
          background: rgba(107, 114, 128, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 114, 128, 0.4);
          box-shadow: 0 4px 16px rgba(107, 114, 128, 0.2);
          color: white;
        }

        .glass-button-secondary:hover {
          background: rgba(107, 114, 128, 0.4);
          box-shadow: 0 8px 24px rgba(107, 114, 128, 0.3);
        }

        .glass-edit-form {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
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
          .glass-assignment-card {
            padding: 1rem;
          }
          
          .grid {
            grid-template-columns: 1fr;
          }
          
          .px-6 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AssignmentsManagement;