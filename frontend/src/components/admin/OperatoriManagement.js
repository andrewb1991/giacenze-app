// components/admin/OperatoriManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, Mail, UserCheck, UserX, Eye, EyeOff, Shield, Clock, Building } from 'lucide-react';
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

  // Reset form nuovo operatore
  const resetAddForm = () => {
    setAddForm({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
    setShowAddForm(false);
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
      resetAddForm();
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

  // Reset password
  const resetPassword = async (operatoreId, username) => {
    const newPassword = prompt(`Inserisci la nuova password per ${username}:`);
    if (!newPassword || newPassword.length < 6) {
      alert('Password deve essere di almeno 6 caratteri');
      return;
    }

    try {
      setError('');
      
      await apiCall(`/admin/users/${operatoreId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      }, token);

      setError('Password aggiornata con successo');
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
          <div className="glass-operators-card p-8 rounded-3xl border-l-4 border-green-400">
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

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-stat-card p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{operatori.length}</div>
                <div className="text-sm text-white/70">Totale Utenti</div>
              </div>
              <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-teal-400 to-teal-600 mr-4">
      <Building className="w-6 h-6 text-white" />
    </div>
    <div>
      <div className="text-2xl font-bold text-teal-400">
        {postazioni.filter(p => p.attiva).length}
      </div>
      <div className="text-sm text-white/70">Postazioni Attive</div>
    </div>
            </div>
          </div>
          <div className="glass-stat-card p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 mr-4">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {operatori.filter(o => o.role === 'user').length}
                </div>
                <div className="text-sm text-white/70">Operatori</div>
              </div>
            </div>
          </div>
          <div className="glass-stat-card p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 mr-4">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {operatori.filter(o => o.role === 'admin').length}
                </div>
                <div className="text-sm text-white/70">Amministratori</div>
              </div>
            </div>
          </div>
          <div className="glass-stat-card p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="glass-stat-icon p-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 mr-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {new Set(operatori.map(o => o.email.split('@')[1])).size}
                </div>
                <div className="text-sm text-white/70">Domini Email</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella Operatori */}
        <div className="glass-operators-card rounded-3xl overflow-hidden">
          <div className="glass-table-header px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Lista Operatori</h3>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Operatore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Ruolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Creato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="glass-table-body">
                  {operatori.map(operatore => {
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
                                onClick={() => resetPassword(operatore._id, operatore.username)}
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

              {operatori.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/70">Nessun operatore trovato</p>
                  <p className="text-sm text-white/50">Clicca "Nuovo Operatore" per iniziare</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
        }
      `}</style>
    </>
  );
};

export default OperatoriManagement;