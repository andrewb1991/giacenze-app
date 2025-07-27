// import React, { useState, useEffect } from 'react';
// import { 
//   Package,
//   Plus,
//   Search,
//   Filter,
//   Edit,
//   Trash2,
//   Eye,
//   Download,
//   Calendar,
//   MapPin,
//   User,
//   DollarSign,
//   Clock,
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   PlayCircle,
//   Star,
//   Building,
//   Truck,
//   FileText,
//   TrendingUp,
//   BarChart3,
//   Users,
//   ShoppingCart
// } from 'lucide-react';

// const OrdiniManagement = () => {
//   // Stati principali
//   const [ordini, setOrdini] = useState([]);
//   const [filteredOrdini, setFilteredOrdini] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('lista');

//   // Stati per filtri
//   const [filtri, setFiltri] = useState({
//     stato: '',
//     priorita: '',
//     cliente: '',
//     dataInizio: '',
//     dataFine: '',
//     citta: '',
//     searchTerm: ''
//   });

//   // Stati per form nuovo ordine
//   const [showNewOrderModal, setShowNewOrderModal] = useState(false);
//   const [nuovoOrdine, setNuovoOrdine] = useState({
//     numero: '',
//     cliente: '',
//     descrizione: '',
//     dataConsegna: '',
//     indirizzo: {
//       via: '',
//       citta: '',
//       cap: '',
//       provincia: ''
//     },
//     priorita: 'MEDIA',
//     prodotti: [],
//     valore: 0,
//     tempoStimato: 60,
//     contatti: {
//       telefono: '',
//       email: '',
//       referente: ''
//     },
//     note: ''
//   });

//   // Stati per modal dettagli
//   const [selectedOrdine, setSelectedOrdine] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);

//   // Stati per statistiche
//   const [statistiche, setStatistiche] = useState({
//     totaleOrdini: 0,
//     ordiniCreati: 0,
//     ordiniAssegnati: 0,
//     ordiniInCorso: 0,
//     ordiniCompletati: 0,
//     valoreCommercialeGiornaliero: 0,
//     valoreCommercialeSettimanale: 0,
//     tempoMedioConsegna: 0
//   });

//   // Mock data per sviluppo
//   useEffect(() => {
//     caricaDatiIniziali();
//   }, []);

//   const caricaDatiIniziali = async () => {
//     try {
//       setLoading(true);
      
//       // Mock data - sostituire con vere chiamate API
//       const mockOrdini = [
//         {
//           _id: '1',
//           numero: 'ORD-20241019001',
//           cliente: 'Azienda Alpha S.r.l.',
//           descrizione: 'Fornitura materiali edili',
//           dataConsegna: '2024-10-22',
//           indirizzo: {
//             via: 'Via Roma 123',
//             citta: 'Milano',
//             cap: '20100',
//             provincia: 'MI'
//           },
//           priorita: 'ALTA',
//           stato: 'CREATO',
//           prodotti: [
//             { nome: 'Cemento Portland', quantita: 50, unita: 'sacchi', prezzo: 8.50 },
//             { nome: 'Ferro per cemento armato', quantita: 100, unita: 'kg', prezzo: 1.20 }
//           ],
//           valore: 545,
//           tempoStimato: 120,
//           contatti: {
//             telefono: '+39 02 1234567',
//             email: 'ordini@alpha.it',
//             referente: 'Mario Rossi'
//           },
//           note: 'Consegna preferibilmente al mattino',
//           createdAt: '2024-10-19T08:30:00Z'
//         },
//         {
//           _id: '2',
//           numero: 'ORD-20241019002',
//           cliente: 'Beta Construction',
//           descrizione: 'Urgente - Riparazione impianto',
//           dataConsegna: '2024-10-20',
//           indirizzo: {
//             via: 'Via Napoli 45',
//             citta: 'Roma',
//             cap: '00100',
//             provincia: 'RM'
//           },
//           priorita: 'URGENTE',
//           stato: 'ASSEGNATO',
//           prodotti: [
//             { nome: 'Tubi PVC', quantita: 20, unita: 'mt', prezzo: 12.50 },
//             { nome: 'Raccordi idraulici', quantita: 15, unita: 'pz', prezzo: 25.00 }
//           ],
//           valore: 625,
//           tempoStimato: 90,
//           contatti: {
//             telefono: '+39 06 9876543',
//             email: 'beta@construction.it',
//             referente: 'Luca Bianchi'
//           },
//           note: 'Cliente molto urgente',
//           createdAt: '2024-10-19T09:15:00Z'
//         },
//         {
//           _id: '3',
//           numero: 'ORD-20241018003',
//           cliente: 'Gamma Industries',
//           descrizione: 'Fornitura mensile standard',
//           dataConsegna: '2024-10-21',
//           indirizzo: {
//             via: 'Via Torino 78',
//             citta: 'Torino',
//             cap: '10100',
//             provincia: 'TO'
//           },
//           priorita: 'MEDIA',
//           stato: 'COMPLETATO',
//           prodotti: [
//             { nome: 'Vernici industriali', quantita: 10, unita: 'lt', prezzo: 45.00 },
//             { nome: 'Pennelli professionali', quantita: 25, unita: 'pz', prezzo: 8.00 }
//           ],
//           valore: 650,
//           tempoStimato: 60,
//           contatti: {
//             telefono: '+39 011 5555555',
//             email: 'gamma@industries.it',
//             referente: 'Anna Verdi'
//           },
//           note: '',
//           createdAt: '2024-10-18T14:20:00Z'
//         }
//       ];

//       setOrdini(mockOrdini);
//       setFilteredOrdini(mockOrdini);
      
//       // Calcola statistiche
//       calcolaStatistiche(mockOrdini);
      
//     } catch (err) {
//       setError('Errore nel caricamento degli ordini: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calcolaStatistiche = (ordiniData) => {
//     const stats = {
//       totaleOrdini: ordiniData.length,
//       ordiniCreati: ordiniData.filter(o => o.stato === 'CREATO').length,
//       ordiniAssegnati: ordiniData.filter(o => o.stato === 'ASSEGNATO').length,
//       ordiniInCorso: ordiniData.filter(o => o.stato === 'IN_CORSO').length,
//       ordiniCompletati: ordiniData.filter(o => o.stato === 'COMPLETATO').length,
//       valoreCommercialeGiornaliero: ordiniData
//         .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
//         .reduce((sum, o) => sum + (o.valore || 0), 0),
//       valoreCommercialeSettimanale: ordiniData.reduce((sum, o) => sum + (o.valore || 0), 0),
//       tempoMedioConsegna: ordiniData.length > 0 
//         ? Math.round(ordiniData.reduce((sum, o) => sum + (o.tempoStimato || 0), 0) / ordiniData.length)
//         : 0
//     };
//     setStatistiche(stats);
//   };

//   // Applicazione filtri
//   useEffect(() => {
//     let filtered = ordini;

