// components/admin/AssignmentsManagement.js
import React from 'react';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { apiCall } from '../../services/api';
import { formatWeek } from '../../utils/formatters';

const AssignmentsManagement = () => {
  const { token, setError } = useAuth();
  const { users, poli, mezzi, settimane, assegnazioni } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { assegnazioneForm, editAssignmentId, editForm } = state;

  const updateAssegnazioneForm = (updates) => {
    dispatch({ type: 'SET_ASSEGNAZIONE_FORM', payload: updates });
  };

  const setEditAssignmentId = (id) => {
    dispatch({ type: 'SET_EDIT_ASSIGNMENT_ID', payload: id });
  };

  const updateEditForm = (updates) => {
    dispatch({ type: 'SET_EDIT_FORM', payload: updates });
  };

  const handleCreateAssignment = async () => {
    try {
      await apiCall('/assegnazioni', {
        method: 'POST',
        body: JSON.stringify(assegnazioneForm)
      }, token);
      
      const updatedAssegnazioni = await apiCall('/assegnazioni', {}, token);
      dispatch({ type: 'SET_ASSEGNAZIONI', payload: updatedAssegnazioni });
      
      dispatch({ type: 'RESET_ASSEGNAZIONE_FORM' });
    } catch (err) {
      setError('Errore nella creazione assegnazione: ' + err.message);
    }
  };

  const handleUpdateAssignment = async (assignmentId) => {
    try {
      const response = await fetch(`https://giacenze-app-production.up.railway.app/api/assegnazioni/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) throw new Error('Errore nella modifica');

      const updated = await apiCall('/assegnazioni', {}, token);
      dispatch({ type: 'SET_ASSEGNAZIONI', payload: updated });
      setEditAssignmentId(null);
      setError('Assegnazione Modificata');
    } catch (err) {
      setError('Errore nella modifica: ' + err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa assegnazione?')) {
      try {
        const response = await fetch(`https://giacenze-app-production.up.railway.app/api/assegnazioni/${assignmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Errore durante l\'eliminazione');
        }

        const updated = await apiCall('/assegnazioni', {}, token);
        dispatch({ type: 'SET_ASSEGNAZIONI', payload: updated });
        setError('Assegnazione Eliminata');
      } catch (err) {
        setError('Errore nell\'eliminazione: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Nuova Assegnazione */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Crea Nuova Assegnazione</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utente *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={assegnazioneForm.userId}
              onChange={(e) => updateAssegnazioneForm({ userId: e.target.value })}
            >
              <option value="">Seleziona utente</option>
              {users.filter(u => u.role === 'user').map(user => (
                <option key={user._id} value={user._id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Polo *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={assegnazioneForm.poloId}
              onChange={(e) => updateAssegnazioneForm({ poloId: e.target.value })}
            >
              <option value="">Seleziona polo</option>
              {poli.map(polo => (
                <option key={polo._id} value={polo._id}>
                  {polo.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mezzo *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={assegnazioneForm.mezzoId}
              onChange={(e) => updateAssegnazioneForm({ mezzoId: e.target.value })}
            >
              <option value="">Seleziona mezzo</option>
              {mezzi.map(mezzo => (
                <option key={mezzo._id} value={mezzo._id}>
                  {mezzo.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Settimana *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={assegnazioneForm.settimanaId}
              onChange={(e) => updateAssegnazioneForm({ settimanaId: e.target.value })}
            >
              <option value="">Seleziona settimana</option>
              {settimane.map(settimana => (
                <option key={settimana._id} value={settimana._id}>
                  {formatWeek(settimana)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateAssignment}
          disabled={!assegnazioneForm.userId || !assegnazioneForm.poloId || !assegnazioneForm.mezzoId || !assegnazioneForm.settimanaId}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Crea Assegnazione
        </button>
      </div>

      {/* Lista Assegnazioni */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Assegnazioni Attive</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Polo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mezzo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Settimana
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assegnazioni.map(assegnazione => (
                <tr key={assegnazione._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assegnazione.userId?.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assegnazione.poloId?.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assegnazione.mezzoId?.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assegnazione.settimanaId ? formatWeek(assegnazione.settimanaId) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assegnazione.attiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {assegnazione.attiva ? 'Attiva' : 'Disattiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setEditAssignmentId(assegnazione._id);
                          updateEditForm({
                            poloId: assegnazione.poloId?._id || '',
                            mezzoId: assegnazione.mezzoId?._id || '',
                            settimanaId: assegnazione.settimanaId?._id || ''
                          });
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteAssignment(assegnazione._id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form di Modifica */}
                    {editAssignmentId === assegnazione._id && (
                      <div className="bg-gray-100 p-4 rounded mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <select
                            className="border border-gray-300 rounded p-2"
                            value={editForm.poloId}
                            onChange={(e) => {
                              e.preventDefault();
                              updateEditForm({ poloId: e.target.value });
                            }}
                          >
                            <option value="">Seleziona Polo</option>
                            {poli.map(p => (
                              <option key={p._id} value={p._id}>{p.nome}</option>
                            ))}
                          </select>

                          <select
                            className="border border-gray-300 rounded p-2"
                            value={editForm.mezzoId}
                            onChange={(e) => {
                              e.preventDefault();
                              updateEditForm({ mezzoId: e.target.value });
                            }}
                          >
                            <option value="">Seleziona Mezzo</option>
                            {mezzi.map(m => (
                              <option key={m._id} value={m._id}>{m.nome}</option>
                            ))}
                          </select>

                          <select
                            className="border border-gray-300 rounded p-2"
                            value={editForm.settimanaId}
                            onChange={(e) => {
                              e.preventDefault();
                              updateEditForm({ settimanaId: e.target.value });
                            }}
                          >
                            <option value="">Seleziona Settimana</option>
                            {settimane.map(s => (
                              <option key={s._id} value={s._id}>
                                {formatWeek(s)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleUpdateAssignment(assegnazione._id);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Salva
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setEditAssignmentId(null);
                            }}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {assegnazioni.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Settings className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-500">Nessuna assegnazione creata</p>
              <p className="text-sm text-gray-400">Crea la prima assegnazione usando il form sopra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentsManagement;