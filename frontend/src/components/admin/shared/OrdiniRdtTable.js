import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Edit,
  Save,
  X,
  Package,
  Hash,
  Clipboard,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useGiacenze } from '../../../hooks/useGiacenze';
import { apiCall } from '../../../services/api';
import OrdineRdtModal from './OrdineRdtModal';

const OrdiniRdtTable = ({ title = "Ordini e RDT", showActions = true, onItemsChange }) => {
  const { token, setError } = useAuth();
  const { users, settimane, assegnazioni } = useGiacenze();

  // Stati per dati
  const [ordini, setOrdini] = useState([]);
  const [rdt, setRdt] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stati per editing
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});
  
  // Stati per modale
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Stati per filtri
  const [filters, setFilters] = useState({
    searchTerm: '',
    operatore: '',
    settimana: '',
    stato: '',
    tipo: ''
  });

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
        apiCall('/ordini', {}, token),
        apiCall('/rdt', {}, token)
      ]);
      
      const ordiniArray = ordiniData?.ordini || [];
      const rdtArray = rdtData?.rdt || [];
      
      setOrdini(ordiniArray);
      setRdt(rdtArray);
      
      // Notifica il componente parent del cambiamento
      if (onItemsChange) {
        onItemsChange([...ordiniArray, ...rdtArray]);
      }
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

  // Avvia editing inline
  const startEdit = (item) => {
    const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
    
    setEditingItem(item._id);
    setEditValues({
      numero: item.numero || '',
      cliente: item.cliente || '',
      dataConsegna: item.dataConsegna ? new Date(item.dataConsegna).toISOString().split('T')[0] : '',
      operatore: assegnazione?.userId?._id || '',
      settimanaId: assegnazione?.settimanaId?._id || '',
      stato: item.stato || 'CREATO',
      note: item.note || ''
    });
  };

  // Salva modifiche inline
  const handleUpdate = async (item) => {
    try {
      setError('');
      
      // Aggiorna l'ordine/rdt
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      const updateData = {
        numero: editValues.numero,
        cliente: editValues.cliente,
        dataConsegna: editValues.dataConsegna,
        stato: editValues.stato,
        note: editValues.note
      };

      await apiCall(`${endpoint}/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);

      // Gestisci l'assegnazione
      const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
      
      if (editValues.operatore && editValues.settimanaId) {
        if (assegnazione && 
            (editValues.operatore !== assegnazione.userId?._id || 
             editValues.settimanaId !== assegnazione.settimanaId?._id)) {
          // Aggiorna assegnazione esistente
          await apiCall(`/assegnazioni/${assegnazione._id}`, {
            method: 'PUT',
            body: JSON.stringify({
              userId: editValues.operatore,
              settimanaId: editValues.settimanaId
            })
          }, token);
        } else if (!assegnazione) {
          // Crea nuova assegnazione (se possibile)
          console.log('Necessaria creazione di nuova assegnazione - non implementata');
        }
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

  // Finalizza elemento
  const finalizeItem = async (item) => {
    if (!window.confirm(`Sei sicuro di voler finalizzare questo ${item.itemType}?`)) {
      return;
    }

    try {
      setError('');
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      
      await apiCall(`${endpoint}/${item._id}/finalize`, {
        method: 'POST'
      }, token);

      await loadData();
      setError(`✅ ${item.itemType} finalizzato! Stato aggiornato a COMPLETATO e giacenze incrementate.`);
    } catch (err) {
      setError('Errore nella finalizzazione: ' + err.message);
    }
  };

  // Riapri elemento completato con ripristino giacenze
  const reopenItem = async (item) => {
    if (!window.confirm(`Sei sicuro di voler riaprire questo ${item.itemType}? Le giacenze dei prodotti associati verranno decrementate dalle giacenze disponibili dell'operatore.`)) {
      return;
    }

    try {
      setError('');
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      
      await apiCall(`${endpoint}/${item._id}/reopen`, {
        method: 'POST'
      }, token);

      await loadData();
      setError(`✅ ${item.itemType} riaperto! Stato aggiornato a CREATO e giacenze decrementate.`);
    } catch (err) {
      setError('Errore nella riapertura: ' + err.message);
    }
  };

  // Apri modale dettagli
  const openModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Chiudi modale
  const closeModal = () => {
    setSelectedItem(null);
    setShowModal(false);
  };

  // Callback per aggiornamenti dal modale
  const handleModalSave = () => {
    loadData();
    closeModal();
  };

  const filteredItems = getFilteredItems();

  return (
    <>
      <div className="glass-card-large rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Package className="w-5 h-5 mr-2" />
            {title}
            {!loading && (
              <span className="ml-2 text-sm text-white/50">
                ({filteredItems.length} risultati)
              </span>
            )}
          </h3>
        </div>

        {/* Filtri */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="glass-input-container rounded-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cerca numero, cliente..."
                  className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={filters.searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                />
              </div>
            </div>
            
            <select
              className="glass-input px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
              value={filters.tipo}
              onChange={(e) => updateFilters({ tipo: e.target.value })}
            >
              <option value="" className="bg-gray-800">Tutti i tipi</option>
              <option value="ordine" className="bg-gray-800">Solo Ordini</option>
              <option value="rdt" className="bg-gray-800">Solo RDT</option>
            </select>

            <select
              className="glass-input px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
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

            <select
              className="glass-input px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
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

            <select
              className="glass-input px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
              value={filters.stato}
              onChange={(e) => updateFilters({ stato: e.target.value })}
            >
              <option value="" className="bg-gray-800">Tutti gli stati</option>
              <option value="CREATO" className="bg-gray-800">Creato</option>
              <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
              <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
              <option value="COMPLETATO" className="bg-gray-800">Completato</option>
              <option value="ANNULLATO" className="bg-gray-800">Annullato</option>
            </select>
          </div>
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
                    Data Consegna
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
                    Note
                  </th>
                  {showActions && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => {
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
                            {isEditing ? (
                              <input
                                type="text"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editValues.numero}
                                onChange={(e) => setEditValues({...editValues, numero: e.target.value})}
                              />
                            ) : (
                              <button
                                onClick={() => openModal(item)}
                                className="text-sm font-medium text-white hover:text-blue-400 transition-colors duration-200"
                              >
                                {item.numero || `${item.itemType.toUpperCase()}-${item._id?.slice(-6) || 'N/A'}`}
                              </button>
                            )}
                            <div className="text-sm text-white/50">
                              {item.itemType === 'ordine' ? 'Ordine' : 'RDT'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.cliente}
                            onChange={(e) => setEditValues({...editValues, cliente: e.target.value})}
                          />
                        ) : (
                          <div className="text-sm text-white">
                            {item.cliente || 'N/A'}
                          </div>
                        )}
                      </td>

                      {/* Data Consegna */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="date"
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.dataConsegna}
                            onChange={(e) => setEditValues({...editValues, dataConsegna: e.target.value})}
                          />
                        ) : (
                          <div className="text-sm text-white">
                            {item.dataConsegna ? new Date(item.dataConsegna).toLocaleDateString('it-IT') : 'N/A'}
                          </div>
                        )}
                      </td>
                      
                      {/* Operatore */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.operatore}
                            onChange={(e) => {
                              const newOperatore = e.target.value;
                              setEditValues({...editValues, operatore: newOperatore});
                              
                              // Reset settimana quando cambia operatore
                              if (newOperatore) {
                                setEditValues(prev => ({...prev, settimanaId: ''}));
                              }
                            }}
                          >
                            <option value="" className="bg-gray-800">Nessun operatore</option>
                            {users?.filter(u => u.role === 'user').map(user => (
                              <option key={user._id} value={user._id} className="bg-gray-800">
                                {user.username}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-white">
                            {assegnazione?.userId?.username || (
                              <span className="text-white/40 italic">Non assegnato</span>
                            )}
                          </div>
                        )}
                      </td>
                      
                      {/* Settimana */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.settimanaId}
                            onChange={(e) => setEditValues({...editValues, settimanaId: e.target.value})}
                            disabled={!editValues.operatore}
                          >
                            <option value="" className="bg-gray-800">Nessuna settimana</option>
                            {editValues.operatore && settimane?.filter(settimana => {
                              // Filtra settimane che hanno assegnazioni attive per l'operatore selezionato
                              return assegnazioni?.some(a => 
                                a.userId._id === editValues.operatore && 
                                a.settimanaId._id === settimana._id && 
                                a.attiva
                              );
                            }).map(settimana => (
                              <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                                Settimana {settimana.numero} - {settimana.anno}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-white">
                            {assegnazione?.settimanaId ? 
                              `Settimana ${assegnazione.settimanaId.numero}/${assegnazione.settimanaId.anno}` :
                              <span className="text-white/40 italic">Non assegnata</span>
                            }
                          </div>
                        )}
                      </td>
                      
                      {/* Stato */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.stato}
                            onChange={(e) => setEditValues({...editValues, stato: e.target.value})}
                          >
                            <option value="CREATO" className="bg-gray-800">Creato</option>
                            <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
                            <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
                            <option value="COMPLETATO" className="bg-gray-800">Completato</option>
                            <option value="ANNULLATO" className="bg-gray-800">Annullato</option>
                          </select>
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
                                {item.stato || 'CREATO'}
                              </>
                            )}
                          </span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.note}
                            onChange={(e) => setEditValues({...editValues, note: e.target.value})}
                            placeholder="Aggiungi note..."
                          />
                        ) : (
                          <div className="text-sm text-white/70 max-w-xs truncate">
                            {item.note || '-'}
                          </div>
                        )}
                      </td>
                      
                      {/* Azioni */}
                      {showActions && (
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
                                  title="Modifica inline"
                                >
                                  <Edit className="w-4 h-4 text-blue-400" />
                                </button>
                                
                                <button
                                  onClick={() => openModal(item)}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Visualizza/Modifica dettagli completi"
                                >
                                  <Eye className="w-4 h-4 text-yellow-400" />
                                </button>
                                
                                {item.stato !== 'COMPLETATO' ? (
                                  <button
                                    onClick={() => finalizeItem(item)}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Finalizza e cambia stato a COMPLETATO"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => reopenItem(item)}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Riapri e ripristina giacenze"
                                  >
                                    <Package className="w-4 h-4 text-orange-400" />
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
                      )}
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

      {/* Modale dettagli */}
      {showModal && selectedItem && (
        <OrdineRdtModal
          item={selectedItem}
          onClose={closeModal}
          onSave={handleModalSave}
        />
      )}
    </>
  );
};

export default OrdiniRdtTable;