//     if (filtri.stato) {
//       filtered = filtered.filter(o => o.stato === filtri.stato);
//     }
//     if (filtri.priorita) {
//       filtered = filtered.filter(o => o.priorita === filtri.priorita);
//     }
//     if (filtri.cliente) {
//       filtered = filtered.filter(o => 
//         o.cliente.toLowerCase().includes(filtri.cliente.toLowerCase())
//       );
//     }
//     if (filtri.citta) {
//       filtered = filtered.filter(o => 
//         o.indirizzo.citta.toLowerCase().includes(filtri.citta.toLowerCase())
//       );
//     }
//     if (filtri.dataInizio) {
//       filtered = filtered.filter(o => 
//         new Date(o.dataConsegna) >= new Date(filtri.dataInizio)
//       );
//     }
//     if (filtri.dataFine) {
//       filtered = filtered.filter(o => 
//         new Date(o.dataConsegna) <= new Date(filtri.dataFine)
//       );
//     }
//     if (filtri.searchTerm) {
//       filtered = filtered.filter(o => 
//         o.numero.toLowerCase().includes(filtri.searchTerm.toLowerCase()) ||
//         o.cliente.toLowerCase().includes(filtri.searchTerm.toLowerCase()) ||
//         o.descrizione.toLowerCase().includes(filtri.searchTerm.toLowerCase())
//       );
//     }

//     setFilteredOrdini(filtered);
//   }, [ordini, filtri]);

//   // Gestione creazione nuovo ordine
//   const creaOrdine = async () => {
//     try {
//       setLoading(true);
      
//       // Validazioni
//       if (!nuovoOrdine.cliente || !nuovoOrdine.dataConsegna || !nuovoOrdine.indirizzo.via) {
//         setError('Campi obbligatori: cliente, data consegna, indirizzo');
//         return;
//       }

//       // Simula chiamata API
//       console.log('Creazione ordine:', nuovoOrdine);
      
//       // Reset form
//       setNuovoOrdine({
//         numero: '',
//         cliente: '',
//         descrizione: '',
//         dataConsegna: '',
//         indirizzo: { via: '', citta: '', cap: '', provincia: '' },
//         priorita: 'MEDIA',
//         prodotti: [],
//         valore: 0,
//         tempoStimato: 60,
//         contatti: { telefono: '', email: '', referente: '' },
//         note: ''
//       });
      
//       setShowNewOrderModal(false);
//       setError('✅ Ordine creato con successo!');
      
//       // Ricarica dati
//       await caricaDatiIniziali();
      
//     } catch (err) {
//       setError('Errore nella creazione: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Componenti badge
//   const StatoBadge = ({ stato }) => {
//     const config = {
//       'CREATO': { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', icon: Package },
//       'ASSEGNATO': { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', icon: User },
//       'IN_CORSO': { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', icon: PlayCircle },
//       'COMPLETATO': { color: 'bg-green-500/20 text-green-300 border-green-400/30', icon: CheckCircle },
//       'ANNULLATO': { color: 'bg-red-500/20 text-red-300 border-red-400/30', icon: XCircle }
//     };
    
//     const { color, icon: Icon } = config[stato] || config['CREATO'];
    
//     return (
//       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {stato}
//       </span>
//     );
//   };

//   const PrioritaBadge = ({ priorita }) => {
//     const config = {
//       'URGENTE': { color: 'bg-red-500/20 text-red-300 border-red-400/30', icon: AlertTriangle },
//       'ALTA': { color: 'bg-orange-500/20 text-orange-300 border-orange-400/30', icon: Star },
//       'MEDIA': { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', icon: Star },
//       'BASSA': { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', icon: Star }
//     };
    
//     const { color, icon: Icon } = config[priorita] || config['MEDIA'];
    
//     return (
//       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
//         <Icon className="w-3 h-3 mr-1" />
//         {priorita}
//       </span>
//     );
//   };

//   // Gestione errori
//   useEffect(() => {
//     if (error) {
//       const timer = setTimeout(() => setErrorLocal(''), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [error]);

//   return (
//     <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
//       {/* Background Effects */}
//       <div className="absolute inset-0">
//         <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
//         <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
//         <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
//       </div>

//       {/* Error Display */}
//       {error && (
//         <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl backdrop-blur-md border ${
//           error.includes('✅') 
//             ? 'bg-green-500/20 border-green-400/30 text-green-300' 
//             : 'bg-red-500/20 border-red-400/30 text-red-300'
//         }`}>
//           <div className="flex items-center">
//             {error.includes('✅') ? (
//               <CheckCircle className="w-5 h-5 mr-2" />
//             ) : (
//               <AlertTriangle className="w-5 h-5 mr-2" />
//             )}
//             {error}
//           </div>
//           <button
//             onClick={() => setErrorLocal('')}
//             className="absolute top-2 right-2 text-current hover:opacity-70"
//           >
//             <XCircle className="w-4 h-4" />
//           </button>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="relative z-10 space-y-6">
//         {/* Header */}
//         <div className="glass-card p-6 rounded-2xl">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="glass-icon p-3 rounded-xl">
//                 <Package className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-white">Gestione Ordini</h2>
//                 <p className="text-white/70">Gestisci ordini clienti, stati e consegne</p>
//               </div>
//             </div>
            
//             <button
//               onClick={() => setShowNewOrderModal(true)}
//               className="glass-button-primary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
//             >
//               <Plus className="w-5 h-5" />
//               <span className="font-medium">Nuovo Ordine</span>
//             </button>
//           </div>
//         </div>

//         {/* Statistiche Dashboard */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="glass-card p-6 rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-white/70 text-sm">Ordini Totali</p>
//                 <p className="text-2xl font-bold text-white">{statistiche.totaleOrdini}</p>
//               </div>
//               <div className="glass-icon p-3 rounded-xl">
//                 <ShoppingCart className="w-6 h-6 text-blue-400" />
//               </div>
//             </div>
//           </div>

//           <div className="glass-card p-6 rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-white/70 text-sm">In Elaborazione</p>
//                 <p className="text-2xl font-bold text-yellow-400">{statistiche.ordiniAssegnati + statistiche.ordiniInCorso}</p>
//               </div>
//               <div className="glass-icon p-3 rounded-xl">
//                 <Clock className="w-6 h-6 text-yellow-400" />
//               </div>
//             </div>
//           </div>

//           <div className="glass-card p-6 rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-white/70 text-sm">Completati</p>
//                 <p className="text-2xl font-bold text-green-400">{statistiche.ordiniCompletati}</p>
//               </div>
//               <div className="glass-icon p-3 rounded-xl">
//                 <CheckCircle className="w-6 h-6 text-green-400" />
//               </div>
//             </div>
//           </div>

