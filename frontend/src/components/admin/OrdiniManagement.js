import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Plus,
  Edit,
  Save,
  X,
  Package,
  FileText,
  Hash,
  Clipboard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import Navigation from '../shared/Navigation';
import { apiCall } from '../../services/api';

const OrdiniManagement = () => {
  const { token, setError, setCurrentPage } = useAuth();
  const { users, settimane, assegnazioni } = useGiacenze();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Stati per dati
  const [ordini, setOrdini] = useState([]);
  const [rdt, setRdt] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stati per editing
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});
  
  // Stati per filtri
  const [filters, setFilters] = useState({
    searchTerm: '',
    operatore: '',
    settimana: '',
    stato: '',
    tipo: ''
  });

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Carica dati iniziali
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [ordiniData, rdtData] = await Promise.all([
        apiCall('/ordini?debug=true', {}, token),
        apiCall('/rdt?debug=true', {}, token)
      ]);
      
      // Estrai gli array dalle risposte API
      console.log('Risposta ordini:', ordiniData);
      console.log('Risposta RDT:', rdtData);
      
      const ordiniArray = ordiniData?.ordini || [];
      const rdtArray = rdtData?.rdt || [];
      
      setOrdini(ordiniArray);
      setRdt(rdtArray);
      
      console.log('Ordini caricati:', ordiniArray.length);
      console.log('RDT caricati:', rdtArray.length);
    } catch (err) {
      setError('Errore nel caricamento dati: ' + err.message);
      setOrdini([]);
      setRdt([]);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per ottenere assegnazione da ordine/rdt
  const getAssegnazioneForItem = (type, numero) => {
    if (!assegnazioni || !numero) return null;
    
    return assegnazioni.find(a => {
      if (type === 'ordine') {
        return a.ordine === numero && a.attiva;
      } else if (type === 'rdt') {
        return a.rdt === numero && a.attiva;
      }
      return false;
    });
  };

  // Combina ordini e RDT in un unico array
  const getAllItems = () => {
    const ordiniWithType = (ordini || []).map(item => ({ ...item, itemType: 'ordine' }));
    const rdtWithType = (rdt || []).map(item => ({ ...item, itemType: 'rdt' }));
    return [...ordiniWithType, ...rdtWithType];
  };

  // Filtra dati combinati
  const getFilteredItems = () => {
    let items = getAllItems();
    
    // Filtro tipo
    if (filters.tipo) {
      items = items.filter(item => item.itemType === filters.tipo);
    }
    
    // Filtro ricerca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      items = items.filter(item => {
        const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
        return item.numero?.toLowerCase().includes(searchLower) ||
               item.cliente?.toLowerCase().includes(searchLower) ||
               assegnazione?.userId?.username?.toLowerCase().includes(searchLower);
      });
    }
    
    // Filtro operatore
    if (filters.operatore) {
      items = items.filter(item => {
        const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
        return assegnazione?.userId?._id === filters.operatore;
      });
    }
    
    // Filtro settimana
    if (filters.settimana) {
      items = items.filter(item => {
        const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
        return assegnazione?.settimanaId?._id === filters.settimana;
      });
    }
    
    // Filtro stato
    if (filters.stato) {
      items = items.filter(item => item.stato === filters.stato);
    }
    
    return items;
  };

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Avvia editing
  const startEdit = (item) => {
    const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
    
    setEditingItem(item._id);
    setEditValues({
      operatore: assegnazione?.userId?._id || '',
      settimanaId: assegnazione?.settimanaId?._id || '',
      stato: item.stato || 'BOZZA'
    });
  };

  // Salva modifiche
  const handleUpdate = async (item) => {
    try {
      setError('');
      
      // Aggiorna l'ordine/rdt
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          stato: editValues.stato
        })
      }, token);

      // Aggiorna l'assegnazione se necessario
      const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
      if (assegnazione && 
          (editValues.operatore !== assegnazione.userId?._id || 
           editValues.settimanaId !== assegnazione.settimanaId?._id)) {
        await apiCall(`/assegnazioni/${assegnazione._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            userId: editValues.operatore,
            settimanaId: editValues.settimanaId
          })
        }, token);
      }
      
      await loadData();
      setEditingItem(null);
      setEditValues({});
      setError('✅ Modifiche salvate con successo');
    } catch (err) {
      setError('Errore nel salvataggio: ' + err.message);
    }
  };

  // Elimina elemento
  const handleDelete = async (item) => {
    if (!window.confirm(`Sei sicuro di voler eliminare questo ${item.itemType}?`)) return;
    
    try {
      setError('');
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${item._id}`, {
        method: 'DELETE'
      }, token);
      
      await loadData();
      setError(`✅ ${item.itemType} eliminato con successo`);
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  // Riapri elemento
  const handleReopen = async (item) => {
    if (!window.confirm(`Sei sicuro di voler riaprire questo ${item.itemType}?`)) return;
    
    try {
      setError('');
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({ stato: 'BOZZA' })
      }, token);
      
      await loadData();
      setError(`✅ ${item.itemType} riaperto per modifiche`);
    } catch (err) {
      setError('Errore nella riapertura: ' + err.message);
    }
  };

  const filteredItems = getFilteredItems();

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
              <div className="relative z-10">
      </div>
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="glass-icon p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Gestione Ordini e RDT</h2>
                <p className="text-white/70">Visualizza e gestisci ordini e RDT collegati alle assegnazioni</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage('crea-ordini')}
                className="glass-button-primary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Crea Ordine / RDT</span>
              </button>
              
              <div className="glass-stats-container p-4 rounded-xl">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {filteredItems.length}
                    </div>
                    <div className="text-xs text-white/60">Totale</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {filteredItems.filter(i => i.itemType === 'ordine').length}
                    </div>
                    <div className="text-xs text-white/60">Ordini</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {filteredItems.filter(i => i.itemType === 'rdt').length}
                    </div>
                    <div className="text-xs text-white/60">RDT</div>
                  </div>
                </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Filtro Tipo */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tipo
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.tipo}
                onChange={(e) => updateFilters({ tipo: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti i tipi</option>
                <option value="ordine" className="bg-gray-800">Solo Ordini</option>
                <option value="rdt" className="bg-gray-800">Solo RDT</option>
              </select>
            </div>

            {/* Filtro Operatore */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Operatore
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.operatore}
                onChange={(e) => updateFilters({ operatore: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti gli operatori</option>
                {users?.filter(u => u.role === 'user').map(user => (
                  <option key={user._id} value={user._id} className="bg-gray-800">
                    {user.username}
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
                value={filters.settimana}
                onChange={(e) => updateFilters({ settimana: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutte le settimane</option>
                {settimane?.map(settimana => (
                  <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                    Settimana {settimana.numero} - {settimana.anno}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro Stato */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Stato
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.stato}
                onChange={(e) => updateFilters({ stato: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti gli stati</option>
                <option value="BOZZA" className="bg-gray-800">Bozza</option>
                <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
                <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
                <option value="COMPLETATO" className="bg-gray-800">Completato</option>
                <option value="ANNULLATO" className="bg-gray-800">Annullato</option>
              </select>
            </div>

            {/* Ricerca */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Ricerca Libera
              </label>
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cerca numero, cliente, operatore..."
                    className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella */}
        <div className="glass-card-large rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Ordini e RDT
              {!loading && (
                <span className="ml-2 text-sm text-white/50">
                  ({filteredItems.length} risultati)
                </span>
              )}
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-white/70">Caricamento...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="glass-table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Tipo/Numero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Operatore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Settimana
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredItems.map((item, index) => {
                    const isEditing = editingItem === item._id;
                    const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
                    
                    return (
                      <tr key={item._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                        {/* Tipo/Numero */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="glass-avatar w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                              {item.itemType === 'ordine' ? 
                                <Hash className="w-5 h-5 text-blue-400" /> : 
                                <Clipboard className="w-5 h-5 text-green-400" />
                              }
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {item.numero || `${item.itemType.toUpperCase()}-${item._id?.slice(-6) || 'N/A'}`}
                              </div>
                              <div className="text-sm text-white/50">
                                {item.itemType === 'ordine' ? 'Ordine' : 'RDT'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {item.cliente || 'N/A'}
                          </div>
                        </td>
                        
                        {/* Operatore */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {isEditing ? (
                              <div className="glass-input-container">
                                <select
                                  className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                  value={editValues.operatore}
                                  onChange={(e) => setEditValues({...editValues, operatore: e.target.value})}
                                >
                                  <option value="" className="bg-gray-800">Nessun operatore</option>
                                  {users?.filter(u => u.role === 'user').map(user => (
                                    <option key={user._id} value={user._id} className="bg-gray-800">
                                      {user.username}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="text-sm text-white">
                                {assegnazione?.userId?.username || (
                                  <span className="text-white/40 italic">Non assegnato</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        {/* Settimana */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <select
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editValues.settimanaId}
                                onChange={(e) => setEditValues({...editValues, settimanaId: e.target.value})}
                              >
                                <option value="" className="bg-gray-800">Nessuna settimana</option>
                                {settimane?.map(settimana => (
                                  <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                                    Settimana {settimana.numero} - {settimana.anno}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-white">
                                {assegnazione?.settimanaId ? 
                                  `Settimana ${assegnazione.settimanaId.numero}/${assegnazione.settimanaId.anno}` :
                                  <span className="text-white/40 italic">Non assegnata</span>
                                }
                              </div>
                            </div>
                          )}
                        </td>
                        
                        {/* Stato */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <select
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editValues.stato}
                                onChange={(e) => setEditValues({...editValues, stato: e.target.value})}
                              >
                                <option value="BOZZA" className="bg-gray-800">Bozza</option>
                                <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
                                <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
                                <option value="COMPLETATO" className="bg-gray-800">Completato</option>
                                <option value="ANNULLATO" className="bg-gray-800">Annullato</option>
                              </select>
                            </div>
                          ) : (
                            <span className={`glass-status-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                              item.stato === 'COMPLETATO' ? 'text-green-200 border-green-300/30 bg-green-400/20' :
                              item.stato === 'IN_CORSO' ? 'text-blue-200 border-blue-300/30 bg-blue-400/20' :
                              item.stato === 'ASSEGNATO' ? 'text-purple-200 border-purple-300/30 bg-purple-400/20' :
                              item.stato === 'ANNULLATO' ? 'text-red-200 border-red-300/30 bg-red-400/20' :
                              'text-yellow-200 border-yellow-300/30 bg-yellow-400/20'
                            }`}>
                              {item.stato === 'COMPLETATO' ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  COMPLETATO
                                </>
                              ) : item.stato === 'ANNULLATO' ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  ANNULLATO
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {item.stato || 'BOZZA'}
                                </>
                              )}
                            </span>
                          )}
                        </td>
                        
                        {/* Data */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                          </div>
                        </td>
                        
                        {/* Azioni */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(item)}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Salva modifiche"
                                >
                                  <Save className="w-4 h-4 text-green-400" />
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Annulla modifica"
                                >
                                  <X className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(item)}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Modifica"
                                >
                                  <Edit className="w-4 h-4 text-blue-400" />
                                </button>
                                
                                {(item.stato === 'COMPLETATO' || item.stato === 'ANNULLATO') && (
                                  <button
                                    onClick={() => handleReopen(item)}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Riapri per modifiche"
                                  >
                                    <Eye className="w-4 h-4 text-yellow-400" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Elimina"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredItems.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-white/70 text-lg mb-2">Nessun elemento trovato</p>
                  <p className="text-sm text-white/50">
                    Modifica i filtri per vedere più risultati
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles - Copiati da AssignmentsManagement */}
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

        .glass-avatar {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-stats-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
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

        .glass-action-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .glass-action-button:hover {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
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
          .glass-card {
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

export default OrdiniManagement;