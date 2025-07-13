// // components/admin/PostazioniManagement.js
// import React, { useState, useEffect } from 'react';
// import { 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Save, 
//   X, 
//   Building, 
//   MapPin, 
//   Users, 
//   Calendar,
//   Search,
//   Filter,
//   Copy,
//   ToggleLeft,
//   ToggleRight,
//   Wrench
// } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';
// import { apiCall } from '../../services/api';
// import { formatDate } from '../../utils/formatters';

// const PostazioniManagement = () => {
//   const { token, setError } = useAuth();
  
//   // Stati per dati
//   const [postazioni, setPostazioni] = useState([]);
//   const [settimane, setSettimane] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // Stati per form nuova postazione
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [addForm, setAddForm] = useState({
//     nome: '',
//     descrizione: '',
//     settimanaId: '',
//     indirizzo: '',
//     coordinate: { lat: '', lng: '' },
//     capacitaPersone: 1,
//     attrezzature: [],
//     note: '',
//     attiva: true
//   });
  
//   // Stati per editing
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({
//     nome: '',
//     descrizione: '',
//     settimanaId: '',
//     indirizzo: '',
//     coordinate: { lat: '', lng: '' },
//     capacitaPersone: 1,
//     attrezzature: [],
//     note: '',
//     attiva: true
//   });

//   // Stati per filtri
//   const [filters, setFilters] = useState({
//     settimanaId: '',
//     attiva: '',
//     searchTerm: '',
//     capacitaMin: '',
//     capacitaMax: ''
//   });

//   // Stati per copia
//   const [showCopyForm, setShowCopyForm] = useState(false);
//   const [copyForm, setCopyForm] = useState({
//     fromSettimanaId: '',
//     toSettimanaId: ''
//   });

//   // Carica dati
//   const loadData = async () => {
//     try {
//       setLoading(true);
//       setError('');
      
//       // Carica settimane
//       const settimaneData = await apiCall('/settimane', {}, token);
//       setSettimane(settimaneData || []);
      
//       // Carica postazioni con filtri
//       const queryParams = new URLSearchParams();
//       if (filters.settimanaId) queryParams.append('settimanaId', filters.settimanaId);
//       if (filters.attiva !== '') queryParams.append('attiva', filters.attiva);
//       if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
//       if (filters.capacitaMin) queryParams.append('capacitaMin', filters.capacitaMin);
//       if (filters.capacitaMax) queryParams.append('capacitaMax', filters.capacitaMax);
      
//       const postazioniData = await apiCall(`/postazioni?${queryParams}`, {}, token);
//       setPostazioni(postazioniData || []);
//     } catch (err) {
//       setError('Errore nel caricamento dati: ' + err.message);
//       setPostazioni([]);
//       setSettimane([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Carica dati iniziali e quando cambiano i filtri
//   useEffect(() => {
//     loadData();
//   }, [filters.settimanaId, filters.attiva]);

//   // Reset form nuova postazione
//   const resetAddForm = () => {
//     setAddForm({
//       nome: '',
//       descrizione: '',
//       settimanaId: '',
//       indirizzo: '',
//       coordinate: { lat: '', lng: '' },
//       capacitaPersone: 1,
//       attrezzature: [],
//       note: '',
//       attiva: true
//     });
//     setShowAddForm(false);
//   };

//   // Crea nuova postazione
//   const handleCreatePostazione = async () => {
//     if (!addForm.nome || !addForm.settimanaId) {
//       setError('Nome e settimana sono obbligatori');
//       return;
//     }

//     try {
//       setError('');
      
//       await apiCall('/postazioni', {
//         method: 'POST',
//         body: JSON.stringify(addForm)
//       }, token);

//       await loadData();
//       resetAddForm();
//       setError('Postazione creata con successo');
//     } catch (err) {
//       setError('Errore nella creazione: ' + err.message);
//     }
//   };

//   // Avvia editing
//   const startEdit = (postazione) => {
//     setEditingId(postazione._id);
//     setEditForm({
//       nome: postazione.nome,
//       descrizione: postazione.descrizione || '',
//       settimanaId: postazione.settimanaId?._id || '',
//       indirizzo: postazione.indirizzo || '',
//       coordinate: postazione.coordinate || { lat: '', lng: '' },
//       capacitaPersone: postazione.capacitaPersone || 1,
//       attrezzature: postazione.attrezzature || [],
//       note: postazione.note || '',
//       attiva: postazione.attiva
//     });
//   };

//   // Annulla editing
//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditForm({
//       nome: '',
//       descrizione: '',
//       settimanaId: '',
//       indirizzo: '',
//       coordinate: { lat: '', lng: '' },
//       capacitaPersone: 1,
//       attrezzature: [],
//       note: '',
//       attiva: true
//     });
//   };

//   // Salva modifiche
//   const saveEdit = async (postazioneId) => {
//     try {
//       setError('');
      
//       await apiCall(`/postazioni/${postazioneId}`, {
//         method: 'PUT',
//         body: JSON.stringify(editForm)
//       }, token);

//       await loadData();
//       cancelEdit();
//       setError('Postazione aggiornata con successo');
//     } catch (err) {
//       setError('Errore nella modifica: ' + err.message);
//     }
//   };

//   // Elimina postazione
//   const deletePostazione = async (postazioneId, nome) => {
//     if (!window.confirm(`Sei sicuro di voler eliminare la postazione "${nome}"?`)) {
//       return;
//     }

//     try {
//       setError('');
      
//       await apiCall(`/postazioni/${postazioneId}`, {
//         method: 'DELETE'
//       }, token);

//       await loadData();
//       setError('Postazione eliminata con successo');
//     } catch (err) {
//       setError('Errore nell\'eliminazione: ' + err.message);
//     }
//   };

//   // Toggle stato attiva
//   const toggleAttiva = async (postazioneId, currentState) => {
//     try {
//       setError('');
      
//       await apiCall(`/postazioni/${postazioneId}/toggle`, {
//         method: 'PATCH',
//         body: JSON.stringify({ attiva: !currentState })
//       }, token);

//       await loadData();
//       setError(`Postazione ${!currentState ? 'attivata' : 'disattivata'} con successo`);
//     } catch (err) {
//       setError('Errore nel cambio stato: ' + err.message);
//     }
//   };

//   // Copia postazioni tra settimane
//   const handleCopyPostazioni = async () => {
//     if (!copyForm.fromSettimanaId || !copyForm.toSettimanaId) {
//       setError('Seleziona entrambe le settimane');
//       return;
//     }

//     try {
//       setError('');
      
//       const result = await apiCall('/postazioni/copy', {
//         method: 'POST',
//         body: JSON.stringify(copyForm)
//       }, token);

//       await loadData();
//       setShowCopyForm(false);
//       setCopyForm({ fromSettimanaId: '', toSettimanaId: '' });
//       setError(`Copia completata: ${result.copiate} postazioni copiate, ${result.saltate} già esistenti`);
//     } catch (err) {
//       setError('Errore nella copia: ' + err.message);
//     }
//   };

//   // Aggiorna filtri
//   const updateFilters = (newFilters) => {
//     setFilters(prev => ({ ...prev, ...newFilters }));
//   };

//   // Gestione attrezzature
//   const addAttrezzatura = (isEdit = false) => {
//     const form = isEdit ? editForm : addForm;
//     const setForm = isEdit ? setEditForm : setAddForm;
    
//     const nuovaAttrezzatura = prompt('Inserisci il nome dell\'attrezzatura:');
//     if (nuovaAttrezzatura) {
//       setForm({
//         ...form,
//         attrezzature: [...form.attrezzature, nuovaAttrezzatura.trim()]
//       });
//     }
//   };

//   const removeAttrezzatura = (index, isEdit = false) => {
//     const form = isEdit ? editForm : addForm;
//     const setForm = isEdit ? setEditForm : setAddForm;
    
//     setForm({
//       ...form,
//       attrezzature: form.attrezzature.filter((_, i) => i !== index)
//     });
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="glass-postazioni-card p-8 rounded-3xl">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center">
//               <div className="glass-icon p-4 rounded-2xl mr-4">
//                 <Building className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-semibold text-white mb-2">Gestione Postazioni</h2>
//                 <p className="text-white/70">
//                   Crea e gestisci postazioni di lavoro per ogni settimana
//                 </p>
//               </div>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowCopyForm(true)}
//                 className="glass-button-secondary flex items-center gap-2 px-4 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
//               >
//                 <Copy className="w-5 h-5" />
//                 <span className="font-medium">Copia</span>
//               </button>
//               <button
//                 onClick={() => setShowAddForm(true)}
//                 className="glass-button-primary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
//               >
//                 <Plus className="w-5 h-5" />
//                 <span className="font-medium">Nuova Postazione</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Form Copia Postazioni */}
//         {showCopyForm && (
//           <div className="glass-postazioni-card p-6 rounded-3xl border-l-4 border-blue-400">
//             <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//               <Copy className="w-5 h-5 mr-2" />
//               Copia Postazioni tra Settimane
//             </h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-white/80 mb-2">Da Settimana</label>
//                 <div className="glass-input-container">
//                   <select
//                     className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
//                     value={copyForm.fromSettimanaId}
//                     onChange={(e) => setCopyForm({ ...copyForm, fromSettimanaId: e.target.value })}
//                   >
//                     <option value="" className="bg-gray-800">Seleziona settimana origine</option>
//                     {settimane.map(settimana => (
//                       <option key={settimana._id} value={settimana._id} className="bg-gray-800">
//                         Settimana {settimana.numero}/{settimana.anno}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-white/80 mb-2">A Settimana</label>
//                 <div className="glass-input-container">
//                   <select
//                     className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
//                     value={copyForm.toSettimanaId}
//                     onChange={(e) => setCopyForm({ ...copyForm, toSettimanaId: e.target.value })}
//                   >
//                     <option value="" className="bg-gray-800">Seleziona settimana destinazione</option>
//                     {settimane.map(settimana => (
//                       <option key={settimana._id} value={settimana._id} className="bg-gray-800">
//                         Settimana {settimana.numero}/{settimana.anno}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="flex space-x-3">
//               <button
//                 onClick={handleCopyPostazioni}
//                 className="glass-button-primary flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300"
//               >
//                 <Copy className="w-4 h-4" />
//                 Copia Postazioni
//               </button>
//               <button
//                 onClick={() => setShowCopyForm(false)}
//                 className="glass-button-secondary flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300"
//               >
//                 <X className="w-4 h-4" />
//                 Annulla
//               </button>
//             </div>
//           </div>
//         )}

        {/* Form Nuova Postazione */}
        // {showAddForm && (
        //   <div className="glass-postazioni-card p-8 rounded-3xl border-l-4 border-green-400">
        //     <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        //       <Plus className="w-6 h-6 mr-3" />
        //       Crea Nuova Postazione
        //     </h3>
            
        //     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        //       <div>
        //         <label className="block text-sm font-medium text-white/80 mb-2">Nome *</label>
        //         <div className="glass-input-container">
        //           <input
        //             type="text"
        //             className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
        //             value={addForm.nome}
        //             onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
        //             placeholder="es. Postazione A"
        //           />
        //         </div>
        //       </div>

        //       <div>
        //         <label className="block text-sm font-medium text-white/80 mb-2">Settimana *</label>
        //         <div className="glass-input-container">
        //           <select
        //             className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
        //             value={addForm.settimanaId}
        //             onChange={(e) => setAddForm({ ...addForm, settimanaId: e.target.value })}
        //           >
        //             <option value="" className="bg-gray-800">Seleziona settimana</option>
        //             {settimane.map(settimana => (
        //               <option key={settimana._id} value={settimana._id} className="bg-gray-800">
        //                 Settimana {settimana.numero}/{settimana.anno}
        //               </option>
        //             ))}
        //           </select>
        //         </div>
        //       </div>

        //       <div>
        //         <label className="block text-sm font-medium text-white/80 mb-2">Descrizione</label>
        //         <div className="glass-input-container">
        //           <input
        //             type="text"
        //             className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
        //             value={addForm.descrizione}
        //             onChange={(e) => setAddForm({ ...addForm, descrizione: e.target.value })}
        //             placeholder="Descrizione della postazione"
        //           />
        //         </div>
        //       </div>

        //       <div>
        //         <label className="block text-sm font-medium text-white/80 mb-2">Capacità Persone</label>
        //         <div className="glass-input-container">
        //           <input
        //             type="number"
        //             min="1"
        //             className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
        //             value={addForm.capacitaPersone}
        //             onChange={(e) => setAddForm({ ...addForm, capacitaPersone: parseInt(e.target.value) || 1 })}
        //             placeholder="1"
        //           />
        //         </div>
        //       </div>

        //       <div className="md:col-span-2">
        //         <label className="block text-sm font-medium text-white/80 mb-2">Indirizzo</label>
        //         <div className="glass-input-container">
        //           <input
        //             type="text"
        //             className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
        //             value={addForm.indirizzo}
        //             onChange={(e) => setAddForm({ ...addForm, indirizzo: e.target.value })}
        //             placeholder="Via Roma 123, Milano"
        //           />
        //         </div>
        //       </div>

        //       <div>
        //         <label className="block text-sm font-medium text-white/80 mb-2">Latitudine</label>
        //         <div className="glass-input-container">
        //           <input
        //             type="number"
        //             step="any"
        //             className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
        //             value={addForm.coordinate.lat}
        //             onChange={(e) => setAddForm({ 
        //               ...addForm, 
        //               coordinate: { ...addForm.coordinate, lat: parseFloat(e.target.value) || '' }
        //             })}
        //             placeholder="45.464664"
        //           />
        //         </div>
        //       </div>

        //       <div>
        //         <label className="block text-sm font-medium text-white/80 mb-2">Longitudine</label>
        //         <div className="glass-input-container">
        //           <input
        //             type="number"
        //             step="any"
        //             className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
        //             value={addForm.coordinate.lng}
        //             onChange={(e) => setAddForm({ 
        //               ...addForm, 
        //               coordinate: { ...addForm.coordinate, lng: parseFloat(e.target.value) || '' }
        //             })}
        //             placeholder="9.188540"
        //           />
        //         </div>
        //       </div>

        //       <div className="md:col-span-2">
        //         <label className="block text-sm font-medium text-white/80 mb-2">Attrezzature</label>
        //         <div className="flex flex-wrap gap-2 mb-2">
        //           {addForm.attrezzature.map((att, index) => (
        //             <span key={index} className="glass-badge px-3 py-1 rounded-full text-sm flex items-center gap-2">
        //               {att}
        //               <button
        //                 onClick={() => removeAttrezzatura(index, false)}
        //                 className="text-red-400 hover:text-red-300"
        //               >
        //                 <X className="w-3 h-3" />
        //               </button>
        //             </span>
        //           ))}
        //         </div>
        //         <button
        //           type="button"
        //           onClick={() => addAttrezzatura(false)}
        //           className="glass-button-secondary px-4 py-2 rounded-xl text-sm"
        //         >
        //           <Plus className="w-4 h-4 inline mr-1" />
        //           Aggiungi Attrezzatura
        //         </button>
        //       </div>

        //       <div className="md:col-span-2">
        //         <label className="block text-sm font-medium text-white/80 mb-2">Note</label>
        //         <div className="glass-input-container">
        //           <textarea
        //             className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50 resize-none"
        //             rows="3"
        //             value={addForm.note}
        //             onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
        //             placeholder="Note aggiuntive sulla postazione"
        //           />
        //         </div>
        //       </div>
        //     </div>

        //     <div className="flex space-x-4">
        //       <button
        //         onClick={handleCreatePostazione}
        //         className="glass-button-success flex items-center gap-2 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
        //       >
        //         <Save className="w-4 h-4" />
        //         <span className="font-medium">Crea Postazione</span>
        //       </button>
        //       <button
        //         onClick={resetAddForm}
        //         className="glass-button-secondary flex items-center gap-2 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
        //       >
        //         <X className="w-4 h-4" />
        //         <span className="font-medium">Annulla</span>
        //       </button>
        //     </div>
        //   </div>
        // )}

//         {/* Filtri */}
//         <div className="glass-postazioni-card p-6 rounded-2xl">
//           <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//             <Filter className="w-5 h-5 mr-2" />
//             Filtri
//           </h3>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Settimana</label>
//               <div className="glass-input-container">
//                 <select
//                   className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
//                   value={filters.settimanaId}
//                   onChange={(e) => updateFilters({ settimanaId: e.target.value })}
//                 >
//                   <option value="" className="bg-gray-800">Tutte le settimane</option>
//                   {settimane.map(settimana => (
//                     <option key={settimana._id} value={settimana._id} className="bg-gray-800">
//                       Settimana {settimana.numero}/{settimana.anno}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Stato</label>
//               <div className="glass-input-container">
//                 <select
//                   className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
//                   value={filters.attiva}
//                   onChange={(e) => updateFilters({ attiva: e.target.value })}
//                 >
//                   <option value="" className="bg-gray-800">Tutti gli stati</option>
//                   <option value="true" className="bg-gray-800">Solo Attive</option>
//                   <option value="false" className="bg-gray-800">Solo Inattive</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Capacità Min</label>
//               <div className="glass-input-container">
//                 <input
//                   type="number"
//                   min="1"
//                   className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                   value={filters.capacitaMin}
//                   onChange={(e) => updateFilters({ capacitaMin: e.target.value })}
//                   placeholder="1"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Ricerca</label>
//               <div className="glass-input-container">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
//                   <input
//                     type="text"
//                     placeholder="Cerca..."
//                     className="glass-input w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={filters.searchTerm}
//                     onChange={(e) => updateFilters({ searchTerm: e.target.value })}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Statistiche */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <div className="glass-stat-card p-6 rounded-2xl">
//             <div className="flex items-center">
//               <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 mr-4">
//                 <Building className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-white">{postazioni.length}</div>
//                 <div className="text-sm text-white/70">Totale</div>
//               </div>
//             </div>
//           </div>
//           <div className="glass-stat-card p-6 rounded-2xl">
//             <div className="flex items-center">
//               <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 mr-4">
//                 <ToggleRight className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-green-400">
//                   {postazioni.filter(p => p.attiva).length}
//                 </div>
//                 <div className="text-sm text-white/70">Attive</div>
//               </div>
//             </div>
//           </div>
//           <div className="glass-stat-card p-6 rounded-2xl">
//             <div className="flex items-center">
//               <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 mr-4">
//                 <Users className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-purple-400">
//                   {postazioni.reduce((sum, p) => sum + (p.capacitaPersone || 0), 0)}
//                 </div>
//                 <div className="text-sm text-white/70">Capacità Tot.</div>
//               </div>
//             </div>
//           </div>
//           <div className="glass-stat-card p-6 rounded-2xl">
//             <div className="flex items-center">
//               <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 mr-4">
//                 <MapPin className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <div className="text-2xl font-bold text-orange-400">
//                   {postazioni.filter(p => p.coordinate?.lat && p.coordinate?.lng).length}
//                 </div>
//                 <div className="text-sm text-white/70">Con GPS</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabella Postazioni */}
//         <div className="glass-postazioni-card rounded-3xl overflow-hidden">
//           <div className="glass-table-header px-6 py-4">
//             <h3 className="text-lg font-semibold text-white">Lista Postazioni</h3>
//           </div>
          
//           {loading ? (
//             <div className="p-8 text-center">
//               <div className="text-white/70">Caricamento postazioni...</div>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead>
//                   <tr className="glass-table-header-row">
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Nome
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Settimana
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Capacità
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Indirizzo
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Attrezzature
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Stato
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Azioni
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="glass-table-body">
//                   {postazioni.map(postazione => {
//                     const isEditing = editingId === postazione._id;
                    
//                     return (
//                       <tr key={postazione._id} className="glass-table-row hover:bg-white/5 transition-colors">
//                         <td className="px-6 py-4">
//                           {isEditing ? (
//                             <div className="glass-input-container">
//                               <input
//                                 type="text"
//                                 className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
//                                 value={editForm.nome}
//                                 onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
//                               />
//                             </div>
//                           ) : (
//                             <div>
//                               <div className="text-sm font-medium text-white">{postazione.nome}</div>
//                               <div className="text-sm text-white/60">{postazione.descrizione}</div>
//                             </div>
//                           )}
//                         </td>
                        
//                         <td className="px-6 py-4">
//                           {isEditing ? (
//                             <div className="glass-input-container">
//                               <select
//                                 className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
//                                 value={editForm.settimanaId}
//                                 onChange={(e) => setEditForm({ ...editForm, settimanaId: e.target.value })}
//                               >
//                                 <option value="" className="bg-gray-800">Seleziona</option>
//                                 {settimane.map(s => (
//                                   <option key={s._id} value={s._id} className="bg-gray-800">
//                                     Sett. {s.numero}/{s.anno}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>
//                           ) : (
//                             <div className="text-sm text-white">
//                               Settimana {postazione.settimanaId?.numero}/{postazione.settimanaId?.anno}
//                             </div>
//                           )}
//                         </td>
                        
//                         <td className="px-6 py-4">
//                           {isEditing ? (
//                             <div className="glass-input-container">
//                               <input
//                                 type="number"
//                                 min="1"
//                                 className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
//                                 value={editForm.capacitaPersone}
//                                 onChange={(e) => setEditForm({ ...editForm, capacitaPersone: parseInt(e.target.value) || 1 })}
//                               />
//                             </div>
//                           ) : (
//                             <div className="flex items-center text-sm text-white">
//                               <Users className="w-4 h-4 mr-1" />
//                               {postazione.capacitaPersone || 1}
//                             </div>
//                           )}
//                         </td>
                        
//                         <td className="px-6 py-4">
//                           {isEditing ? (
//                             <div className="glass-input-container">
//                               <input
//                                 type="text"
//                                 className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
//                                 value={editForm.indirizzo}
//                                 onChange={(e) => setEditForm({ ...editForm, indirizzo: e.target.value })}
//                               />
//                             </div>
//                           ) : (
//                             <div className="text-sm text-white">
//                               {postazione.indirizzo ? (
//                                 <div className="flex items-center">
//                                   <MapPin className="w-4 h-4 mr-1" />
//                                   {postazione.indirizzo}
//                                 </div>
//                               ) : (
//                                 <span className="text-white/50">Non specificato</span>
//                               )}
//                             </div>
//                           )}
//                         </td>
                        
//                         <td className="px-6 py-4">
//                           <div className="flex flex-wrap gap-1">
//                             {(postazione.attrezzature || []).slice(0, 2).map((att, index) => (
//                               <span key={index} className="glass-mini-badge px-2 py-1 rounded text-xs">
//                                 {att}
//                               </span>
//                             ))}
//                             {(postazione.attrezzature || []).length > 2 && (
//                               <span className="text-xs text-white/50">
//                                 +{postazione.attrezzature.length - 2}
//                               </span>
//                             )}
//                             {(!postazione.attrezzature || postazione.attrezzature.length === 0) && (
//                               <span className="text-xs text-white/50">Nessuna</span>
//                             )}
//                           </div>
//                         </td>
                        
//                         <td className="px-6 py-4">
//                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             postazione.attiva 
//                               ? 'bg-green-500/20 text-green-300 border border-green-400/30'
//                               : 'bg-red-500/20 text-red-300 border border-red-400/30'
//                           } glass-badge`}>
//                             {postazione.attiva ? 'Attiva' : 'Inattiva'}
//                           </span>
//                         </td>
                        
//                         <td className="px-6 py-4">
//                           {isEditing ? (
//                             <div className="flex items-center space-x-2">
//                               <button
//                                 onClick={() => saveEdit(postazione._id)}
//                                 className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
//                                 title="Salva modifiche"
//                               >
//                                 <Save className="w-4 h-4 text-green-400" />
//                               </button>
//                               <button
//                                 onClick={cancelEdit}
//                                 className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
//                                 title="Annulla modifiche"
//                               >
//                                 <X className="w-4 h-4 text-gray-400" />
//                               </button>
//                             </div>
//                           ) : (
//                             <div className="flex items-center space-x-2">
//                               <button
//                                 onClick={() => startEdit(postazione)}
//                                 className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
//                                 title="Modifica postazione"
//                               >
//                                 <Edit className="w-4 h-4 text-blue-400" />
//                               </button>
//                               <button
//                                 onClick={() => toggleAttiva(postazione._id, postazione.attiva)}
//                                 className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
//                                 title={postazione.attiva ? 'Disattiva' : 'Attiva'}
//                               >
//                                 {postazione.attiva ? (
//                                   <ToggleLeft className="w-4 h-4 text-yellow-400" />
//                                 ) : (
//                                   <ToggleRight className="w-4 h-4 text-green-400" />
//                                 )}
//                               </button>
//                               <button
//                                 onClick={() => deletePostazione(postazione._id, postazione.nome)}
//                                 className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
//                                 title="Elimina postazione"
//                               >
//                                 <Trash2 className="w-4 h-4 text-red-400" />
//                               </button>
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>

//               {postazioni.length === 0 && !loading && (
//                 <div className="text-center py-8">
//                   <Building className="w-12 h-12 text-white/40 mx-auto mb-4" />
//                   <p className="text-white/70">Nessuna postazione trovata</p>
//                   <p className="text-sm text-white/50">Clicca "Nuova Postazione" per iniziare</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Custom Styles */}
//       <style jsx>{`
//         .glass-postazioni-card {
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(20px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//           box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
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
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(15px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//           transition: all 0.3s ease;
//         }

//         .glass-input:focus {
//           background: rgba(255, 255, 255, 0.12);
//           border-color: rgba(59, 130, 246, 0.5);
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

//         .glass-button-primary:hover {
//           background: rgba(59, 130, 246, 0.4);
//           box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3);
//         }

//         .glass-button-success {
//           background: rgba(34, 197, 94, 0.3);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(34, 197, 94, 0.4);
//           box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
//           color: white;
//         }

//         .glass-button-success:hover {
//           background: rgba(34, 197, 94, 0.4);
//           box-shadow: 0 12px 32px rgba(34, 197, 94, 0.3);
//         }

//         .glass-button-secondary {
//           background: rgba(107, 114, 128, 0.3);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(107, 114, 128, 0.4);
//           box-shadow: 0 8px 24px rgba(107, 114, 128, 0.2);
//           color: white;
//         }

//         .glass-button-secondary:hover {
//           background: rgba(107, 114, 128, 0.4);
//           box-shadow: 0 12px 32px rgba(107, 114, 128, 0.3);
//         }

//         .glass-stat-card {
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(15px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//           box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
//           transition: all 0.3s ease;
//         }

//         .glass-stat-card:hover {
//           background: rgba(255, 255, 255, 0.12);
//           transform: translateY(-2px);
//           box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
//         }

//         .glass-stat-icon {
//           backdrop-filter: blur(10px);
//           box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
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

//         .glass-badge {
//           backdrop-filter: blur(10px);
//         }

//         .glass-mini-badge {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(8px);
//           border: 1px solid rgba(255, 255, 255, 0.15);
//           color: white;
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

//         /* Responsive */
//         @media (max-width: 768px) {
//           .glass-postazioni-card {
//             padding: 1rem;
//           }
          
//           .glass-stat-card {
//             padding: 1rem;
//           }
          
//           .grid {
//             grid-template-columns: 1fr;
//           }
          
//           .flex {
//             flex-direction: column;
//             gap: 0.5rem;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default PostazioniManagement;



// ===================================
// SOLUZIONE: Fix Filtro Ricerca
// ===================================

// Sostituisci la sezione filtri e logica nel componente PostazioniManagement:

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Building, 
  MapPin, 
  Users, 
  Calendar,
  Search,
  Filter,
  Copy,
  ToggleLeft,
  ToggleRight,
  Wrench
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../services/api';
import { formatDate } from '../../utils/formatters';


const PostazioniManagement = () => {
  const { token, setError } = useAuth();
  
  // Stati per dati
  const [postazioni, setPostazioni] = useState([]);
  const [allPostazioni, setAllPostazioni] = useState([]); // ← NUOVO: Tutte le postazioni
  const [poli, setPoli] = useState([]); // ← CAMBIATO: da settimane a poli
  const [loading, setLoading] = useState(false);
  
  // Stati per form nuova postazione
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    nome: '',
    descrizione: '',
    poloId: '', // ← CAMBIATO: da settimanaId a poloId
    indirizzo: '',
    coordinate: { lat: '', lng: '' },
    capacitaPersone: 1,
    attrezzature: [],
    note: '',
    attiva: true
  });
  
  // Stati per editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    descrizione: '',
    poloId: '', // ← CAMBIATO: da settimanaId a poloId
    indirizzo: '',
    coordinate: { lat: '', lng: '' },
    capacitaPersone: 1,
    attrezzature: [],
    note: '',
    attiva: true
  });

  // Stati per filtri
  const [filters, setFilters] = useState({
    poloId: '', // ← CAMBIATO: da settimanaId a poloId
    attiva: '',
    searchTerm: '',
    capacitaMin: '',
    capacitaMax: ''
  });

  // Stati per copia
  const [showCopyForm, setShowCopyForm] = useState(false);
  const [copyForm, setCopyForm] = useState({
    fromPoloId: '', // ← CAMBIATO: da fromSettimanaId a fromPoloId
    toPoloId: '' // ← CAMBIATO: da toSettimanaId a toPoloId
  });

  // Carica dati dal server
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Carica poli (cambiato da settimane)
      const poliData = await apiCall('/poli', {}, token);
      setPoli(poliData || []);
      
      // Carica TUTTE le postazioni (senza filtro searchTerm)
      const queryParams = new URLSearchParams();
      if (filters.poloId) queryParams.append('poloId', filters.poloId); // ← CAMBIATO
      if (filters.attiva !== '') queryParams.append('attiva', filters.attiva);
      if (filters.capacitaMin) queryParams.append('capacitaMin', filters.capacitaMin);
      if (filters.capacitaMax) queryParams.append('capacitaMax', filters.capacitaMax);
      
      const postazioniData = await apiCall(`/postazioni?${queryParams}`, {}, token);
      setAllPostazioni(postazioniData || []); // ← SALVA TUTTE LE POSTAZIONI
    } catch (err) {
      setError('Errore nel caricamento dati: ' + err.message);
      setAllPostazioni([]);
      setPoli([]); // ← CAMBIATO
    } finally {
      setLoading(false);
    }
  };

  // Applica filtri lato client
  const applyClientFilters = () => {
    let filtered = [...allPostazioni];

    // Filtro ricerca libera (LATO CLIENT)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(postazione => 
        postazione.nome.toLowerCase().includes(term) ||
        postazione.descrizione?.toLowerCase().includes(term) ||
        postazione.indirizzo?.toLowerCase().includes(term) ||
        postazione.note?.toLowerCase().includes(term) ||
        postazione.attrezzature?.some(att => att.toLowerCase().includes(term)) ||
        // ← CAMBIATO: ricerca nel polo invece della settimana
        (postazione.poloId?.nome && postazione.poloId.nome.toLowerCase().includes(term))
      );
    }

    setPostazioni(filtered);
  };

  // Carica dati quando cambiano i filtri SERVER
  useEffect(() => {
    loadData();
  }, [filters.poloId, filters.attiva, filters.capacitaMin, filters.capacitaMax]); // ← CAMBIATO

  // Applica filtri CLIENT quando cambiano searchTerm o allPostazioni
  useEffect(() => {
    applyClientFilters();
  }, [filters.searchTerm, allPostazioni]);

  // Caricamento iniziale
  useEffect(() => {
    loadData();
  }, []);

  // Reset form nuova postazione
  const resetAddForm = () => {
    setAddForm({
      nome: '',
      descrizione: '',
      poloId: '', // ← CAMBIATO
      indirizzo: '',
      coordinate: { lat: '', lng: '' },
      capacitaPersone: 1,
      attrezzature: [],
      note: '',
      attiva: true
    });
    setShowAddForm(false);
  };

  // Crea nuova postazione
  const handleCreatePostazione = async () => {
   if (!addForm.nome || !addForm.poloId) { // ← CAMBIATO
      setError('Nome e polo sono obbligatori');
      return;
    }

     try {
      setError('');
      
      await apiCall('/postazioni', {
        method: 'POST',
        body: JSON.stringify(addForm)
      }, token);

      await loadData();
      resetAddForm();
       setError('Postazione creata con successo');
     } catch (err) {
      setError('Errore nella creazione: ' + err.message);
     }
   };

  // Avvia editing
  const startEdit = (postazione) => {
    setEditingId(postazione._id);
    setEditForm({
      nome: postazione.nome,
      descrizione: postazione.descrizione || '',
      poloId: postazione.poloId?._id || '', // ← CAMBIATO
      indirizzo: postazione.indirizzo || '',
      coordinate: postazione.coordinate || { lat: '', lng: '' },
      capacitaPersone: postazione.capacitaPersone || 1,
      attrezzature: postazione.attrezzature || [],
      note: postazione.note || '',
      attiva: postazione.attiva
    });
  };

  // Annulla editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      nome: '',
      descrizione: '',
      poloId: '', // ← CAMBIATO
      indirizzo: '',
      coordinate: { lat: '', lng: '' },
      capacitaPersone: 1,
      attrezzature: [],
      note: '',
      attiva: true
    });
  };

  // Salva modifiche
  const saveEdit = async (postazioneId) => {
    try {
      setError('');
      
      await apiCall(`/postazioni/${postazioneId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      }, token);

      await loadData(); // ← RICARICA DAL SERVER
      cancelEdit();
      setError('Postazione aggiornata con successo');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  // Elimina postazione
  const deletePostazione = async (postazioneId, nome) => {
    if (!window.confirm(`Sei sicuro di voler eliminare la postazione "${nome}"?`)) {
      return;
    }

    try {
      setError('');
      
      await apiCall(`/postazioni/${postazioneId}`, {
        method: 'DELETE'
      }, token);

      await loadData(); // ← RICARICA DAL SERVER
      setError('Postazione eliminata con successo');
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  // Toggle stato attiva
  const toggleAttiva = async (postazioneId, currentState) => {
    try {
      setError('');
      
      await apiCall(`/postazioni/${postazioneId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ attiva: !currentState })
      }, token);

      await loadData(); // ← RICARICA DAL SERVER
      setError(`Postazione ${!currentState ? 'attivata' : 'disattivata'} con successo`);
    } catch (err) {
      setError('Errore nel cambio stato: ' + err.message);
    }
  };

  // Copia postazioni tra poli (cambiato da settimane)
  const handleCopyPostazioni = async () => {
    if (!copyForm.fromPoloId || !copyForm.toPoloId) { // ← CAMBIATO
      setError('Seleziona entrambi i poli');
      return;
    }

    try {
      setError('');
      
      const result = await apiCall('/postazioni/copy', {
        method: 'POST',
        body: JSON.stringify(copyForm)
      }, token);

      await loadData(); // ← RICARICA DAL SERVER
      setShowCopyForm(false);
      setCopyForm({ fromPoloId: '', toPoloId: '' }); // ← CAMBIATO
      setError(`Copia completata: ${result.copiate} postazioni copiate, ${result.saltate} già esistenti`);
    } catch (err) {
      setError('Errore nella copia: ' + err.message);
    }
  };

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filtri
  const resetFilters = () => {
    setFilters({
      poloId: '', // ← CAMBIATO
      attiva: '',
      searchTerm: '',
      capacitaMin: '',
      capacitaMax: ''
    });
  };

  // Gestione attrezzature
  const addAttrezzatura = (isEdit = false) => {
    const form = isEdit ? editForm : addForm;
    const setForm = isEdit ? setEditForm : setAddForm;
    
    const nuovaAttrezzatura = prompt('Inserisci il nome dell\'attrezzatura:');
    if (nuovaAttrezzatura) {
      setForm({
        ...form,
        attrezzature: [...form.attrezzature, nuovaAttrezzatura.trim()]
      });
    }
  };

  const removeAttrezzatura = (index, isEdit = false) => {
    const form = isEdit ? editForm : addForm;
    const setForm = isEdit ? setEditForm : setAddForm;
    
    setForm({
      ...form,
      attrezzature: form.attrezzature.filter((_, i) => i !== index)
    });
  };

