// components/admin/AdminPage.js
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppContext } from '../../contexts/AppContext';
import Navigation from '../shared/Navigation';
import UserGiacenzeView from './UserGiacenzeView';
import GiacenzeManagement from './GiacenzeManagement';
import AssignmentsManagement from './AssigmentsManagement';
import AdminStats from './AdminStats';
import UtilizziManagement from './UtilizziManagement';
import OperatoriManagement from './OperatoriManagement';
import ProdottiManagement from './ProdottiManagement';

const AdminPage = () => {
  const { setCurrentPage } = useAuth();
  const { state, dispatch } = useAppContext();
  const { adminView, activeTab } = state;

  const setActiveTab = (tab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation title="Amministrazione Giacenze" />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {adminView === 'user-giacenze' ? (
          <UserGiacenzeView />
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('giacenze')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'giacenze'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestione Giacenze
                </button>
                <button
                  onClick={() => setActiveTab('assegnazioni')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'assegnazioni'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Assegnazioni
                </button>
                <button
                  onClick={() => setActiveTab('utilizzi')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'utilizzi'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestione Utilizzi
                </button>
                <button
                  onClick={() => setActiveTab('operatori')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'operatori'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestione Operatori
                </button>
                <button
                  onClick={() => setActiveTab('prodotti')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'prodotti'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestione Prodotti
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'giacenze' && <GiacenzeManagement />}
            {activeTab === 'assegnazioni' && <AssignmentsManagement />}
            {activeTab === 'utilizzi' && <UtilizziManagement />}
            {activeTab === 'operatori' && <OperatoriManagement />}
            {activeTab === 'prodotti' && <ProdottiManagement />}

            {/* Statistiche Admin */}
            <AdminStats />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;