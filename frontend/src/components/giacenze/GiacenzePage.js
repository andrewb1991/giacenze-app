// components/giacenze/GiacenzePage.js
import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  MapPin,
  Truck,
  AlertTriangle,
  Search,
  Package2,
  Minus,
  Plus,
  ArrowLeft,
  Package
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import Navigation, { BackButton } from '../shared/Navigation';
import { formatWeek, formatWeekRange, calculatePercentage, getProgressBarColor, getCurrentWeekAssignment, sortAssignmentsByCurrentWeekFirst } from '../../utils/formatters';
import { apiCall } from '../../services/api';

const GiacenzePage = () => {
  const { setCurrentPage, token } = useAuth();
  const { myGiacenze, myUtilizzi, loadUtilizzi, myAssignments, selectedAssignment, setSelectedAssignment, useProduct, addProduct } = useGiacenze();
  const [searchTerm, setSearchTerm] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Stati per postazioni
  const [selectedPostazione, setSelectedPostazione] = useState('');
  const [availablePostazioni, setAvailablePostazioni] = useState([]);
  const [loadingPostazioni, setLoadingPostazioni] = useState(false);

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set default assignment to current week when assignments are loaded
  useEffect(() => {
    if (myAssignments.length > 0 && !selectedAssignment) {
      const currentAssignment = getCurrentWeekAssignment(myAssignments);
      if (currentAssignment) {
        setSelectedAssignment(currentAssignment);
      }
    }
  }, [myAssignments, selectedAssignment, setSelectedAssignment]);

  // Carica postazioni quando cambia l'assegnazione selezionata
  useEffect(() => {
    if (selectedAssignment) {
      loadPostazioni();
    }
  }, [selectedAssignment]);

  // Load utilizzi when assignment or postazione changes
  useEffect(() => {
    if (selectedAssignment?._id && selectedPostazione) {
      console.log('🔄 Caricando utilizzi per:', {
        settimanaId: selectedAssignment._id,
        postazioneId: selectedPostazione
      });
      loadUtilizzi(selectedAssignment._id, selectedPostazione);
    }
  }, [selectedAssignment?._id, selectedPostazione]);

  // Carica postazioni filtrate per polo dell'assegnazione selezionata
  const loadPostazioni = async () => {
    try {
      setLoadingPostazioni(true);
      setSelectedPostazione(''); // Reset postazione selezionata
      
      if (!selectedAssignment || !selectedAssignment.poloId?._id) {
        console.log('🏢 Nessun polo trovato per questa settimana');
        setAvailablePostazioni([]);
        return;
      }

      console.log('🔍 Caricamento postazioni per polo:', selectedAssignment.poloId.nome);
      
      // Carica postazioni del polo
      const postazioni = await apiCall(`/postazioni/polo/${selectedAssignment.poloId._id}`, {}, token);
      
      console.log('🏢 Postazioni caricate:', postazioni.length);
      setAvailablePostazioni(postazioni || []);
      
    } catch (error) {
      console.error('❌ Errore caricamento postazioni:', error);
      setAvailablePostazioni([]);
    } finally {
      setLoadingPostazioni(false);
    }
  };

  // Sort assignments with current week first
  const sortedAssignments = sortAssignmentsByCurrentWeekFirst(myAssignments);

  // Filtra giacenze per ricerca e postazione selezionata
  const filteredGiacenze = myGiacenze.filter(giacenza => {
    const matchesSearch = giacenza.productId?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    // Per ora mostriamo tutte le giacenze se non è selezionata una postazione
    // In futuro si potrebbe filtrare per postazione se le giacenze avessero questo campo
    return matchesSearch;
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Interactive Light Effect */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-white/20 to-transparent rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass-nav border-b border-white/10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="glass-button p-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="glass-icon p-3 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Le Mie Giacenze</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Selettore Settimana */}
        {myAssignments.length > 0 && (
          <div className="glass-card p-6 rounded-2xl">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Seleziona Settimana
            </label>
            <select
              className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
              value={selectedAssignment?._id || ''}
              onChange={(e) => {
                const assignment = myAssignments.find(a => a._id === e.target.value);
                setSelectedAssignment(assignment);
              }}
            >
              <option value="" className="bg-gray-800">Seleziona una settimana</option>
              {sortedAssignments.map((assignment, index) => {
                const isCurrentWeek = index === 0 && getCurrentWeekAssignment(myAssignments)?._id === assignment._id;
                return (
                  <option key={assignment._id} value={assignment._id} className="bg-gray-800">
                    {isCurrentWeek ? '📅 ' : ''}{formatWeekRange(assignment.settimanaId, assignment.settimanaFineId)}{isCurrentWeek ? ' (Corrente)' : ''} - {assignment.poloId?.nome} - {assignment.mezzoId?.nome}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Selettore Postazione */}
        {selectedAssignment && (
          <div className="glass-card p-6 rounded-2xl">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Seleziona Postazione
              {loadingPostazioni && (
                <div className="ml-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </label>
            
            {availablePostazioni.length > 0 ? (
              <>
                <select
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={selectedPostazione}
                  onChange={(e) => setSelectedPostazione(e.target.value)}
                  disabled={loadingPostazioni}
                >
                  <option value="" className="bg-gray-800">Seleziona una postazione</option>
                  {availablePostazioni.map(postazione => (
                    <option key={postazione._id} value={postazione._id} className="bg-gray-800">
                      {postazione.nome} - {postazione.indirizzo || 'Nessun indirizzo'}
                    </option>
                  ))}
                </select>
                
                {/* Info postazione selezionata */}
                {selectedPostazione && (
                  <div className="mt-4 glass-info-card p-3 rounded-xl">
                    <div className="text-sm text-white/80">
                      {(() => {
                        const postazione = availablePostazioni.find(p => p._id === selectedPostazione);
                        return postazione ? (
                          <div className="flex items-center space-x-4">
                            <span>🏢 <strong>{postazione.nome}</strong></span>
                            {postazione.indirizzo && <span>📍 {postazione.indirizzo}</span>}
                            {postazione.capacitaPersone && <span>👥 {postazione.capacitaPersone} persone</span>}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
              </>
            ) : loadingPostazioni ? (
              <div className="glass-info-card p-4 rounded-xl text-center">
                <div className="text-white/70">Caricamento postazioni...</div>
              </div>
            ) : (
              <div className="glass-warning-card p-4 rounded-xl">
                <div className="flex items-center text-yellow-200">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <div>
                    <div className="font-medium">Nessuna postazione disponibile</div>
                    <div className="text-sm text-yellow-200/70">
                      Non ci sono postazioni configurate per il polo di questa settimana.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedAssignment && (
          <div className="glass-warning-card p-4 rounded-2xl">
            <div className="flex items-center text-yellow-200">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>Seleziona una settimana per visualizzare e gestire le giacenze.</span>
            </div>
          </div>
        )}

        {selectedAssignment && selectedPostazione && (
          <>
            {/* Info Settimana e Postazione Selezionate */}
            <div className="glass-info-card p-6 rounded-2xl">
              <h3 className="font-semibold text-white mb-4">Informazioni Selezione:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-white/90">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-300" />
                  <span>{formatWeekRange(selectedAssignment.settimanaId, selectedAssignment.settimanaFineId)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-300" />
                  <span>{selectedAssignment.poloId?.nome}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-purple-300" />
                  <span>{selectedAssignment.mezzoId?.nome}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package2 className="w-4 h-4 text-orange-300" />
                  <span>{availablePostazioni.find(p => p._id === selectedPostazione)?.nome}</span>
                </div>
              </div>
            </div>

            {/* Barra di ricerca */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cerca nelle tue giacenze..."
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Lista Giacenze */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGiacenze.map(giacenza => {
                const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                const percentualeRimasta = calculatePercentage(giacenza.quantitaDisponibile, giacenza.quantitaAssegnata);
                
                // Debug generale per capire la situazione (solo prima card)
                if (filteredGiacenze.indexOf(giacenza) === 0) {
                  console.log("🔍 Debug generale:", {
                    prodottoNome: giacenza.productId?.nome,
                    productIdGiacenza: giacenza.productId?._id,
                    totalUtilizzi: myUtilizzi?.length || 0,
                    selectedAssignmentId: selectedAssignment?._id,
                    selectedPostazione: selectedPostazione,
                    firstUtilizzo: myUtilizzi?.[0],
                    primi3Utilizzi: myUtilizzi?.slice(0, 3).map(u => ({
                      productId: u.productId?._id || u.productId,
                      productName: u.productId?.nome,
                      settimanaId: u.settimanaId?._id || u.settimanaId,
                      postazioneId: u.postazioneId?._id || u.postazioneId
                    }))
                  });

                  // Test diretto API utilizzi
                  if (myUtilizzi?.length === 0) {
                    console.log("🧪 Test chiamata diretta API utilizzi...");
                    apiCall('/utilizzi/my', {}, token).then(result => {
                      console.log("📡 Risultato chiamata diretta:", result);
                    }).catch(error => {
                      console.error("❌ Errore chiamata diretta:", error);
                    });
                  }
                }


                // Calcola utilizzi per questo prodotto
                const utilizziProdotto = myUtilizzi.filter(u =>
                  u.productId?._id === giacenza.productId?._id
                );

                return (
                  <GiacenzaCard
                    key={giacenza._id}
                    giacenza={giacenza}
                    isSottoSoglia={isSottoSoglia}
                    percentualeRimasta={percentualeRimasta}
                    utilizziCount={utilizziProdotto.length}
                    onUseProduct={(productId, quantity) => useProduct(productId, quantity, selectedPostazione)}
                    onAddProduct={(productId, quantity) => addProduct(productId, quantity, selectedPostazione)}
                  />
                );
              })}
            </div>

            {filteredGiacenze.length === 0 && (
              <div className="text-center py-12">
                <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                  <Package2 className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-white/70 text-lg">
                  {searchTerm ? 'Nessun prodotto trovato con i criteri di ricerca' : 'Nessun prodotto assegnato per questa settimana e postazione'}
                </p>
              </div>
            )}
          </>
        )}

        {selectedAssignment && !selectedPostazione && availablePostazioni.length > 0 && (
          <div className="glass-warning-card p-6 rounded-2xl">
            <div className="flex items-center justify-center text-yellow-200">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium">Seleziona una postazione</div>
                <div className="text-sm text-yellow-200/70">
                  Scegli una postazione dal menu sopra per visualizzare e gestire le tue giacenze.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-nav {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .glass-card-interactive {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .glass-card-interactive:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .glass-warning-card {
          background: rgba(251, 191, 36, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.1);
        }

        .glass-info-card {
          background: rgba(59, 130, 246, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
        }

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-input-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }


        .glass-input {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

const GiacenzaCard = ({ giacenza, isSottoSoglia, percentualeRimasta, utilizziCount = 0, onUseProduct, onAddProduct }) => {
  const canAdd = giacenza.quantitaDisponibile < giacenza.quantitaAssegnata;

  return (
    <div className="glass-card-interactive p-6 rounded-2xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {giacenza.productId?.nome}
          </h3>
          <p className="text-sm text-white/60">{giacenza.productId?.categoria}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {/* Badge utilizzi */}
          <div className="glass-utilizzi-badge px-3 py-1 rounded-full flex items-center space-x-2">
            <Package className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-xs font-medium text-white">
              {utilizziCount} utilizzi
            </span>
          </div>

          {/* Badge stato */}
          <span className={`glass-status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            isSottoSoglia
              ? 'text-red-200 border-red-300/30 bg-red-400/20'
              : 'text-green-200 border-green-300/30 bg-green-400/20'
          }`}>
            {isSottoSoglia ? 'SOTTO SOGLIA' : 'OK'}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-white/70">Disponibile:</span>
          <span className={`text-sm font-medium ${
            isSottoSoglia ? 'text-red-300' : 'text-white'
          }`}>
            {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-white/70">Assegnata:</span>
          <span className="text-sm font-medium text-white">
            {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-white/70">Soglia minima:</span>
          <span className="text-sm font-medium text-white">
            {giacenza.quantitaMinima} {giacenza.productId?.unita}
          </span>
        </div>

        {/* Barra progresso */}
        <div className="glass-progress-container rounded-full h-3 overflow-hidden">
          <div 
            className={`glass-progress-fill h-full rounded-full transition-all duration-500 ${
              percentualeRimasta > 50 
                ? 'bg-gradient-to-r from-green-400 to-green-500' 
                : percentualeRimasta > 25 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                : 'bg-gradient-to-r from-red-400 to-red-500'
            }`}
            style={{ width: `${Math.max(percentualeRimasta, 5)}%` }}
          ></div>
        </div>
        <div className="text-xs text-white/60 text-center">
          {percentualeRimasta.toFixed(0)}% della quantità assegnata
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 space-x-4">
        <div className="flex flex-col flex-1">
          <span className="text-xs text-white/70 mb-2">Usa prodotto:</span>
          <button
            onClick={() => onUseProduct(giacenza.productId._id, 1)}
            disabled={giacenza.quantitaDisponibile <= 0}
            className="glass-button-danger px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
            <span>1</span>
          </button>
        </div>
        
        <div className="flex flex-col flex-1">
          <span className="text-xs text-white/70 mb-2">Reintegra:</span>
          <button
            onClick={() => onAddProduct(giacenza.productId._id, 1)}
            disabled={!canAdd}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
              canAdd 
                ? 'glass-button-success text-white hover:scale-105' 
                : 'glass-button-disabled text-white/50 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>1</span>
          </button>
        </div>
      </div>

      {giacenza.note && (
        <div className="mt-4 glass-note-container p-3 rounded-xl">
          <div className="text-xs text-white/80">
            <strong>Note:</strong> {giacenza.note}
          </div>
        </div>
      )}

      <style jsx>{`
        .glass-utilizzi-badge {
          background: rgba(59, 130, 246, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }

        .glass-utilizzi-badge:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: scale(1.05);
        }

        .glass-status-badge {
          backdrop-filter: blur(10px);
        }

        .glass-progress-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-progress-fill {
          backdrop-filter: blur(5px);
        }

        .glass-button-danger {
          background: rgba(239, 68, 68, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .glass-button-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.4);
        }

        .glass-button-success {
          background: rgba(34, 197, 94, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        .glass-button-success:hover {
          background: rgba(34, 197, 94, 0.4);
        }

        .glass-button-disabled {
          background: rgba(107, 114, 128, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(107, 114, 128, 0.3);
        }

        .glass-note-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default GiacenzePage;