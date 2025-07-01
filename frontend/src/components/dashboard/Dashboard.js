// components/dashboard/Dashboard.js
import React from 'react';
import { 
  Package, 
  Download, 
  Settings, 
  Calendar,
  MapPin,
  Truck,
  UserCheck,
  AlertTriangle,
  Package2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import Navigation from '../shared/Navigation';
import { formatWeek } from '../../utils/formatters';

const Dashboard = () => {
  const { user, setCurrentPage } = useAuth();
  const { myGiacenze, myAssignments, selectedAssignment, setSelectedAssignment } = useGiacenze();

  const giacenzeInScadenza = myGiacenze.filter(g => g.quantitaDisponibile <= g.quantitaMinima);
  const giacenzeOk = myGiacenze.filter(g => g.quantitaDisponibile > g.quantitaMinima);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation title={user?.role === 'admin' ? 'Dashboard Operatore' : 'Giacenze Personali'} />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Lista Assegnazioni */}
        {myAssignments.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Le Tue Assegnazioni</h2>
            <div className="space-y-3">
              {myAssignments.map(assignment => (
                <div 
                  key={assignment._id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAssignment?._id === assignment._id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">
                        {assignment.settimanaId ? formatWeek(assignment.settimanaId) : 'Settimana N/A'}
                      </span>
                      <MapPin className="w-5 h-5 text-green-600" />
                      <span>{assignment.poloId?.nome || 'N/A'}</span>
                      <Truck className="w-5 h-5 text-purple-600" />
                      <span>{assignment.mezzoId?.nome || 'N/A'}</span>
                    </div>
                    {selectedAssignment?._id === assignment._id && (
                      <span className="text-sm text-blue-600 font-medium">Selezionata</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Clicca su un'assegnazione per gestire le giacenze di quella settimana
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Nessuna assegnazione attiva. Contatta l'amministratore.
          </div>
        )}

        {/* Statistiche Giacenze */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{myGiacenze.length}</div>
                <div className="text-sm text-gray-600">Prodotti Assegnati</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-600">{giacenzeOk.length}</div>
                <div className="text-sm text-gray-600">Giacenze OK</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-red-600">{giacenzeInScadenza.length}</div>
                <div className="text-sm text-gray-600">Sotto Soglia</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{myAssignments.length}</div>
                <div className="text-sm text-gray-600">Settimane Assegnate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setCurrentPage('giacenze')}
            className="bg-white hover:bg-gray-50 p-6 rounded-lg shadow-md transition duration-200"
          >
            <Package2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Le Mie Giacenze</h3>
            <p className="text-sm text-gray-600">Scorte personali</p>
            <p className="text-xs text-gray-500 mt-2">{myGiacenze.length} prodotti assegnati</p>
          </button>

          <button
            onClick={() => setCurrentPage('utilizzi')}
            className="bg-white hover:bg-gray-50 p-6 rounded-lg shadow-md transition duration-200"
          >
            <UserCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">I Miei Utilizzi</h3>
            <p className="text-sm text-gray-600">Storico consumi</p>
          </button>

          <button
            onClick={() => setCurrentPage('reports')}
            className="bg-white hover:bg-gray-50 p-6 rounded-lg shadow-md transition duration-200"
          >
            <Download className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Report</h3>
            <p className="text-sm text-gray-600">Scarica Excel</p>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setCurrentPage('admin')}
              className="bg-white hover:bg-gray-50 p-6 rounded-lg shadow-md transition duration-200"
            >
              <Settings className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">Amministrazione</h3>
              <p className="text-sm text-gray-600">Gestisci sistema</p>
            </button>
          )}
        </div>

        {/* Alert Giacenze Sotto Soglia */}
        {giacenzeInScadenza.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-sm font-semibold text-red-800">
                {giacenzeInScadenza.length} prodotti sotto soglia minima
              </h3>
            </div>
            <div className="text-sm text-red-700">
              {giacenzeInScadenza.slice(0, 3).map(g => g.productId?.nome).join(', ')}
              {giacenzeInScadenza.length > 3 && ` e altri ${giacenzeInScadenza.length - 3}...`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;