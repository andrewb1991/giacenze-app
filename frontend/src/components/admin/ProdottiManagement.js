// components/admin/ProdottiManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, Search, Filter, Tag, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const ProdottiManagement = () => {
  const { token, setError } = useAuth();
  
  // Stati per dati
  const [prodotti, setProdotti] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stati per filtri
  const [filters, setFilters] = useState({
    categoria: '',
    searchTerm: '',
    attivo: 'all'
  });
  
  // Stati per form nuovo prodotto
  const [showAddForm, setShowAddForm] = useState(false);
  const [isClosingForm, setIsClosingForm] = useState(false);
  const [addForm, setAddForm] = useState({
    nome: '',
    descrizione: '',
    categoria: '',
    unita: 'pz',
    attivo: true
  });
  
  // Stati per editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    descrizione: '',
    categoria: '',
    unita: 'pz',
    attivo: true
  });
  
  // Stati per ordinamento
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Unità di misura disponibili
  const unitaMisura = [
    { value: 'pz', label: 'Pezzi' },
    { value: 'kg', label: 'Chilogrammi' },
    { value: 'lt', label: 'Litri' },
    { value: 'mt', label: 'Metri' },
    { value: 'mq', label: 'Metri quadrati' },
    { value: 'paia', label: 'Paia' },
    { value: 'flaconi', label: 'Flaconi' },
    { value: 'scatole', label: 'Scatole' },
    { value: 'rotoli', label: 'Rotoli' },
    { value: 'sacchi', label: 'Sacchi' }
  ];

  // Carica prodotti
  const loadProdotti = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiCall('/admin/products', {}, token);
      setProdotti(data || []);
    } catch (err) {
      setError('Errore nel caricamento prodotti: ' + err.message);
      setProdotti([]);
    } finally {
      setLoading(false);
    }
  };

  // Carica dati iniziali
  useEffect(() => {
    loadProdotti();
  }, []);

  // Funzioni per ordinamento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-white/50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-white" />
      : <ChevronDown className="w-4 h-4 text-white" />;
  };

  // Filtra e ordina prodotti
  const filteredProdotti = prodotti.filter(prodotto => {
    const matchCategoria = !filters.categoria || prodotto.categoria === filters.categoria;
    const matchSearch = !filters.searchTerm || 
      prodotto.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      prodotto.descrizione?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchAttivo = filters.attivo === 'all' || 
      (filters.attivo === 'true' && prodotto.attivo) ||
      (filters.attivo === 'false' && !prodotto.attivo);
    
    return matchCategoria && matchSearch && matchAttivo;
  });

  const sortedProdotti = [...filteredProdotti].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Gestione casi speciali
    if (sortField === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === 'attivo') {
      // Ordina per booleano: attivo prima quando asc, disattivo prima quando desc
      aValue = a.attivo ? 1 : 0;
      bValue = b.attivo ? 1 : 0;
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Ottieni categorie uniche
  const categorieUniche = [...new Set(prodotti.map(p => p.categoria).filter(Boolean))];

  // Chiusura animata del form
  const closeAddForm = () => {
    setIsClosingForm(true);
    setTimeout(() => {
      setShowAddForm(false);
      setIsClosingForm(false);
      resetAddFormData();
    }, 300); // durata dell'animazione
  };

  // Reset dati form
  const resetAddFormData = () => {
    setAddForm({
      nome: '',
      descrizione: '',
      categoria: '',
      unita: 'pz',
      attivo: true
    });
  };

  // Reset form nuovo prodotto (mantenuto per compatibilità)
  const resetAddForm = () => {
    closeAddForm();
  };

  // Crea nuovo prodotto
  const handleCreateProdotto = async () => {
    if (!addForm.nome || !addForm.categoria) {
      setError('Nome e categoria sono obbligatori');
      return;
    }

    try {
      setError('');
      
      await apiCall('/admin/products', {
        method: 'POST',
        body: JSON.stringify(addForm)
      }, token);

      await loadProdotti();
      closeAddForm();
      setError('Prodotto creato con successo');
    } catch (err) {
      setError('Errore nella creazione: ' + err.message);
    }
  };

  // Avvia editing
  const startEdit = (prodotto) => {
    setEditingId(prodotto._id);
    setEditForm({
      nome: prodotto.nome,
      descrizione: prodotto.descrizione || '',
      categoria: prodotto.categoria || '',
      unita: prodotto.unita,
      attivo: prodotto.attivo
    });
  };

  // Annulla editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      nome: '',
      descrizione: '',
      categoria: '',
      unita: 'pz',
      attivo: true
    });
  };

  // Salva modifiche
  const saveEdit = async (prodottoId) => {
    try {
      setError('');
      
      await apiCall(`/admin/products/${prodottoId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      }, token);

      await loadProdotti();
      cancelEdit();
      setError('Prodotto aggiornato con successo');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  // Elimina prodotto
  const deleteProdotto = async (prodottoId, nome) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il prodotto "${nome}"? Questa azione eliminerà anche tutte le giacenze associate.`)) {
      return;
    }

    try {
      setError('');
      
      await apiCall(`/admin/products/${prodottoId}`, {
        method: 'DELETE'
      }, token);

      await loadProdotti();
      setError('Prodotto eliminato con successo');
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  // Toggle stato attivo
  const toggleAttivo = async (prodottoId, currentStatus) => {
    try {
      setError('');
      
      await apiCall(`/admin/products/${prodottoId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ attivo: !currentStatus })
      }, token);

      await loadProdotti();
      setError(`Prodotto ${!currentStatus ? 'attivato' : 'disattivato'} con successo`);
    } catch (err) {
      setError('Errore nel cambio stato: ' + err.message);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-products-card p-8 rounded-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="glass-icon p-4 rounded-2xl mr-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Gestione Prodotti</h2>
                <p className="text-white/70">
                  Crea, modifica ed elimina prodotti del catalogo. Gestisci categorie e unità di misura.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="glass-button-primary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nuovo Prodotto</span>
            </button>
          </div>
        </div>

        {/* Form Nuovo Prodotto */}
        {showAddForm && (
          <div className={`glass-products-card p-8 rounded-3xl border-l-4 border-green-400 ${isClosingForm ? 'glass-form-slide-up' : 'glass-form-slide-down'}`}>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Plus className="w-6 h-6 mr-3" />
              Crea Nuovo Prodotto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nome Prodotto *
                </label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.nome}
                    onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
                    placeholder="es. Guanti in lattice"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Categoria *
                </label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.categoria}
                    onChange={(e) => setAddForm({ ...addForm, categoria: e.target.value })}
                    placeholder="es. DPI, Pulizia, Igiene"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Unità di Misura
                </label>
                <div className="glass-input-container">
                  <select
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                    value={addForm.unita}
                    onChange={(e) => setAddForm({ ...addForm, unita: e.target.value })}
                  >
                    {unitaMisura.map(unita => (
                      <option key={unita.value} value={unita.value} className="bg-gray-800">
                        {unita.label} ({unita.value})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Stato
                </label>
                <div className="glass-input-container">
                  <select
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                    value={addForm.attivo}
                    onChange={(e) => setAddForm({ ...addForm, attivo: e.target.value === 'true' })}
                  >
                    <option value="true" className="bg-gray-800">Attivo</option>
                    <option value="false" className="bg-gray-800">Disattivo</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Descrizione
                </label>
                <div className="glass-input-container">
                  <textarea
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    rows="3"
                    value={addForm.descrizione}
                    onChange={(e) => setAddForm({ ...addForm, descrizione: e.target.value })}
                    placeholder="Descrizione dettagliata del prodotto..."
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleCreateProdotto}
                className="glass-button-success flex items-center gap-2 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                <span className="font-medium">Crea Prodotto</span>
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



        {/* Tabella Prodotti */}
        <div className="glass-products-card rounded-3xl overflow-hidden">
          <div className="glass-table-header px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Lista Prodotti ({sortedProdotti.length})
              </h3>
            </div>
            
            {/* Filtri compatti */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Categoria */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/70 whitespace-nowrap">Categoria:</label>
                <select
                  className="glass-input-compact px-3 py-1.5 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm focus:border-blue-400/50 transition-colors min-w-32"
                  value={filters.categoria}
                  onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Tutte</option>
                  {categorieUniche.map(categoria => (
                    <option key={categoria} value={categoria} className="bg-gray-800">
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stato */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/70 whitespace-nowrap">Stato:</label>
                <select
                  className="glass-input-compact px-3 py-1.5 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm focus:border-blue-400/50 transition-colors min-w-24"
                  value={filters.attivo}
                  onChange={(e) => setFilters({ ...filters, attivo: e.target.value })}
                >
                  <option value="all" className="bg-gray-800">Tutti</option>
                  <option value="true" className="bg-gray-800">Attivi</option>
                  <option value="false" className="bg-gray-800">Disattivi</option>
                </select>
              </div>

              {/* Ricerca */}
              <div className="flex items-center gap-2 flex-1 min-w-48">
                <label className="text-xs text-white/70 whitespace-nowrap">Cerca:</label>
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Nome o descrizione..."
                    className="glass-input-compact w-full pl-8 pr-8 py-1.5 rounded-lg bg-transparent border border-white/20 outline-none text-white placeholder-white/50 text-sm focus:border-blue-400/50 transition-colors"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  />
                  {filters.searchTerm && (
                    <button
                      onClick={() => setFilters({ ...filters, searchTerm: '' })}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Reset filtri */}
              {(filters.categoria || filters.attivo !== 'all' || filters.searchTerm) && (
                <button
                  onClick={() => setFilters({ categoria: '', searchTerm: '', attivo: 'all' })}
                  className="text-xs text-white/60 hover:text-white transition-colors px-2 py-1 rounded border border-white/20 hover:border-white/40"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-white/70">Caricamento prodotti...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="glass-table-header-row">
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('nome')}
                    >
                      <div className="flex items-center justify-between">
                        Prodotto
                        {getSortIcon('nome')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('categoria')}
                    >
                      <div className="flex items-center justify-between">
                        Categoria
                        {getSortIcon('categoria')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('unita')}
                    >
                      <div className="flex items-center justify-between">
                        Unità
                        {getSortIcon('unita')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('attivo')}
                    >
                      <div className="flex items-center justify-between">
                        Stato
                        {getSortIcon('attivo')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center justify-between">
                        Creato
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-table-body">
                  {sortedProdotti.map(prodotto => {
                    const isEditing = editingId === prodotto._id;
                    
                    return (
                      <tr key={prodotto._id} className="glass-table-row hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="glass-input-container">
                                <input
                                  type="text"
                                  className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                  value={editForm.nome}
                                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                                  placeholder="Nome prodotto"
                                />
                              </div>
                              <div className="glass-input-container">
                                <textarea
                                  className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                  rows="2"
                                  value={editForm.descrizione}
                                  onChange={(e) => setEditForm({ ...editForm, descrizione: e.target.value })}
                                  placeholder="Descrizione"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-white">
                                {prodotto.nome}
                              </div>
                              {prodotto.descrizione && (
                                <div className="text-sm text-white/60">
                                  {prodotto.descrizione}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="text"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.categoria}
                                onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                              />
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 glass-badge">
                              {prodotto.categoria}
                            </span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <select
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.unita}
                                onChange={(e) => setEditForm({ ...editForm, unita: e.target.value })}
                              >
                                {unitaMisura.map(unita => (
                                  <option key={unita.value} value={unita.value} className="bg-gray-800">
                                    {unita.value}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="text-sm text-white">{prodotto.unita}</div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <select
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.attivo}
                                onChange={(e) => setEditForm({ ...editForm, attivo: e.target.value === 'true' })}
                              >
                                <option value="true" className="bg-gray-800">Attivo</option>
                                <option value="false" className="bg-gray-800">Disattivo</option>
                              </select>
                            </div>
                          ) : (
                            <button
                              onClick={() => toggleAttivo(prodotto._id, prodotto.attivo)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer glass-badge ${
                                prodotto.attivo 
                                  ? 'bg-green-500/20 text-green-300 border border-green-400/30 hover:bg-green-500/30' 
                                  : 'bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30'
                              }`}
                            >
                              {prodotto.attivo ? <ToggleRight className="w-3 h-3 mr-1" /> : <ToggleLeft className="w-3 h-3 mr-1" />}
                              {prodotto.attivo ? 'Attivo' : 'Disattivo'}
                            </button>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">
                            {formatDate(prodotto.createdAt)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => saveEdit(prodotto._id)}
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
                                onClick={() => startEdit(prodotto)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Modifica prodotto"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => deleteProdotto(prodotto._id, prodotto.nome)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Elimina prodotto"
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

              {sortedProdotti.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/70">Nessun prodotto trovato</p>
                  <p className="text-sm text-white/50">
                    {filters.categoria || filters.searchTerm || filters.attivo !== 'all'
                      ? 'Prova a modificare i filtri per vedere più risultati'
                      : 'Clicca "Nuovo Prodotto" per iniziare'
                    }
                  </p>
                  {(filters.categoria || filters.searchTerm || filters.attivo !== 'all') && (
                    <button
                      onClick={() => setFilters({ categoria: '', searchTerm: '', attivo: 'all' })}
                      className="glass-button-secondary mt-4 px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
                    >
                      Reset Filtri
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Riepilogo compatto */}
        <div className="glass-compact-summary p-3 rounded-xl">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="text-white/70">Totale:</span>
              <span className="text-white font-medium">{prodotti.length}</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-green-400" />
              <span className="text-white/70">Attivi:</span>
              <span className="text-green-400 font-medium">{prodotti.filter(p => p.attivo).length}</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-red-400" />
              <span className="text-white/70">Disattivi:</span>
              <span className="text-red-400 font-medium">{prodotti.filter(p => !p.attivo).length}</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <span className="text-white/70">Categorie:</span>
              <span className="text-purple-400 font-medium">{categorieUniche.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-products-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        /* Form slide down animation */
        .glass-form-slide-down {
          animation: slideDown 0.4s ease-out forwards;
          opacity: 0;
          transform: translateY(-20px);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .glass-form-slide-up {
          animation: slideUp 0.3s ease-in forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
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
          transition: all 0.3s ease;
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.12);
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
          transition: all 0.3s ease;
        }

        .glass-badge:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

        .glass-compact-summary {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        /* Animation delays for staggered appearance */
        .glass-table-row {
          animation: slideInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .glass-table-row:nth-child(1) { animation-delay: 0.1s; }
        .glass-table-row:nth-child(2) { animation-delay: 0.2s; }
        .glass-table-row:nth-child(3) { animation-delay: 0.3s; }
        .glass-table-row:nth-child(4) { animation-delay: 0.4s; }
        .glass-table-row:nth-child(5) { animation-delay: 0.5s; }
        .glass-table-row:nth-child(n+6) { animation-delay: 0.6s; }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced hover effects */
        .glass-stat-card:hover .glass-stat-icon {
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .glass-action-button:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
        }

        .glass-table-row:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        /* Button press effects */
        .glass-button-primary:active,
        .glass-button-success:active,
        .glass-button-secondary:active {
          transform: scale(0.98);
        }

        .glass-action-button:active {
          transform: scale(1.05);
        }

        /* Focus states for accessibility */
        .glass-input:focus,
        .glass-input:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }

        .glass-button-primary:focus,
        .glass-button-success:focus,
        .glass-button-secondary:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        /* Loading state */
        .glass-products-card.loading {
          pointer-events: none;
          opacity: 0.7;
        }

        /* Icon glow effects */
        .glass-icon:hover {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .grid-cols-1.md\\:grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .glass-products-card {
            padding: 1rem;
            margin: 0.5rem;
          }
          
          .glass-stat-card {
            padding: 1rem;
          }
          
          .grid {
            grid-template-columns: 1fr;
          }
          
          .flex {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .px-6 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .py-4 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          
          .text-2xl {
            font-size: 1.25rem;
          }
          
          .text-xl {
            font-size: 1.125rem;
          }
          
          .text-lg {
            font-size: 1rem;
          }
        }

        @media (max-width: 640px) {
          .glass-products-card {
            margin: 0.25rem;
            padding: 0.75rem;
          }
          
          .glass-table-header, .glass-table-row {
            font-size: 0.75rem;
          }
          
          .glass-action-button {
            padding: 0.5rem;
          }
          
          .overflow-x-auto table {
            min-width: 700px;
          }

          .glass-table-header .flex-wrap {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .glass-table-header .flex-1 {
            min-width: 100%;
          }
        }

        /* Enhanced table responsiveness */
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
        }

        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Filter highlight effect */
        .glass-input-container:has(.glass-input:not(:placeholder-shown)) {
          border-color: rgba(34, 197, 94, 0.5);
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
        }

        /* Category badge variations */
        .glass-badge[data-category="DPI"] {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(252, 165, 165);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .glass-badge[data-category="Pulizia"] {
          background: rgba(34, 197, 94, 0.2);
          color: rgb(134, 239, 172);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .glass-badge[data-category="Igiene"] {
          background: rgba(168, 85, 247, 0.2);
          color: rgb(196, 181, 253);
          border-color: rgba(168, 85, 247, 0.3);
        }

        /* Toggle switch styling */
        .glass-badge:has(svg) {
          cursor: pointer;
          user-select: none;
        }

        .glass-badge:has(svg):hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
};

export default ProdottiManagement;