import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Building, MapPin, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../services/api';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import Navigation, { SidebarProvider } from '../shared/Navigation';
import SidebarMenu from '../shared/SidebarMenu';
import Pagination from '../shared/Pagination';

// Get API base URL helper
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://giacenze-app-production.up.railway.app/api'
    : 'http://localhost:7070/api';
};

const PoliManagement = () => {
  const { token, setError, setCurrentPage } = useAuth();
  
  // Stati per dati
  const [poli, setPoli] = useState([]);
  const [loading, setLoading] = useState(false);
  
  
  // Stati per form nuovo polo
  const [showAddForm, setShowAddForm] = useState(false);
  const [isClosingForm, setIsClosingForm] = useState(false);
  const [addForm, setAddForm] = useState({
    nome: '',
    descrizione: '',
    indirizzo: '',
    citta: '',
    cap: '',
    email: '',
    telefono: '',
    partitaIva: '',
    codiceFiscale: '',
    note: ''
  });

  // Stati per editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    descrizione: '',
    indirizzo: '',
    citta: '',
    cap: '',
    email: '',
    telefono: '',
    partitaIva: '',
    codiceFiscale: '',
    note: ''
  });

  // Stati per ordinamento
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Stati per filtri di ricerca
  const [searchPoli, setSearchPoli] = useState('');
  const [searchIndirizzi, setSearchIndirizzi] = useState('');

  // Stati per paginazione
  const [tablePage, setTablePage] = useState(1);
  const pageSize = 20;

  // Stati per popup conferma eliminazione
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState(null);
  
  // Modal animations
  const deleteModalAnimation = useModalAnimation(showDeleteModal);

  // Carica dati dal server
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Carica poli
      const poliData = await apiCall('/poli', {}, token);
      setPoli(poliData || []);
    } catch (err) {
      setError('Errore nel caricamento dati: ' + err.message);
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
      descrizione: '',
      indirizzo: '',
      citta: '',
      cap: '',
      email: '',
      telefono: '',
      partitaIva: '',
      codiceFiscale: '',
      note: ''
    });
  };

  // Aggiunge nuovo polo
  const addPolo = async () => {
    try {
      setError('');

      if (!addForm.nome.trim()) {
        setError('Il nome è obbligatorio');
        return;
      }

      const newPolo = {
        nome: addForm.nome.trim(),
        descrizione: addForm.descrizione.trim(),
        indirizzo: addForm.indirizzo.trim(),
        citta: addForm.citta.trim(),
        cap: addForm.cap.trim(),
        email: addForm.email.trim(),
        telefono: addForm.telefono.trim(),
        partitaIva: addForm.partitaIva.trim(),
        codiceFiscale: addForm.codiceFiscale.trim(),
        note: addForm.note.trim()
      };

      await apiCall('/poli', {
        method: 'POST',
        body: JSON.stringify(newPolo)
      }, token);

      await loadData();
      closeAddForm();
      setError('Cliente aggiunto con successo');
    } catch (err) {
      setError('Errore nell\'aggiunta del cliente: ' + err.message);
    }
  };

  // Inizia editing
  const startEdit = (polo) => {
    setEditingId(polo._id);
    setEditForm({
      nome: polo.nome || '',
      descrizione: polo.descrizione || '',
      indirizzo: polo.indirizzo || '',
      citta: polo.citta || '',
      cap: polo.cap || '',
      email: polo.email || '',
      telefono: polo.telefono || '',
      partitaIva: polo.partitaIva || '',
      codiceFiscale: polo.codiceFiscale || '',
      note: polo.note || ''
    });
  };

  // Annulla editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      nome: '',
      descrizione: '',
      indirizzo: '',
      citta: '',
      cap: '',
      email: '',
      telefono: '',
      partitaIva: '',
      codiceFiscale: '',
      note: ''
    });
  };

  // Salva modifiche
  const saveEdit = async (poloId) => {
    try {
      setError('');

      const updateData = {
        nome: editForm.nome,
        descrizione: editForm.descrizione,
        indirizzo: editForm.indirizzo,
        citta: editForm.citta,
        cap: editForm.cap,
        email: editForm.email,
        telefono: editForm.telefono,
        partitaIva: editForm.partitaIva,
        codiceFiscale: editForm.codiceFiscale,
        note: editForm.note
      };

      await apiCall(`/poli/${poloId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);

      await loadData();
      cancelEdit();
      setError('Cliente aggiornato con successo');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  // Inizia processo eliminazione polo
  const initializeDeletePolo = async (poloId, nome) => {
    try {
      setError('');
      
      // Chiamata diretta per verificare conflitti
      const response = await fetch(`${getApiBaseUrl()}/poli/${poloId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Eliminazione avvenuta senza conflitti
        await loadData();
        setError('Polo eliminato con successo');
        return;
      }
      
      // Se c'è un errore, controlla se è per conflitti
      const errorData = await response.json();
      console.log('📋 Risposta server eliminazione:', { status: response.status, data: errorData });
      
      if (errorData.richiediConferma || response.status === 400) {
        // Mostra popup con dettagli conflitti
        console.log('🚨 Conflitti rilevati, mostro popup:', errorData);
        setDeleteModalData({
          poloId,
          nome,
          conflitti: errorData.conflitti || ['Dati collegati presenti'],
          dettagli: errorData.dettagli || `Il polo "${nome}" ha dati collegati`
        });
        setShowDeleteModal(true);
        return;
      }
      
      // Altri tipi di errore
      setError('Errore nell\'eliminazione: ' + (errorData.message || 'Errore sconosciuto'));
      
    } catch (err) {
      console.error('Errore eliminazione polo:', err);
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  // Conferma eliminazione forzata
  const confirmDeletePolo = async (force = false) => {
    if (!deleteModalData) return;
    
    try {
      setError('');
      
      const endpoint = force 
        ? `/poli/${deleteModalData.poloId}/force`
        : `/poli/${deleteModalData.poloId}`;
        
      await apiCall(endpoint, { method: 'DELETE' }, token);
      await loadData();
      setError(`Polo "${deleteModalData.nome}" eliminato con successo`);
      
      setShowDeleteModal(false);
      setDeleteModalData(null);
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  // Annulla eliminazione
  const cancelDeletePolo = () => {
    deleteModalAnimation.closeModal(() => {
      setShowDeleteModal(false);
      setDeleteModalData(null);
    });
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

  const getSortedPoli = () => {
    let sorted = [...poli];

    // Applica filtri di ricerca
    if (searchPoli) {
      sorted = sorted.filter(polo => 
        polo.nome?.toLowerCase().includes(searchPoli.toLowerCase())
      );
    }

    if (searchIndirizzi) {
      sorted = sorted.filter(polo => 
        polo.indirizzo?.toLowerCase().includes(searchIndirizzi.toLowerCase())
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
          case 'indirizzo':
            aValue = a.indirizzo || '';
            bValue = b.indirizzo || '';
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

  const sortedPoli = getSortedPoli();

  // Reset pagina quando cambiano i filtri
  useEffect(() => {
    setTablePage(1);
  }, [searchPoli, searchIndirizzi, sortField, sortDirection]);

  // Calcola dati paginati
  const totalPages = Math.ceil(sortedPoli.length / pageSize);
  const paginatedPoli = sortedPoli.slice(
    (tablePage - 1) * pageSize,
    tablePage * pageSize
  );

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
    <SidebarProvider>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Sidebar Menu */}
        <SidebarMenu />

        {/* Navigation */}
        <Navigation title="👔 Gestione Clienti" showBackToDashboard={true} showSidebarToggle={true} />

        {/* Main Content */}
        <div className="relative z-10 w-full mx-auto pt-20 pb-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="glass-icon p-3 rounded-xl">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Gestione Clienti</h2>
                <p className="text-white/70">
                  Gestisci i clienti del sistema
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Aggiungi Polo */}
              <button
                onClick={() => setShowAddForm(true)}
                className="glass-button-primary px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuovo Cliente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Aggiungi Polo */}
        {showAddForm && (
          <div className={`glass-card p-6 rounded-2xl border-l-4 border-green-400 ${isClosingForm ? 'glass-form-slide-up' : 'glass-form-slide-down'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Plus className="w-6 h-6 mr-3 text-green-400" />
                Aggiungi Nuovo Cliente
              </h3>
              <button
                onClick={closeAddForm}
                className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nome Cliente *
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: Azienda XYZ S.r.l."
                    value={addForm.nome}
                    onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="email"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: info@cliente.it"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Telefono */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Telefono
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="tel"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: +39 02 1234567"
                    value={addForm.telefono}
                    onChange={(e) => setAddForm({ ...addForm, telefono: e.target.value })}
                  />
                </div>
              </div>

              {/* Indirizzo */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Indirizzo
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: Via Roma 123"
                    value={addForm.indirizzo}
                    onChange={(e) => setAddForm({ ...addForm, indirizzo: e.target.value })}
                  />
                </div>
              </div>

              {/* Città */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Città
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: Milano"
                    value={addForm.citta}
                    onChange={(e) => setAddForm({ ...addForm, citta: e.target.value })}
                  />
                </div>
              </div>

              {/* CAP */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  CAP
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: 20100"
                    value={addForm.cap}
                    onChange={(e) => setAddForm({ ...addForm, cap: e.target.value })}
                  />
                </div>
              </div>

              {/* P.IVA */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Partita IVA
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: 12345678901"
                    value={addForm.partitaIva}
                    onChange={(e) => setAddForm({ ...addForm, partitaIva: e.target.value })}
                  />
                </div>
              </div>

              {/* Codice Fiscale */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Codice Fiscale
                </label>
                <div className="glass-input-container rounded-xl">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    placeholder="Es: 12345678901"
                    value={addForm.codiceFiscale}
                    onChange={(e) => setAddForm({ ...addForm, codiceFiscale: e.target.value })}
                  />
                </div>
              </div>

              {/* Descrizione - colspan 2 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Descrizione
                </label>
                <div className="glass-input-container rounded-xl">
                  <textarea
                    rows="2"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50 resize-none"
                    placeholder="Breve descrizione del cliente..."
                    value={addForm.descrizione}
                    onChange={(e) => setAddForm({ ...addForm, descrizione: e.target.value })}
                  />
                </div>
              </div>

              {/* Note - colspan 2 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Note
                </label>
                <div className="glass-input-container rounded-xl">
                  <textarea
                    rows="3"
                    className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50 resize-none"
                    placeholder="Note aggiuntive..."
                    value={addForm.note}
                    onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-start space-x-4 mt-6">
              <button
                onClick={addPolo}
                className="glass-button-success px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salva Cliente</span>
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
                Cerca per Nome Cliente
              </label>
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Nome cliente..."
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={searchPoli}
                    onChange={(e) => setSearchPoli(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Cerca per Indirizzo
              </label>
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Indirizzo..."
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={searchIndirizzi}
                    onChange={(e) => setSearchIndirizzi(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella Poli */}
        <div className="glass-card-large rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Lista Clienti ({sortedPoli.length})
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
                        Nome Cliente
                        {renderSortIcon('nome')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Contatti
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('indirizzo')}
                    >
                      <div className="flex items-center justify-between">
                        Indirizzo
                        {renderSortIcon('indirizzo')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      P.IVA / C.F.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-table-body">
                  {paginatedPoli.map(polo => {
                    const isEditing = editingId === polo._id;
                    
                    return (
                      <tr key={polo._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                        {/* Nome */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white"
                              value={editForm.nome}
                              onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-2 text-blue-300" />
                              <div>
                                <div className="text-sm font-medium text-white">{polo.nome}</div>
                                {polo.descrizione && (
                                  <div className="text-xs text-white/50 mt-1">{polo.descrizione}</div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Contatti */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="email"
                                placeholder="Email"
                                className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              />
                              <input
                                type="tel"
                                placeholder="Telefono"
                                className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm"
                                value={editForm.telefono}
                                onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white">
                              {polo.email && <div>{polo.email}</div>}
                              {polo.telefono && <div className="text-white/70">{polo.telefono}</div>}
                              {!polo.email && !polo.telefono && <div className="text-white/50">N/A</div>}
                            </div>
                          )}
                        </td>

                        {/* Indirizzo */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Indirizzo"
                                className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm"
                                value={editForm.indirizzo}
                                onChange={(e) => setEditForm({ ...editForm, indirizzo: e.target.value })}
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Città"
                                  className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm"
                                  value={editForm.citta}
                                  onChange={(e) => setEditForm({ ...editForm, citta: e.target.value })}
                                />
                                <input
                                  type="text"
                                  placeholder="CAP"
                                  className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm"
                                  value={editForm.cap}
                                  onChange={(e) => setEditForm({ ...editForm, cap: e.target.value })}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-white">
                              {polo.indirizzo && <div>{polo.indirizzo}</div>}
                              {(polo.citta || polo.cap) && (
                                <div className="text-white/70">
                                  {polo.cap} {polo.citta}
                                </div>
                              )}
                              {!polo.indirizzo && !polo.citta && <div className="text-white/50">N/A</div>}
                            </div>
                          )}
                        </td>

                        {/* P.IVA / C.F. */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="P.IVA"
                                className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm"
                                value={editForm.partitaIva}
                                onChange={(e) => setEditForm({ ...editForm, partitaIva: e.target.value })}
                              />
                              <input
                                type="text"
                                placeholder="C.F."
                                className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm"
                                value={editForm.codiceFiscale}
                                onChange={(e) => setEditForm({ ...editForm, codiceFiscale: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white">
                              {polo.partitaIva && <div>P.IVA: {polo.partitaIva}</div>}
                              {polo.codiceFiscale && <div className="text-white/70">C.F.: {polo.codiceFiscale}</div>}
                              {!polo.partitaIva && !polo.codiceFiscale && <div className="text-white/50">N/A</div>}
                            </div>
                          )}
                        </td>

                        {/* Note */}
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <textarea
                              rows="2"
                              placeholder="Note..."
                              className="glass-input w-full px-3 py-2 rounded-lg bg-transparent border border-white/20 outline-none text-white text-sm resize-none"
                              value={editForm.note}
                              onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                            />
                          ) : (
                            <div className="text-sm text-white/70 max-w-xs truncate">
                              {polo.note || '-'}
                            </div>
                          )}
                        </td>

                        {/* Azioni */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEdit(polo._id)}
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
                                  onClick={() => startEdit(polo)}
                                  className="glass-button p-2 rounded-xl text-blue-300 hover:text-blue-200 hover:scale-105 transition-all duration-300"
                                  title="Modifica polo"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => initializeDeletePolo(polo._id, polo.nome)}
                                  className="glass-button p-2 rounded-xl text-red-300 hover:text-red-200 hover:scale-105 transition-all duration-300"
                                  title="Elimina polo"
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

            {sortedPoli.length === 0 && !loading && (
              <div className="glass-empty-state text-center py-16">
                <div className="glass-icon w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-white/70 text-lg mb-2">
                  {poli.length === 0 ? 'Nessun cliente creato' : 'Nessun cliente trovato con i filtri selezionati'}
                </p>
                <p className="text-white/50 text-sm">
                  {poli.length === 0
                    ? 'Clicca "Nuovo Cliente" per iniziare'
                    : 'Prova a modificare i filtri per vedere più risultati'
                  }
                </p>
                {(searchPoli || searchIndirizzi) && (
                  <button
                    onClick={() => {
                      setSearchPoli('');
                      setSearchIndirizzi('');
                    }}
                    className="glass-button-secondary mt-4 px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
                  >
                    Reset Filtri
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Paginazione */}
          <Pagination
            currentPage={tablePage}
            totalPages={totalPages}
            totalItems={sortedPoli.length}
            pageSize={pageSize}
            onPageChange={(page) => setTablePage(page)}
          />
        </div>
      </div>

      {/* Popup Conferma Eliminazione */}
      {showDeleteModal && deleteModalData && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${deleteModalAnimation.backdropClass}`}>
          <div className={`glass-modal max-w-md w-full rounded-2xl p-6 space-y-6 ${deleteModalAnimation.modalClass}`}>
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
                onClick={cancelDeletePolo}
                className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenuto */}
            <div className="space-y-4">
              <div className="glass-alert-warning p-4 rounded-xl">
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

              <div className="glass-info-box p-4 rounded-xl">
                <p className="text-white/90 text-sm">
                  <strong>Eliminando questo polo:</strong>
                </p>
                <ul className="text-white/70 text-sm mt-2 space-y-1">
                  <li>• Verranno disattivate tutte le assegnazioni collegate</li>
                  <li>• Verranno disattivate tutte le postazioni del polo</li>
                  <li>• Gli utilizzi rimarranno per storico ma il polo risulterà inattivo</li>
                </ul>
              </div>
            </div>

            {/* Azioni */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => confirmDeletePolo(true)}
                className="glass-button-danger w-full py-3 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Elimina Definitivamente</span>
              </button>
              
              <button
                onClick={cancelDeletePolo}
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
    </SidebarProvider>
  );
};

export default PoliManagement;