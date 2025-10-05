// components/admin/ClientiManagement.js
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Building, Phone, MapPin, ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../services/api';
import Navigation, { SidebarProvider } from '../shared/Navigation';
import SidebarMenu from '../shared/SidebarMenu';

const ClientiManagement = () => {
  const { token, setError } = useAuth();

  // Stati per dati
  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stati per form nuovo cliente
  const [showAddForm, setShowAddForm] = useState(false);
  const [isClosingForm, setIsClosingForm] = useState(false);
  const [addForm, setAddForm] = useState({
    nome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    citta: '',
    cap: '',
    partitaIva: '',
    codiceFiscale: '',
    note: ''
  });

  // Stati per editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    citta: '',
    cap: '',
    partitaIva: '',
    codiceFiscale: '',
    note: ''
  });

  // Stati per ordinamento
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Stati per filtro di ricerca
  const [searchTerm, setSearchTerm] = useState('');

  // Carica clienti
  const loadClienti = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiCall('/clienti', {}, token);
      setClienti(data || []);
    } catch (err) {
      setError('Errore nel caricamento clienti: ' + err.message);
      setClienti([]);
    } finally {
      setLoading(false);
    }
  };

  // Carica dati iniziali
  useEffect(() => {
    loadClienti();
  }, []);

  // Chiusura animata del form
  const closeAddForm = () => {
    setIsClosingForm(true);
    setTimeout(() => {
      setShowAddForm(false);
      setIsClosingForm(false);
      resetAddFormData();
    }, 300);
  };

  // Reset dati form
  const resetAddFormData = () => {
    setAddForm({
      nome: '',
      email: '',
      telefono: '',
      indirizzo: '',
      citta: '',
      cap: '',
      partitaIva: '',
      codiceFiscale: '',
      note: ''
    });
  };

  // Reset form nuovo cliente (mantenuto per compatibilità)
  const resetAddForm = () => {
    closeAddForm();
  };

  // Crea nuovo cliente
  const handleCreateCliente = async () => {
    if (!addForm.nome) {
      setError('Il nome del cliente è obbligatorio');
      return;
    }

    try {
      setError('');

      await apiCall('/clienti', {
        method: 'POST',
        body: JSON.stringify(addForm)
      }, token);

      await loadClienti();
      closeAddForm();
      setError('Cliente creato con successo');
    } catch (err) {
      setError('Errore nella creazione: ' + err.message);
    }
  };

  // Avvia editing
  const startEdit = (cliente) => {
    setEditingId(cliente._id);
    setEditForm({
      nome: cliente.nome,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      indirizzo: cliente.indirizzo || '',
      citta: cliente.citta || '',
      cap: cliente.cap || '',
      partitaIva: cliente.partitaIva || '',
      codiceFiscale: cliente.codiceFiscale || '',
      note: cliente.note || ''
    });
  };

  // Annulla editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      nome: '',
      email: '',
      telefono: '',
      indirizzo: '',
      citta: '',
      cap: '',
      partitaIva: '',
      codiceFiscale: '',
      note: ''
    });
  };

  // Salva modifiche
  const saveEdit = async (clienteId) => {
    try {
      setError('');

      await apiCall(`/clienti/${clienteId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      }, token);

      await loadClienti();
      cancelEdit();
      setError('Cliente aggiornato con successo');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  // Elimina cliente
  const deleteCliente = async (clienteId, nome) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il cliente "${nome}"? Questa azione eliminerà anche tutti i dati correlati.`)) {
      return;
    }

    try {
      setError('');

      await apiCall(`/clienti/${clienteId}`, {
        method: 'DELETE'
      }, token);

      await loadClienti();
      setError('Cliente eliminato con successo');
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
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

  // Filtra e ordina clienti
  const filteredClienti = clienti.filter(cliente => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      (cliente.nome && cliente.nome.toLowerCase().includes(term)) ||
      (cliente.email && cliente.email.toLowerCase().includes(term)) ||
      (cliente.telefono && cliente.telefono.toLowerCase().includes(term)) ||
      (cliente.citta && cliente.citta.toLowerCase().includes(term)) ||
      (cliente.partitaIva && cliente.partitaIva.toLowerCase().includes(term))
    );
  });

  const sortedClienti = [...filteredClienti].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Gestione casi speciali
    if (sortField === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue ? bValue.toLowerCase() : '';
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Sidebar Menu */}
        <SidebarMenu />

        {/* Navigation */}
        <div className="relative z-10">
          <Navigation title="👔 Gestione Clienti" showBackToDashboard={true} showSidebarToggle={true} />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
        {/* Header */}
        <div className="glass-clienti-card p-8 rounded-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="glass-icon p-4 rounded-2xl mr-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Gestione Clienti</h2>
                <p className="text-white/70">
                  Crea, modifica ed elimina clienti. Gestisci informazioni e dati di contatto.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="glass-button-primary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nuovo Cliente</span>
            </button>
          </div>
        </div>

        {/* Form Nuovo Cliente */}
        {showAddForm && (
          <div className={`glass-clienti-card p-8 rounded-3xl border-l-4 border-green-400 ${isClosingForm ? 'glass-form-slide-up' : 'glass-form-slide-down'}`}>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Plus className="w-6 h-6 mr-3" />
              Crea Nuovo Cliente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nome / Ragione Sociale *
                </label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.nome}
                    onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
                    placeholder="es. Rossi Mario / Azienda S.r.l."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <div className="glass-input-container">
                  <input
                    type="email"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Telefono
                </label>
                <div className="glass-input-container">
                  <input
                    type="tel"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.telefono}
                    onChange={(e) => setAddForm({ ...addForm, telefono: e.target.value })}
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Indirizzo
                </label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.indirizzo}
                    onChange={(e) => setAddForm({ ...addForm, indirizzo: e.target.value })}
                    placeholder="Via Roma, 123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Città
                </label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.citta}
                    onChange={(e) => setAddForm({ ...addForm, citta: e.target.value })}
                    placeholder="Milano"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  CAP
                </label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.cap}
                    onChange={(e) => setAddForm({ ...addForm, cap: e.target.value })}
                    placeholder="20100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Partita IVA
                </label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.partitaIva}
                    onChange={(e) => setAddForm({ ...addForm, partitaIva: e.target.value })}
                    placeholder="IT12345678901"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Codice Fiscale
                </label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.codiceFiscale}
                    onChange={(e) => setAddForm({ ...addForm, codiceFiscale: e.target.value })}
                    placeholder="RSSMRA80A01H501U"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Note
                </label>
                <div className="glass-input-container">
                  <textarea
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.note}
                    onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
                    placeholder="Note aggiuntive..."
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleCreateCliente}
                className="glass-button-success flex items-center gap-2 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                <span className="font-medium">Crea Cliente</span>
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

        {/* Tabella Clienti */}
        <div className="glass-clienti-card rounded-3xl overflow-hidden">
          <div className="glass-table-header px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Lista Clienti ({sortedClienti.length})
              </h3>

              {/* Barra di ricerca compatta */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cerca..."
                  className="glass-input-compact w-64 pl-9 pr-8 py-2 rounded-xl bg-transparent border border-white/20 outline-none text-white placeholder-white/50 text-sm focus:border-blue-400/50 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="text-white/70">Caricamento clienti...</div>
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
                        Cliente
                        {getSortIcon('nome')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center justify-between">
                        Email
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('telefono')}
                    >
                      <div className="flex items-center justify-between">
                        Telefono
                        {getSortIcon('telefono')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('citta')}
                    >
                      <div className="flex items-center justify-between">
                        Città
                        {getSortIcon('citta')}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('partitaIva')}
                    >
                      <div className="flex items-center justify-between">
                        P.IVA
                        {getSortIcon('partitaIva')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-table-body">
                  {sortedClienti.map(cliente => {
                    const isEditing = editingId === cliente._id;

                    return (
                      <tr key={cliente._id} className="glass-table-row hover:bg-white/5 transition-colors">
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
                            <div className="text-sm font-medium text-white">
                              {cliente.nome}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="email"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white">{cliente.email || '-'}</div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="tel"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.telefono}
                                onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white flex items-center">
                              {cliente.telefono ? (
                                <>
                                  <Phone className="w-3 h-3 mr-1 text-white/50" />
                                  {cliente.telefono}
                                </>
                              ) : '-'}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="text"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.citta}
                                onChange={(e) => setEditForm({ ...editForm, citta: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white flex items-center">
                              {cliente.citta ? (
                                <>
                                  <MapPin className="w-3 h-3 mr-1 text-white/50" />
                                  {cliente.citta}
                                </>
                              ) : '-'}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="text"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.partitaIva}
                                onChange={(e) => setEditForm({ ...editForm, partitaIva: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-white">{cliente.partitaIva || '-'}</div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => saveEdit(cliente._id)}
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
                                onClick={() => startEdit(cliente)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Modifica cliente"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => deleteCliente(cliente._id, cliente.nome)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Elimina cliente"
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

              {sortedClienti.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Building className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/70">Nessun cliente trovato</p>
                  <p className="text-sm text-white/50">
                    {searchTerm
                      ? 'Prova a modificare i termini di ricerca per vedere più risultati'
                      : 'Clicca "Nuovo Cliente" per iniziare'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
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
        <div className="glass-compact-summary p-4 rounded-xl">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span className="text-white/70">Totale Clienti:</span>
              <span className="text-white font-medium">{clienti.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-clienti-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
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

        .glass-compact-summary {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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

        /* Responsive */
        @media (max-width: 768px) {
          .glass-clienti-card {
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
          }
        }

        @media (max-width: 640px) {
          .glass-table-header .flex {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .glass-input-compact {
            width: 100%;
          }
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
        .glass-compact-summary:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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
      `}</style>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ClientiManagement;
