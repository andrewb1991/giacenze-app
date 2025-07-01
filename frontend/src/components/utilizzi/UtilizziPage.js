// components/utilizzi/UtilizziPage.js
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { BackButton } from '../shared/Navigation';
import { formatWeek } from '../../utils/formatters';

const UtilizziPage = () => {
  const { setCurrentPage } = useAuth();
  const { myAssignments, myUtilizzi, selectedAssignment, loadUtilizzi } = useGiacenze();
  const [selectedWeek, setSelectedWeek] = useState('');
  const [debugData, setDebugData] = useState(null);

  useEffect(() => {
    if (!selectedWeek && selectedAssignment?._id) {
      setSelectedWeek(selectedAssignment._id);
    }
  }, [selectedAssignment, selectedWeek]);

  useEffect(() => {
    if (selectedWeek) {
      loadUtilizzi(selectedWeek);
    }
  }, [selectedWeek]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BackButton onClick={() => setCurrentPage('dashboard')} />
              <h1 className="text-xl font-semibold text-gray-800">I Miei Utilizzi</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Selettore settimana */}
        {myAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Settimana
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="">Seleziona una settimana</option>
              {myAssignments.map(assignment => (
                <option key={assignment._id} value={assignment._id}>
                  {formatWeek(assignment.settimanaId)} - {assignment.poloId?.nome} - {assignment.mezzoId?.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabella o fallback */}
        {selectedWeek && myUtilizzi.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantità Usata</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rimasta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Ora</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myUtilizzi.map(utilizzo => (
                  <tr key={utilizzo._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {utilizzo.productId?.nome || 'N/D'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {utilizzo.productId?.categoria || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      -{utilizzo.quantitaUtilizzata} {utilizzo.productId?.unita}
                    </td>
                    <td className="px-6 py-4">{utilizzo.quantitaPrimaDellUso ?? 'N/A'}</td>
                    <td className="px-6 py-4">{utilizzo.quantitaRimasta ?? 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div>{new Date(utilizzo.dataUtilizzo).toLocaleDateString('it-IT')}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(utilizzo.dataUtilizzo).toLocaleTimeString('it-IT')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedWeek ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Nessun utilizzo registrato per questa settimana.
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Seleziona una settimana per visualizzare gli utilizzi.
          </div>
        )}

        {/* 🔍 DEBUG VIEW (solo dev) */}
        {debugData && (
          <pre className="mt-6 text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default UtilizziPage;