//           <div className="glass-card p-6 rounded-2xl">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-white/70 text-sm">Valore Settimanale</p>
//                 <p className="text-2xl font-bold text-purple-400">€{statistiche.valoreCommercialeSettimanale.toLocaleString()}</p>
//               </div>
//               <div className="glass-icon p-3 rounded-xl">
//                 <DollarSign className="w-6 h-6 text-purple-400" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filtri */}
//         <div className="glass-card p-6 rounded-2xl">
//           <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//             <Filter className="w-5 h-5 mr-2" />
//             Filtri Ricerca
//           </h3>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Stato</label>
//               <select
//                 className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
//                 value={filtri.stato}
//                 onChange={(e) => setFiltri(prev => ({...prev, stato: e.target.value}))}
//               >
//                 <option value="" className="bg-gray-800">Tutti gli stati</option>
//                 <option value="CREATO" className="bg-gray-800">Creato</option>
//                 <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
//                 <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
//                 <option value="COMPLETATO" className="bg-gray-800">Completato</option>
//                 <option value="ANNULLATO" className="bg-gray-800">Annullato</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Priorità</label>
//               <select
//                 className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
//                 value={filtri.priorita}
//                 onChange={(e) => setFiltri(prev => ({...prev, priorita: e.target.value}))}
//               >
//                 <option value="" className="bg-gray-800">Tutte le priorità</option>
//                 <option value="URGENTE" className="bg-gray-800">Urgente</option>
//                 <option value="ALTA" className="bg-gray-800">Alta</option>
//                 <option value="MEDIA" className="bg-gray-800">Media</option>
//                 <option value="BASSA" className="bg-gray-800">Bassa</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Data Inizio</label>
//               <input
//                 type="date"
//                 className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
//                 value={filtri.dataInizio}
//                 onChange={(e) => setFiltri(prev => ({...prev, dataInizio: e.target.value}))}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Data Fine</label>
//               <input
//                 type="date"
//                 className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
//                 value={filtri.dataFine}
//                 onChange={(e) => setFiltri(prev => ({...prev, dataFine: e.target.value}))}
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Cliente</label>
//               <input
//                 type="text"
//                 placeholder="Nome cliente..."
//                 className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                 value={filtri.cliente}
//                 onChange={(e) => setFiltri(prev => ({...prev, cliente: e.target.value}))}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Città</label>
//               <input
//                 type="text"
//                 placeholder="Città consegna..."
//                 className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                 value={filtri.citta}
//                 onChange={(e) => setFiltri(prev => ({...prev, citta: e.target.value}))}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-white/80 mb-2">Ricerca Generale</label>
//               <div className="glass-input-container rounded-xl">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
//                   <input
//                     type="text"
//                     placeholder="Cerca numero, cliente, descrizione..."
//                     className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={filtri.searchTerm}
//                     onChange={(e) => setFiltri(prev => ({...prev, searchTerm: e.target.value}))}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabella Ordini */}
//         <div className="glass-card-large rounded-2xl overflow-hidden">
//           <div className="px-6 py-4 border-b border-white/10">
//             <h3 className="text-lg font-semibold text-white flex items-center">
//               <Package className="w-5 h-5 mr-2" />
//               Lista Ordini
//               <span className="ml-2 text-sm text-white/50">
//                 ({filteredOrdini.length} risultati)
//               </span>
//             </h3>
//           </div>
          
//           {loading ? (
//             <div className="p-8 text-center">
//               <div className="text-white/70">Caricamento ordini...</div>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-white/10">
//                 <thead className="glass-table-header">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Ordine
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Cliente
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Consegna
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Priorità
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Stato
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Valore
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
//                       Azioni
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-white/5">
//                   {filteredOrdini.map(ordine => (
//                     <tr key={ordine._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <div className="text-sm font-medium text-white">
//                             {ordine.numero}
//                           </div>
//                           <div className="text-sm text-white/50">
//                             {new Date(ordine.createdAt).toLocaleDateString('it-IT')}
//                           </div>
//                         </div>
//                       </td>
                      
//                       <td className="px-6 py-4">
//                         <div>
//                           <div className="text-sm font-medium text-white">
//                             {ordine.cliente}
//                           </div>
//                           <div className="text-sm text-white/50">
//                             {ordine.descrizione}
//                           </div>
//                         </div>
//                       </td>
                      
//                       <td className="px-6 py-4">
//                         <div>
//                           <div className="text-sm font-medium text-white flex items-center">
//                             <Calendar className="w-4 h-4 mr-2 text-blue-400" />
//                             {new Date(ordine.dataConsegna).toLocaleDateString('it-IT')}
//                           </div>
//                           <div className="text-sm text-white/50 flex items-center">
//                             <MapPin className="w-4 h-4 mr-2 text-green-400" />
//                             {ordine.indirizzo.citta}
//                           </div>
//                         </div>
//                       </td>
                      
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <PrioritaBadge priorita={ordine.priorita} />
//                       </td>
                      
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <StatoBadge stato={ordine.stato} />
//                       </td>
                      
//                       <td className="px-6 py-4">
//                         <div>
//                           <div className="text-sm font-medium text-white flex items-center">
//                             <DollarSign className="w-4 h-4 mr-1 text-green-400" />
//                             €{ordine.valore.toLocaleString()}
//                           </div>
//                           <div className="text-sm text-white/50 flex items-center">
//                             <Clock className="w-4 h-4 mr-1 text-yellow-400" />
//                             {ordine.tempoStimato}min
//                           </div>
//                         </div>
//                       </td>
                      
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center space-x-2">
//                           <button
//                             onClick={() => {
//                               setSelectedOrdine(ordine);
//                               setShowDetailsModal(true);
//                             }}
//                             className="glass-button-primary p-2 rounded-xl hover:scale-105 transition-all duration-300"
//                                title="Vedi dettagli"
//                           >
//                             <Eye className="w-4 h-4" />
//                           </button>
                          
//                           <button
//                             className="glass-button-secondary p-2 rounded-xl hover:scale-105 transition-all duration-300"
//                             title="Modifica"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
                          
//                           <button
//                             onClick={() => eliminaOrdine(ordine._id)}
//                             className="glass-button-danger p-2 rounded-xl hover:scale-105 transition-all duration-300"
//                             title="Elimina"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {filteredOrdini.length === 0 && !loading && (
//                 <div className="text-center py-12">
//                   <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
//                     <Package className="w-8 h-8 text-white/50" />
//                   </div>
//                   <p className="text-white/70 text-lg mb-2">Nessun ordine trovato</p>
//                   <p className="text-sm text-white/50">
//                     Modifica i filtri per vedere più risultati
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Quick Stats Panel */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Ordini per Stato */}
//           <div className="glass-card p-6 rounded-2xl">
//             <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//               <BarChart3 className="w-5 h-5 mr-2" />
//               Distribuzione per Stato
//             </h3>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-300 text-sm">Creati</span>
//                 <span className="text-white font-bold">{statistiche.ordiniCreati}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-300 text-sm">Assegnati</span>
//                 <span className="text-blue-400 font-bold">{statistiche.ordiniAssegnati}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-300 text-sm">In Corso</span>
//                 <span className="text-yellow-400 font-bold">{statistiche.ordiniInCorso}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-300 text-sm">Completati</span>
//                 <span className="text-green-400 font-bold">{statistiche.ordiniCompletati}</span>
//               </div>
//             </div>
//           </div>

