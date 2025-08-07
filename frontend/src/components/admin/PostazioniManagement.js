import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Building, MapPin, Download, Upload, FileSpreadsheet, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../services/api';

// Get API base URL helper
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://giacenze-app-production.up.railway.app/api'
    : 'http://localhost:7070/api';
};

const PostazioniManagement = () => {
  const { token, setError } = useAuth();
  
  // Stati per dati
  const [postazioni, setPostazioni] = useState([]);
  const [poli, setPoli] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stati per import Excel
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Stati per form nuova postazione
  const [showAddForm, setShowAddForm] = useState(false);
  const [isClosingForm, setIsClosingForm] = useState(false);
  const [addForm, setAddForm] = useState({
    nome: '',
    poloId: '',
    indirizzo: '',
    latitudine: '',
    longitudine: ''
  });
  
  // Stati per editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    poloId: '',
    indirizzo: '',
    latitudine: '',
    longitudine: ''
  });

  // Stati per ordinamento
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Stati per filtri di ricerca
  const [searchPostazioni, setSearchPostazioni] = useState('');
  const [searchIndirizzi, setSearchIndirizzi] = useState('');
  const [selectedPolo, setSelectedPolo] = useState('');

  // Carica dati dal server
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Carica poli
      const poliData = await apiCall('/poli', {}, token);
      setPoli(poliData || []);
      
      // Carica postazioni
      const postazioniData = await apiCall('/postazioni', {}, token);
      setPostazioni(postazioniData || []);
    } catch (err) {
      setError('Errore nel caricamento dati: ' + err.message);
      setPostazioni([]);
      setPoli([]);
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
      poloId: '',
      indirizzo: '',
      latitudine: '',
      longitudine: ''
    });
  };

  // Reset form nuova postazione (mantenuto per compatibilità)
  const resetAddForm = () => {
    closeAddForm();
  };

  // Crea nuova postazione
  const handleCreatePostazione = async () => {
    if (!addForm.nome || !addForm.poloId) {
      setError('Nome e polo sono obbligatori');
      return;
    }

    try {
      setError('');
      
      // Prepara i dati con coordinate nel formato corretto
      const postData = {
        nome: addForm.nome,
        poloId: addForm.poloId,
        indirizzo: addForm.indirizzo,
        coordinate: {
          lat: parseFloat(addForm.latitudine) || '',
          lng: parseFloat(addForm.longitudine) || ''
        }
      };

      await apiCall('/postazioni', {
        method: 'POST',
        body: JSON.stringify(postData)
      }, token);

      await loadData();
      closeAddForm();
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
      poloId: postazione.poloId?._id || '',
      indirizzo: postazione.indirizzo || '',
      latitudine: postazione.coordinate?.lat || '',
      longitudine: postazione.coordinate?.lng || ''
    });
  };

  // Annulla editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      nome: '',
      poloId: '',
      indirizzo: '',
      latitudine: '',
      longitudine: ''
    });
  };

  // Salva modifiche
  const saveEdit = async (postazioneId) => {
    try {
      setError('');
      
      // Prepara i dati con coordinate nel formato corretto
      const updateData = {
        nome: editForm.nome,
        poloId: editForm.poloId,
        indirizzo: editForm.indirizzo,
        coordinate: {
          lat: parseFloat(editForm.latitudine) || '',
          lng: parseFloat(editForm.longitudine) || ''
        }
      };

      await apiCall(`/postazioni/${postazioneId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);

      await loadData();
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

      await loadData();
      setError('Postazione eliminata con successo');
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  // Download template Excel
  const downloadTemplate = async () => {
    try {
      setError('');
      
      // Usa l'API base URL corretto
      const API_BASE = getApiBaseUrl();
      console.log('📥 Download template:', `${API_BASE}/postazioni/template`);
      
      const response = await fetch(`${API_BASE}/postazioni/template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Errore nel download del template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'template_postazioni.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setError('Template scaricato con successo');
    } catch (err) {
      setError('Errore nel download: ' + err.message);
    }
  };

  // Upload Excel file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verifica che sia un file Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Per favore seleziona un file Excel (.xlsx o .xls)');
      return;
    }

    try {
      setUploading(true);
      setError('');
      console.log('📤 Inizio upload file:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      // Usa l'API base URL corretto
      const API_BASE = getApiBaseUrl();
      console.log('🔗 URL upload:', `${API_BASE}/postazioni/import`);

      const response = await fetch(`${API_BASE}/postazioni/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const result = await response.json();
      console.log('📦 Response data:', result);

      if (!response.ok) {
        console.error('❌ Upload failed:', result);
        throw new Error(result.message || 'Errore nell\'upload del file');
      }

      await loadData(); // Ricarica i dati
      setError(`Import completato: ${result.created} postazioni create, ${result.updated} aggiornate, ${result.errors} errori`);
      console.log('✅ Import completato con successo');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError('Errore nell\'import: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

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

  // Filtra e ordina postazioni
  const filteredPostazioni = postazioni.filter(postazione => {
    // Filtro per ricerca postazioni (nome postazione)
    let matchesPostazioni = true;
    if (searchPostazioni) {
      const term = searchPostazioni.toLowerCase();
      matchesPostazioni = postazione.nome && postazione.nome.toLowerCase().includes(term);
    }

    // Filtro per ricerca indirizzi
    let matchesIndirizzi = true;
    if (searchIndirizzi) {
      const term = searchIndirizzi.toLowerCase();
      matchesIndirizzi = postazione.indirizzo && postazione.indirizzo.toLowerCase().includes(term);
    }

    // Filtro per polo
    let matchesPolo = true;
    if (selectedPolo) {
      matchesPolo = postazione.poloId?._id === selectedPolo;
    }

    return matchesPostazioni && matchesIndirizzi && matchesPolo;
  });

  const sortedPostazioni = [...filteredPostazioni].sort((a, b) => {
    if (!sortField) return 0;

    let aValue, bValue;

    // Gestione campi nested
    if (sortField === 'polo') {
      aValue = a.poloId?.nome || '';
      bValue = b.poloId?.nome || '';
    } else if (sortField === 'latitudine') {
      aValue = a.coordinate?.lat || '';
      bValue = b.coordinate?.lat || '';
    } else if (sortField === 'longitudine') {
      aValue = a.coordinate?.lng || '';
      bValue = b.coordinate?.lng || '';
    } else {
      aValue = a[sortField] || '';
      bValue = b[sortField] || '';
    }

    // Conversione per confronto
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    } else if (typeof aValue === 'number') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-postazioni-card p-8 rounded-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="glass-icon p-4 rounded-2xl mr-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Gestione Postazioni</h2>
                <p className="text-white/70">
                  Crea e gestisci postazioni di lavoro per ogni polo
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadTemplate}
                className="glass-button-secondary flex items-center gap-2 px-4 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
                title="Scarica template Excel"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Template</span>
              </button>
              
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  onClick={() => {
                    console.log('🖱️ Import button clicked');
                    if (fileInputRef.current) {
                      console.log('📁 Triggering file input');
                      fileInputRef.current.click();
                    } else {
                      console.error('❌ File input ref not found');
                    }
                  }}
                  className="glass-button-secondary flex items-center gap-2 px-4 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
                  disabled={uploading}
                  title="Carica file Excel"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {uploading ? 'Caricando...' : 'Import'}
                  </span>
                </button>
              </div>

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

        {/* Form Nuova Postazione */}
        {showAddForm && (
          <div className={`glass-postazioni-card p-8 rounded-3xl border-l-4 border-green-400 ${isClosingForm ? 'glass-form-slide-up' : 'glass-form-slide-down'}`}>
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
                <label className="block text-sm font-medium text-white/80 mb-2">Polo *</label>
                <div className="glass-input-container">
                  <select
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                    value={addForm.poloId}
                    onChange={(e) => setAddForm({ ...addForm, poloId: e.target.value })}
                  >
                    <option value="" className="bg-gray-800">Seleziona polo</option>
                    {poli.map(polo => (
                      <option key={polo._id} value={polo._id} className="bg-gray-800">
                        {polo.nome}
                      </option>
                    ))}
                  </select>
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
                    value={addForm.latitudine}
                    onChange={(e) => setAddForm({ ...addForm, latitudine: e.target.value })}
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
                    value={addForm.longitudine}
                    onChange={(e) => setAddForm({ ...addForm, longitudine: e.target.value })}
                    placeholder="9.188540"
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

        {/* Tabella Postazioni */}
        <div className="glass-postazioni-card rounded-3xl overflow-hidden">
          <div className="glass-table-header px-6 py-4">
            <div className="flex items-center justify-start gap-6 flex-wrap">
              <h3 className="text-lg font-semibold text-white">
                Lista Postazioni
              </h3>
              
              {/* Filtri compatti */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Filtro per polo */}
                <div className="glass-input-container-compact">
                  <select
                    className="glass-input-compact px-3 py-2 rounded-xl bg-transparent border border-white/20 outline-none text-white text-sm focus:border-blue-400/50 transition-colors min-w-[140px]"
                    value={selectedPolo}
                    onChange={(e) => setSelectedPolo(e.target.value)}
                  >
                    <option value="" className="bg-gray-800">Tutti i poli</option>
                    {poli.map(polo => (
                      <option key={polo._id} value={polo._id} className="bg-gray-800">
                        {polo.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ricerca postazioni */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cerca postazioni..."
                    className="glass-input-compact w-44 pl-9 pr-8 py-2 rounded-xl bg-transparent border border-white/20 outline-none text-white placeholder-white/50 text-sm focus:border-blue-400/50 transition-colors"
                    value={searchPostazioni}
                    onChange={(e) => setSearchPostazioni(e.target.value)}
                  />
                  {searchPostazioni && (
                    <button
                      onClick={() => setSearchPostazioni('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Ricerca indirizzi */}
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cerca indirizzi..."
                    className="glass-input-compact w-full pl-9 pr-8 py-2 rounded-xl bg-transparent border border-white/20 outline-none text-white placeholder-white/50 text-sm focus:border-blue-400/50 transition-colors"
                    value={searchIndirizzi}
                    onChange={(e) => setSearchIndirizzi(e.target.value)}
                  />
                  {searchIndirizzi && (
                    <button
                      onClick={() => setSearchIndirizzi('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Reset filtri se attivi */}
                {(searchPostazioni || searchIndirizzi || selectedPolo) && (
                  <button
                    onClick={() => {
                      setSearchPostazioni('');
                      setSearchIndirizzi('');
                      setSelectedPolo('');
                    }}
                    className="glass-button-secondary px-3 py-2 rounded-xl text-white text-sm hover:scale-105 transition-all duration-300"
                    title="Reset filtri"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
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
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('nome')}
                    >
                      <div className="flex items-center justify-between">
                        Nome
                        {getSortIcon('nome')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('polo')}
                    >
                      <div className="flex items-center justify-between">
                        Polo
                        {getSortIcon('polo')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('indirizzo')}
                    >
                      <div className="flex items-center justify-between">
                        Indirizzo
                        {getSortIcon('indirizzo')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Latitudine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Longitudine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-table-body">
                  {sortedPostazioni.map(postazione => {
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
                            <div className="text-sm font-medium text-white">{postazione.nome}</div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <select
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.poloId}
                                onChange={(e) => setEditForm({ ...editForm, poloId: e.target.value })}
                              >
                                <option value="" className="bg-gray-800">Seleziona</option>
                                {poli.map(polo => (
                                  <option key={polo._id} value={polo._id} className="bg-gray-800">
                                    {polo.nome}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="text-sm text-white">
                              {postazione.poloId?.nome || 'N/A'}
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
                              {postazione.indirizzo || 'Non specificato'}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="number"
                                step="any"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.latitudine}
                                onChange={(e) => setEditForm({ ...editForm, latitudine: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white">
                              {postazione.coordinate?.lat || 'N/A'}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="number"
                                step="any"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.longitudine}
                                onChange={(e) => setEditForm({ ...editForm, longitudine: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white">
                              {postazione.coordinate?.lng || 'N/A'}
                            </div>
                          )}
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
              {sortedPostazioni.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/70">Nessuna postazione trovata</p>
                  <p className="text-sm text-white/50">
                    {(searchPostazioni || searchIndirizzi || selectedPolo)
                      ? 'Prova a modificare i filtri per vedere più risultati'
                      : 'Clicca "Nuova Postazione" per iniziare'
                    }
                  </p>
                  {(searchPostazioni || searchIndirizzi || selectedPolo) && (
                    <button
                      onClick={() => {
                        setSearchPostazioni('');
                        setSearchIndirizzi('');
                        setSelectedPolo('');
                      }}
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

        {/* Contatore postazioni compatto */}
        <div className="glass-compact-summary p-3 rounded-xl">
          <div className="flex items-center justify-center text-sm">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span className="text-white/70">Totale postazioni:</span>
              <span className="text-white font-medium">{sortedPostazioni.length}</span>
              {postazioni.length !== sortedPostazioni.length && (
                <>
                  <span className="text-white/50">su</span>
                  <span className="text-white/70">{postazioni.length}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-postazioni-card {
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

        .glass-action-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-action-button:hover {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
        }

        .glass-input-compact {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          transition: all 0.3s ease;
        }

        .glass-input-compact:focus {
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        }

        .glass-input-container-compact {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }

        .glass-input-container-compact:focus-within {
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
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
        .glass-table-row:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .glass-action-button:hover {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
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
        .glass-input:focus-visible,
        .glass-input-compact:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }

        .glass-button-primary:focus,
        .glass-button-success:focus,
        .glass-button-secondary:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        /* Icon glow effects */
        .glass-icon:hover {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
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

          .glass-input-compact {
            width: 200px;
            min-width: auto;
          }
        }

        @media (max-width: 640px) {
          .glass-table-header .flex {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }

          .glass-table-header h3 {
            text-align: center;
          }

          .glass-input-compact {
            width: 100%;
            min-width: auto;
          }
        }
      `}</style>
    </>
  );
};

export default PostazioniManagement;