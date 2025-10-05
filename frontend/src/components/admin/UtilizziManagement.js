// components/admin/UtilizziManagement.js
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, X, Search, Filter, Eye, User, Package, Calendar, ChevronRight, BarChart3, Clock, FileText, AlertCircle, MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { apiCall } from '../../services/api';
import { useModalAnimation, useStaggerAnimation } from '../../hooks/useModalAnimation';
import { formatWeek, formatDateTime, getCurrentWeekFromList, sortWeeksChronologically, sortWeeksCenteredOnCurrent } from '../../utils/formatters';

const UtilizziManagement = () => {
  const { token, setError } = useAuth();
  const { users, settimane, poli, mezzi } = useGiacenze();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Stati per filtri
  const [filters, setFilters] = useState({
    userId: '',
    poloId: '',
    settimanaId: '',
    searchTerm: ''
  });
  
  // Stato per checkbox "tutte le settimane"
  const [showAllWeeks, setShowAllWeeks] = useState(true);

  // Stati per sorting
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: 'asc'
  });

  // Stati per dati
  const [allUtilizzi, setAllUtilizzi] = useState([]);
  const [groupedUtilizzi, setGroupedUtilizzi] = useState([]);
  const [postazioni, setPostazioni] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stati per modal dettagli
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUtilizzi, setModalUtilizzi] = useState([]);
  
  // Stati per editing nel modal
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    quantitaUtilizzata: '',
    note: ''
  });

  // Stati per popup di conferma eliminazione
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [utilizzoToDelete, setUtilizzoToDelete] = useState(null);
  
  // Modal animations
  const mainModalAnimation = useModalAnimation(modalOpen);
  const deleteModalAnimation = useModalAnimation(deleteConfirmOpen);
  const staggeredRows = useStaggerAnimation(modalUtilizzi, modalOpen);

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set default current week for filters when showAllWeeks is false
  useEffect(() => {
    if (settimane.length > 0 && !showAllWeeks && filters.settimanaId === '') {
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        setFilters(prev => ({ ...prev, settimanaId: currentWeek._id }));
      }
    }
  }, [settimane, showAllWeeks]);

  // Handle showAllWeeks toggle
  useEffect(() => {
    if (showAllWeeks) {
      // When showing all weeks, clear the week filter
      setFilters(prev => ({ ...prev, settimanaId: '' }));
    } else {
      // When not showing all weeks, set current week as default
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        setFilters(prev => ({ ...prev, settimanaId: currentWeek._id }));
      }
    }
  }, [showAllWeeks, settimane]);

  // Sort weeks centered on current week for dropdown
  const sortedSettimane = React.useMemo(() => {
    if (!settimane.length) return [];
    return sortWeeksCenteredOnCurrent(settimane);
  }, [settimane]);

  // Carica tutti gli utilizzi
  const loadAllUtilizzi = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.poloId) queryParams.append('poloId', filters.poloId);
      if (filters.settimanaId) queryParams.append('settimanaId', filters.settimanaId);
      
      const data = await apiCall(`/admin/utilizzi?${queryParams}`, {}, token);
      const utilizziArray = Array.isArray(data) ? data : [];
      setAllUtilizzi(utilizziArray);
      
      // Raggruppa gli utilizzi
      groupUtilizzi(utilizziArray);
    } catch (err) {
      setError('Errore nel caricamento utilizzi: ' + err.message);
      setAllUtilizzi([]);
      setGroupedUtilizzi([]);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per gestire il sorting
  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Funzione per ordinare i gruppi
  const sortGroupedUtilizzi = (data) => {
    if (!sortConfig.field) return data;

    return [...data].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.field) {
        case 'operatore':
          aVal = a.userId?.username || '';
          bVal = b.userId?.username || '';
          break;
        case 'codice':
          aVal = a.productId?.codice || '';
          bVal = b.productId?.codice || '';
          break;
        case 'prodotto':
          aVal = a.productId?.nome || '';
          bVal = b.productId?.nome || '';
          break;
        case 'polo':
          aVal = a.utilizzi[0]?.poloId?.nome || '';
          bVal = b.utilizzi[0]?.poloId?.nome || '';
          break;
        case 'settimana':
          aVal = a.settimanaId?.numero || 0;
          bVal = b.settimanaId?.numero || 0;
          if (aVal === bVal) {
            aVal = a.settimanaId?.anno || 0;
            bVal = b.settimanaId?.anno || 0;
          }
          break;
        case 'utilizzi':
          aVal = a.numeroUtilizzi || 0;
          bVal = b.numeroUtilizzi || 0;
          break;
        default:
          return 0;
      }

      // Confronto stringhe o numeri
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Raggruppa utilizzi per prodotto, utente e settimana
  const groupUtilizzi = (utilizzi) => {
    const grouped = {};

    utilizzi.forEach(utilizzo => {
      const key = `${utilizzo.userId?._id}-${utilizzo.productId?._id}-${utilizzo.settimanaId?._id}`;

      if (!grouped[key]) {
        grouped[key] = {
          key,
          userId: utilizzo.userId,
          productId: utilizzo.productId,
          settimanaId: utilizzo.settimanaId,
          utilizzi: [],
          totalQuantita: 0,
          numeroUtilizzi: 0,
          dataUltimoUtilizzo: utilizzo.dataUtilizzo,
          dataPrimoUtilizzo: utilizzo.dataUtilizzo
        };
      }

      grouped[key].utilizzi.push(utilizzo);
      grouped[key].totalQuantita += utilizzo.quantitaUtilizzata;
      grouped[key].numeroUtilizzi += 1;

      // Aggiorna date primo e ultimo utilizzo
      if (new Date(utilizzo.dataUtilizzo) > new Date(grouped[key].dataUltimoUtilizzo)) {
        grouped[key].dataUltimoUtilizzo = utilizzo.dataUtilizzo;
      }
      if (new Date(utilizzo.dataUtilizzo) < new Date(grouped[key].dataPrimoUtilizzo)) {
        grouped[key].dataPrimoUtilizzo = utilizzo.dataUtilizzo;
      }
    });

    // Converte in array e applica filtri di ricerca
    let groupedArray = Object.values(grouped);

    if (filters.searchTerm) {
      groupedArray = groupedArray.filter(group =>
        group.productId?.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        group.productId?.codice?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        group.userId?.username.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Ordina per sorting custom o per data ultimo utilizzo (più recenti prima)
    if (sortConfig.field) {
      groupedArray = sortGroupedUtilizzi(groupedArray);
    } else {
      groupedArray.sort((a, b) => new Date(b.dataUltimoUtilizzo) - new Date(a.dataUltimoUtilizzo));
    }

    setGroupedUtilizzi(groupedArray);
  };

  // Carica postazioni
  const loadPostazioni = async () => {
    try {
      const data = await apiCall('/postazioni', {}, token);
      setPostazioni(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Errore caricamento postazioni:', error);
      setPostazioni([]);
    }
  };

  // Carica dati iniziali
  useEffect(() => {
    loadPostazioni();
  }, [token]);

  // Carica dati quando cambiano i filtri
  useEffect(() => {
    loadAllUtilizzi();
  }, [filters.userId, filters.poloId, filters.settimanaId]);

  // Riapplica raggruppamento quando cambia il termine di ricerca o il sorting
  useEffect(() => {
    if (allUtilizzi.length > 0) {
      groupUtilizzi(allUtilizzi);
    }
  }, [filters.searchTerm, sortConfig]);

  // Carica dati iniziali
  useEffect(() => {
    loadAllUtilizzi();
  }, []);

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Apri modal dettagli
  const openModal = (group) => {
    setSelectedGroup(group);
    setModalUtilizzi(group.utilizzi.sort((a, b) => new Date(b.dataUtilizzo) - new Date(a.dataUtilizzo)));
    setModalOpen(true);
  };

  // Chiudi modal
  const closeModal = () => {
    mainModalAnimation.closeModal(() => {
      setModalOpen(false);
      setSelectedGroup(null);
      setModalUtilizzi([]);
      setEditingId(null);
      setEditForm({ quantitaUtilizzata: '', note: '' });
    });
  };

  // Funzioni editing nel modal
  const startEdit = (utilizzo) => {
    setEditingId(utilizzo._id);
    setEditForm({
      quantitaUtilizzata: utilizzo.quantitaUtilizzata,
      note: utilizzo.note || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ quantitaUtilizzata: '', note: '' });
  };

  const saveEdit = async (utilizzoId) => {
    try {
      setError('');
      
      const updatedData = {
        quantitaUtilizzata: parseInt(editForm.quantitaUtilizzata),
        note: editForm.note
      };

      await apiCall(`/admin/utilizzi/${utilizzoId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      }, token);

      // Aggiorna immediatamente gli utilizzi nel modal
      const updatedModalUtilizzi = modalUtilizzi.map(utilizzo => {
        if (utilizzo._id === utilizzoId) {
          return {
            ...utilizzo,
            quantitaUtilizzata: parseInt(editForm.quantitaUtilizzata),
            note: editForm.note
          };
        }
        return utilizzo;
      });
      
      setModalUtilizzi(updatedModalUtilizzi);
      
      // Aggiorna anche il selectedGroup per coerenza
      if (selectedGroup) {
        const updatedUtilizzi = selectedGroup.utilizzi.map(utilizzo => {
          if (utilizzo._id === utilizzoId) {
            return {
              ...utilizzo,
              quantitaUtilizzata: parseInt(editForm.quantitaUtilizzata),
              note: editForm.note
            };
          }
          return utilizzo;
        });
        
        // Ricalcola il totale
        const newTotal = updatedUtilizzi.reduce((sum, u) => sum + (u.quantitaUtilizzata || 0), 0);
        
        setSelectedGroup({
          ...selectedGroup,
          utilizzi: updatedUtilizzi,
          totalQuantita: newTotal
        });
      }

      // Ricarica dati in background per mantenere sincronizzazione
      loadAllUtilizzi();
      
      cancelEdit();
      setError('Utilizzo aggiornato con successo');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  // Apri popup di conferma eliminazione
  const openDeleteConfirm = (utilizzo) => {
    setUtilizzoToDelete(utilizzo);
    setDeleteConfirmOpen(true);
  };

  // Chiudi popup di conferma eliminazione
  const closeDeleteConfirm = () => {
    deleteModalAnimation.closeModal(() => {
      setDeleteConfirmOpen(false);
      setUtilizzoToDelete(null);
    });
  };

  // Conferma eliminazione utilizzo
  const confirmDeleteUtilizzo = async () => {
    if (!utilizzoToDelete) return;

    try {
      setError('');
      
      await apiCall(`/admin/utilizzi/${utilizzoToDelete._id}`, {
        method: 'DELETE'
      }, token);

      // Aggiorna immediatamente gli utilizzi nel modal
      const updatedModalUtilizzi = modalUtilizzi.filter(utilizzo => utilizzo._id !== utilizzoToDelete._id);
      
      if (updatedModalUtilizzi.length === 0) {
        // Se non ci sono più utilizzi, chiudi il modal
        closeModal();
      } else {
        // Aggiorna il modal con gli utilizzi rimanenti
        setModalUtilizzi(updatedModalUtilizzi);
        
        // Aggiorna anche il selectedGroup per coerenza
        if (selectedGroup) {
          const updatedUtilizzi = selectedGroup.utilizzi.filter(utilizzo => utilizzo._id !== utilizzoToDelete._id);
          
          // Ricalcola il totale
          const newTotal = updatedUtilizzi.reduce((sum, u) => sum + (u.quantitaUtilizzata || 0), 0);
          const newCount = updatedUtilizzi.length;
          
          setSelectedGroup({
            ...selectedGroup,
            utilizzi: updatedUtilizzi,
            totalQuantita: newTotal,
            numeroUtilizzi: newCount
          });
        }
      }

      // Ricarica dati in background per mantenere sincronizzazione
      loadAllUtilizzi();
      
      // Chiudi popup di conferma
      closeDeleteConfirm();
      
      setError('Utilizzo eliminato con successo');
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
      closeDeleteConfirm();
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
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="glass-icon p-3 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Gestione Utilizzi - Vista Raggruppata</h2>
              <p className="text-white/70">
                Visualizza utilizzi aggregati per prodotto e settimana. Clicca su una riga per vedere i dettagli.
              </p>
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtri di Ricerca
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Filtro Operatore */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Operatore
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                value={filters.userId}
                onChange={(e) => updateFilters({ userId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti gli operatori</option>
                {users.filter(u => u.role === 'user').map(user => (
                  <option key={user._id} value={user._id} className="bg-gray-800">
                    {user.username} - {user.email}
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
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
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

            {/* Filtro Settimana */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Settimana
              </label>
              
              {/* Dropdown settimane */}
              <select
                className={`glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white ${showAllWeeks ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={showAllWeeks ? 'all' : filters.settimanaId}
                onChange={(e) => updateFilters({ settimanaId: e.target.value })}
                disabled={showAllWeeks}
              >
                {showAllWeeks ? (
                  <option value="all" className="bg-gray-800">
                    🌍 Tutte le settimane selezionate
                  </option>
                ) : (
                  sortedSettimane.map((settimana) => {
                    const currentWeek = getCurrentWeekFromList(settimane);
                    const isCurrentWeek = currentWeek && settimana._id === currentWeek._id;
                    return (
                      <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                        {isCurrentWeek ? '📅 ' : ''}{formatWeek(settimana)}{isCurrentWeek ? ' (Settimana corrente)' : ''}
                      </option>
                    );
                  })
                )}
              </select>

              {/* Checkbox "Tutte le settimane" */}
              <div className="mt-3">
                <label className="glass-checkbox-container flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllWeeks}
                    onChange={(e) => setShowAllWeeks(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`glass-checkbox w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                    showAllWeeks 
                      ? 'border-blue-400 bg-blue-400/20' 
                      : 'border-white/30 bg-transparent'
                  }`}>
                    {showAllWeeks && (
                      <svg className="w-3 h-3 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="ml-2 text-sm text-white/80">🌍 Tutte le settimane</span>
                </label>
              </div>
            </div>

            {/* Ricerca per Nome */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Cerca Prodotto/Utente
              </label>
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Nome prodotto o utente..."
                    className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Info Filtri Attivi */}
          <div className="flex items-center space-x-4 text-sm text-white/70">
            <span>Filtri attivi:</span>
            {filters.userId && (
              <span className="glass-badge px-3 py-1 rounded-full text-blue-200 border border-blue-300/20">
                Operatore: {users.find(u => u._id === filters.userId)?.username}
              </span>
            )}
            {filters.poloId && (
              <span className="glass-badge px-3 py-1 rounded-full text-orange-200 border border-orange-300/20">
                Polo: {poli.find(p => p._id === filters.poloId)?.nome}
              </span>
            )}
            {filters.settimanaId && (
              <span className="glass-badge px-3 py-1 rounded-full text-green-200 border border-green-300/20">
                Settimana: {formatWeek(settimane.find(s => s._id === filters.settimanaId))}
              </span>
            )}
            {filters.searchTerm && (
              <span className="glass-badge px-3 py-1 rounded-full text-yellow-200 border border-yellow-300/20">
                Ricerca: "{filters.searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Tabella Utilizzi Raggruppati */}
        <div className="glass-card-large rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Utilizzi Raggruppati
              {!loading && (
                <span className="ml-2 text-sm text-white/50">
                  ({groupedUtilizzi.length} gruppi)
                </span>
              )}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              // Skeleton loading animation
              <div className="space-y-2">
                {/* Header skeleton */}
                <div className="glass-table-header-row flex">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-1 px-6 py-3">
                      <div className="animate-pulse bg-white/20 h-4 rounded"></div>
                    </div>
                  ))}
                </div>
                
                {/* Row skeletons */}
                {[...Array(6)].map((_, rowIndex) => (
                  <div key={rowIndex} className="glass-table-row flex border-t border-white/5">
                    {[...Array(5)].map((_, colIndex) => (
                      <div key={colIndex} className="flex-1 px-6 py-4">
                        <div className="animate-pulse bg-white/10 h-4 rounded" 
                             style={{ animationDelay: `${(rowIndex * 5 + colIndex) * 100}ms` }}>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="glass-table-header">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('operatore')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Operatore</span>
                        {sortConfig.field === 'operatore' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('codice')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Codice</span>
                        {sortConfig.field === 'codice' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('prodotto')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Prodotto</span>
                        {sortConfig.field === 'prodotto' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('polo')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Polo</span>
                        {sortConfig.field === 'polo' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('settimana')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Settimana</span>
                        {sortConfig.field === 'settimana' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('utilizzi')}
                    >
                      <div className="flex items-center gap-2">
                        <span>N° Utilizzi</span>
                        {sortConfig.field === 'utilizzi' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {groupedUtilizzi.map(group => {
                    return (
                      <tr 
                        key={group.key} 
                        className="glass-table-row hover:bg-white/5 transition-all duration-300 cursor-pointer"
                        onClick={() => openModal(group)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="glass-avatar w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {group.userId?.username}
                              </div>
                              <div className="text-sm text-white/50">
                                {group.userId?.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/70">
                            {group.productId?.codice || '-'}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-2 text-blue-300" />
                            <div>
                              <div className="text-sm font-medium text-white">
                                {group.productId?.nome}
                              </div>
                              <div className="text-sm text-white/50">
                                {group.productId?.categoria}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-orange-300" />
                            <div className="text-sm font-medium text-white">
                              {group.utilizzi[0]?.poloId?.nome || 'N/A'}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-green-300" />
                            <div className="text-sm font-medium text-white">
                              {group.settimanaId ? formatWeek(group.settimanaId) : 'N/A'}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="glass-count-badge px-2 py-1 rounded-full">
                              <span className="text-sm font-medium text-white">
                                {group.numeroUtilizzi}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(group);
                              }}
                              className="glass-button p-2 rounded-xl text-blue-300 hover:text-blue-200 hover:scale-105 transition-all duration-300"
                              title="Visualizza dettagli"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
                )}

                {groupedUtilizzi.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-white/50" />
                    </div>
                    <p className="text-white/70 text-lg mb-2">Nessun utilizzo trovato</p>
                    <p className="text-sm text-white/50">
                      {filters.userId || filters.settimanaId || filters.searchTerm
                        ? 'Prova a modificare i filtri per vedere più risultati'
                        : 'Gli utilizzi appariranno qui quando gli operatori useranno i prodotti'
                      }
                    </p>
                  </div>
                )}
              )}
            </div>
        </div>

      </div>

      {/* Modal Dettagli Utilizzi */}
      {modalOpen && selectedGroup && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${mainModalAnimation.backdropClass}`}>
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className={`relative glass-modal w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl ${mainModalAnimation.modalClass}`}>
            {/* Header Modal */}
            <div className="glass-modal-header px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="glass-icon p-2 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Dettagli Utilizzi - {selectedGroup.productId?.nome}
                    </h3>
                    <p className="text-white/70">
                      {selectedGroup.userId?.username} • {selectedGroup.settimanaId ? formatWeek(selectedGroup.settimanaId) : 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Lista Dettagliata */}
            <div className="glass-modal-content p-6 overflow-y-auto max-h-96">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Utilizzi Dettagliati ({modalUtilizzi.length})
              </h4>
              
              <div className="space-y-3">
                {modalUtilizzi.map((utilizzo, index) => {
                  const isEditing = editingId === utilizzo._id;
                  const dateTime = formatDateTime(utilizzo.dataUtilizzo);
                  
                  // Trova la postazione dall'ID utilizzando i dati delle postazioni caricate
                  const postazione = postazioni?.find(p => p._id === utilizzo.postazioneId);
                  const polo = poli?.find(p => p._id === utilizzo.poloId);
                  
                  // Debug: verifica dati postazione
                  console.log('🔍 Dati utilizzo:', {
                    utilizzoId: utilizzo._id,
                    postazioneId: utilizzo.postazioneId,
                    postazioneTrovata: postazione,
                    poloId: utilizzo.poloId,
                    poloTrovato: polo
                  });
                  
                  return (
                    <div key={utilizzo._id} className={`glass-utilizzo-item p-4 rounded-xl ${staggeredRows[index]?.class || ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {/* Data/Ora */}
                          <div>
                            <div className="text-xs text-white/60 mb-1 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Data/Ora
                            </div>
                            <div className="text-sm text-white">{dateTime.date}</div>
                            <div className="text-xs text-white/50">{dateTime.time}</div>
                          </div>
                          
                          {/* Polo */}
                          <div>
                            <div className="text-xs text-white/60 mb-1 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              Polo
                            </div>
                            <div className="text-sm text-white">
                              {utilizzo.poloId?.nome || 'N/A'}
                            </div>
                          </div>

                          {/* Postazione */}
                          <div>
                            <div className="text-xs text-white/60 mb-1 flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              Postazione
                            </div>
                            <div className="text-sm text-white">
                              {postazione?.nome || 'N/A'}
                            </div>
                          </div>

                          {/* Settimana */}
                          <div>
                            <div className="text-xs text-white/60 mb-1 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Settimana
                            </div>
                            <div className="text-sm text-white">
                              {utilizzo.settimanaId ? formatWeek(utilizzo.settimanaId) : 'N/A'}
                            </div>
                          </div>
                          
                          {/* Quantità */}
                          <div>
                            <div className="text-xs text-white/60 mb-1">Quantità</div>
                            {isEditing ? (
                              <input
                                type="number"
                                min="1"
                                className="glass-input w-20 px-2 py-1 rounded-lg text-sm bg-transparent border border-white/20 outline-none text-white"
                                value={editForm.quantitaUtilizzata}
                                onChange={(e) => setEditForm({ ...editForm, quantitaUtilizzata: e.target.value })}
                              />
                            ) : (
                              <div className="text-sm font-medium text-red-300">
                                -{utilizzo.quantitaUtilizzata} {utilizzo.productId?.unita}
                              </div>
                            )}
                          </div>
                          
                          {/* Note */}
                          <div>
                            <div className="text-xs text-white/60 mb-1">Note</div>
                            {isEditing ? (
                              <input
                                type="text"
                                placeholder="Note opzionali..."
                                className="glass-input w-full px-2 py-1 rounded-lg text-sm bg-transparent border border-white/20 outline-none text-white placeholder-white/50"
                                value={editForm.note}
                                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                              />
                            ) : (
                              <div className="text-sm text-white/70">
                                {utilizzo.note || '-'}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Azioni */}
                        <div className="flex items-center space-x-2 ml-4">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(utilizzo._id)}
                                className="glass-button p-2 rounded-xl text-green-300 hover:text-green-200 hover:scale-105 transition-all duration-300"
                                title="Salva modifiche"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
                                title="Annulla modifiche"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(utilizzo)}
                                className="glass-button p-2 rounded-xl text-blue-300 hover:text-blue-200 hover:scale-105 transition-all duration-300"
                                title="Modifica utilizzo"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(utilizzo)}
                                className="glass-button p-2 rounded-xl text-red-300 hover:text-red-200 hover:scale-105 transition-all duration-300"
                                title="Elimina utilizzo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="glass-modal-footer px-6 py-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/70">
                  💡 Modifica i singoli utilizzi o eliminali per ripristinare le quantità
                </div>
                <button
                  onClick={closeModal}
                  className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Conferma Eliminazione Utilizzo */}
      {deleteConfirmOpen && utilizzoToDelete && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${deleteModalAnimation.backdropClass}`}>
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteConfirm}
          ></div>
          
          {/* Popup Content */}
          <div className={`relative glass-modal w-full max-w-md rounded-2xl overflow-hidden ${deleteModalAnimation.modalClass}`}>
            {/* Header */}
            <div className="glass-modal-header px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="glass-icon p-2 rounded-xl bg-red-500/20 border border-red-400/30">
                  <AlertCircle className="w-6 h-6 text-red-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Conferma Eliminazione
                  </h3>
                  <p className="text-sm text-white/70">
                    Questa azione non può essere annullata
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="glass-modal-content px-6 py-6">
              <div className="space-y-4">
                <p className="text-white/90">
                  Sei sicuro di voler eliminare questo utilizzo?
                </p>
                
                {/* Dettagli utilizzo da eliminare */}
                <div className="glass-utilizzo-summary p-4 rounded-xl border border-red-400/20 bg-red-500/10">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-white/60 mb-1">Prodotto</div>
                      <div className="text-white font-medium">
                        {utilizzoToDelete.productId?.nome}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 mb-1">Quantità</div>
                      <div className="text-red-300 font-bold">
                        -{utilizzoToDelete.quantitaUtilizzata} {utilizzoToDelete.productId?.unita}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 mb-1">Data</div>
                      <div className="text-white">
                        {new Date(utilizzoToDelete.dataUtilizzo).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 mb-1">Ora</div>
                      <div className="text-white">
                        {new Date(utilizzoToDelete.dataUtilizzo).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {utilizzoToDelete.note && (
                      <div className="col-span-2">
                        <div className="text-white/60 mb-1">Note</div>
                        <div className="text-white/80 italic">
                          "{utilizzoToDelete.note}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-warning-box p-3 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-300 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-200">
                      <strong>Attenzione:</strong> Eliminando questo utilizzo, la quantità del prodotto verrà automaticamente ripristinata nella giacenza dell'operatore.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="glass-modal-footer px-6 py-4 border-t border-white/10">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDeleteUtilizzo}
                  className="glass-button-danger px-4 py-2 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Elimina Utilizzo</span>
                </button>
              </div>
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

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-button-secondary {
          background: rgba(107, 114, 128, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 114, 128, 0.4);
          color: white;
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
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .glass-badge {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .glass-quantity-badge {
          background: rgba(239, 68, 68, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .glass-count-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-table-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-table-row {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
        }

        .glass-modal {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .glass-modal-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-modal-summary {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
        }

        .glass-modal-content {
          background: rgba(255, 255, 255, 0.02);
        }

        .glass-modal-footer {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-summary-item {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-utilizzo-item {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .glass-utilizzo-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .glass-button-danger {
          background: rgba(239, 68, 68, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: white;
        }

        .glass-button-danger:hover {
          background: rgba(239, 68, 68, 0.4);
          border-color: rgba(239, 68, 68, 0.6);
        }

        .glass-utilizzo-summary {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-warning-box {
          background: rgba(255, 255, 255, 0.05);
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

        /* Scroll personalizzato per il modal */
        .glass-modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .glass-modal-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .glass-modal-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .glass-modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .glass-modal {
            margin: 1rem;
            max-width: calc(100vw - 2rem);
          }
          
          .glass-modal-content {
            max-height: 60vh;
          }
          
          .glass-utilizzo-item .grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .glass-utilizzo-item .flex {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default UtilizziManagement;