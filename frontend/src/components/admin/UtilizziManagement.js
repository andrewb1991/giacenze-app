// components/admin/UtilizziManagement.js
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, X, Search, Filter, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { apiCall } from '../../services/api';
import { formatWeek, formatDateTime } from '../../utils/formatters';

const UtilizziManagement = () => {
  const { token, setError } = useAuth();
  const { users, settimane } = useGiacenze();
  
  // Stati per filtri
  const [filters, setFilters] = useState({
    userId: '',
    settimanaId: '',
    searchTerm: ''
  });
  
  // Stati per dati
  const [allUtilizzi, setAllUtilizzi] = useState([]);
  const [filteredUtilizzi, setFilteredUtilizzi] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stati per editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    quantitaUtilizzata: '',
    note: ''
  });

  // Carica tutti gli utilizzi
  const loadAllUtilizzi = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.settimanaId) queryParams.append('settimanaId', filters.settimanaId);
      
      const data = await apiCall(`/admin/utilizzi?${queryParams}`, {}, token);
      setAllUtilizzi(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Errore nel caricamento utilizzi: ' + err.message);
      setAllUtilizzi([]);
    } finally {
      setLoading(false);
    }
  };

  // Applica filtri locali
  useEffect(() => {
    let filtered = allUtilizzi;
    
    if (filters.searchTerm) {
      filtered = filtered.filter(utilizzo => 
        utilizzo.productId?.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        utilizzo.userId?.username.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    
    setFilteredUtilizzi(filtered);
  }, [allUtilizzi, filters.searchTerm]);

  // Carica dati quando cambiano i filtri principali
  useEffect(() => {
    loadAllUtilizzi();
  }, [filters.userId, filters.settimanaId]);

  // Carica dati iniziali
  useEffect(() => {
    loadAllUtilizzi();
  }, []);

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Avvia editing
  const startEdit = (utilizzo) => {
    setEditingId(utilizzo._id);
    setEditForm({
      quantitaUtilizzata: utilizzo.quantitaUtilizzata,
      note: utilizzo.note || ''
    });
  };

  // Annulla editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      quantitaUtilizzata: '',
      note: ''
    });
  };

  // Salva modifiche
  const saveEdit = async (utilizzoId) => {
    try {
      setError('');
      
      const updatedData = {
        quantitaUtilizzata: parseInt(editForm.quantitaUtilizzata),
        note: editForm.note
      };

      await apiCall(`/admin/utilizzi/${utilizzoId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      }, token);

      // Ricarica dati
      await loadAllUtilizzi();
      
      // Reset editing
      cancelEdit();
      
      setError('Utilizzo aggiornato con successo');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  // Elimina utilizzo
  const deleteUtilizzo = async (utilizzoId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo utilizzo? Questa azione ripristinerà la quantità del prodotto.')) {
      return;
    }

    try {
      setError('');
      
      await apiCall(`/admin/utilizzi/${utilizzoId}`, {
        method: 'DELETE'
      }, token);

      // Ricarica dati
      await loadAllUtilizzi();
      
      setError('Utilizzo eliminato con successo');
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestione Utilizzi - Vista Admin</h2>
        <p className="text-sm text-gray-600">
          Visualizza, modifica ed elimina gli utilizzi di tutti gli operatori. I filtri ti permettono di concentrarti su specifici utenti e settimane.
        </p>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtri di Ricerca
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Filtro Operatore */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operatore
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.userId}
              onChange={(e) => updateFilters({ userId: e.target.value })}
            >
              <option value="">Tutti gli operatori</option>
              {users.filter(u => u.role === 'user').map(user => (
                <option key={user._id} value={user._id}>
                  {user.username} - {user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Settimana */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Settimana
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.settimanaId}
              onChange={(e) => updateFilters({ settimanaId: e.target.value })}
            >
              <option value="">Tutte le settimane</option>
              {settimane.map(settimana => (
                <option key={settimana._id} value={settimana._id}>
                  {formatWeek(settimana)}
                </option>
              ))}
            </select>
          </div>

          {/* Ricerca per Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cerca Prodotto/Utente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nome prodotto o utente..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Info Filtri Attivi */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Filtri attivi:</span>
          {filters.userId && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Operatore: {users.find(u => u._id === filters.userId)?.username}
            </span>
          )}
          {filters.settimanaId && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              Settimana: {formatWeek(settimane.find(s => s._id === filters.settimanaId))}
            </span>
          )}
          {filters.searchTerm && (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Ricerca: "{filters.searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* Tabella Utilizzi */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Utilizzi Registrati
            {!loading && (
              <span className="ml-2 text-sm text-gray-500">
                ({filteredUtilizzi.length} risultati)
              </span>
            )}
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Caricamento utilizzi...</div>
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
                    Prodotto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantità Utilizzata
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prima/Dopo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Ora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUtilizzi.map(utilizzo => {
                  const isEditing = editingId === utilizzo._id;
                  const dateTime = formatDateTime(utilizzo.dataUtilizzo);
                  
                  return (
                    <tr key={utilizzo._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {utilizzo.userId?.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {utilizzo.userId?.email}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {utilizzo.productId?.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {utilizzo.productId?.categoria}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            value={editForm.quantitaUtilizzata}
                            onChange={(e) => setEditForm({ ...editForm, quantitaUtilizzata: e.target.value })}
                          />
                        ) : (
                          <span className="text-sm font-medium text-red-600">
                            -{utilizzo.quantitaUtilizzata} {utilizzo.productId?.unita}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{utilizzo.quantitaPrimaDellUso} → {utilizzo.quantitaRimasta}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dateTime.date}</div>
                        <div className="text-sm text-gray-500">{dateTime.time}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="Note opzionali..."
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            value={editForm.note}
                            onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                          />
                        ) : (
                          <span className="text-sm text-gray-600">
                            {utilizzo.note || '-'}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => saveEdit(utilizzo._id)}
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
                              onClick={() => startEdit(utilizzo)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifica utilizzo"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUtilizzo(utilizzo._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Elimina utilizzo"
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

            {filteredUtilizzi.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Eye className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">Nessun utilizzo trovato</p>
                <p className="text-sm text-gray-400">
                  {filters.userId || filters.settimanaId || filters.searchTerm
                    ? 'Prova a modificare i filtri per vedere più risultati'
                    : 'Gli utilizzi appariranno qui quando gli operatori useranno i prodotti'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Azioni */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 Azioni Disponibili:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>Modifica:</strong> Cambia la quantità utilizzata e aggiungi note</li>
          <li><strong>Elimina:</strong> Rimuove l'utilizzo e ripristina la quantità nel magazzino</li>
          <li><strong>Filtri:</strong> Usa i filtri per trovare rapidamente utilizzi specifici</li>
        </ul>
      </div>
    </div>
  );
};

export default UtilizziManagement;