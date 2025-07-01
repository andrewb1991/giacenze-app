// components/admin/ProdottiManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, Search, Filter, Tag } from 'lucide-react';
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

  // Filtra prodotti
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

  // Ottieni categorie uniche
  const categorieUniche = [...new Set(prodotti.map(p => p.categoria).filter(Boolean))];

  // Reset form nuovo prodotto
  const resetAddForm = () => {
    setAddForm({
      nome: '',
      descrizione: '',
      categoria: '',
      unita: 'pz',
      attivo: true
    });
    setShowAddForm(false);
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
      resetAddForm();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Gestione Prodotti</h2>
            <p className="text-sm text-gray-600">
              Crea, modifica ed elimina prodotti del catalogo. Gestisci categorie e unità di misura.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Prodotto
          </button>
        </div>
      </div>

      {/* Form Nuovo Prodotto */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Crea Nuovo Prodotto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Prodotto *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={addForm.nome}
                onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
                placeholder="es. Guanti in lattice"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={addForm.categoria}
                onChange={(e) => setAddForm({ ...addForm, categoria: e.target.value })}
                placeholder="es. DPI, Pulizia, Igiene"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unità di Misura
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={addForm.unita}
                onChange={(e) => setAddForm({ ...addForm, unita: e.target.value })}
              >
                {unitaMisura.map(unita => (
                  <option key={unita.value} value={unita.value}>
                    {unita.label} ({unita.value})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stato
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={addForm.attivo}
                onChange={(e) => setAddForm({ ...addForm, attivo: e.target.value === 'true' })}
              >
                <option value="true">Attivo</option>
                <option value="false">Disattivo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={addForm.descrizione}
                onChange={(e) => setAddForm({ ...addForm, descrizione: e.target.value })}
                placeholder="Descrizione dettagliata del prodotto..."
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCreateProdotto}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Crea Prodotto
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

      {/* Filtri */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtri Prodotti
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.categoria}
              onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            >
              <option value="">Tutte le categorie</option>
              {categorieUniche.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stato
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.attivo}
              onChange={(e) => setFilters({ ...filters, attivo: e.target.value })}
            >
              <option value="all">Tutti i prodotti</option>
              <option value="true">Solo attivi</option>
              <option value="false">Solo disattivi</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cerca Prodotto
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nome o descrizione..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-800">{prodotti.length}</div>
              <div className="text-sm text-gray-600">Totale Prodotti</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Tag className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {prodotti.filter(p => p.attivo).length}
              </div>
              <div className="text-sm text-gray-600">Prodotti Attivi</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-red-600">
                {prodotti.filter(p => !p.attivo).length}
              </div>
              <div className="text-sm text-gray-600">Prodotti Disattivi</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Tag className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{categorieUniche.length}</div>
              <div className="text-sm text-gray-600">Categorie</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabella Prodotti */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Lista Prodotti ({filteredProdotti.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Caricamento prodotti...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prodotto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
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
                {filteredProdotti.map(prodotto => {
                  const isEditing = editingId === prodotto._id;
                  
                  return (
                    <tr key={prodotto._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              value={editForm.nome}
                              onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                              placeholder="Nome prodotto"
                            />
                            <textarea
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              rows="2"
                              value={editForm.descrizione}
                              onChange={(e) => setEditForm({ ...editForm, descrizione: e.target.value })}
                              placeholder="Descrizione"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {prodotto.nome}
                            </div>
                            {prodotto.descrizione && (
                              <div className="text-sm text-gray-500">
                                {prodotto.descrizione}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            value={editForm.categoria}
                            onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                          />
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {prodotto.categoria}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            value={editForm.unita}
                            onChange={(e) => setEditForm({ ...editForm, unita: e.target.value })}
                          >
                            {unitaMisura.map(unita => (
                              <option key={unita.value} value={unita.value}>
                                {unita.value}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-gray-900">{prodotto.unita}</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            value={editForm.attivo}
                            onChange={(e) => setEditForm({ ...editForm, attivo: e.target.value === 'true' })}
                          >
                            <option value="true">Attivo</option>
                            <option value="false">Disattivo</option>
                          </select>
                        ) : (
                          <button
                            onClick={() => toggleAttivo(prodotto._id, prodotto.attivo)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              prodotto.attivo 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } transition-colors cursor-pointer`}
                          >
                            {prodotto.attivo ? 'Attivo' : 'Disattivo'}
                          </button>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(prodotto.createdAt)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => saveEdit(prodotto._id)}
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
                              onClick={() => startEdit(prodotto)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifica prodotto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProdotto(prodotto._id, prodotto.nome)}
                              className="text-red-600 hover:text-red-900"
                              title="Elimina prodotto"
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

            {filteredProdotti.length === 0 && !loading && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nessun prodotto trovato</p>
                <p className="text-sm text-gray-400">
                  {filters.categoria || filters.searchTerm || filters.attivo !== 'all'
                    ? 'Prova a modificare i filtri per vedere più risultati'
                    : 'Clicca "Nuovo Prodotto" per iniziare'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdottiManagement;