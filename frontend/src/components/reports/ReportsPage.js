// components/reports/ReportsPage.js
import React, { useEffect } from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { BackButton } from '../shared/Navigation';
import { downloadExcelReport } from '../../services/api';
import { formatWeek } from '../../utils/formatters';

const ReportsPage = () => {
  const { user, token, setCurrentPage, setError } = useAuth();
  const { settimane, poli, mezzi, users } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { reportFilters } = state;

  const updateReportFilters = (updates) => {
    dispatch({ type: 'SET_REPORT_FILTERS', payload: updates });
  };

  const handleDownloadReport = async () => {
    try {
      setError('');
      await downloadExcelReport(reportFilters, token);
      console.log('Report scaricato con successo');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BackButton onClick={() => setCurrentPage('dashboard')} />
              <h1 className="text-xl font-semibold text-gray-800">Report Giacenze</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Genera Report Excel</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Settimana
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={reportFilters.settimanaId}
                onChange={(e) => updateReportFilters({ settimanaId: e.target.value })}
              >
                <option value="">Tutte le settimane</option>
                {settimane.length > 0 ? (
                  settimane.map(settimana => (
                    <option key={settimana._id} value={settimana._id}>
                      {formatWeek(settimana)}
                    </option>
                  ))
                ) : (
                  <option disabled>Caricamento settimane...</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Polo
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={reportFilters.poloId}
                onChange={(e) => updateReportFilters({ poloId: e.target.value })}
              >
                <option value="">Tutti i poli</option>
                {poli.map(polo => (
                  <option key={polo._id} value={polo._id}>
                    {polo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mezzo
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={reportFilters.mezzoId}
                onChange={(e) => updateReportFilters({ mezzoId: e.target.value })}
              >
                <option value="">Tutti i mezzi</option>
                {mezzi.map(mezzo => (
                  <option key={mezzo._id} value={mezzo._id}>
                    {mezzo.nome}
                  </option>
                ))}
              </select>
            </div>

            {user.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utente
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={reportFilters.userId}
                  onChange={(e) => updateReportFilters({ userId: e.target.value })}
                >
                  <option value="">Tutti gli utenti</option>
                  {users.filter(u => u.role === 'user').map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={handleDownloadReport}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center mx-auto"
            >
              <Download className="w-5 h-5 mr-2" />
              Scarica Report Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;