// Funzione per aprire Google Maps
const openInGoogleMaps = (postazione) => {
  let url = 'https://www.google.com/maps/search/';
  
  // Se ha coordinate GPS, usa quelle (più preciso)
  if (postazione.coordinate?.lat && postazione.coordinate?.lng) {
    url += `${postazione.coordinate.lat},${postazione.coordinate.lng}`;
  } 
  // Altrimenti usa l'indirizzo testuale
  else if (postazione.indirizzo) {
    url += encodeURIComponent(postazione.indirizzo);
  }
  // Fallback: cerca per nome postazione
  else {
    url += encodeURIComponent(postazione.nome + ' Milano'); // Aggiungi città di default
  }
  
  // Apri in nuova tab
  window.open(url, '_blank', 'noopener,noreferrer');
};

const openNavigation = (postazione) => {
  let destination = '';
  
  if (postazione.coordinate?.lat && postazione.coordinate?.lng) {
    destination = `${postazione.coordinate.lat},${postazione.coordinate.lng}`;
  } else if (postazione.indirizzo) {
    destination = encodeURIComponent(postazione.indirizzo);
  } else {
    destination = encodeURIComponent(postazione.nome + ' Milano');
  }
  
  // URL per navigazione da posizione corrente
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

  return (
    <>
      <div className="space-y-6">
        {/* Header - UGUALE */}
        <div className="glass-postazioni-card p-8 rounded-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="glass-icon p-4 rounded-2xl mr-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Gestione Postazioni</h2>
                <p className="text-white/70">
                  Crea e gestisci postazioni di lavoro per ogni polo {/* ← CAMBIATO testo */}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCopyForm(true)}
                className="glass-button-secondary flex items-center gap-2 px-4 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <Copy className="w-5 h-5" />
                <span className="font-medium">Copia</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="glass-button-primary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Nuova Postazione</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Copia Postazioni - AGGIORNATO PER POLI */}
        {showCopyForm && (
          <div className="glass-postazioni-card p-6 rounded-3xl border-l-4 border-blue-400">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Copy className="w-5 h-5 mr-2" />
              Copia Postazioni tra Poli {/* ← CAMBIATO testo */}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Da Polo</label> {/* ← CAMBIATO */}
                <div className="glass-input-container">
                  <select
                    className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                    value={copyForm.fromPoloId} // ← CAMBIATO
                    onChange={(e) => setCopyForm({ ...copyForm, fromPoloId: e.target.value })} // ← CAMBIATO
                  >
                    <option value="" className="bg-gray-800">Seleziona polo origine</option> {/* ← CAMBIATO */}
                    {poli.map(polo => ( // ← CAMBIATO: da settimane a poli
                      <option key={polo._id} value={polo._id} className="bg-gray-800">
                        {polo.nome} {/* ← CAMBIATO: mostra nome polo */}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">A Polo</label> {/* ← CAMBIATO */}
                <div className="glass-input-container">
                  <select
                    className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                    value={copyForm.toPoloId} // ← CAMBIATO
                    onChange={(e) => setCopyForm({ ...copyForm, toPoloId: e.target.value })} // ← CAMBIATO
                  >
                    <option value="" className="bg-gray-800">Seleziona polo destinazione</option> {/* ← CAMBIATO */}
                    {poli.map(polo => ( // ← CAMBIATO: da settimane a poli
                      <option key={polo._id} value={polo._id} className="bg-gray-800">
                        {polo.nome} {/* ← CAMBIATO: mostra nome polo */}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCopyPostazioni}
                className="glass-button-primary flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <Copy className="w-4 h-4" />
                Copia Postazioni
              </button>
              <button
                onClick={() => setShowCopyForm(false)}
                className="glass-button-secondary flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <X className="w-4 h-4" />
                Annulla
              </button>
            </div>
          </div>
        )}

        {/* Form Nuova Postazione - AGGIORNATO PER POLI */}
        {showAddForm && (
          <div className="glass-postazioni-card p-8 rounded-3xl border-l-4 border-green-400">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Plus className="w-6 h-6 mr-3" />
              Crea Nuova Postazione
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Nome *</label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.nome}
                    onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
                    placeholder="es. Postazione A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Polo *</label> {/* ← CAMBIATO */}
                <div className="glass-input-container">
                  <select
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                    value={addForm.poloId} // ← CAMBIATO
                    onChange={(e) => setAddForm({ ...addForm, poloId: e.target.value })} // ← CAMBIATO
                  >
                    <option value="" className="bg-gray-800">Seleziona polo</option> {/* ← CAMBIATO */}
                    {poli.map(polo => ( // ← CAMBIATO: da settimane a poli
                      <option key={polo._id} value={polo._id} className="bg-gray-800">
                        {polo.nome} {/* ← CAMBIATO: mostra nome polo */}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Descrizione</label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.descrizione}
                    onChange={(e) => setAddForm({ ...addForm, descrizione: e.target.value })}
                    placeholder="Descrizione della postazione"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Capacità Persone</label>
                <div className="glass-input-container">
                  <input
                    type="number"
                    min="1"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.capacitaPersone}
                    onChange={(e) => setAddForm({ ...addForm, capacitaPersone: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">Indirizzo</label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.indirizzo}
                    onChange={(e) => setAddForm({ ...addForm, indirizzo: e.target.value })}
                    placeholder="Via Roma 123, Milano"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Latitudine</label>
                <div className="glass-input-container">
                  <input
                    type="number"
                    step="any"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.coordinate.lat}
                    onChange={(e) => setAddForm({ 
                      ...addForm, 
                      coordinate: { ...addForm.coordinate, lat: parseFloat(e.target.value) || '' }
                    })}
                    placeholder="45.464664"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Longitudine</label>
                <div className="glass-input-container">
                  <input
                    type="number"
                    step="any"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.coordinate.lng}
                    onChange={(e) => setAddForm({ 
                      ...addForm, 
                      coordinate: { ...addForm.coordinate, lng: parseFloat(e.target.value) || '' }
                    })}
                    placeholder="9.188540"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">Attrezzature</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {addForm.attrezzature.map((att, index) => (
                    <span key={index} className="glass-badge px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {att}
                      <button
                        onClick={() => removeAttrezzatura(index, false)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addAttrezzatura(false)}
                  className="glass-button-secondary px-4 py-2 rounded-xl text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Aggiungi Attrezzatura
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">Note</label>
                <div className="glass-input-container">
                  <textarea
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50 resize-none"
                    rows="3"
                    value={addForm.note}
                    onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
                    placeholder="Note aggiuntive sulla postazione"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleCreatePostazione}
                className="glass-button-success flex items-center gap-2 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                <span className="font-medium">Crea Postazione</span>
              </button>
              <button
                onClick={resetAddForm}
                className="glass-button-secondary flex items-center gap-2 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <X className="w-4 h-4" />
                <span className="font-medium">Annulla</span>
              </button>
            </div>
          </div>
        )}

        {/* Filtri - AGGIORNATI PER POLI */}
        <div className="glass-postazioni-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtri
            </h3>
            {/* Mostra conteggio risultati */}
            <div className="text-white/70 text-sm">
              {postazioni.length} di {allPostazioni.length} postazioni
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Polo</label> {/* ← CAMBIATO */}
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                  value={filters.poloId} // ← CAMBIATO
                  onChange={(e) => updateFilters({ poloId: e.target.value })} // ← CAMBIATO
                >
                  <option value="" className="bg-gray-800">Tutti i poli</option> {/* ← CAMBIATO */}
                  {poli.map(polo => ( // ← CAMBIATO: da settimane a poli
                    <option key={polo._id} value={polo._id} className="bg-gray-800">
                      {polo.nome} {/* ← CAMBIATO: mostra nome polo */}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Stato</label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                  value={filters.attiva}
                  onChange={(e) => updateFilters({ attiva: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Tutti gli stati</option>
                  <option value="true" className="bg-gray-800">Solo Attive</option>
                  <option value="false" className="bg-gray-800">Solo Inattive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Capacità Min</label>
              <div className="glass-input-container">
                <input
                  type="number"
                  min="1"
                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={filters.capacitaMin}
                  onChange={(e) => updateFilters({ capacitaMin: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Capacità Max</label>
              <div className="glass-input-container">
                <input
                  type="number"
                  min="1"
                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={filters.capacitaMax}
                  onChange={(e) => updateFilters({ capacitaMax: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            {/* ← RICERCA MIGLIORATA */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">🔍 Ricerca Avanzata</label>
              <div className="glass-input-container">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Nome, indirizzo, attrezzature..."
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  />
                  {/* Mostra X per pulire */}
                  {filters.searchTerm && (
                    <button
                      onClick={() => updateFilters({ searchTerm: '' })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottone Reset */}
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
            >
              Reset Filtri
            </button>
          </div>
        </div>

        {/* Statistiche - UGUALE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-stat-card p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 mr-4">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{postazioni.length}</div>
                <div className="text-sm text-white/70">Mostrate</div>
              </div>
            </div>
          </div>
          <div className="glass-stat-card p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 mr-4">
                <ToggleRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {postazioni.filter(p => p.attiva).length}
                </div>
                <div className="text-sm text-white/70">Attive</div>
              </div>
            </div>
          </div>
          <div className="glass-stat-card p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {postazioni.reduce((sum, p) => sum + (p.capacitaPersone || 0), 0)}
                </div>
                <div className="text-sm text-white/70">Capacità Tot.</div>
              </div>
            </div>
          </div>
          <div className="glass-stat-card p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 mr-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {postazioni.filter(p => p.coordinate?.lat && p.coordinate?.lng).length}
                </div>
                <div className="text-sm text-white/70">Con GPS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella Postazioni - AGGIORNATA PER POLI */}
        <div className="glass-postazioni-card rounded-3xl overflow-hidden">
          <div className="glass-table-header px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Lista Postazioni</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-white/70">Caricamento postazioni...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="glass-table-header-row">
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Polo {/* ← CAMBIATO: da Settimana a Polo */}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Capacità
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Indirizzo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Attrezzature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-table-body">
                  {/* Usa postazioni (filtrate) invece di allPostazioni */}
                  {postazioni.map(postazione => {
                    const isEditing = editingId === postazione._id;
                    
                    return (
                      <tr key={postazione._id} className="glass-table-row hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="text"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.nome}
                                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-white">{postazione.nome}</div>
                              <div className="text-sm text-white/60">{postazione.descrizione}</div>
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <select
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.poloId} // ← CAMBIATO
                                onChange={(e) => setEditForm({ ...editForm, poloId: e.target.value })} // ← CAMBIATO
                              >
                                <option value="" className="bg-gray-800">Seleziona</option>
                                {poli.map(polo => ( // ← CAMBIATO: da settimane a poli
                                  <option key={polo._id} value={polo._id} className="bg-gray-800">
                                    {polo.nome} {/* ← CAMBIATO: mostra nome polo */}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="text-sm text-white">
                              {postazione.poloId?.nome || 'N/A'} {/* ← CAMBIATO: mostra nome polo */}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="number"
                                min="1"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.capacitaPersone}
                                onChange={(e) => setEditForm({ ...editForm, capacitaPersone: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-white">
                              <Users className="w-4 h-4 mr-1" />
                              {postazione.capacitaPersone || 1}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="text"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.indirizzo}
                                onChange={(e) => setEditForm({ ...editForm, indirizzo: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white">
                              {postazione.indirizzo ? (
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {postazione.indirizzo}
                                </div>
                              ) : (
                                <span className="text-white/50">Non specificato</span>
                              )}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(postazione.attrezzature || []).slice(0, 2).map((att, index) => (
                              <span key={index} className="glass-mini-badge px-2 py-1 rounded text-xs">
                                {att}
                              </span>
                            ))}
                            {(postazione.attrezzature || []).length > 2 && (
                              <span className="text-xs text-white/50">
                                +{postazione.attrezzature.length - 2}
                              </span>
                            )}
                            {(!postazione.attrezzature || postazione.attrezzature.length === 0) && (
                              <span className="text-xs text-white/50">Nessuna</span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            postazione.attiva 
                              ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                              : 'bg-red-500/20 text-red-300 border border-red-400/30'
                          } glass-badge`}>
                            {postazione.attiva ? 'Attiva' : 'Inattiva'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => saveEdit(postazione._id)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Salva modifiche"
                              >
                                <Save className="w-4 h-4 text-green-400" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Annulla modifiche"
                              >
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => startEdit(postazione)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Modifica postazione"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => toggleAttiva(postazione._id, postazione.attiva)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title={postazione.attiva ? 'Disattiva' : 'Attiva'}
                              >
                                {postazione.attiva ? (
                                  <ToggleLeft className="w-4 h-4 text-yellow-400" />
                                ) : (
                                  <ToggleRight className="w-4 h-4 text-green-400" />
                                )}
                              </button>
                              <button
                                onClick={() => deletePostazione(postazione._id, postazione.nome)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Elimina postazione"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Messaggio quando non ci sono risultati */}
              {postazioni.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  {allPostazioni.length === 0 ? (
                    <>
                      <p className="text-white/70">Nessuna postazione trovata</p>
                      <p className="text-sm text-white/50">Clicca "Nuova Postazione" per iniziare</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white/70">Nessuna postazione corrisponde ai filtri</p>
                      <p className="text-sm text-white/50 mb-4">
                        {filters.searchTerm ? `Nessun risultato per "${filters.searchTerm}"` : 'Modifica i filtri per vedere più risultati'}
                      </p>
                      <button
                        onClick={resetFilters}
                        className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
                      >
                        Reset Filtri
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Debug info se necessario */}
              {filters.searchTerm && (
                <div className="px-6 py-2 text-xs text-white/50 border-t border-white/10">
                  💡 Ricerca in: nome, descrizione, indirizzo, note, attrezzature, polo {/* ← CAMBIATO: da settimana a polo */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles - UGUALI */}
      <style jsx>{`
        .glass-postazioni-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        .glass-icon {
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

        .glass-button-primary {
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
          color: white;
        }

        .glass-button-primary:hover {
          background: rgba(59, 130, 246, 0.4);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3);
        }

        .glass-button-success {
          background: rgba(34, 197, 94, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 197, 94, 0.4);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
          color: white;
        }

        .glass-button-success:hover {
          background: rgba(34, 197, 94, 0.4);
          box-shadow: 0 12px 32px rgba(34, 197, 94, 0.3);
        }

        .glass-button-secondary {
          background: rgba(107, 114, 128, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 114, 128, 0.4);
          box-shadow: 0 8px 24px rgba(107, 114, 128, 0.2);
          color: white;
        }

        .glass-button-secondary:hover {
          background: rgba(107, 114, 128, 0.4);
          box-shadow: 0 12px 32px rgba(107, 114, 128, 0.3);
        }

        .glass-stat-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .glass-stat-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .glass-stat-icon {
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
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

        .glass-badge {
          backdrop-filter: blur(10px);
        }

        .glass-mini-badge {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
        }

        .glass-action-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-action-button:hover {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .glass-postazioni-card {
            padding: 1rem;
          }
          
          .glass-stat-card {
            padding: 1rem;
          }
          
          .grid {
            grid-template-columns: 1fr;
          }
          
          .flex {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default PostazioniManagement;