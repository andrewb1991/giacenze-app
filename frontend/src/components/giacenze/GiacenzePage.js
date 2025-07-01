// components/giacenze/GiacenzePage.js
import React, { useState } from 'react';
import { 
  Calendar,
  MapPin,
  Truck,
  AlertTriangle,
  Search,
  Package2,
  Minus,
  Plus
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import Navigation, { BackButton } from '../shared/Navigation';
import { formatWeek, calculatePercentage, getProgressBarColor } from '../../utils/formatters';

const GiacenzePage = () => {
  const { setCurrentPage } = useAuth();
  const { myGiacenze, myAssignments, selectedAssignment, setSelectedAssignment, useProduct, addProduct } = useGiacenze();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGiacenze = myGiacenze.filter(giacenza =>
    giacenza.productId?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BackButton onClick={() => setCurrentPage('dashboard')} />
              <h1 className="text-xl font-semibold text-gray-800">Le Mie Giacenze</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Selettore Settimana */}
        {myAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Settimana
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedAssignment?._id || ''}
              onChange={(e) => {
                const assignment = myAssignments.find(a => a._id === e.target.value);
                setSelectedAssignment(assignment);
              }}
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

        {!selectedAssignment && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Seleziona una settimana per visualizzare e gestire le giacenze.
          </div>
        )}

        {selectedAssignment && (
          <>
            {/* Info Settimana Selezionata */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Settimana Selezionata:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatWeek(selectedAssignment.settimanaId)}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedAssignment.poloId?.nome}
                </div>
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  {selectedAssignment.mezzoId?.nome}
                </div>
              </div>
            </div>

            {/* Barra di ricerca */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca nelle tue giacenze..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Lista Giacenze */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGiacenze.map(giacenza => {
                const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                const percentualeRimasta = calculatePercentage(giacenza.quantitaDisponibile, giacenza.quantitaAssegnata);
                
                return (
                  <GiacenzaCard
                    key={giacenza._id}
                    giacenza={giacenza}
                    isSottoSoglia={isSottoSoglia}
                    percentualeRimasta={percentualeRimasta}
                    onUseProduct={useProduct}
                    onAddProduct={addProduct}
                  />
                );
              })}
            </div>

            {filteredGiacenze.length === 0 && (
              <div className="text-center py-8">
                <Package2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Nessun prodotto trovato con i criteri di ricerca' : 'Nessun prodotto assegnato per questa settimana'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const GiacenzaCard = ({ giacenza, isSottoSoglia, percentualeRimasta, onUseProduct, onAddProduct }) => {
                    const canAdd = giacenza.quantitaDisponibile < giacenza.quantitaAssegnata;
                const maxAddable = giacenza.quantitaAssegnata - giacenza.quantitaDisponibile;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
      isSottoSoglia ? 'border-red-500' : 'border-green-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {giacenza.productId?.nome}
          </h3>
          <p className="text-sm text-gray-600">{giacenza.productId?.categoria}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isSottoSoglia ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {isSottoSoglia ? 'SOTTO SOGLIA' : 'OK'}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Disponibile:</span>
          <span className={`text-sm font-medium ${
            isSottoSoglia ? 'text-red-600' : 'text-gray-900'
          }`}>
            {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Assegnata:</span>
          <span className="text-sm font-medium text-gray-900">
            {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Soglia minima:</span>
          <span className="text-sm font-medium text-gray-900">
            {giacenza.quantitaMinima} {giacenza.productId?.unita}
          </span>
        </div>

        {/* Barra progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(percentualeRimasta)}`}
            style={{ width: `${Math.max(percentualeRimasta, 5)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          {percentualeRimasta.toFixed(0)}% della quantità assegnata
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 mb-2">
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Usa prodotto:</span>
          <button
            onClick={() => onUseProduct(giacenza.productId._id, 1)}
            disabled={giacenza.quantitaDisponibile <= 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4 mr-1" />
            1
          </button>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Reintegra prodotto:</span>
          <button
  onClick={() => onAddProduct(giacenza.productId._id, 1)}
  disabled={!canAdd}
  className={`px-4 py-2 rounded-lg transition duration-200 flex items-center ${
    canAdd 
      ? 'bg-green-600 hover:bg-green-700 text-white' 
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`}
>
            <Plus className="w-4 h-4 mr-1" />
            1
          </button>
        </div>
      </div>

      {giacenza.note && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <strong>Note:</strong> {giacenza.note}
        </div>
      )}
    </div>
  );
};

export default GiacenzePage;