//           {/* Performance Giornaliera */}
//           <div className="glass-card p-6 rounded-2xl">
//             <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//               <TrendingUp className="w-5 h-5 mr-2" />
//               Performance Oggi
//             </h3>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-300 text-sm">Valore Giornaliero</span>
//                 <span className="text-purple-400 font-bold">
//                   €{statistiche.valoreCommercialeGiornaliero.toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-300 text-sm">Tempo Medio</span>
//                 <span className="text-blue-400 font-bold">{statistiche.tempoMedioConsegna}min</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-300 text-sm">Efficienza</span>
//                 <span className="text-green-400 font-bold">
//                   {statistiche.totaleOrdini > 0 
//                     ? Math.round((statistiche.ordiniCompletati / statistiche.totaleOrdini) * 100)
//                     : 0}%
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Azioni Rapide */}
//           <div className="glass-card p-6 rounded-2xl">
//             <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
//               <Users className="w-5 h-5 mr-2" />
//               Azioni Rapide
//             </h3>
//             <div className="space-y-3">
//               <button className="w-full glass-button-primary flex items-center justify-center gap-2 px-4 py-3 rounded-xl">
//                 <Download className="w-4 h-4" />
//                 Esporta Excel
//               </button>
//               <button className="w-full glass-button-secondary flex items-center justify-center gap-2 px-4 py-3 rounded-xl">
//                 <FileText className="w-4 h-4" />
//                 Report Mensile
//               </button>
//               <button className="w-full glass-button-secondary flex items-center justify-center gap-2 px-4 py-3 rounded-xl">
//                 <Search className="w-4 h-4" />
//                 Ricerca Avanzata
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal Nuovo Ordine */}
//       {showNewOrderModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//           <div className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-bold text-white flex items-center">
//                 <Plus className="w-6 h-6 mr-2" />
//                 Crea Nuovo Ordine
//               </h3>
//               <button
//                 onClick={() => setShowNewOrderModal(false)}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <XCircle className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Informazioni Cliente */}
//               <div className="space-y-4">
//                 <h4 className="text-lg font-medium text-white border-b border-white/10 pb-2">
//                   Informazioni Cliente
//                 </h4>
                
//                 <div>
//                   <label className="block text-sm font-medium text-white/80 mb-2">
//                     Numero Ordine
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Lascia vuoto per generazione automatica"
//                     className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={nuovoOrdine.numero}
//                     onChange={(e) => setNuovoOrdine(prev => ({...prev, numero: e.target.value}))}
//                   />
//                   <small className="text-white/50 text-xs">Se vuoto, verrà generato automaticamente</small>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-white/80 mb-2">
//                     Cliente *
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Nome cliente..."
//                     className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={nuovoOrdine.cliente}
//                     onChange={(e) => setNuovoOrdine(prev => ({...prev, cliente: e.target.value}))}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-white/80 mb-2">
//                     Descrizione
//                   </label>
//                   <textarea
//                     placeholder="Descrizione ordine..."
//                     className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     rows="3"
//                     value={nuovoOrdine.descrizione}
//                     onChange={(e) => setNuovoOrdine(prev => ({...prev, descrizione: e.target.value}))}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-2">
//                       Data Consegna *
//                     </label>
//                     <input
//                       type="date"
//                       className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
//                       value={nuovoOrdine.dataConsegna}
//                       onChange={(e) => setNuovoOrdine(prev => ({...prev, dataConsegna: e.target.value}))}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-2">
//                       Priorità
//                     </label>
//                     <select
//                       className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
//                       value={nuovoOrdine.priorita}
//                       onChange={(e) => setNuovoOrdine(prev => ({...prev, priorita: e.target.value}))}
//                     >
//                       <option value="BASSA" className="bg-gray-800">Bassa</option>
//                       <option value="MEDIA" className="bg-gray-800">Media</option>
//                       <option value="ALTA" className="bg-gray-800">Alta</option>
//                       <option value="URGENTE" className="bg-gray-800">Urgente</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Indirizzo e Contatti */}
//               <div className="space-y-4">
//                 <h4 className="text-lg font-medium text-white border-b border-white/10 pb-2">
//                   Indirizzo e Contatti
//                 </h4>
                
//                 <div>
//                   <label className="block text-sm font-medium text-white/80 mb-2">
//                     Via *
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Indirizzo completo..."
//                     className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={nuovoOrdine.indirizzo.via}
//                     onChange={(e) => setNuovoOrdine(prev => ({
//                       ...prev, 
//                       indirizzo: {...prev.indirizzo, via: e.target.value}
//                     }))}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-2">
//                       Città *
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Città..."
//                       className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                       value={nuovoOrdine.indirizzo.citta}
//                       onChange={(e) => setNuovoOrdine(prev => ({
//                         ...prev, 
//                         indirizzo: {...prev.indirizzo, citta: e.target.value}
//                       }))}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-white/80 mb-2">
//                       CAP
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="CAP..."
//                       className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                       value={nuovoOrdine.indirizzo.cap}
//                       onChange={(e) => setNuovoOrdine(prev => ({
//                         ...prev, 
//                         indirizzo: {...prev.indirizzo, cap: e.target.value}
//                       }))}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-white/80 mb-2">
//                     Provincia
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Provincia..."
//                     className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={nuovoOrdine.indirizzo.provincia}
//                     onChange={(e) => setNuovoOrdine(prev => ({
//                       ...prev, 
//                       indirizzo: {...prev.indirizzo, provincia: e.target.value}
//                     }))}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-white/80 mb-2">
//                     Telefono
//                   </label>
//                   <input
//                     type="tel"
//                     placeholder="Numero di telefono..."
//                     className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={nuovoOrdine.contatti.telefono}
//                     onChange={(e) => setNuovoOrdine(prev => ({
//                       ...prev, 
//                       contatti: {...prev.contatti, telefono: e.target.value}
//                     }))}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Sezione Prodotti e Valori */}
//             <div className="mt-6">
//               <h4 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-4">
//                 Valori e Timing
//               </h4>
              
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-white/80 mb-2">
//                     Valore Ordine (€)
//                   </label>
//                   <input
//                     type="number"
//                     placeholder="0.00"
//                     className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={nuovoOrdine.valore}
//                     onChange={(e) => setNuovoOrdine(prev => ({...prev, valore: parseFloat(e.target.value) || 0}))}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-white/80 mb-2">
//                     Tempo Stimato (min)
//                   </label>
//                   <input
//                     type="number"
//                     placeholder="60"
//                     className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={nuovoOrdine.tempoStimato}
//                     onChange={(e) => setNuovoOrdine(prev => ({...prev, tempoStimato: parseInt(e.target.value) || 60}))}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-white/80 mb-2">
//                     Referente
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Nome referente..."
//                     className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                     value={nuovoOrdine.contatti.referente}
//                     onChange={(e) => setNuovoOrdine(prev => ({
//                       ...prev, 
//                       contatti: {...prev.contatti, referente: e.target.value}
//                     }))}
//                   />
//                 </div>
//               </div>

