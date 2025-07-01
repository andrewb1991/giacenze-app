// components/admin/UserGiacenzeView.js
import React from 'react';
import { Calendar, MapPin, Truck, Plus } from 'lucide-react';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { formatWeek } from '../../utils/formatters';

const UserGiacenzeView = () => {
  const { users, allProducts, allGiacenze, assegnazioni, assignGiacenza } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { selectedUserForGiacenze, giacenzeForm } = state;

  const setSelectedUserForGiacenze = (userId) => {
    dispatch({ type: 'SET_SELECTED_USER_FOR_GIACENZE', payload: userId });
  };

  const setAdminView = (view) => {
    dispatch({ type: 'SET_ADMIN_VIEW', payload: view });
  };

  const updateGiacenzeForm = (updates) => {
    dispatch({ type: 'SET_GIACENZE_FORM', payload: updates });
  };

  const selectedUser = users.find(u => u._id === selectedUserForGiacenze);
  const userAssignments = assegnazioni.filter(a => a.userId?._id === selectedUserForGiacenze);
  const userGiacenze = allGiacenze.filter(g => g.userId?._id === selectedUserForGiacenze);

  const handleAssignGiacenza = () => {
    assignGiacenza(selectedUserForGiacenze, giacenzeForm);
  };

  return (
    <div className="space-y-6">
      {/* Header con info utente */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Gestione Giacenze: {selectedUser?.username}
            </h2>
            <p className="text-sm text-gray-600">
              {selectedUser?.email}
            </p>
          </div>
          <button
            onClick={() => {
              setAdminView('overview');
              setSelectedUserForGiacenze('');
            }}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Torna alla lista utenti
          </button>
        </div>

        {/* Settimane assegnate all'utente */}
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Settimane Assegnate:</h3>
          <div className="space-y-2">
            {userAssignments.map(assignment => (
              <div key={assignment._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{formatWeek(assignment.settimanaId)}</span>
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>{assignment.poloId?.nome}</span>
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>{assignment.mezzoId?.nome}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    assignment.attiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {assignment.attiva ? 'Attiva' : 'Inattiva'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form assegnazione giacenza */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Assegna/Aggiorna Giacenza Prodotto
        </h3>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prodotto *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={giacenzeForm.productId}
                onChange={(e) => updateGiacenzeForm({ productId: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={giacenzeForm.quantitaAssegnata}
                onChange={(e) => updateGiacenzeForm({ quantitaAssegnata: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={giacenzeForm.quantitaMinima}
                onChange={(e) => updateGiacenzeForm({ quantitaMinima: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder="es. 20"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di giacenza
              </label>
              <div className="mb-3">
                <input
                  type="checkbox"
                  id="isGlobal"
                  checked={giacenzeForm.isGlobal !== false}
                  onChange={(e) => updateGiacenzeForm({ isGlobal: e.target.checked })}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="mr-2"
                />
                <label htmlFor="isGlobal" className="text-sm text-gray-700">
                  Giacenza globale (valida per tutte le settimane)
                </label>
              </div>

              {!giacenzeForm.isGlobal && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Settimana specifica
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={giacenzeForm.settimanaId || ''}
                    onChange={(e) => updateGiacenzeForm({ settimanaId: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  >
                    <option value="">Seleziona settimana</option>
                    {userAssignments.map(assignment => (
                      <option key={assignment.settimanaId._id} value={assignment.settimanaId._id}>
                        {formatWeek(assignment.settimanaId)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <input
                  type="checkbox"
                  id="applicaATutteLeSettimane"
                  checked={giacenzeForm.applicaATutteLeSettimane || false}
                  onChange={(e) => updateGiacenzeForm({ applicaATutteLeSettimane: e.target.checked })}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="mr-2"
                  disabled={giacenzeForm.isGlobal}
                />
                <label htmlFor="applicaATutteLeSettimane" className="text-sm text-gray-700">
                  Applica a tutte le settimane assegnate all'utente
                </label>
              </div>

              <div className="mb-3">
                <input
                  type="checkbox"
                  id="aggiungiAlla"
                  checked={giacenzeForm.aggiungiAlla}
                  onChange={(e) => updateGiacenzeForm({ aggiungiAlla: e.target.checked })}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  className="mr-2"
                />
                <label htmlFor="aggiungiAlla" className="text-sm text-gray-700">
                  Aggiungi alla quantità esistente (invece di sostituire)
                </label>
              </div>
            </div>
          </div>
        </form>
        <button
          type="button"
          onClick={handleAssignGiacenza}
          disabled={!giacenzeForm.productId || !giacenzeForm.quantitaAssegnata}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          {giacenzeForm.aggiungiAlla ? 'Ricarica Giacenza' : 'Assegna Giacenza'}
        </button>
      </div>

      {/* Lista giacenze utente */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Giacenze Attuali</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prodotto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantità Assegnata
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userGiacenze.map(giacenza => {
                const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                
                return (
                  <tr key={giacenza._id} className="hover:bg-gray-50">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserGiacenzeView;