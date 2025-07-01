// components/admin/GiacenzeManagement.js
import React from 'react';
import { Plus, Users, ChevronRight, Package2 } from 'lucide-react';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { calculatePercentage, formatDate } from '../../utils/formatters';

const GiacenzeManagement = () => {
  const { users, allProducts, allGiacenze, assegnazioni, assignGiacenza } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { selectedUser, giacenzeForm } = state;

  const setSelectedUser = (userId) => {
    dispatch({ type: 'SET_SELECTED_USER', payload: userId });
  };

  const setSelectedUserForGiacenze = (userId) => {
    dispatch({ type: 'SET_SELECTED_USER_FOR_GIACENZE', payload: userId });
  };

  const setAdminView = (view) => {
    dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
  };

  const updateGiacenzeForm = (updates) => {
    dispatch({ type: 'SET_GIACENZE_FORM', payload: updates });
  };

  const handleAssignGiacenza = () => {
    assignGiacenza(selectedUser, giacenzeForm);
  };

  return (
    <div className="space-y-6">
      {/* Gestione Giacenze Utenti */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestione Giacenze Utenti</h2>
        <p className="text-sm text-gray-600 mb-4">
          Seleziona un utente per gestire le sue giacenze personali e vedere le settimane assegnate
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.filter(u => u.role === 'user').map(user => {
            const userGiacenzeCount = allGiacenze.filter(g => g.userId?._id === user._id).length;
            const userAssignmentsCount = assegnazioni.filter(a => a.userId?._id === user._id).length;
            const criticalCount = allGiacenze.filter(g => 
              g.userId?._id === user._id && g.quantitaDisponibile <= g.quantitaMinima
            ).length;
            
            return (
              <button
                key={user._id}
                onClick={() => {
                  setSelectedUserForGiacenze(user._id);
                  setAdminView('user-giacenze');
                }}
                className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{user.username}</h3>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-gray-700">{userGiacenzeCount}</div>
                    <div className="text-gray-500">Prodotti</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-700">{userAssignmentsCount}</div>
                    <div className="text-gray-500">Settimane</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${criticalCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {criticalCount}
                    </div>
                    <div className="text-gray-500">Critici</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Assegnazione Giacenza Veloce */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Assegnazione Veloce Giacenza
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utente *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Seleziona utente</option>
              {users.filter(u => u.role === 'user').map(user => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prodotto *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={giacenzeForm.productId}
              onChange={(e) => updateGiacenzeForm({ productId: e.target.value })}
            >
              <option value="">Seleziona prodotto</option>
              {allProducts.map(product => (
                <option key={product._id} value={product._id}>
                  {product.nome} ({product.categoria})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantità *
            </label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={giacenzeForm.quantitaAssegnata}
              onChange={(e) => updateGiacenzeForm({ quantitaAssegnata: e.target.value })}
              placeholder="es. 100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Soglia Minima
            </label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={giacenzeForm.quantitaMinima}
              onChange={(e) => updateGiacenzeForm({ quantitaMinima: e.target.value })}
              placeholder="es. 20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={giacenzeForm.note}
              onChange={(e) => updateGiacenzeForm({ note: e.target.value })}
              placeholder="Note opzionali per l'assegnazione"
            />
          </div>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="aggiungiAlla"
            checked={giacenzeForm.aggiungiAlla}
            onChange={(e) => updateGiacenzeForm({ aggiungiAlla: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="aggiungiAlla" className="text-sm text-gray-700">
            Aggiungi alla quantità esistente (invece di sostituire)
          </label>
        </div>

        <button
          onClick={handleAssignGiacenza}
          disabled={!selectedUser || !giacenzeForm.productId || !giacenzeForm.quantitaAssegnata}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          {giacenzeForm.aggiungiAlla ? 'Ricarica Giacenza' : 'Assegna/Aggiorna Giacenza'}
        </button>
      </div>

      {/* Lista Giacenze Globale */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Tutte le Giacenze</h2>
          <p className="text-sm text-gray-600">Panoramica completa delle giacenze di tutti gli operatori</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prodotto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assegnata
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponibile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Soglia Min
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Assegnazione
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allGiacenze.map(giacenza => {
                const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                const percentualeRimasta = calculatePercentage(giacenza.quantitaDisponibile, giacenza.quantitaAssegnata);
                
                return (
                  <tr key={giacenza._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {giacenza.userId?.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {giacenza.userId?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {giacenza.productId?.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {giacenza.productId?.categoria}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        isSottoSoglia ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className={`h-1 rounded-full ${
                            percentualeRimasta <= 20 ? 'bg-red-500' : 
                            percentualeRimasta <= 40 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.max(percentualeRimasta, 5)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {giacenza.quantitaMinima} {giacenza.productId?.unita}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isSottoSoglia ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isSottoSoglia ? 'CRITICO' : 'OK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(giacenza.dataAssegnazione)}
                      </div>
                      <div className="text-sm text-gray-500">
                        da {giacenza.assegnatoDa?.username}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {allGiacenze.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Package2 className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500">Nessuna giacenza assegnata</p>
              <p className="text-sm text-gray-400">Usa il form sopra per assegnare prodotti agli operatori</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiacenzeManagement;