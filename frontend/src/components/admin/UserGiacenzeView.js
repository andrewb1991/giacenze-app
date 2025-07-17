
// components/admin/UserGiacenzeView.js
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Truck, Plus, User, Package, ArrowLeft, CheckCircle, AlertCircle, Eye, Filter, Search, BarChart3 } from 'lucide-react';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { formatWeek } from '../../utils/formatters';

const UserGiacenzeView = () => {
  const { users, allProducts, allGiacenze, assegnazioni, assignGiacenza } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { selectedUserForGiacenze, giacenzeForm } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  // Stati per giacenze filtrate
  const [filteredUserGiacenze, setFilteredUserGiacenze] = useState([]);

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
  const userGiacenze = allGiacenze.filter(g => g.userId?._id === selectedUserForGiacenze);

  // Applica filtri alle giacenze utente
  useEffect(() => {
    let filtered = [...userGiacenze];

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
        g.productId?.nome.toLowerCase().includes(term) ||
        g.productId?.categoria.toLowerCase().includes(term) ||
        g.productId?.unita.toLowerCase().includes(term)
      );
    }

    // Filtro per quantità assegnata
    if (filters.quantitaAssegnataMin) {
      filtered = filtered.filter(g => g.quantitaAssegnata >= parseInt(filters.quantitaAssegnataMin));
    }
    if (filters.quantitaAssegnataMax) {
      filtered = filtered.filter(g => g.quantitaAssegnata <= parseInt(filters.quantitaAssegnataMax));
    }

    // Filtro per quantità disponibile
    if (filters.quantitaDisponibileMin) {
      filtered = filtered.filter(g => g.quantitaDisponibile >= parseInt(filters.quantitaDisponibileMin));
    }
    if (filters.quantitaDisponibileMax) {
      filtered = filtered.filter(g => g.quantitaDisponibile <= parseInt(filters.quantitaDisponibileMax));
    }

    // Filtro per soglia minima
    if (filters.sogliaMinimaMin) {
      filtered = filtered.filter(g => g.quantitaMinima >= parseInt(filters.sogliaMinimaMin));
    }
    if (filters.sogliaMinimaMax) {
      filtered = filtered.filter(g => g.quantitaMinima <= parseInt(filters.sogliaMinimaMax));
    }

    setFilteredUserGiacenze(filtered);
  }, [userGiacenze, filters]);

  // Inizializza filteredUserGiacenze
  useEffect(() => {
    setFilteredUserGiacenze(userGiacenze);
  }, [userGiacenze]);

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
    assignGiacenza(selectedUserForGiacenze, giacenzeForm);
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
                  
                  let newAvailable, newAssigned, operation;
                  
                  if (isAdd) {
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
              </h3>
              <div className="text-white/70">
                {filteredUserGiacenze.length} di {userGiacenze.length} giacenze
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
                {filteredUserGiacenze.map(giacenza => {
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
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUserGiacenze.length === 0 && (
              <div className="glass-empty-state text-center py-16">
                <div className="glass-icon w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-white/70 text-lg mb-2">
                  {userGiacenze.length === 0 
                    ? 'Nessuna giacenza assegnata a questo utente' 
                    : 'Nessuna giacenza trovata con i filtri selezionati'
                  }
                </p>
                <p className="text-white/50 text-sm">
                  {userGiacenze.length === 0 
                    ? 'Usa il form sopra per assegnare prodotti a questo operatore'
                    : 'Prova a modificare i filtri per vedere più risultati'
                  }
                </p>
                {Object.values(filters).some(filter => filter !== '') && userGiacenze.length > 0 && (
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