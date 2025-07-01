// components/admin/OperatoriManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Users, Mail, UserCheck, UserX, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../services/api';
import { formatDate } from '../../utils/formatters';

const OperatoriManagement = () => {
  const { token, setError } = useAuth();
  
  // Stati per dati
  const [operatori, setOperatori] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Gestione Operatori</h2>
            <p className="text-sm text-gray-600">
              Crea, modifica ed elimina account operatori. Gestisci ruoli e permessi.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Operatore
          </button>
        </div>
      </div>

      {/* Form Nuovo Operatore */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Crea Nuovo Operatore</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={addForm.username}
                onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                placeholder="es. mario.rossi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="mario.rossi@azienda.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                placeholder="Minimo 6 caratteri"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ruolo
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              >
                <option value="user">Operatore</option>
                <option value="admin">Amministratore</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCreateOperatore}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Crea Operatore
            </button>
            <button
              onClick={resetAddForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              <X className="w-4 h-4 inline mr-2" />
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-800">{operatori.length}</div>
              <div className="text-sm text-gray-600">Totale Utenti</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <UserCheck className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {operatori.filter(o => o.role === 'user').length}
              </div>
              <div className="text-sm text-gray-600">Operatori</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {operatori.filter(o => o.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">Amministratori</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {new Set(operatori.map(o => o.email.split('@')[1])).size}
              </div>
              <div className="text-sm text-gray-600">Domini Email</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabella Operatori */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Lista Operatori</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Caricamento operatori...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operatore
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operatori.map(operatore => {
                  const isEditing = editingId === operatore._id;
                  
                  return (
                    <tr key={operatore._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            value={editForm.username}
                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {operatore.username}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="email"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{operatore.email}</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          >
                            <option value="user">Operatore</option>
                            <option value="admin">Amministratore</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            operatore.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {operatore.role === 'admin' ? 'Amministratore' : 'Operatore'}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(operatore.createdAt)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => saveEdit(operatore._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Salva modifiche"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                              title="Annulla modifiche"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEdit(operatore)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifica operatore"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => resetPassword(operatore._id, operatore.username)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Reset password"
                            >
                              {showPasswords[operatore._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteOperatore(operatore._id, operatore.username)}
                              className="text-red-600 hover:text-red-900"
                              title="Elimina operatore"
                            >
                              <Trash2 className="w-4 h-4" />
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
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nessun operatore trovato</p>
                <p className="text-sm text-gray-400">Clicca "Nuovo Operatore" per iniziare</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatoriManagement;