// components/admin/OperatoriManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, Mail, UserCheck, UserX, Eye, EyeOff, Shield, Clock, Building, ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const OperatoriManagement = () => {
  const { token, setError } = useAuth();
  
  // Stati per dati
  const [operatori, setOperatori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postazioni, setPostazioni] = useState([]);
  
  // Stati per form nuovo operatore
  const [showAddForm, setShowAddForm] = useState(false);
  const [isClosingForm, setIsClosingForm] = useState(false);
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  // Stati per editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: 'user'
  });

  // Stati per UI
  const [showPasswords, setShowPasswords] = useState({});
  
  // Stati per ordinamento
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Stati per filtro di ricerca
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stati per modal reset password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({ userId: '', username: '', newPassword: '' });
useEffect(() => {
  const loadPostazioni = async () => {
    try {
      const data = await apiCall('/postazioni', {}, token);
      setPostazioni(data || []);
    } catch (err) {
      console.error('Errore caricamento postazioni:', err);
    }
  };
  
  loadPostazioni();
}, []);
  // Carica operatori
  const loadOperatori = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await apiCall('/admin/users', {}, token);
      setOperatori(data || []);
    } catch (err) {
      setError('Errore nel caricamento operatori: ' + err.message);
      setOperatori([]);
    } finally {
      setLoading(false);
    }
  };

  // Carica dati iniziali
  useEffect(() => {
    loadOperatori();
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
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
  };

  // Reset form nuovo operatore (mantenuto per compatibilità)
  const resetAddForm = () => {
    closeAddForm();
  };

  // Crea nuovo operatore
  const handleCreateOperatore = async () => {
    if (!addForm.username || !addForm.email || !addForm.password) {
      setError('Compila tutti i campi obbligatori');
      return;
    }

    try {
      setError('');
      
      await apiCall('/admin/users', {
        method: 'POST',
        body: JSON.stringify(addForm)
      }, token);

      await loadOperatori();
      closeAddForm();
      setError('Operatore creato con successo');
    } catch (err) {
      setError('Errore nella creazione: ' + err.message);
    }
  };

  // Avvia editing
  const startEdit = (operatore) => {
    setEditingId(operatore._id);
    setEditForm({
      username: operatore.username,
      email: operatore.email,
      role: operatore.role
    });
  };

  // Annulla editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      username: '',
      email: '',
      role: 'user'
    });
  };

  // Salva modifiche
  const saveEdit = async (operatoreId) => {
    try {
      setError('');
      
      await apiCall(`/admin/users/${operatoreId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      }, token);

      await loadOperatori();
      cancelEdit();
      setError('Operatore aggiornato con successo');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  // Elimina operatore
  const deleteOperatore = async (operatoreId, username) => {
    if (!window.confirm(`Sei sicuro di voler eliminare l'operatore "${username}"? Questa azione eliminerà anche tutte le sue giacenze e utilizzi.`)) {
      return;
    }

    try {
      setError('');
      
      await apiCall(`/admin/users/${operatoreId}`, {
        method: 'DELETE'
      }, token);

      await loadOperatori();
      setError('Operatore eliminato con successo');
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  // Toggle visibilità password
  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
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

  // Filtra e ordina operatori
  const filteredOperatori = operatori.filter(operatore => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      (operatore.username && operatore.username.toLowerCase().includes(term)) ||
      (operatore.email && operatore.email.toLowerCase().includes(term)) ||
      (operatore.role && operatore.role.toLowerCase().includes(term))
    );
  });

  const sortedOperatori = [...filteredOperatori].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Gestione casi speciali
    if (sortField === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Apri modal reset password
  const openPasswordModal = (operatoreId, username) => {
    setPasswordResetData({ userId: operatoreId, username, newPassword: '' });
    setShowPasswordModal(true);
  };

  // Chiudi modal reset password
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordResetData({ userId: '', username: '', newPassword: '' });
  };

  // Reset password
  const resetPassword = async () => {
    if (!passwordResetData.newPassword || passwordResetData.newPassword.length < 6) {
      setError('Password deve essere di almeno 6 caratteri');
      return;
    }

    try {
      setError('');
      
      await apiCall(`/admin/users/${passwordResetData.userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword: passwordResetData.newPassword })
      }, token);

      setError('Password aggiornata con successo');
      closePasswordModal();
    } catch (err) {
      setError('Errore nel reset password: ' + err.message);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-operators-card p-8 rounded-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="glass-icon p-4 rounded-2xl mr-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Gestione Operatori</h2>
                <p className="text-white/70">
                  Crea, modifica ed elimina account operatori. Gestisci ruoli e permessi.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="glass-button-primary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nuovo Operatore</span>
            </button>
          </div>
        </div>

        {/* Form Nuovo Operatore */}
        {showAddForm && (
          <div className={`glass-operators-card p-8 rounded-3xl border-l-4 border-green-400 ${isClosingForm ? 'glass-form-slide-up' : 'glass-form-slide-down'}`}>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Plus className="w-6 h-6 mr-3" />
              Crea Nuovo Operatore
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Username *
                </label>
                <div className="glass-input-container">
                  <input
                    type="text"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    placeholder="es. mario.rossi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email *
                </label>
                <div className="glass-input-container">
                  <input
                    type="email"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="mario.rossi@azienda.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password *
                </label>
                <div className="glass-input-container">
                  <input
                    type="password"
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Minimo 6 caratteri"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Ruolo
                </label>
                <div className="glass-input-container">
                  <select
                    className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  >
                    <option value="user" className="bg-gray-800">Operatore</option>
                    <option value="admin" className="bg-gray-800">Amministratore</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleCreateOperatore}
                className="glass-button-success flex items-center gap-2 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                <span className="font-medium">Crea Operatore</span>
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


        {/* Tabella Operatori */}
        <div className="glass-operators-card rounded-3xl overflow-hidden">
          <div className="glass-table-header px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Lista Operatori ({sortedOperatori.length})
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
              <div className="text-white/70">Caricamento operatori...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="glass-table-header-row">
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => handleSort('username')}
                    >
                      <div className="flex items-center justify-between">
                        Operatore
                        {getSortIcon('username')}
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
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center justify-between">
                        Ruolo
                        {getSortIcon('role')}
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
                  {sortedOperatori.map(operatore => {
                    const isEditing = editingId === operatore._id;
                    
                    return (
                      <tr key={operatore._id} className="glass-table-row hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <input
                                type="text"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-white">
                              {operatore.username}
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
                            <div className="text-sm text-white">{operatore.email}</div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="glass-input-container">
                              <select
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                              >
                                <option value="user" className="bg-gray-800">Operatore</option>
                                <option value="admin" className="bg-gray-800">Amministratore</option>
                              </select>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              operatore.role === 'admin' 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                                : 'bg-green-500/20 text-green-300 border border-green-400/30'
                            } glass-badge`}>
                              {operatore.role === 'admin' ? 'Amministratore' : 'Operatore'}
                            </span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">
                            {formatDate(operatore.createdAt)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => saveEdit(operatore._id)}
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
                                onClick={() => startEdit(operatore)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Modifica operatore"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => openPasswordModal(operatore._id, operatore.username)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Reset password"
                              >
                                {showPasswords[operatore._id] ? (
                                  <EyeOff className="w-4 h-4 text-yellow-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-yellow-400" />
                                )}
                              </button>
                              <button
                                onClick={() => deleteOperatore(operatore._id, operatore.username)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Elimina operatore"
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

              {sortedOperatori.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/70">Nessun operatore trovato</p>
                  <p className="text-sm text-white/50">
                    {searchTerm
                      ? 'Prova a modificare i termini di ricerca per vedere più risultati'
                      : 'Clicca "Nuovo Operatore" per iniziare'
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
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white/70">Totale:</span>
              <span className="text-white font-medium">{operatori.length}</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-green-400" />
              <span className="text-white/70">Operatori:</span>
              <span className="text-green-400 font-medium">{operatori.filter(o => o.role === 'user').length}</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-white/70">Amministratori:</span>
              <span className="text-purple-400 font-medium">{operatori.filter(o => o.role === 'admin').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Reset Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePasswordModal}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 m-4 max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Eye className="w-6 h-6 mr-3 text-yellow-400" />
                Reset Password
              </h3>
              <button
                onClick={closePasswordModal}
                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-white/80 mb-4">
                Inserisci la nuova password per <strong className="text-white">{passwordResetData.username}</strong>:
              </p>
              
              <div className="glass-input-container">
                <input
                  type="password"
                  className="glass-input w-full p-4 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  placeholder="Minimo 6 caratteri"
                  value={passwordResetData.newPassword}
                  onChange={(e) => setPasswordResetData({ ...passwordResetData, newPassword: e.target.value })}
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && resetPassword()}
                />
              </div>
              
              {passwordResetData.newPassword && passwordResetData.newPassword.length < 6 && (
                <p className="text-red-400 text-sm mt-2">
                  Password deve essere di almeno 6 caratteri
                </p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={resetPassword}
                disabled={!passwordResetData.newPassword || passwordResetData.newPassword.length < 6}
                className="glass-button-success flex items-center gap-2 px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Save className="w-4 h-4" />
                <span className="font-medium">Aggiorna Password</span>
              </button>
              <button
                onClick={closePasswordModal}
                className="glass-button-secondary flex items-center gap-2 px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <X className="w-4 h-4" />
                <span className="font-medium">Annulla</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .glass-operators-card {
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
          .glass-operators-card {
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
    </>
  );
};

export default OperatoriManagement;