//               <div className="mt-4">
//                 <label className="block text-sm font-medium text-white/80 mb-2">
//                   Note Aggiuntive
//                 </label>
//                 <textarea
//                   placeholder="Note specifiche per l'ordine..."
//                   className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
//                   rows="3"
//                   value={nuovoOrdine.note}
//                   onChange={(e) => setNuovoOrdine(prev => ({...prev, note: e.target.value}))}
//                 />
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowNewOrderModal(false)}
//                 className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
//               >
//                 Annulla
//               </button>
//               <button
//                 onClick={creaOrdine}
//                 disabled={loading}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Creazione...
//                   </>
//                 ) : (
//                   <>
//                     <Plus className="w-4 h-4 mr-2" />
//                     Crea Ordine
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal Dettagli Ordine */}
//       {showDetailsModal && selectedOrdine && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//           <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-xl font-bold text-white flex items-center">
//                 <Eye className="w-6 h-6 mr-2" />
//                 Dettagli Ordine {selectedOrdine.numero}
//               </h3>
//               <button
//                 onClick={() => setShowDetailsModal(false)}
//                 className="text-gray-400 hover:text-white transition-colors"
//               >
//                 <XCircle className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Info Generale */}
//               <div className="bg-gray-800/50 rounded-xl p-4">
//                 <h4 className="text-white font-medium mb-3 flex items-center">
//                   <Package className="w-5 h-5 mr-2" />
//                   Informazioni Generali
//                 </h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Cliente:</span>
//                     <span className="text-white">{selectedOrdine.cliente}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Stato:</span>
//                     <StatoBadge stato={selectedOrdine.stato} />
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Priorità:</span>
//                     <PrioritaBadge priorita={selectedOrdine.priorita} />
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-400">Valore:</span>
//                     <span className="text-green-400 font-medium">€{selectedOrdine.valore.toLocaleString()}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Consegna */}
//               <div className="bg-gray-800/50 rounded-xl p-4">
//                 <h4 className="text-white font-medium mb-3 flex items-center">
//                   <MapPin className="w-5 h-5 mr-2" />
//                   Consegna
//                 </h4>
//                 <div className="space-y-2">
//                   <div className="text-sm">
//                     <span className="text-gray-400">Data:</span>
//                     <span className="text-white ml-2">
//                       {new Date(selectedOrdine.dataConsegna).toLocaleDateString('it-IT')}
//                     </span>
//                   </div>
//                   <div className="text-sm">
//                     <span className="text-gray-400">Indirizzo:</span>
//                     <div className="text-white mt-1">
//                       {selectedOrdine.indirizzo.via}<br/>
//                       {selectedOrdine.indirizzo.cap} {selectedOrdine.indirizzo.citta} ({selectedOrdine.indirizzo.provincia})
//                     </div>
//                   </div>
//                   <div className="text-sm">
//                     <span className="text-gray-400">Tempo stimato:</span>
//                     <span className="text-yellow-400 ml-2">{selectedOrdine.tempoStimato} minuti</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Prodotti */}
//             <div className="mt-6 bg-gray-800/50 rounded-xl p-4">
//               <h4 className="text-white font-medium mb-3 flex items-center">
//                 <Package className="w-5 h-5 mr-2" />
//                 Prodotti ({selectedOrdine.prodotti.length})
//               </h4>
//               <div className="space-y-2">
//                 {selectedOrdine.prodotti.map((prodotto, index) => (
//                   <div key={index} className="flex justify-between items-center bg-gray-700/50 rounded-lg p-3">
//                     <div>
//                       <span className="text-white font-medium">{prodotto.nome}</span>
//                       <div className="text-sm text-gray-400">
//                         {prodotto.quantita} {prodotto.unita}
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-white font-medium">€{prodotto.prezzo.toFixed(2)}</div>
//                       <div className="text-sm text-gray-400">
//                         Totale: €{(prodotto.quantita * prodotto.prezzo).toFixed(2)}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Contatti e Note */}
//             {(selectedOrdine.contatti.referente || selectedOrdine.note) && (
//               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {selectedOrdine.contatti.referente && (
//                   <div className="bg-gray-800/50 rounded-xl p-4">
//                     <h4 className="text-white font-medium mb-3 flex items-center">
//                       <User className="w-5 h-5 mr-2" />
//                       Contatti
//                     </h4>
//                     <div className="space-y-2">
//                       <div className="text-sm">
//                         <span className="text-gray-400">Referente:</span>
//                         <span className="text-white ml-2">{selectedOrdine.contatti.referente}</span>
//                       </div>
//                       {selectedOrdine.contatti.telefono && (
//                         <div className="text-sm">
//                           <span className="text-gray-400">Telefono:</span>
//                           <span className="text-white ml-2">{selectedOrdine.contatti.telefono}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {selectedOrdine.note && (
//                   <div className="bg-gray-800/50 rounded-xl p-4">
//                     <h4 className="text-white font-medium mb-3 flex items-center">
//                       <FileText className="w-5 h-5 mr-2" />
//                       Note
//                     </h4>
//                     <p className="text-gray-300 text-sm">{selectedOrdine.note}</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             <div className="mt-6 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowDetailsModal(false)}
//                 className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
//               >
//                 Chiudi
//               </button>
//               <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center">
//                 <Edit className="w-4 h-4 mr-2" />
//                 Modifica
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Custom Styles */}
//       <style jsx>{`
//         .glass-card {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(20px);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//           box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
//         }

//         .glass-card-large {
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(30px);
//           border: 1px solid rgba(255, 255, 255, 0.2);
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

//         .glass-table-header {
//           background: rgba(255, 255, 255, 0.05);
//           backdrop-filter: blur(10px);
//         }

//         .glass-table-row {
//           background: rgba(255, 255, 255, 0.02);
//           backdrop-filter: blur(5px);
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

//         .glass-button-danger {
//           background: rgba(239, 68, 68, 0.3);
//           backdrop-filter: blur(15px);
//           border: 1px solid rgba(239, 68, 68, 0.4);
//           color: white;
//         }

//         .glass-button-danger:hover {
//           background: rgba(239, 68, 68, 0.4);
//           box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
//         }

//         @keyframes blob {
//           0% {
//             transform: translate(0px, 0px) scale(1);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//           100% {
//             transform: translate(0px, 0px) scale(1);
//           }
//         }

//         .animate-blob {
//           animation: blob 7s infinite;
//         }

//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }

//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }

//         /* Responsive */
//         @media (max-width: 768px) {
//           .grid-cols-4 {
//             grid-template-columns: repeat(2, 1fr);
//           }
          
//           .px-6 {
//             padding-left: 1rem;
//             padding-right: 1rem;
//           }
//         }

//         @media (max-width: 640px) {
//           .grid-cols-2,
//           .grid-cols-3,
//           .grid-cols-4 {
//             grid-template-columns: 1fr;
//           }
          
//           .text-2xl {
//             font-size: 1.5rem;
//           }
          
//           .space-x-4 > * + * {
//             margin-left: 1rem;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default OrdiniManagement;

import React, { useState, useEffect } from 'react';
import { 
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  Star,
  Building,
  Truck,
  FileText,
  TrendingUp,
  BarChart3,
  Users,
  ShoppingCart
} from 'lucide-react';

