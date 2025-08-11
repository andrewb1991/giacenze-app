// components/admin/GiacenzeManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Users, ChevronRight, Package2, UserPlus, AlertCircle, Filter, Search, User, Calendar, Package, BarChart3, Edit, X, Save, Trash2, Check } from 'lucide-react';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { calculatePercentage, formatDate } from '../../utils/formatters';
import UserGiacenzeView from './UserGiacenzeView';

const GiacenzeManagement = () => {
  const { users, allProducts, allGiacenze, assegnazioni, assignGiacenza, updateGiacenza, deleteGiacenza } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { selectedUser, giacenzeForm, adminView, selectedUserForGiacenze } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Stati per edit modal
  const [editingGiacenza, setEditingGiacenza] = useState(null);
  const [editForm, setEditForm] = useState({
    quantitaAssegnata: '',
    quantitaDisponibile: '',
    quantitaMinima: '',
    note: ''
  });

  // Stati per delete confirmation
  const [deletingGiacenza, setDeletingGiacenza] = useState(null);

  // Stati per toast notifications
  const [toast, setToast] = useState(null);

  // Stati per filtri
  const [filters, setFilters] = useState({
    userId: '',
    productId: '',
    stato: '', // 'critico', 'ok', ''
    searchTerm: ''
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

  // Funzione per applicare i filtri
  const applyFilters = (giacenze, currentFilters) => {
    let filtered = [...giacenze];

    // Filtro per utente
    if (currentFilters.userId) {
      filtered = filtered.filter(g => g.userId?._id === currentFilters.userId);
    }

    // Filtro per prodotto
    if (currentFilters.productId) {
      filtered = filtered.filter(g => g.productId?._id === currentFilters.productId);
    }

    // Filtro per stato
    if (currentFilters.stato === 'critico') {
      filtered = filtered.filter(g => g.quantitaDisponibile <= g.quantitaMinima);
    } else if (currentFilters.stato === 'ok') {
      filtered = filtered.filter(g => g.quantitaDisponibile > g.quantitaMinima);
    }

    // Filtro ricerca libera
    if (currentFilters.searchTerm) {
      const term = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        (g.userId?.username && g.userId.username.toLowerCase().includes(term)) ||
        (g.userId?.email && g.userId.email.toLowerCase().includes(term)) ||
        (g.productId?.nome && g.productId.nome.toLowerCase().includes(term)) ||
        (g.productId?.categoria && g.productId.categoria.toLowerCase().includes(term)) ||
        (g.assegnatoDa?.username && g.assegnatoDa.username.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  // Applica filtri alle giacenze
  useEffect(() => {
    const filtered = applyFilters(allGiacenze, filters);
    setFilteredGiacenze(filtered);
  }, [allGiacenze, filters]);

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

  const handleAssignGiacenza = async () => {
    try {
      await assignGiacenza(selectedUser, giacenzeForm);
      showToast('Giacenza assegnata con successo!', 'success');
      // Riapplica i filtri dopo l'assegnazione
      setTimeout(() => {
        const filtered = applyFilters(allGiacenze, filters);
        setFilteredGiacenze(filtered);
      }, 100);
    } catch (error) {
      showToast('Errore nell\'assegnazione della giacenza', 'error');
    }
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
      searchTerm: ''
    });
  };

  // Toast functions
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Funzioni per edit modal
  const openEditModal = (giacenza) => {
    setEditingGiacenza(giacenza);
    setEditForm({
      quantitaAssegnata: giacenza.quantitaAssegnata.toString(),
      quantitaDisponibile: giacenza.quantitaDisponibile.toString(),
      quantitaMinima: giacenza.quantitaMinima.toString(),
      note: giacenza.note || ''
    });
  };

  const closeEditModal = () => {
    setEditingGiacenza(null);
    setEditForm({
      quantitaAssegnata: '',
      quantitaDisponibile: '',
      quantitaMinima: '',
      note: ''
    });
  };

  const handleUpdateGiacenza = async () => {
    if (!editingGiacenza) return;

    const success = await updateGiacenza(editingGiacenza._id, editForm);
    if (success) {
      closeEditModal();
      showToast('Giacenza aggiornata con successo!', 'success');
      // I dati verranno aggiornati automaticamente dal useEffect che monitora allGiacenze
    } else {
      showToast('Errore nell\'aggiornamento della giacenza', 'error');
    }
  };

  // Funzioni per delete
  const openDeleteModal = (giacenza) => {
    setDeletingGiacenza(giacenza);
  };

  const closeDeleteModal = () => {
    setDeletingGiacenza(null);
  };

  const handleDeleteGiacenza = async () => {
    if (!deletingGiacenza) return;

    const success = await deleteGiacenza(deletingGiacenza._id);
    if (success) {
      closeDeleteModal();
      showToast('Giacenza eliminata con successo!', 'success');
      // Riapplica i filtri dopo l'eliminazione
      setTimeout(() => {
        const filtered = applyFilters(allGiacenze, filters);
        setFilteredGiacenze(filtered);
      }, 100);
    } else {
      showToast('Errore nell\'eliminazione della giacenza', 'error');
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

      <div className="relative z-10 space-y-6">
        {/* Conditional rendering based on adminView */}
        {adminView === 'user-giacenze' ? (
          <UserGiacenzeView />
        ) : (
          <>
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
                  <th className="px-8 py-4 text-center text-xs font-medium text-white/80 uppercase tracking-wider">
                    Azioni
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
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(giacenza)}
                            className="glass-icon-button p-2 rounded-xl hover:scale-105 transition-all duration-300"
                            title="Modifica giacenza"
                          >
                            <Edit className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(giacenza)}
                            className="glass-icon-button-danger p-2 rounded-xl hover:scale-105 transition-all duration-300"
                            title="Elimina giacenza"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
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

      {/* Edit Modal */}
      {editingGiacenza && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          
          {/* Modal */}
          <div className="relative glass-management-card p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="glass-icon p-3 rounded-2xl mr-4">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Modifica Giacenza</h2>
                  <p className="text-white/60">
                    {editingGiacenza.userId?.username} - {editingGiacenza.productId?.nome}
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="glass-icon-button p-2 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Quantità Assegnata */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Quantità Assegnata *
                </label>
                <div className="glass-input-container">
                  <input
                    type="number"
                    min="0"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={editForm.quantitaAssegnata}
                    onChange={(e) => setEditForm(prev => ({ ...prev, quantitaAssegnata: e.target.value }))}
                    placeholder="es. 100"
                  />
                </div>
              </div>

              {/* Quantità Disponibile */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Quantità Disponibile *
                </label>
                <div className="glass-input-container">
                  <input
                    type="number"
                    min="0"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={editForm.quantitaDisponibile}
                    onChange={(e) => setEditForm(prev => ({ ...prev, quantitaDisponibile: e.target.value }))}
                    placeholder="es. 80"
                  />
                </div>
                <p className="text-xs text-white/50 mt-1">
                  Valore originale: {editingGiacenza.quantitaDisponibile} {editingGiacenza.productId?.unita}
                </p>
              </div>

              {/* Soglia Minima */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Soglia Minima
                </label>
                <div className="glass-input-container">
                  <input
                    type="number"
                    min="0"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={editForm.quantitaMinima}
                    onChange={(e) => setEditForm(prev => ({ ...prev, quantitaMinima: e.target.value }))}
                    placeholder="es. 20"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Note
                </label>
                <div className="glass-input-container">
                  <textarea
                    rows={3}
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50 resize-none"
                    value={editForm.note}
                    onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Note opzionali"
                  />
                </div>
              </div>

              {/* Info giacenza */}
              <div className="glass-stat-mini p-4 rounded-xl">
                <h4 className="text-sm font-medium text-white/80 mb-3">Informazioni Giacenza</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Utente:</span>
                    <div className="text-white font-medium">{editingGiacenza.userId?.username}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Prodotto:</span>
                    <div className="text-white font-medium">{editingGiacenza.productId?.nome}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Categoria:</span>
                    <div className="text-white font-medium">{editingGiacenza.productId?.categoria}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Data Assegnazione:</span>
                    <div className="text-white font-medium">{formatDate(editingGiacenza.dataAssegnazione)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4 mt-8">
              <button
                onClick={closeEditModal}
                className="glass-button-secondary px-6 py-3 rounded-2xl text-white hover:scale-105 transition-all duration-300"
              >
                Annulla
              </button>
              <button
                onClick={handleUpdateGiacenza}
                disabled={!editForm.quantitaAssegnata || !editForm.quantitaDisponibile}
                className="glass-button-primary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Save className="w-4 h-4" />
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGiacenza && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDeleteModal}
          />
          
          {/* Modal */}
          <div className="relative glass-management-card p-8 rounded-3xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="glass-icon-danger p-3 rounded-2xl mr-4">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Conferma Eliminazione</h2>
                </div>
              </div>
              <button
                onClick={closeDeleteModal}
                className="glass-icon-button p-2 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-white/80 mb-4">
                Sei sicuro di voler eliminare questa giacenza?
              </p>
              <div className="glass-stat-mini p-4 rounded-xl">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Utente:</span>
                    <span className="text-white font-medium ml-2">{deletingGiacenza.userId?.username}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Prodotto:</span>
                    <span className="text-white font-medium ml-2">{deletingGiacenza.productId?.nome}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Quantità:</span>
                    <span className="text-white font-medium ml-2">{deletingGiacenza.quantitaDisponibile} {deletingGiacenza.productId?.unita}</span>
                  </div>
                </div>
              </div>
              <p className="text-red-300 text-sm mt-4">
                ⚠️ Questa azione non può essere annullata.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={closeDeleteModal}
                className="glass-button-secondary px-6 py-3 rounded-2xl text-white hover:scale-105 transition-all duration-300"
              >
                Annulla
              </button>
              <button
                onClick={handleDeleteGiacenza}
                className="glass-button-danger flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" />
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`glass-toast p-4 rounded-2xl min-w-80 ${
            toast.type === 'success' ? 'glass-toast-success' : 'glass-toast-error'
          } animate-toast-in`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                toast.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {toast.type === 'success' ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      )}
          </>
        )}
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

        .glass-icon-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-icon-button:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .glass-icon-button-danger {
          background: rgba(239, 68, 68, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .glass-icon-button-danger:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .glass-icon-danger {
          background: rgba(239, 68, 68, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .glass-button-danger {
          background: rgba(239, 68, 68, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.4);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
          color: white;
        }

        .glass-button-danger:hover {
          background: rgba(239, 68, 68, 0.4);
          box-shadow: 0 12px 32px rgba(239, 68, 68, 0.3);
        }

        .glass-toast {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .glass-toast-success {
          border-left: 4px solid #22c55e;
        }

        .glass-toast-error {
          border-left: 4px solid #ef4444;
        }

        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .animate-toast-in {
          animation: toast-in 0.3s ease-out;
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