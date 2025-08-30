import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Truck, Search, ChevronUp, ChevronDown, ChevronsUpDown, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../services/api';
import { useModalAnimation } from '../../hooks/useModalAnimation';

// Get API base URL helper
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://giacenze-app-production.up.railway.app/api'
    : 'http://localhost:7070/api';
};

const MezziManagement = () => {
  const { token, setError, setCurrentPage } = useAuth();
  
  // Stati per dati
  const [mezzi, setMezzi] = useState([]);
  const [loading, setLoading] = useState(false);
  
  
  // Stati per form nuovo mezzo
  const [showAddForm, setShowAddForm] = useState(false);
  const [isClosingForm, setIsClosingForm] = useState(false);
  const [addForm, setAddForm] = useState({
    nome: '',
    descrizione: '',
    targa: '',
    tipo: '',
    marca: '',
    modello: ''
  });
  
  // Stati per editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    descrizione: '',
    targa: '',
    tipo: '',
    marca: '',
    modello: ''
  });

  // Stati per ordinamento
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Stati per filtri di ricerca
  const [searchMezzi, setSearchMezzi] = useState('');
  const [searchTarghe, setSearchTarghe] = useState('');

  // Stati per popup conferma eliminazione
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  
  // Hook per animazioni modal eliminazione
  const deleteModalAnimation = useModalAnimation(showDeleteModal, () => {
    setDeleteModalData(null);
  });

  // Carica dati dal server
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Carica mezzi
      const mezziData = await apiCall('/mezzi', {}, token);
      setMezzi(mezziData || []);
    } catch (err) {
      setError('Errore nel caricamento dati: ' + err.message);
      setMezzi([]);
    } finally {
      setLoading(false);
    }
  };

  // Caricamento iniziale
  useEffect(() => {
    loadData();
  }, []);

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
      targa: '',
      tipo: '',
      marca: '',
      modello: ''
    });
  };

  // Aggiunge nuovo mezzo
  const addMezzo = async () => {
    try {
      setError('');
      
      if (!addForm.nome.trim()) {
        setError('Il nome è obbligatorio');
        return;
      }

      const newMezzo = {
        nome: addForm.nome.trim(),
        descrizione: addForm.descrizione.trim(),
        targa: addForm.targa.trim(),
        tipo: addForm.tipo.trim(),
        marca: addForm.marca.trim(),
        modello: addForm.modello.trim()
      };

      await apiCall('/mezzi', {
        method: 'POST',
        body: JSON.stringify(newMezzo)
      }, token);

      await loadData();
      closeAddForm();
      setError('Mezzo aggiunto con successo');
    } catch (err) {
      setError('Errore nell\'aggiunta del mezzo: ' + err.message);
    }
  };

  // Inizia editing
  const startEdit = (mezzo) => {
    setEditingId(mezzo._id);
    setEditForm({
      nome: mezzo.nome || '',
      descrizione: mezzo.descrizione || '',
      targa: mezzo.targa || '',
      tipo: mezzo.tipo || '',
      marca: mezzo.marca || '',
      modello: mezzo.modello || ''
    });
  };

  // Annulla editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      nome: '',
      descrizione: '',
      targa: '',
      tipo: '',
      marca: '',
      modello: ''
    });
  };

  // Salva modifiche
  const saveEdit = async (mezzoId) => {
    try {
      setError('');
      
      const updateData = {
        nome: editForm.nome,
        descrizione: editForm.descrizione,
        targa: editForm.targa,
        tipo: editForm.tipo,
        marca: editForm.marca,
        modello: editForm.modello
      };

      await apiCall(`/mezzi/${mezzoId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);

      await loadData();
      cancelEdit();
      setError('Mezzo aggiornato con successo');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  // Inizia processo eliminazione mezzo
  const initializeDeleteMezzo = (mezzoId, nome) => {
    // Mostra sempre il popup di conferma
    setDeleteModalData({
      mezzoId,
      nome,
      conflitti: [],
      dettagli: `Sei sicuro di voler eliminare il mezzo "${nome}"?`
    });
    setShowDeleteModal(true);
  };

  // Conferma eliminazione
  const confirmDeleteMezzo = async (force = false) => {
    if (!deleteModalData) return;
    
    try {
      setError('');
      
      if (force) {
        // Eliminazione forzata (se ci sono conflitti)
        await apiCall(`/mezzi/${deleteModalData.mezzoId}/force`, { method: 'DELETE' }, token);
        await loadData();
        setError(`Mezzo "${deleteModalData.nome}" eliminato con successo`);
        setShowDeleteModal(false);
        setDeleteModalData(null);
        return;
      }
      
      // Prima prova l'eliminazione normale
      const response = await fetch(`${getApiBaseUrl()}/mezzi/${deleteModalData.mezzoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Eliminazione avvenuta senza conflitti
        await loadData();
        setError(`Mezzo "${deleteModalData.nome}" eliminato con successo`);
        setShowDeleteModal(false);
        setDeleteModalData(null);
        return;
      }
      
      // Se c'è un errore, controlla se è per conflitti
      const errorData = await response.json();
      console.log('📋 Risposta server eliminazione:', { status: response.status, data: errorData });
      
      if (errorData.richiediConferma || response.status === 400) {
        // Aggiorna il popup con i dettagli dei conflitti
        console.log('🚨 Conflitti rilevati, aggiorno popup:', errorData);
        setDeleteModalData({
          ...deleteModalData,
          conflitti: errorData.conflitti || ['Il mezzo ha dati collegati'],
          dettagli: errorData.dettagli || `Il mezzo "${deleteModalData.nome}" ha dati collegati`
        });
        return;
      }
      
      // Altri tipi di errore
      setError('Errore nell\'eliminazione: ' + (errorData.message || 'Errore sconosciuto'));
      
    } catch (err) {
      console.error('Errore eliminazione mezzo:', err);
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  // Annulla eliminazione con animazione
  const cancelDeleteMezzo = () => {
    deleteModalAnimation.handleAnimatedClose();
    setShowDeleteModal(false);
  };

  // Ordinamento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedMezzi = () => {
    let sorted = [...mezzi];

    // Applica filtri di ricerca
    if (searchMezzi) {
      sorted = sorted.filter(mezzo => 
        mezzo.nome?.toLowerCase().includes(searchMezzi.toLowerCase()) ||
        mezzo.tipo?.toLowerCase().includes(searchMezzi.toLowerCase()) ||
        mezzo.marca?.toLowerCase().includes(searchMezzi.toLowerCase()) ||
        mezzo.modello?.toLowerCase().includes(searchMezzi.toLowerCase())
      );
    }

    if (searchTarghe) {
      sorted = sorted.filter(mezzo => 
        mezzo.targa?.toLowerCase().includes(searchTarghe.toLowerCase())
      );
    }

    // Applica ordinamento
    if (sortField) {
      sorted.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortField) {
          case 'nome':
            aValue = a.nome || '';
            bValue = b.nome || '';
            break;
          case 'targa':
            aValue = a.targa || '';
            bValue = b.targa || '';
            break;
          case 'tipo':
            aValue = a.tipo || '';
            bValue = b.tipo || '';
            break;
          case 'marca':
            aValue = a.marca || '';
            bValue = b.marca || '';
            break;
          case 'modello':
            aValue = a.modello || '';
            bValue = b.modello || '';
            break;
          default:
            return 0;
        }

        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    return sorted;
  };

  const sortedMezzi = getSortedMezzi();

  // Render icona ordinamento
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-400" />
      : <ChevronDown className="w-4 h-4 text-blue-400" />;
  };


  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="glass-icon p-3 rounded-xl">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Gestione Mezzi</h2>
                <p className="text-white/70">
                  Gestisci i mezzi del sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Torna a Postazioni */}
              <button
                onClick={() => setCurrentPage('admin-postazioni')}
                className="glass-button px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                title="Torna a Gestione Postazioni"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Torna a Postazioni</span>
              </button>

              {/* Aggiungi Mezzo */}
              <button
                onClick={() => setShowAddForm(true)}
                className="glass-button-primary px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuovo Mezzo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Aggiungi Mezzo */}
        {showAddForm && (
          <div className={`glass-card p-6 rounded-2xl border-l-4 border-green-400 ${isClosingForm ? 'glass-form-slide-up' : 'glass-form-slide-down'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Plus className="w-6 h-6 mr-3 text-green-400" />
                Aggiungi Nuovo Mezzo
              </h3>
              <button
                onClick={closeAddForm}
                className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nome Mezzo *
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: Furgone 1"
                    value={addForm.nome}
                    onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Descrizione
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: Descrizione dettagliata del mezzo"
                    value={addForm.descrizione}
                    onChange={(e) => setAddForm({ ...addForm, descrizione: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Targa
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: AB123CD"
                    value={addForm.targa}
                    onChange={(e) => setAddForm({ ...addForm, targa: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tipo
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: Furgone, Auto, Camion"
                    value={addForm.tipo}
                    onChange={(e) => setAddForm({ ...addForm, tipo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Marca
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: Ford, Mercedes, Iveco"
                    value={addForm.marca}
                    onChange={(e) => setAddForm({ ...addForm, marca: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Modello
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: Transit, Sprinter, Daily"
                    value={addForm.modello}
                    onChange={(e) => setAddForm({ ...addForm, modello: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-start space-x-4 mt-6">
              <button
                onClick={addMezzo}
                className="glass-button-success px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salva Mezzo</span>
              </button>
              <button
                onClick={closeAddForm}
                className="glass-button-secondary px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Annulla
              </button>
            </div>
          </div>
        )}

        {/* Filtri di ricerca */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Filtri di Ricerca
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Cerca per Nome/Tipo/Marca/Modello
              </label>
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Nome mezzo, tipo, marca, modello..."
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={searchMezzi}
                    onChange={(e) => setSearchMezzi(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Cerca per Targa
              </label>
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Targa..."
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={searchTarghe}
                    onChange={(e) => setSearchTarghe(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella Mezzi */}
        <div className="glass-card-large rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Lista Mezzi ({sortedMezzi.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              // Skeleton loading animation
              <div className="space-y-2">
                {/* Header skeleton */}
                <div className="glass-table-header-row flex">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-1 px-6 py-3">
                      <div className="animate-pulse bg-white/20 h-4 rounded"></div>
                    </div>
                  ))}
                </div>
                
                {/* Row skeletons */}
                {[...Array(5)].map((_, rowIndex) => (
                  <div key={rowIndex} className="glass-table-row flex border-t border-white/5">
                    {[...Array(6)].map((_, colIndex) => (
                      <div key={colIndex} className="flex-1 px-6 py-4">
                        <div className="animate-pulse bg-white/10 h-4 rounded" 
                             style={{ animationDelay: `${(rowIndex * 6 + colIndex) * 100}ms` }}>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="glass-table-header-row">
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('nome')}
                    >
                      <div className="flex items-center justify-between">
                        Nome Mezzo
                        {renderSortIcon('nome')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('targa')}
                    >
                      <div className="flex items-center justify-between">
                        Targa
                        {renderSortIcon('targa')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('tipo')}
                    >
                      <div className="flex items-center justify-between">
                        Tipo
                        {renderSortIcon('tipo')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('marca')}
                    >
                      <div className="flex items-center justify-between">
                        Marca
                        {renderSortIcon('marca')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('modello')}
                    >
                      <div className="flex items-center justify-between">
                        Modello
                        {renderSortIcon('modello')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-table-body">
                  {sortedMezzi.map(mezzo => {
                    const isEditing = editingId === mezzo._id;
                    
                    return (
                      <tr key={mezzo._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                        {/* Nome */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-start">
                              <Truck className="w-4 h-4 mr-2 text-blue-300 mt-2" />
                              <div className="space-y-2 flex-1">
                                <input
                                  type="text"
                                  className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white"
                                  placeholder="Nome mezzo"
                                  value={editForm.nome}
                                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                                />
                                <input
                                  type="text"
                                  className="glass-input w-full px-3 py-1 rounded-lg bg-transparent border border-white/20 outline-none text-white text-xs"
                                  placeholder="Descrizione"
                                  value={editForm.descrizione}
                                  onChange={(e) => setEditForm({ ...editForm, descrizione: e.target.value })}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start">
                              <Truck className="w-4 h-4 mr-2 text-blue-300 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {mezzo.nome}
                                </div>
                                {mezzo.descrizione && (
                                  <div className="text-xs text-white/70 mt-1">
                                    {mezzo.descrizione}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Targa */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white"
                              value={editForm.targa}
                              onChange={(e) => setEditForm({ ...editForm, targa: e.target.value })}
                            />
                          ) : (
                            <div className="text-sm text-white">
                              {mezzo.targa || 'N/A'}
                            </div>
                          )}
                        </td>

                        {/* Tipo */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white"
                              value={editForm.tipo}
                              onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                            />
                          ) : (
                            <div className="text-sm text-white">
                              {mezzo.tipo || 'N/A'}
                            </div>
                          )}
                        </td>

                        {/* Marca */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white"
                              value={editForm.marca}
                              onChange={(e) => setEditForm({ ...editForm, marca: e.target.value })}
                            />
                          ) : (
                            <div className="text-sm text-white">
                              {mezzo.marca || 'N/A'}
                            </div>
                          )}
                        </td>

                        {/* Modello */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="text"
                              className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white"
                              value={editForm.modello}
                              onChange={(e) => setEditForm({ ...editForm, modello: e.target.value })}
                            />
                          ) : (
                            <div className="text-sm text-white">
                              {mezzo.modello || 'N/A'}
                            </div>
                          )}
                        </td>

                        {/* Azioni */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEdit(mezzo._id)}
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
                                  onClick={() => startEdit(mezzo)}
                                  className="glass-button p-2 rounded-xl text-blue-300 hover:text-blue-200 hover:scale-105 transition-all duration-300"
                                  title="Modifica mezzo"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => initializeDeleteMezzo(mezzo._id, mezzo.nome)}
                                  className="glass-button p-2 rounded-xl text-red-300 hover:text-red-200 hover:scale-105 transition-all duration-300"
                                  title="Elimina mezzo"
                                >
                                  <Trash2 className="w-4 h-4" />
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
            )}

            {sortedMezzi.length === 0 && !loading && (
              <div className="glass-empty-state text-center py-16">
                <div className="glass-icon w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                  <Truck className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-white/70 text-lg mb-2">
                  {mezzi.length === 0 ? 'Nessun mezzo creato' : 'Nessun mezzo trovato con i filtri selezionati'}
                </p>
                <p className="text-white/50 text-sm">
                  {mezzi.length === 0 
                    ? 'Clicca "Nuovo Mezzo" per iniziare'
                    : 'Prova a modificare i filtri per vedere più risultati'
                  }
                </p>
                {(searchMezzi || searchTarghe) && (
                  <button
                    onClick={() => {
                      setSearchMezzi('');
                      setSearchTarghe('');
                    }}
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

      {/* Popup Conferma Eliminazione */}
      {deleteModalAnimation.isVisible && deleteModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            {...deleteModalAnimation.backdropProps}
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${deleteModalAnimation.backdropClasses}`}
          ></div>
          <div 
            {...deleteModalAnimation.modalProps}
            className={`glass-modal max-w-md w-full rounded-2xl p-6 space-y-6 modal-bounce-in ${deleteModalAnimation.modalClasses}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="glass-icon-danger p-3 rounded-xl">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Conferma Eliminazione</h3>
                  <p className="text-white/70 text-sm">Azione irreversibile</p>
                </div>
              </div>
              <button
                onClick={cancelDeleteMezzo}
                className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenuto */}
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${deleteModalData.conflitti.length > 0 ? 'glass-alert-warning' : 'glass-info-box'}`}>
                <p className="text-white font-medium mb-2">{deleteModalData.dettagli}</p>
                {deleteModalData.conflitti.length > 0 && (
                  <ul className="text-white/80 text-sm space-y-1">
                    {deleteModalData.conflitti.map((conflitto, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>{conflitto}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {deleteModalData.conflitti.length > 0 && (
                <div className="glass-info-box p-4 rounded-xl">
                  <p className="text-white/90 text-sm">
                    <strong>Eliminando questo mezzo:</strong>
                  </p>
                  <ul className="text-white/70 text-sm mt-2 space-y-1">
                    <li>• Verranno disattivate tutte le assegnazioni collegate</li>
                    <li>• Gli utilizzi rimarranno per storico ma il mezzo risulterà inattivo</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Azioni */}
            <div className="flex flex-col space-y-3">
              {deleteModalData.conflitti.length > 0 ? (
                <button
                  onClick={() => confirmDeleteMezzo(true)}
                  className="glass-button-danger w-full py-3 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Elimina Definitivamente</span>
                </button>
              ) : (
                <button
                  onClick={() => confirmDeleteMezzo(false)}
                  className="glass-button-danger w-full py-3 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Elimina Mezzo</span>
                </button>
              )}
              
              <button
                onClick={cancelDeleteMezzo}
                className="glass-button-secondary w-full py-3 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Annulla
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

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-button-primary {
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.4);
          color: white;
        }

        .glass-button-secondary {
          background: rgba(107, 114, 128, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 114, 128, 0.4);
          color: white;
        }

        .glass-button-success {
          background: rgba(34, 197, 94, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: white;
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

        .glass-table-header-row {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-table-body {
          background: rgba(255, 255, 255, 0.02);
        }

        .glass-table-row {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
        }

        .glass-empty-state {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
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

        /* Modal Styles */
        .glass-modal {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .glass-icon-danger {
          background: rgba(239, 68, 68, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .glass-alert-warning {
          background: rgba(245, 158, 11, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .glass-info-box {
          background: rgba(59, 130, 246, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .glass-button-danger {
          background: rgba(239, 68, 68, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: white;
        }

        .glass-button-danger:hover {
          background: rgba(239, 68, 68, 0.4);
          box-shadow: 0 12px 32px rgba(239, 68, 68, 0.3);
        }

        /* Form slide animations */
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
      `}</style>
    </div>
  );
};

export default MezziManagement;