const OrdiniManagement = () => {
  // Stati principali
  const [ordini, setOrdini] = useState([]);
  const [filteredOrdini, setFilteredOrdini] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lista');

  // Stati per filtri
  const [filtri, setFiltri] = useState({
    stato: '',
    priorita: '',
    cliente: '',
    dataInizio: '',
    dataFine: '',
    citta: '',
    searchTerm: ''
  });

  // Stati per form nuovo ordine
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [nuovoOrdine, setNuovoOrdine] = useState({
    numero: '',
    cliente: '',
    descrizione: '',
    dataConsegna: '',
    indirizzo: {
      via: '',
      citta: '',
      cap: '',
      provincia: ''
    },
    priorita: 'MEDIA',
    prodotti: [],
    valore: 0,
    tempoStimato: 60,
    contatti: {
      telefono: '',
      email: '',
      referente: ''
    },
    note: ''
  });

  // Stati per modal dettagli
  const [selectedOrdine, setSelectedOrdine] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Stati per statistiche
  const [statistiche, setStatistiche] = useState({
    totaleOrdini: 0,
    ordiniCreati: 0,
    ordiniAssegnati: 0,
    ordiniInCorso: 0,
    ordiniCompletati: 0,
    valoreCommercialeGiornaliero: 0,
    valoreCommercialeSettimanale: 0,
    tempoMedioConsegna: 0
  });

  // Mock data per sviluppo
  useEffect(() => {
    caricaDatiIniziali();
  }, []);

  const caricaDatiIniziali = async () => {
    try {
      setLoading(true);
      
      // Mock data - sostituire con vere chiamate API
      const mockOrdini = [
        {
          _id: '1',
          numero: 'ORD-20241019001',
          cliente: 'Azienda Alpha S.r.l.',
          descrizione: 'Fornitura materiali edili',
          dataConsegna: '2024-10-22',
          indirizzo: {
            via: 'Via Roma 123',
            citta: 'Milano',
            cap: '20100',
            provincia: 'MI'
          },
          priorita: 'ALTA',
          stato: 'CREATO',
          prodotti: [
            { nome: 'Cemento Portland', quantita: 50, unita: 'sacchi', prezzo: 8.50 },
            { nome: 'Ferro per cemento armato', quantita: 100, unita: 'kg', prezzo: 1.20 }
          ],
          valore: 545,
          tempoStimato: 120,
          contatti: {
            telefono: '+39 02 1234567',
            email: 'ordini@alpha.it',
            referente: 'Mario Rossi'
          },
          note: 'Consegna preferibilmente al mattino',
          createdAt: '2024-10-19T08:30:00Z'
        },
        {
          _id: '2',
          numero: 'ORD-20241019002',
          cliente: 'Beta Construction',
          descrizione: 'Urgente - Riparazione impianto',
          dataConsegna: '2024-10-20',
          indirizzo: {
            via: 'Via Napoli 45',
            citta: 'Roma',
            cap: '00100',
            provincia: 'RM'
          },
          priorita: 'URGENTE',
          stato: 'ASSEGNATO',
          prodotti: [
            { nome: 'Tubi PVC', quantita: 20, unita: 'mt', prezzo: 12.50 },
            { nome: 'Raccordi idraulici', quantita: 15, unita: 'pz', prezzo: 25.00 }
          ],
          valore: 625,
          tempoStimato: 90,
          contatti: {
            telefono: '+39 06 9876543',
            email: 'beta@construction.it',
            referente: 'Luca Bianchi'
          },
          note: 'Cliente molto urgente',
          createdAt: '2024-10-19T09:15:00Z'
        },
        {
          _id: '3',
          numero: 'ORD-20241018003',
          cliente: 'Gamma Industries',
          descrizione: 'Fornitura mensile standard',
          dataConsegna: '2024-10-21',
          indirizzo: {
            via: 'Via Torino 78',
            citta: 'Torino',
            cap: '10100',
            provincia: 'TO'
          },
          priorita: 'MEDIA',
          stato: 'COMPLETATO',
          prodotti: [
            { nome: 'Vernici industriali', quantita: 10, unita: 'lt', prezzo: 45.00 },
            { nome: 'Pennelli professionali', quantita: 25, unita: 'pz', prezzo: 8.00 }
          ],
          valore: 650,
          tempoStimato: 60,
          contatti: {
            telefono: '+39 011 5555555',
            email: 'gamma@industries.it',
            referente: 'Anna Verdi'
          },
          note: '',
          createdAt: '2024-10-18T14:20:00Z'
        }
      ];

      setOrdini(mockOrdini);
      setFilteredOrdini(mockOrdini);
      
      // Calcola statistiche
      calcolaStatistiche(mockOrdini);
      
    } catch (err) {
      setError('Errore nel caricamento degli ordini: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calcolaStatistiche = (ordiniData) => {
    const stats = {
      totaleOrdini: ordiniData.length,
      ordiniCreati: ordiniData.filter(o => o.stato === 'CREATO').length,
      ordiniAssegnati: ordiniData.filter(o => o.stato === 'ASSEGNATO').length,
      ordiniInCorso: ordiniData.filter(o => o.stato === 'IN_CORSO').length,
      ordiniCompletati: ordiniData.filter(o => o.stato === 'COMPLETATO').length,
      valoreCommercialeGiornaliero: ordiniData
        .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, o) => sum + (o.valore || 0), 0),
      valoreCommercialeSettimanale: ordiniData.reduce((sum, o) => sum + (o.valore || 0), 0),
      tempoMedioConsegna: ordiniData.length > 0 
        ? Math.round(ordiniData.reduce((sum, o) => sum + (o.tempoStimato || 0), 0) / ordiniData.length)
        : 0
    };
    setStatistiche(stats);
  };

  // Applicazione filtri
  useEffect(() => {
    let filtered = ordini;

    if (filtri.stato) {
      filtered = filtered.filter(o => o.stato === filtri.stato);
    }
    if (filtri.priorita) {
      filtered = filtered.filter(o => o.priorita === filtri.priorita);
    }
    if (filtri.cliente) {
      filtered = filtered.filter(o => 
        o.cliente.toLowerCase().includes(filtri.cliente.toLowerCase())
      );
    }
    if (filtri.citta) {
      filtered = filtered.filter(o => 
        o.indirizzo.citta.toLowerCase().includes(filtri.citta.toLowerCase())
      );
    }
    if (filtri.dataInizio) {
      filtered = filtered.filter(o => 
        new Date(o.dataConsegna) >= new Date(filtri.dataInizio)
      );
    }
    if (filtri.dataFine) {
      filtered = filtered.filter(o => 
        new Date(o.dataConsegna) <= new Date(filtri.dataFine)
      );
    }
    if (filtri.searchTerm) {
      filtered = filtered.filter(o => 
        o.numero.toLowerCase().includes(filtri.searchTerm.toLowerCase()) ||
        o.cliente.toLowerCase().includes(filtri.searchTerm.toLowerCase()) ||
        o.descrizione.toLowerCase().includes(filtri.searchTerm.toLowerCase())
      );
    }

    setFilteredOrdini(filtered);
  }, [ordini, filtri]);

  // Gestione creazione nuovo ordine
  const creaOrdine = async () => {
    try {
      setLoading(true);
      
      // Validazioni
      if (!nuovoOrdine.cliente || !nuovoOrdine.dataConsegna || !nuovoOrdine.indirizzo.via) {
        setError('Campi obbligatori: cliente, data consegna, indirizzo');
        return;
      }

      // Simula chiamata API
      console.log('Creazione ordine:', nuovoOrdine);
      
      // Reset form
      setNuovoOrdine({
        numero: '',
        cliente: '',
        descrizione: '',
        dataConsegna: '',
        indirizzo: { via: '', citta: '', cap: '', provincia: '' },
        priorita: 'MEDIA',
        prodotti: [],
        valore: 0,
        tempoStimato: 60,
        contatti: { telefono: '', email: '', referente: '' },
        note: ''
      });
      
      setShowNewOrderModal(false);
      setError('✅ Ordine creato con successo!');
      
      // Ricarica dati
      await caricaDatiIniziali();
      
    } catch (err) {
      setError('Errore nella creazione: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Componenti badge
  const StatoBadge = ({ stato }) => {
    const config = {
      'CREATO': { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', icon: Package },
      'ASSEGNATO': { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', icon: User },
      'IN_CORSO': { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', icon: PlayCircle },
      'COMPLETATO': { color: 'bg-green-500/20 text-green-300 border-green-400/30', icon: CheckCircle },
      'ANNULLATO': { color: 'bg-red-500/20 text-red-300 border-red-400/30', icon: XCircle }
    };
    
    const { color, icon: Icon } = config[stato] || config['CREATO'];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {stato}
      </span>
    );
  };

  const PrioritaBadge = ({ priorita }) => {
    const config = {
      'URGENTE': { color: 'bg-red-500/20 text-red-300 border-red-400/30', icon: AlertTriangle },
      'ALTA': { color: 'bg-orange-500/20 text-orange-300 border-orange-400/30', icon: Star },
      'MEDIA': { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', icon: Star },
      'BASSA': { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', icon: Star }
    };
    
    const { color, icon: Icon } = config[priorita] || config['MEDIA'];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {priorita}
      </span>
    );
  };

  // Gestione errori
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setErrorLocal(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl backdrop-blur-md border ${
          error.includes('✅') 
            ? 'bg-green-500/20 border-green-400/30 text-green-300' 
            : 'bg-red-500/20 border-red-400/30 text-red-300'
        }`}>
          <div className="flex items-center">
            {error.includes('✅') ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            {error}
          </div>
          <button
            onClick={() => setError('')}
            className="absolute top-2 right-2 text-current hover:opacity-70"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="glass-icon p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Gestione Ordini</h2>
                <p className="text-white/70">Gestisci ordini clienti, stati e consegne</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="glass-button-primary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nuovo Ordine</span>
            </button>
          </div>
        </div>

        {/* Statistiche Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Ordini Totali</p>
                <p className="text-2xl font-bold text-white">{statistiche.totaleOrdini}</p>
              </div>
              <div className="glass-icon p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">In Elaborazione</p>
                <p className="text-2xl font-bold text-yellow-400">{statistiche.ordiniAssegnati + statistiche.ordiniInCorso}</p>
              </div>
              <div className="glass-icon p-3 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Completati</p>
                <p className="text-2xl font-bold text-green-400">{statistiche.ordiniCompletati}</p>
              </div>
              <div className="glass-icon p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Valore Settimanale</p>
                <p className="text-2xl font-bold text-purple-400">€{statistiche.valoreCommercialeSettimanale.toLocaleString()}</p>
              </div>
              <div className="glass-icon p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtri Ricerca
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Stato</label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filtri.stato}
                onChange={(e) => setFiltri(prev => ({...prev, stato: e.target.value}))}
              >
                <option value="" className="bg-gray-800">Tutti gli stati</option>
                <option value="CREATO" className="bg-gray-800">Creato</option>
                <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
                <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
                <option value="COMPLETATO" className="bg-gray-800">Completato</option>
                <option value="ANNULLATO" className="bg-gray-800">Annullato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Priorità</label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filtri.priorita}
                onChange={(e) => setFiltri(prev => ({...prev, priorita: e.target.value}))}
              >
                <option value="" className="bg-gray-800">Tutte le priorità</option>
                <option value="URGENTE" className="bg-gray-800">Urgente</option>
                <option value="ALTA" className="bg-gray-800">Alta</option>
                <option value="MEDIA" className="bg-gray-800">Media</option>
                <option value="BASSA" className="bg-gray-800">Bassa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Data Inizio</label>
              <input
                type="date"
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filtri.dataInizio}
                onChange={(e) => setFiltri(prev => ({...prev, dataInizio: e.target.value}))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Data Fine</label>
              <input
                type="date"
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filtri.dataFine}
                onChange={(e) => setFiltri(prev => ({...prev, dataFine: e.target.value}))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Cliente</label>
              <input
                type="text"
                placeholder="Nome cliente..."
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={filtri.cliente}
                onChange={(e) => setFiltri(prev => ({...prev, cliente: e.target.value}))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Città</label>
              <input
                type="text"
                placeholder="Città consegna..."
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={filtri.citta}
                onChange={(e) => setFiltri(prev => ({...prev, citta: e.target.value}))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Ricerca Generale</label>
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cerca numero, cliente, descrizione..."
                    className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filtri.searchTerm}
                    onChange={(e) => setFiltri(prev => ({...prev, searchTerm: e.target.value}))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella Ordini */}
        <div className="glass-card-large rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Lista Ordini
              <span className="ml-2 text-sm text-white/50">
                ({filteredOrdini.length} risultati)
              </span>
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-white/70">Caricamento ordini...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="glass-table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Ordine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Consegna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Priorità
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Valore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrdini.map(ordine => (
                    <tr key={ordine._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {ordine.numero}
                          </div>
                          <div className="text-sm text-white/50">
                            {new Date(ordine.createdAt).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {ordine.cliente}
                          </div>
                          <div className="text-sm text-white/50">
                            {ordine.descrizione}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                            {new Date(ordine.dataConsegna).toLocaleDateString('it-IT')}
                          </div>
                          <div className="text-sm text-white/50 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-green-400" />
                            {ordine.indirizzo.citta}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PrioritaBadge priorita={ordine.priorita} />
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatoBadge stato={ordine.stato} />
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                            €{ordine.valore.toLocaleString()}
                          </div>
                          <div className="text-sm text-white/50 flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-yellow-400" />
                            {ordine.tempoStimato}min
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrdine(ordine);
                              setShowDetailsModal(true);
                            }}
                            className="glass-button-primary p-2 rounded-xl hover:scale-105 transition-all duration-300"
title="Vedi dettagli"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            className="glass-button-secondary p-2 rounded-xl hover:scale-105 transition-all duration-300"
                            title="Modifica"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => eliminaOrdine(ordine._id)}
                            className="glass-button-danger p-2 rounded-xl hover:scale-105 transition-all duration-300"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrdini.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-white/70 text-lg mb-2">Nessun ordine trovato</p>
                  <p className="text-sm text-white/50">
                    Modifica i filtri per vedere più risultati
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ordini per Stato */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Distribuzione per Stato
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Creati</span>
                <span className="text-white font-bold">{statistiche.ordiniCreati}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Assegnati</span>
                <span className="text-blue-400 font-bold">{statistiche.ordiniAssegnati}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">In Corso</span>
                <span className="text-yellow-400 font-bold">{statistiche.ordiniInCorso}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Completati</span>
                <span className="text-green-400 font-bold">{statistiche.ordiniCompletati}</span>
              </div>
            </div>
          </div>

          {/* Performance Giornaliera */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Oggi
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Valore Giornaliero</span>
                <span className="text-purple-400 font-bold">
                  €{statistiche.valoreCommercialeGiornaliero.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Tempo Medio</span>
                <span className="text-blue-400 font-bold">{statistiche.tempoMedioConsegna}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Efficienza</span>
                <span className="text-green-400 font-bold">
                  {statistiche.totaleOrdini > 0 
                    ? Math.round((statistiche.ordiniCompletati / statistiche.totaleOrdini) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Azioni Rapide */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Azioni Rapide
            </h3>
            <div className="space-y-3">
              <button className="w-full glass-button-primary flex items-center justify-center gap-2 px-4 py-3 rounded-xl">
                <Download className="w-4 h-4" />
                Esporta Excel
              </button>
              <button className="w-full glass-button-secondary flex items-center justify-center gap-2 px-4 py-3 rounded-xl">
                <FileText className="w-4 h-4" />
                Report Mensile
              </button>
              <button className="w-full glass-button-secondary flex items-center justify-center gap-2 px-4 py-3 rounded-xl">
                <Search className="w-4 h-4" />
                Ricerca Avanzata
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nuovo Ordine */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Plus className="w-6 h-6 mr-2" />
                Crea Nuovo Ordine
              </h3>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informazioni Cliente */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white border-b border-white/10 pb-2">
                  Informazioni Cliente
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Numero Ordine
                  </label>
                  <input
                    type="text"
                    placeholder="Lascia vuoto per generazione automatica"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={nuovoOrdine.numero}
                    onChange={(e) => setNuovoOrdine(prev => ({...prev, numero: e.target.value}))}
                  />
                  <small className="text-white/50 text-xs">Se vuoto, verrà generato automaticamente</small>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    placeholder="Nome cliente..."
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={nuovoOrdine.cliente}
                    onChange={(e) => setNuovoOrdine(prev => ({...prev, cliente: e.target.value}))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    placeholder="Descrizione ordine..."
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    rows="3"
                    value={nuovoOrdine.descrizione}
                    onChange={(e) => setNuovoOrdine(prev => ({...prev, descrizione: e.target.value}))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Data Consegna *
                    </label>
                    <input
                      type="date"
                      className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={nuovoOrdine.dataConsegna}
                      onChange={(e) => setNuovoOrdine(prev => ({...prev, dataConsegna: e.target.value}))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Priorità
                    </label>
                    <select
                      className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={nuovoOrdine.priorita}
                      onChange={(e) => setNuovoOrdine(prev => ({...prev, priorita: e.target.value}))}
                    >
                      <option value="BASSA" className="bg-gray-800">Bassa</option>
                      <option value="MEDIA" className="bg-gray-800">Media</option>
                      <option value="ALTA" className="bg-gray-800">Alta</option>
                      <option value="URGENTE" className="bg-gray-800">Urgente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Indirizzo e Contatti */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white border-b border-white/10 pb-2">
                  Indirizzo e Contatti
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Via *
                  </label>
                  <input
                    type="text"
                    placeholder="Indirizzo completo..."
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={nuovoOrdine.indirizzo.via}
                    onChange={(e) => setNuovoOrdine(prev => ({
                      ...prev, 
                      indirizzo: {...prev.indirizzo, via: e.target.value}
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Città *
                    </label>
                    <input
                      type="text"
                      placeholder="Città..."
                      className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={nuovoOrdine.indirizzo.citta}
                      onChange={(e) => setNuovoOrdine(prev => ({
                        ...prev, 
                        indirizzo: {...prev.indirizzo, citta: e.target.value}
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      CAP
                    </label>
                    <input
                      type="text"
                      placeholder="CAP..."
                      className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={nuovoOrdine.indirizzo.cap}
                      onChange={(e) => setNuovoOrdine(prev => ({
                        ...prev, 
                        indirizzo: {...prev.indirizzo, cap: e.target.value}
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Provincia
                  </label>
                  <input
                    type="text"
                    placeholder="Provincia..."
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={nuovoOrdine.indirizzo.provincia}
                    onChange={(e) => setNuovoOrdine(prev => ({
                      ...prev, 
                      indirizzo: {...prev.indirizzo, provincia: e.target.value}
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    placeholder="Numero di telefono..."
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={nuovoOrdine.contatti.telefono}
                    onChange={(e) => setNuovoOrdine(prev => ({
                      ...prev, 
                      contatti: {...prev.contatti, telefono: e.target.value}
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Sezione Prodotti e Valori */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-white border-b border-white/10 pb-2 mb-4">
                Valori e Timing
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Valore Ordine (€)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={nuovoOrdine.valore}
                    onChange={(e) => setNuovoOrdine(prev => ({...prev, valore: parseFloat(e.target.value) || 0}))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Tempo Stimato (min)
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={nuovoOrdine.tempoStimato}
                    onChange={(e) => setNuovoOrdine(prev => ({...prev, tempoStimato: parseInt(e.target.value) || 60}))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Referente
                  </label>
                  <input
                    type="text"
                    placeholder="Nome referente..."
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={nuovoOrdine.contatti.referente}
                    onChange={(e) => setNuovoOrdine(prev => ({
                      ...prev, 
                      contatti: {...prev.contatti, referente: e.target.value}
                    }))}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Note Aggiuntive
                </label>
                <textarea
                  placeholder="Note specifiche per l'ordine..."
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  rows="3"
                  value={nuovoOrdine.note}
                  onChange={(e) => setNuovoOrdine(prev => ({...prev, note: e.target.value}))}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={creaOrdine}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creazione...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Crea Ordine
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dettagli Ordine */}
      {showDetailsModal && selectedOrdine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Eye className="w-6 h-6 mr-2" />
                Dettagli Ordine {selectedOrdine.numero}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info Generale */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Informazioni Generali
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cliente:</span>
                    <span className="text-white">{selectedOrdine.cliente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stato:</span>
                    <StatoBadge stato={selectedOrdine.stato} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Priorità:</span>
                    <PrioritaBadge priorita={selectedOrdine.priorita} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valore:</span>
                    <span className="text-green-400 font-medium">€{selectedOrdine.valore.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Consegna */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Consegna
                </h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white ml-2">
                      {new Date(selectedOrdine.dataConsegna).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Indirizzo:</span>
                    <div className="text-white mt-1">
                      {selectedOrdine.indirizzo.via}<br/>
                      {selectedOrdine.indirizzo.cap} {selectedOrdine.indirizzo.citta} ({selectedOrdine.indirizzo.provincia})
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Tempo stimato:</span>
                    <span className="text-yellow-400 ml-2">{selectedOrdine.tempoStimato} minuti</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prodotti */}
            <div className="mt-6 bg-gray-800/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Prodotti ({selectedOrdine.prodotti.length})
              </h4>
              <div className="space-y-2">
                {selectedOrdine.prodotti.map((prodotto, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-700/50 rounded-lg p-3">
                    <div>
                      <span className="text-white font-medium">{prodotto.nome}</span>
                      <div className="text-sm text-gray-400">
                        {prodotto.quantita} {prodotto.unita}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">€{prodotto.prezzo.toFixed(2)}</div>
                      <div className="text-sm text-gray-400">
                        Totale: €{(prodotto.quantita * prodotto.prezzo).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contatti e Note */}
            {(selectedOrdine.contatti.referente || selectedOrdine.note) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedOrdine.contatti.referente && (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Contatti
                    </h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-400">Referente:</span>
                        <span className="text-white ml-2">{selectedOrdine.contatti.referente}</span>
                      </div>
                      {selectedOrdine.contatti.telefono && (
                        <div className="text-sm">
                          <span className="text-gray-400">Telefono:</span>
                          <span className="text-white ml-2">{selectedOrdine.contatti.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrdine.note && (
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Note
                    </h4>
                    <p className="text-gray-300 text-sm">{selectedOrdine.note}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Chiudi
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center">
                <Edit className="w-4 h-4 mr-2" />
                Modifica
              </button>
            </div>
          </div>
        </div>
      )}

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

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-input-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
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
          box-shadow: 0 4px 16px rgba(107, 114, 128, 0.2);
          color: white;
        }

        .glass-button-secondary:hover {
          background: rgba(107, 114, 128, 0.4);
          box-shadow: 0 8px 24px rgba(107, 114, 128, 0.3);
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

        /* Responsive */
        @media (max-width: 768px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .px-6 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        @media (max-width: 640px) {
          .grid-cols-2,
          .grid-cols-3,
          .grid-cols-4 {
            grid-template-columns: 1fr;
          }
          
          .text-2xl {
            font-size: 1.5rem;
          }
          
          .space-x-4 > * + * {
            margin-left: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrdiniManagement;