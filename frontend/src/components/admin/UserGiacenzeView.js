import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Truck, Plus, User, Package, ArrowLeft, CheckCircle, AlertCircle, Eye, Filter, Search, BarChart3, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { apiCall } from '../../services/api';
import { formatWeek } from '../../utils/formatters';

// Componente per gestire gli utilizzi di una giacenza specifica
const UtilizziGiacenzaManager = ({ giacenza, onUtilizziChange, token, setError }) => {
  const [utilizzi, setUtilizzi] = useState([]);
  const [postazioni, setPostazioni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Carica utilizzi per questa giacenza
  const loadUtilizzi = async () => {
    try {
      setLoading(true);
      
      // Carica utilizzi per questo utente e postazioni in parallelo
      const [utilizziData, postazioniData] = await Promise.all([
        apiCall(`/admin/utilizzi?userId=${giacenza.userId._id}`, {}, token),
        apiCall('/postazioni', {}, token)
      ]);
      
      // Filtra gli utilizzi solo per questo prodotto specifico
      const utilizziFiltered = Array.isArray(utilizziData) 
        ? utilizziData.filter(u => u.productId?._id === giacenza.productId._id)
        : [];
      
      setUtilizzi(utilizziFiltered);
      setPostazioni(Array.isArray(postazioniData) ? postazioniData : []);
    } catch (err) {
      setError('Errore nel caricamento utilizzi: ' + err.message);
      setUtilizzi([]);
      setPostazioni([]);
    } finally {
      setLoading(false);
    }
  };

  // Elimina utilizzo e ricarica dati
  const deleteUtilizzo = async (utilizzoId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo utilizzo? Questa azione ripristinerà la quantità del prodotto.')) {
      return;
    }
    try {
      await apiCall(`/admin/utilizzi/${utilizzoId}`, { method: 'DELETE' }, token);
      await loadUtilizzi();
      onUtilizziChange(); // Ricarica giacenze
    } catch (err) {
      setError('Errore eliminazione utilizzo: ' + err.message);
    }
  };

  useEffect(() => {
    if (expanded) {
      loadUtilizzi();
    }
  }, [expanded, giacenza._id]);

  const totalUtilizzato = utilizzi.reduce((sum, u) => sum + (u.quantitaUtilizzata || 0), 0);

  return (
    <div className="glass-card-interactive p-4 rounded-xl mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Utilizzi di {giacenza.productId?.nome}
          {utilizzi.length > 0 && (
            <span className="ml-2 text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded-full">
              {utilizzi.length} utilizzi
            </span>
          )}
        </h4>
        <button
          onClick={() => setExpanded(!expanded)}
          className="glass-button px-3 py-1 rounded-lg text-white hover:scale-105 transition-all duration-300 text-sm"
        >
          {expanded ? 'Nascondi' : 'Visualizza'}
        </button>
      </div>

      {totalUtilizzato > 0 && (
        <div className="text-sm text-white/70 mb-2">
          Totale utilizzato: <span className="text-white font-semibold">{totalUtilizzato} {giacenza.productId?.unita}</span>
        </div>
      )}

      {expanded && (
        <div className="space-y-2">
          {loading ? (
            <div className="text-white/50 text-sm">Caricamento utilizzi...</div>
          ) : utilizzi.length === 0 ? (
            <div className="text-white/50 text-sm">Nessun utilizzo registrato per questo prodotto</div>
          ) : (
            utilizzi.map(utilizzo => {
              // Trova la postazione dall'ID utilizzando l'array delle postazioni
              const postazione = postazioni?.find(p => p._id === utilizzo.postazioneId);
              
              return (
                <div key={utilizzo._id} className="glass-card p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">
                      <div className="text-white mb-1">
                        <span className="font-semibold">{utilizzo.quantitaUtilizzata} {giacenza.productId?.unita}</span>
                        {utilizzo.note && <span className="text-white/70 ml-2">- {utilizzo.note}</span>}
                      </div>
                      <div className="text-white/60 text-xs mb-2">
                        {new Date(utilizzo.dataUtilizzo).toLocaleDateString('it-IT')} alle {new Date(utilizzo.dataUtilizzo).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteUtilizzo(utilizzo._id)}
                      className="glass-button p-1 rounded-lg text-red-300 hover:text-red-200 hover:scale-105 transition-all duration-300"
                      title="Elimina utilizzo e ripristina quantità"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Informazioni aggiuntive: settimana, polo, mezzo, postazione */}
                  <div className="flex items-center space-x-4 text-xs flex-wrap">
                    {utilizzo.settimanaId && (
                      <div className="flex items-center text-blue-300">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatWeek(utilizzo.settimanaId)}</span>
                      </div>
                    )}
                    {utilizzo.poloId && (
                      <div className="flex items-center text-green-300">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{utilizzo.poloId?.nome}</span>
                      </div>
                    )}
                    {utilizzo.mezzoId && (
                      <div className="flex items-center text-purple-300">
                        <Truck className="w-3 h-3 mr-1" />
                        <span>{utilizzo.mezzoId?.nome}</span>
                      </div>
                    )}
                    {utilizzo.postazioneId && postazione && (
                      <div className="flex items-center text-orange-300">
                        <Package className="w-3 h-3 mr-1" />
                        <span>{postazione.nome}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const UserGiacenzeView = () => {
  const { token, setError } = useAuth();
  const { users, allProducts, assegnazioni, assignGiacenza, updateGiacenza, deleteGiacenza } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { selectedUserForGiacenze, giacenzeForm } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ✅ STATO SEPARATO per giacenze utente (non da useGiacenze)
  const [userGiacenze, setUserGiacenze] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stati per filtri specifici delle giacenze utente
  const [filters, setFilters] = useState({
    productId: '',
    stato: '', // 'critico', 'ok', ''
    searchTerm: '',
    quantitaAssegnataMin: '',
    quantitaAssegnataMax: '',
    quantitaDisponibileMin: '',
    quantitaDisponibileMax: '',
    sogliaMinimaMin: '',
    sogliaMinimaMax: ''
  });

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const selectedUser = users.find(u => u._id === selectedUserForGiacenze);
  const userAssignments = assegnazioni.filter(a => a.userId?._id === selectedUserForGiacenze);

  // ✅ FUNZIONE: Carica giacenze utente con filtri dal backend
  const loadUserGiacenze = async () => {
    if (!selectedUserForGiacenze) return;

    try {
      setLoading(true);
      setError('');
      
      // ✅ COSTRUISCE CORRETTAMENTE i query parameters
      const queryParams = new URLSearchParams();
      
      // Sempre filtra per questo utente specifico
      queryParams.append('userId', selectedUserForGiacenze);
      
      // Filtri aggiuntivi
      if (filters.productId) queryParams.append('productId', filters.productId);
      if (filters.stato) queryParams.append('stato', filters.stato);
      if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
      
      // Filtri numerici - solo se hanno valore
      if (filters.quantitaAssegnataMin && filters.quantitaAssegnataMin !== '') {
        queryParams.append('quantitaAssegnataMin', filters.quantitaAssegnataMin);
      }
      if (filters.quantitaAssegnataMax && filters.quantitaAssegnataMax !== '') {
        queryParams.append('quantitaAssegnataMax', filters.quantitaAssegnataMax);
      }
      if (filters.quantitaDisponibileMin && filters.quantitaDisponibileMin !== '') {
        queryParams.append('quantitaDisponibileMin', filters.quantitaDisponibileMin);
      }
      if (filters.quantitaDisponibileMax && filters.quantitaDisponibileMax !== '') {
        queryParams.append('quantitaDisponibileMax', filters.quantitaDisponibileMax);
      }
      if (filters.sogliaMinimaMin && filters.sogliaMinimaMin !== '') {
        queryParams.append('sogliaMinimaMin', filters.sogliaMinimaMin);
      }
      if (filters.sogliaMinimaMax && filters.sogliaMinimaMax !== '') {
        queryParams.append('sogliaMinimaMax', filters.sogliaMinimaMax);
      }
      
      // ✅ COSTRUISCE URL con parametri
      const url = `/admin/giacenze${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('🔍 Caricamento giacenze utente:', url);
      console.log('👤 Filtri per utente:', selectedUser?.username, Object.fromEntries(queryParams));
      
      const data = await apiCall(url, {}, token);
      setUserGiacenze(Array.isArray(data) ? data : []);
      
    } catch (err) {
      setError('Errore nel caricamento giacenze utente: ' + err.message);
      setUserGiacenze([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARICA GIACENZE quando cambia utente o filtri
  useEffect(() => {
    if (selectedUserForGiacenze) {
      loadUserGiacenze();
    }
  }, [
    selectedUserForGiacenze,
    filters.productId,
    filters.stato,
    filters.searchTerm,
    filters.quantitaAssegnataMin,
    filters.quantitaAssegnataMax,
    filters.quantitaDisponibileMin,
    filters.quantitaDisponibileMax,
    filters.sogliaMinimaMin,
    filters.sogliaMinimaMax
  ]);

  const setSelectedUserForGiacenze = (userId) => {
    dispatch({ type: 'SET_SELECTED_USER_FOR_GIACENZE', payload: userId });
  };

  const setAdminView = (view) => {
    dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
  };

  const updateGiacenzeForm = (updates) => {
    dispatch({ type: 'SET_GIACENZE_FORM', payload: updates });
  };

  // ✅ AGGIORNATO: Ricarica giacenze dopo assegnazione
  const handleAssignGiacenza = async () => {
    try {
      console.log('🔧 handleAssignGiacenza - Form data:', giacenzeForm);
      
      // Prima assegna/aggiorna la giacenza normale
      await assignGiacenza(selectedUserForGiacenze, giacenzeForm);
      
      // Se c'è un aggiornamento diretto della quantità disponibile, applicalo
      if (giacenzeForm.nuovaQuantitaDisponibile !== undefined && giacenzeForm.nuovaQuantitaDisponibile !== '' && giacenzeForm.productId) {
        const existingGiacenza = userGiacenze.find(g => g.productId?._id === giacenzeForm.productId);
        console.log('🔧 Giacenza esistente:', existingGiacenza);
        console.log('🔧 Nuova quantità disponibile:', giacenzeForm.nuovaQuantitaDisponibile);
        console.log('🔧 Quantità attuale:', existingGiacenza?.quantitaDisponibile);
        
        if (existingGiacenza && parseInt(giacenzeForm.nuovaQuantitaDisponibile) !== existingGiacenza.quantitaDisponibile) {
          console.log('🔧 Aggiornamento quantità disponibile...');
          await updateGiacenza(existingGiacenza._id, {
            quantitaDisponibile: parseInt(giacenzeForm.nuovaQuantitaDisponibile)
          });
          console.log('✅ Quantità disponibile aggiornata');
        } else {
          console.log('⚠️ Nessun aggiornamento necessario o dati mancanti');
        }
      } else {
        console.log('⚠️ Campo nuovaQuantitaDisponibile non presente:', giacenzeForm.nuovaQuantitaDisponibile);
      }
      
      // Ricarica le giacenze dopo l'assegnazione
      await loadUserGiacenze();
      
      // Reset form
      updateGiacenzeForm({
        productId: '',
        quantitaAssegnata: '',
        quantitaMinima: '',
        nuovaQuantitaDisponibile: '',
        isGlobal: true,
        aggiungiAlla: false,
        applicaATutteLeSettimane: false,
        settimanaId: ''
      });
      
    } catch (err) {
      setError('Errore nell\'assegnazione: ' + err.message);
    }
  };

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filtri
  const resetFilters = () => {
    setFilters({
      productId: '',
      stato: '',
      searchTerm: '',
      quantitaAssegnataMin: '',
      quantitaAssegnataMax: '',
      quantitaDisponibileMin: '',
      quantitaDisponibileMax: '',
      sogliaMinimaMin: '',
      sogliaMinimaMax: ''
    });
  };

  // Elimina giacenza
  const handleDeleteGiacenza = async (giacenza) => {
    try {
      // Prima carica gli utilizzi correlati a questa giacenza
      const utilizziData = await apiCall(`/admin/utilizzi?userId=${giacenza.userId._id}`, {}, token);
      
      // Filtra gli utilizzi per questo prodotto e settimana (se specificata)
      const utilizziCorrelati = Array.isArray(utilizziData) 
        ? utilizziData.filter(u => {
            const sameProduct = u.productId?._id === giacenza.productId._id;
            if (giacenza.settimanaId) {
              // Giacenza specifica per settimana - elimina solo utilizzi di quella settimana
              return sameProduct && u.settimanaId?._id === giacenza.settimanaId._id;
            } else {
              // Giacenza globale - elimina tutti gli utilizzi del prodotto
              return sameProduct;
            }
          })
        : [];

      // Carica anche le postazioni per mostrare i dettagli completi
      const postazioniData = await apiCall('/postazioni', {}, token);
      const postazioni = Array.isArray(postazioniData) ? postazioniData : [];

      const isGlobal = !giacenza.settimanaId;
      const settimanaText = isGlobal ? 'globale' : `per la settimana ${formatWeek(giacenza.settimanaId)}`;
      
      // Prepara il messaggio con i dettagli degli utilizzi
      let confirmMessage = `Sei sicuro di voler eliminare la giacenza ${settimanaText} di "${giacenza.productId?.nome}"?\n\n`;
      
      confirmMessage += `GIACENZA DA ELIMINARE:\n`;
      confirmMessage += `• Quantità assegnata: ${giacenza.quantitaAssegnata} ${giacenza.productId?.unita}\n`;
      confirmMessage += `• Quantità disponibile: ${giacenza.quantitaDisponibile} ${giacenza.productId?.unita}\n\n`;

      if (utilizziCorrelati.length > 0) {
        const totalUtilizzato = utilizziCorrelati.reduce((sum, u) => sum + (u.quantitaUtilizzata || 0), 0);
        
        confirmMessage += `⚠️ ATTENZIONE: Verranno eliminati anche ${utilizziCorrelati.length} utilizzi collegati:\n\n`;
        
        utilizziCorrelati.forEach((utilizzo, index) => {
          const postazione = postazioni.find(p => p._id === utilizzo.postazioneId);
          const data = new Date(utilizzo.dataUtilizzo).toLocaleDateString('it-IT', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
          
          confirmMessage += `${index + 1}. ${utilizzo.quantitaUtilizzata} ${giacenza.productId?.unita} - ${data}\n`;
          confirmMessage += `   📅 ${formatWeek(utilizzo.settimanaId)} | 📍 ${utilizzo.poloId?.nome} | 🚛 ${utilizzo.mezzoId?.nome}`;
          if (postazione) {
            confirmMessage += ` | 📦 ${postazione.nome}`;
          }
          if (utilizzo.note) {
            confirmMessage += `\n   📝 ${utilizzo.note}`;
          }
          confirmMessage += `\n\n`;
        });
        
        confirmMessage += `📊 Totale utilizzato da eliminare: ${totalUtilizzato} ${giacenza.productId?.unita}\n\n`;
      } else {
        confirmMessage += `✅ Non ci sono utilizzi collegati da eliminare.\n\n`;
      }
      
      confirmMessage += `L'operazione non può essere annullata.`;

      // Mostra il popup di conferma con tutti i dettagli
      if (!window.confirm(confirmMessage)) {
        return;
      }

      console.log('🗑️ Eliminazione giacenza:', giacenza._id);
      console.log('🗑️ Utilizzi da eliminare:', utilizziCorrelati.length);
      
      // Prima elimina tutti gli utilizzi correlati
      if (utilizziCorrelati.length > 0) {
        console.log('🗑️ Eliminazione utilizzi correlati...');
        for (const utilizzo of utilizziCorrelati) {
          try {
            await apiCall(`/admin/utilizzi/${utilizzo._id}`, { method: 'DELETE' }, token);
            console.log(`✅ Utilizzo eliminato: ${utilizzo._id}`);
          } catch (err) {
            console.error(`❌ Errore eliminazione utilizzo ${utilizzo._id}:`, err);
            throw new Error(`Errore nell'eliminazione dell'utilizzo del ${new Date(utilizzo.dataUtilizzo).toLocaleDateString('it-IT')}`);
          }
        }
        console.log('✅ Tutti gli utilizzi correlati eliminati');
      }
      
      // Poi elimina la giacenza
      const success = await deleteGiacenza(giacenza._id);
      
      if (success) {
        // Ricarica le giacenze dopo l'eliminazione
        await loadUserGiacenze();
        const messaggioSuccesso = utilizziCorrelati.length > 0 
          ? `✅ Giacenza eliminata con successo insieme a ${utilizziCorrelati.length} utilizzi correlati`
          : '✅ Giacenza eliminata con successo';
        console.log(messaggioSuccesso);
      } else {
        setError('Errore nell\'eliminazione della giacenza');
      }
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
      console.error('❌ Errore eliminazione giacenza:', err);
    }
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
          {/* Pulsante back in alto a sinistra */}
          <div className="mb-4">
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
          
          {/* Info utente */}
          <div className="flex items-center space-x-4 mb-4">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Prodotto *
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={giacenzeForm.productId}
                onChange={(e) => {
                  updateGiacenzeForm({ productId: e.target.value });
                  // Reset delle informazioni quando cambia prodotto
                  if (e.target.value) {
                    // Cerca giacenza esistente per questo prodotto e utente
                    const existingGiacenza = userGiacenze.find(g => g.productId?._id === e.target.value);
                    if (existingGiacenza) {
                      updateGiacenzeForm({
                        quantitaAssegnata: existingGiacenza.quantitaAssegnata,
                        quantitaMinima: existingGiacenza.quantitaMinima,
                        quantitaAttuale: existingGiacenza.quantitaDisponibile
                      });
                    } else {
                      updateGiacenzeForm({
                        quantitaAttuale: 0
                      });
                    }
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
              >
                <option value="" className="bg-gray-800">Seleziona prodotto</option>
                {allProducts.map(product => {
                  const hasGiacenza = userGiacenze.find(g => g.productId?._id === product._id);
                  return (
                    <option key={product._id} value={product._id} className="bg-gray-800">
                      {product.nome} ({product.categoria}) {hasGiacenza ? '📦 Esistente' : '🆕 Nuovo'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Mostra quantità attuale se giacenza esistente */}
            {giacenzeForm.productId && (() => {
              const existingGiacenza = userGiacenze.find(g => g.productId?._id === giacenzeForm.productId);
              return existingGiacenza ? (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Quantità Attuale
                  </label>
                  <div className="glass-info-display px-3 py-2 rounded-xl">
                    <div className="text-white text-sm">
                      <span className="font-semibold">{existingGiacenza.quantitaDisponibile}</span>
                      <span className="text-white/70"> / {existingGiacenza.quantitaAssegnata} {existingGiacenza.productId?.unita}</span>
                    </div>
                    <div className="text-xs text-white/60">
                      Disponibile / Assegnata
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Nuova Quantità Assegnata *
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
              {giacenzeForm.productId && (() => {
                const existingGiacenza = userGiacenze.find(g => g.productId?._id === giacenzeForm.productId);
                const newQuantity = parseInt(giacenzeForm.quantitaAssegnata) || 0;
                const currentAssigned = existingGiacenza?.quantitaAssegnata || 0;
                const difference = newQuantity - currentAssigned;
                
                return existingGiacenza && giacenzeForm.quantitaAssegnata ? (
                  <div className="mt-1 text-xs">
                    {difference > 0 ? (
                      <span className="text-green-300">+{difference} rispetto a prima</span>
                    ) : difference < 0 ? (
                      <span className="text-yellow-300">{difference} rispetto a prima</span>
                    ) : (
                      <span className="text-white/60">Stessa quantità</span>
                    )}
                  </div>
                ) : null;
              })()}
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

            {/* Campo per aggiornare quantità disponibile */}
            {giacenzeForm.productId && (() => {
              const existingGiacenza = userGiacenze.find(g => g.productId?._id === giacenzeForm.productId);
              return existingGiacenza ? (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Nuova Quantità Disponibile
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={giacenzeForm.nuovaQuantitaDisponibile !== undefined && giacenzeForm.nuovaQuantitaDisponibile !== '' 
                      ? giacenzeForm.nuovaQuantitaDisponibile 
                      : existingGiacenza.quantitaDisponibile}
                    onChange={(e) => {
                      console.log('🔧 Campo nuovaQuantitaDisponibile cambiato:', e.target.value);
                      updateGiacenzeForm({ nuovaQuantitaDisponibile: e.target.value });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    placeholder={`Attuale: ${existingGiacenza.quantitaDisponibile}`}
                  />
                  <div className="mt-1 text-xs text-white/60">
                    Permette di correggere direttamente la quantità disponibile (es. per inventario, perdite, ecc.)
                  </div>
                </div>
              ) : null;
            })()}

            {/* Gestione Utilizzi per giacenza esistente */}
            {giacenzeForm.productId && (() => {
              const existingGiacenza = userGiacenze.find(g => g.productId?._id === giacenzeForm.productId);
              return existingGiacenza ? (
                <div className="lg:col-span-4">
                  <UtilizziGiacenzaManager 
                    giacenza={existingGiacenza}
                    onUtilizziChange={() => loadUserGiacenze()}
                    token={token}
                    setError={setError}
                  />
                </div>
              ) : null;
            })()}

            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Modalità di Aggiornamento
              </label>
              
              {/* Anteprima operazione */}
              {giacenzeForm.productId && giacenzeForm.quantitaAssegnata && (() => {
                const existingGiacenza = userGiacenze.find(g => g.productId?._id === giacenzeForm.productId);
                const newQuantity = parseInt(giacenzeForm.quantitaAssegnata) || 0;
                const isAdd = giacenzeForm.aggiungiAlla;
                
                if (existingGiacenza) {
                  const currentAvailable = existingGiacenza.quantitaDisponibile;
                  const currentAssigned = existingGiacenza.quantitaAssegnata;
                  
                  // Controlla se c'è un aggiornamento diretto della quantità disponibile
                  const newDisponibile = (giacenzeForm.nuovaQuantitaDisponibile !== undefined && giacenzeForm.nuovaQuantitaDisponibile !== '') ? 
                    parseInt(giacenzeForm.nuovaQuantitaDisponibile) : null;
                  
                  let newAvailable, newAssigned, operation;
                  
                  if (newDisponibile !== null && newDisponibile !== currentAvailable) {
                    // Aggiornamento diretto della quantità disponibile
                    newAssigned = newQuantity;
                    newAvailable = newDisponibile;
                    operation = "Aggiornamento Diretto";
                  } else if (isAdd) {
                    newAssigned = currentAssigned + newQuantity;
                    newAvailable = currentAvailable + newQuantity;
                    operation = "Aggiunta";
                  } else {
                    newAssigned = newQuantity;
                    newAvailable = currentAvailable + (newQuantity - currentAssigned);
                    operation = "Sostituzione";
                  }
                  
                  return (
                    <div className="glass-preview-container p-4 rounded-xl mb-4">
                      <h5 className="text-white font-medium mb-2">🔍 Anteprima Operazione ({operation})</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-white/70">Prima:</div>
                          <div className="text-white">
                            📦 Assegnata: <span className="font-semibold">{currentAssigned}</span>
                          </div>
                          <div className="text-white">
                            ✅ Disponibile: <span className="font-semibold">{currentAvailable}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70">Dopo:</div>
                          <div className="text-white">
                            📦 Assegnata: <span className="font-semibold text-blue-300">{newAssigned}</span>
                          </div>
                          <div className="text-white">
                            ✅ Disponibile: <span className={`font-semibold ${newAvailable >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                              {newAvailable}
                            </span>
                          </div>
                        </div>
                      </div>
                      {newAvailable < 0 && (
                        <div className="mt-2 text-red-300 text-xs">
                          ⚠️ Attenzione: La quantità disponibile diventerà negativa!
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

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
            <span>
              {(() => {
                const existingGiacenza = userGiacenze.find(g => g.productId?._id === giacenzeForm.productId);
                if (existingGiacenza) {
                  return giacenzeForm.aggiungiAlla ? 'Aggiungi Quantità' : 'Aggiorna Giacenza';
                } else {
                  return 'Assegna Nuova Giacenza';
                }
              })()}
            </span>
          </button>
        </div>

        {/* Lista giacenze utente con filtri */}
        <div className="glass-card-large rounded-2xl">
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Giacenze Attuali
                {loading && <span className="ml-2 text-sm text-white/50">Caricamento...</span>}
              </h3>
              <div className="text-white/70">
                {userGiacenze.length} giacenz{userGiacenze.length === 1 ? 'a' : 'e'} trovata/e
              </div>
            </div>
          </div>

          {/* Sezione Filtri */}
          <div className="glass-filter-section px-6 py-4 border-b border-white/10">
            <h4 className="text-md font-semibold text-white mb-4 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filtri Giacenze
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                      placeholder="Cerca prodotto..."
                      className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={filters.searchTerm}
                      onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filtri Numerici */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quantità Assegnata */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Quantità Assegnata
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.quantitaAssegnataMin}
                    onChange={(e) => updateFilters({ quantitaAssegnataMin: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.quantitaAssegnataMax}
                    onChange={(e) => updateFilters({ quantitaAssegnataMax: e.target.value })}
                  />
                </div>
              </div>

              {/* Quantità Disponibile */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Quantità Disponibile
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.quantitaDisponibileMin}
                    onChange={(e) => updateFilters({ quantitaDisponibileMin: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.quantitaDisponibileMax}
                    onChange={(e) => updateFilters({ quantitaDisponibileMax: e.target.value })}
                  />
                </div>
              </div>

              {/* Soglia Minima */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Soglia Minima
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.sogliaMinimaMin}
                    onChange={(e) => updateFilters({ sogliaMinimaMin: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.sogliaMinimaMax}
                    onChange={(e) => updateFilters({ sogliaMinimaMax: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Pulsanti Azione */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-white/60">
                {loading ? 'Caricamento...' : `${userGiacenze.length} giacenz${userGiacenze.length === 1 ? 'a' : 'e'} trovata/e`}
              </div>
              <button
                onClick={resetFilters}
                className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Reset Filtri
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white/50 animate-pulse" />
                </div>
                <p className="text-white/70">Caricamento giacenze...</p>
              </div>
            ) : (
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
                          <div className="text-sm text-white">
                            {giacenza.settimanaId ? (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-blue-300" />
                                <span>{formatWeek(giacenza.settimanaId)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span className="text-blue-300">🌐</span>
                                <span className="ml-1">Globale</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`glass-status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isSottoSoglia 
                              ? 'text-red-200 border-red-300/30 bg-red-400/20' 
                              : 'text-green-200 border-green-300/30 bg-green-400/20'
                          }`}>
                            {isSottoSoglia ? (
                              <>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                CRITICO
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                OK
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteGiacenza(giacenza)}
                            className="glass-button p-2 rounded-lg text-red-300 hover:text-red-200 hover:scale-105 transition-all duration-300"
                            title={giacenza.settimanaId ? 'Elimina giacenza per questa settimana' : 'Elimina giacenza globale'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading && userGiacenze.length === 0 && (
              <div className="glass-empty-state text-center py-16">
                <div className="glass-icon w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-white/70 text-lg mb-2">
                  Nessuna giacenza trovata
                </p>
                <p className="text-white/50 text-sm mb-4">
                  {Object.values(filters).some(filter => filter !== '') 
                    ? 'Prova a modificare i filtri per vedere più risultati'
                    : 'Usa il form sopra per assegnare prodotti a questo operatore'
                  }
                </p>
                {Object.values(filters).some(filter => filter !== '') && (
                  <button
                    onClick={resetFilters}
                    className="glass-button-secondary px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
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

        .glass-filter-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
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

        .glass-button-secondary {
          background: rgba(107, 114, 128, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 114, 128, 0.4);
          color: white;
        }

        .glass-button-secondary:hover {
          background: rgba(107, 114, 128, 0.4);
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

        .glass-empty-state {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
        }

        .glass-info-display {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-preview-container {
          background: rgba(59, 130, 246, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
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

        /* Responsive */
        @media (max-width: 768px) {
          .glass-card {
            padding: 1rem;
          }
          
          .glass-filter-section {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserGiacenzeView;