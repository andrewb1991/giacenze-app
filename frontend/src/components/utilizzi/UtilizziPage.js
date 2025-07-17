// components/utilizzi/UtilizziPage.js
import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, FileText, Calendar, Package, ChevronRight, BarChart3, Clock, User, Eye, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { BackButton } from '../shared/Navigation';
import { formatWeek, formatDateTime } from '../../utils/formatters';

const UtilizziPage = () => {
  const { setCurrentPage } = useAuth();
  const { myAssignments, myUtilizzi, selectedAssignment, loadUtilizzi } = useGiacenze();
  const [selectedWeek, setSelectedWeek] = useState('');
  const [debugData, setDebugData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Stati per raggruppamento utilizzi
  const [groupedUtilizzi, setGroupedUtilizzi] = useState([]);
  
  // Stati per modal dettagli
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUtilizzi, setModalUtilizzi] = useState([]);

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  // Raggruppa utilizzi per prodotto
  useEffect(() => {
    if (myUtilizzi.length > 0) {
      groupUtilizzi(myUtilizzi);
    } else {
      setGroupedUtilizzi([]);
    }
  }, [myUtilizzi]);

  // Raggruppa utilizzi per prodotto
  const groupUtilizzi = (utilizzi) => {
    const grouped = {};
    
    utilizzi.forEach(utilizzo => {
      const key = utilizzo.productId?._id;
      
      if (!grouped[key]) {
        grouped[key] = {
          key,
          productId: utilizzo.productId,
          settimanaId: utilizzo.settimanaId,
          utilizzi: [],
          totalQuantita: 0,
          numeroUtilizzi: 0,
          dataUltimoUtilizzo: utilizzo.dataUtilizzo,
          dataPrimoUtilizzo: utilizzo.dataUtilizzo
        };
      }
      
      grouped[key].utilizzi.push(utilizzo);
      grouped[key].totalQuantita += utilizzo.quantitaUtilizzata;
      grouped[key].numeroUtilizzi += 1;
      
      // Aggiorna date primo e ultimo utilizzo
      if (new Date(utilizzo.dataUtilizzo) > new Date(grouped[key].dataUltimoUtilizzo)) {
        grouped[key].dataUltimoUtilizzo = utilizzo.dataUtilizzo;
      }
      if (new Date(utilizzo.dataUtilizzo) < new Date(grouped[key].dataPrimoUtilizzo)) {
        grouped[key].dataPrimoUtilizzo = utilizzo.dataUtilizzo;
      }
    });

    // Converte in array e ordina per data ultimo utilizzo (più recenti prima)
    const groupedArray = Object.values(grouped).sort((a, b) => 
      new Date(b.dataUltimoUtilizzo) - new Date(a.dataUltimoUtilizzo)
    );
    
    setGroupedUtilizzi(groupedArray);
  };

  // Apri modal dettagli
  const openModal = (group) => {
    setSelectedGroup(group);
    setModalUtilizzi(group.utilizzi.sort((a, b) => new Date(b.dataUtilizzo) - new Date(a.dataUtilizzo)));
    setModalOpen(true);
  };

  // Chiudi modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedGroup(null);
    setModalUtilizzi([]);
  };

  // Trova la settimana selezionata per il display
  const selectedAssignmentInfo = myAssignments.find(a => a._id === selectedWeek);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="glass-button p-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="glass-icon p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">I Miei Utilizzi</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Info */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="glass-icon p-3 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Storico Utilizzi Personali</h2>
              <p className="text-white/70">
                Visualizza i tuoi utilizzi raggruppati per prodotto. Clicca su una riga per vedere i dettagli.
              </p>
            </div>
          </div>
        </div>

        {/* Selettore settimana */}
        {myAssignments.length > 0 && (
          <div className="glass-card p-6 rounded-2xl">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Seleziona Settimana
            </label>
            <select
              className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="" className="bg-gray-800">Seleziona una settimana</option>
              {myAssignments.map(assignment => (
                <option key={assignment._id} value={assignment._id} className="bg-gray-800">
                  {formatWeek(assignment.settimanaId)} - {assignment.poloId?.nome} - {assignment.mezzoId?.nome}
                </option>
              ))}
            </select>
            
            {/* Info settimana selezionata */}
            {selectedAssignmentInfo && (
              <div className="mt-4 glass-info-display p-3 rounded-xl">
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <span>📅 <strong>{formatWeek(selectedAssignmentInfo.settimanaId)}</strong></span>
                  <span>🏢 <strong>{selectedAssignmentInfo.poloId?.nome}</strong></span>
                  <span>🚛 <strong>{selectedAssignmentInfo.mezzoId?.nome}</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabella Utilizzi Raggruppati */}
        {selectedWeek && groupedUtilizzi.length > 0 ? (
          <div className="glass-card-large rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Utilizzi per Prodotto
                <span className="ml-2 text-sm text-white/50">
                  ({groupedUtilizzi.length} prodotti utilizzati)
                </span>
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="glass-table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Prodotto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Totale Utilizzato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      N° Utilizzi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Media per Utilizzo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Periodo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Dettagli
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {groupedUtilizzi.map(group => {
                    const mediaPerUtilizzo = (group.totalQuantita / group.numeroUtilizzi).toFixed(1);
                    const periodoUtilizzo = group.dataPrimoUtilizzo === group.dataUltimoUtilizzo 
                      ? formatDateTime(group.dataUltimoUtilizzo).date
                      : `${formatDateTime(group.dataPrimoUtilizzo).date} - ${formatDateTime(group.dataUltimoUtilizzo).date}`;
                    
                    return (
                      <tr 
                        key={group.key} 
                        className="glass-table-row hover:bg-white/5 transition-all duration-300 cursor-pointer"
                        onClick={() => openModal(group)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="glass-icon-small w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {group.productId?.nome}
                              </div>
                              <div className="text-sm text-white/50">
                                {group.productId?.categoria}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="glass-quantity-badge px-3 py-1 rounded-full">
                            <span className="text-sm font-bold text-red-300">
                              -{group.totalQuantita} {group.productId?.unita}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="glass-count-badge px-2 py-1 rounded-full">
                            <span className="text-sm font-medium text-white">
                              {group.numeroUtilizzi}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/80">
                            {mediaPerUtilizzo} {group.productId?.unita}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-purple-300" />
                            <div className="text-sm text-white">
                              {periodoUtilizzo}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(group);
                            }}
                            className="glass-button p-2 rounded-xl text-blue-300 hover:text-blue-200 hover:scale-105 transition-all duration-300"
                            title="Visualizza dettagli"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedWeek ? (
          <div className="glass-warning-card p-6 rounded-2xl">
            <div className="flex items-center justify-center text-yellow-200">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium">Nessun utilizzo registrato</div>
                <div className="text-sm text-yellow-200/70">Non hai ancora utilizzato prodotti in questa settimana.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-warning-card p-6 rounded-2xl">
            <div className="flex items-center justify-center text-yellow-200">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium">Seleziona una settimana</div>
                <div className="text-sm text-yellow-200/70">Scegli una settimana dal menu sopra per visualizzare i tuoi utilizzi.</div>
              </div>
            </div>
          </div>
        )}

        {/* 🔍 DEBUG VIEW (solo dev) */}
        {debugData && (
          <div className="glass-card p-4 rounded-2xl">
            <pre className="text-xs text-white/70 overflow-auto">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Modal Dettagli Utilizzi */}
      {modalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative glass-modal w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl">
            {/* Header Modal */}
            <div className="glass-modal-header px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="glass-icon p-2 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Dettagli Utilizzi - {selectedGroup.productId?.nome}
                    </h3>
                    <p className="text-white/70">
                      {selectedAssignmentInfo ? formatWeek(selectedAssignmentInfo.settimanaId) : 'Settimana selezionata'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Riepilogo */}
            <div className="glass-modal-summary px-6 py-4 border-b border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-summary-item p-3 rounded-xl text-center">
                  <div className="text-2xl font-bold text-red-300">
                    -{selectedGroup.totalQuantita}
                  </div>
                  <div className="text-xs text-white/60">Totale Utilizzato</div>
                </div>
                <div className="glass-summary-item p-3 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-300">
                    {selectedGroup.numeroUtilizzi}
                  </div>
                  <div className="text-xs text-white/60">Numero Utilizzi</div>
                </div>
                <div className="glass-summary-item p-3 rounded-xl text-center">
                  <div className="text-lg font-bold text-green-300">
                    {(selectedGroup.totalQuantita / selectedGroup.numeroUtilizzi).toFixed(1)}
                  </div>
                  <div className="text-xs text-white/60">Media per Utilizzo</div>
                </div>
                <div className="glass-summary-item p-3 rounded-xl text-center">
                  <div className="text-lg font-bold text-purple-300">
                    {selectedGroup.productId?.unita}
                  </div>
                  <div className="text-xs text-white/60">Unità di Misura</div>
                </div>
              </div>
            </div>

            {/* Lista Dettagliata */}
            <div className="glass-modal-content p-6 overflow-y-auto max-h-96">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Cronologia Utilizzi ({modalUtilizzi.length})
              </h4>
              
              <div className="space-y-3">
                {modalUtilizzi.map(utilizzo => {
                  const dateTime = formatDateTime(utilizzo.dataUtilizzo);
                  
                  return (
                    <div key={utilizzo._id} className="glass-utilizzo-item p-4 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Data/Ora */}
                        <div>
                          <div className="text-xs text-white/60 mb-1">Data/Ora</div>
                          <div className="text-sm text-white">{dateTime.date}</div>
                          <div className="text-xs text-white/50">{dateTime.time}</div>
                        </div>
                        
                        {/* Quantità */}
                        <div>
                          <div className="text-xs text-white/60 mb-1">Quantità Usata</div>
                          <div className="text-sm font-medium text-red-300">
                            -{utilizzo.quantitaUtilizzata} {utilizzo.productId?.unita}
                          </div>
                        </div>
                        
                        {/* Prima/Dopo */}
                        <div>
                          <div className="text-xs text-white/60 mb-1">Prima → Dopo</div>
                          <div className="text-sm text-white">
                            {utilizzo.quantitaPrimaDellUso} → {utilizzo.quantitaRimasta}
                          </div>
                        </div>
                        
                        {/* Note */}
                        <div>
                          <div className="text-xs text-white/60 mb-1">Note</div>
                          <div className="text-sm text-white/70">
                            {utilizzo.note || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="glass-modal-footer px-6 py-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/70">
                  📋 Questa è la cronologia completa dei tuoi utilizzi per questo prodotto
                </div>
                <button
                  onClick={closeModal}
                  className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

        .glass-card-large {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-icon-small {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-button-secondary {
          background: rgba(107, 114, 128, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 114, 128, 0.4);
          color: white;
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

        .glass-info-display {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-warning-card {
          background: rgba(251, 191, 36, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.1);
        }

        .glass-quantity-badge {
          background: rgba(239, 68, 68, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .glass-count-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-table-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-table-row {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
        }

        .glass-modal {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .glass-modal-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-modal-summary {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
        }

        .glass-modal-content {
          background: rgba(255, 255, 255, 0.02);
        }

        .glass-modal-footer {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-summary-item {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-utilizzo-item {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .glass-utilizzo-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
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

        /* Scroll personalizzato per il modal */
        .glass-modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .glass-modal-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .glass-modal-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .glass-modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .glass-modal {
            margin: 1rem;
            max-width: calc(100vw - 2rem);
          }
          
          .glass-modal-content {
            max-height: 60vh;
          }
          
          .glass-utilizzo-item .grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .glass-modal-summary .grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          
          .glass-card {
            padding: 1rem;
          }
          
          .glass-card-large {
            margin: 0 -1rem;
            border-radius: 0;
          }
        }

        /* Animazioni personalizzate */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .glass-table-row {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .glass-table-row:nth-child(1) { animation-delay: 0.1s; }
        .glass-table-row:nth-child(2) { animation-delay: 0.2s; }
        .glass-table-row:nth-child(3) { animation-delay: 0.3s; }
        .glass-table-row:nth-child(4) { animation-delay: 0.4s; }
        .glass-table-row:nth-child(5) { animation-delay: 0.5s; }

        /* Hover effects per i badge */
        .glass-quantity-badge:hover {
          transform: scale(1.05);
          background: rgba(239, 68, 68, 0.3);
        }

        .glass-count-badge:hover {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default UtilizziPage;