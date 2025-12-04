// components/utilizzi/UtilizziPage.js
import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, FileText, Calendar, Package, ChevronRight, BarChart3, Clock, User, Eye, X, MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useModalAnimation, useStaggerAnimation } from '../../hooks/useModalAnimation';
import { BackButton } from '../shared/Navigation';
import { formatWeek, formatWeekRange, formatDateTime, getCurrentWeekAssignment, sortAssignmentsByCurrentWeekFirst } from '../../utils/formatters';
import { apiCall } from '../../services/api';

const UtilizziPage = () => {
  const { setCurrentPage } = useAuth();
  const { myAssignments, myUtilizzi, selectedAssignment, loadUtilizzi } = useGiacenze();
  const { token } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedPostazione, setSelectedPostazione] = useState('');
  const [availablePostazioni, setAvailablePostazioni] = useState([]);
  const [loadingPostazioni, setLoadingPostazioni] = useState(false);
  const [debugData, setDebugData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Stati per raggruppamento utilizzi
  const [groupedUtilizzi, setGroupedUtilizzi] = useState([]);

  // Stati per sorting
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: 'asc'
  });

  // Stati per modal dettagli
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUtilizzi, setModalUtilizzi] = useState([]);
  
  // Hook per animazioni modal
  const modalAnimation = useModalAnimation(modalOpen, () => {
    setSelectedGroup(null);
    setModalUtilizzi([]);
  });
  
  // Hook per animazioni stagger degli utilizzi nel modal
  const staggerAnimation = useStaggerAnimation(modalUtilizzi, modalOpen, 75);

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set default week to current week when assignments are loaded
  useEffect(() => {
    if (myAssignments.length > 0 && !selectedWeek) {
      const currentAssignment = getCurrentWeekAssignment(myAssignments);
      if (currentAssignment) {
        setSelectedWeek(currentAssignment._id);
      }
    }
  }, [myAssignments, selectedWeek]);

  useEffect(() => {
    if (!selectedWeek && selectedAssignment?._id) {
      setSelectedWeek(selectedAssignment._id);
    }
  }, [selectedAssignment, selectedWeek]);

  useEffect(() => {
    if (selectedWeek === 'all') {
      // Se "Tutte le settimane" è selezionato, carica tutti gli utilizzi
      setAvailablePostazioni([]);
      setSelectedPostazione('all');
      loadUtilizzi(null, 'all'); // null = tutte le settimane, 'all' = tutte le postazioni
    } else if (selectedWeek) {
      loadUtilizzi(selectedWeek);
      loadPostazioni(selectedWeek);
    }
  }, [selectedWeek]);

  // Ricarica utilizzi quando cambia la postazione selezionata
  useEffect(() => {
    if (selectedWeek === 'all') {
      // Per "Tutte le settimane" carica sempre tutti gli utilizzi
      loadUtilizzi(null, 'all');
    } else if (selectedWeek && selectedPostazione) {
      console.log('📍 Caricamento utilizzi per postazione:', selectedPostazione);
      loadUtilizzi(selectedWeek, selectedPostazione);
    }
  }, [selectedPostazione]);

  // Carica postazioni filtrate per polo della settimana selezionata
  const loadPostazioni = async (weekId) => {
    try {
      setLoadingPostazioni(true);
      setSelectedPostazione(''); // Reset postazione selezionata
      
      // Trova l'assegnazione per ottenere il polo
      const assignment = myAssignments.find(a => a._id === weekId);
      if (!assignment || !assignment.poloId?._id) {
        console.log('🏢 Nessun polo trovato per questa settimana');
        setAvailablePostazioni([]);
        return;
      }

      console.log('🔍 Caricamento postazioni per polo:', assignment.poloId.nome);
      
      // Carica postazioni del polo
      const postazioni = await apiCall(`/postazioni/polo/${assignment.poloId._id}`, {}, token);
      
      console.log('🏢 Postazioni caricate:', postazioni.length);
      setAvailablePostazioni(postazioni || []);
      
    } catch (error) {
      console.error('❌ Errore caricamento postazioni:', error);
      setAvailablePostazioni([]);
    } finally {
      setLoadingPostazioni(false);
    }
  };

  // Funzione per gestire il sorting
  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Funzione per ordinare i gruppi
  const sortGroupedUtilizzi = (data) => {
    if (!sortConfig.field) return data;

    return [...data].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.field) {
        case 'operatore':
          aVal = a.userId?.username || '';
          bVal = b.userId?.username || '';
          break;
        case 'prodotto':
          aVal = a.productId?.nome || '';
          bVal = b.productId?.nome || '';
          break;
        case 'polo':
          aVal = a.utilizzi[0]?.poloId?.nome || '';
          bVal = b.utilizzi[0]?.poloId?.nome || '';
          break;
        case 'settimana':
          aVal = a.settimanaId?.numero || 0;
          bVal = b.settimanaId?.numero || 0;
          if (aVal === bVal) {
            aVal = a.settimanaId?.anno || 0;
            bVal = b.settimanaId?.anno || 0;
          }
          break;
        case 'utilizzi':
          aVal = a.numeroUtilizzi || 0;
          bVal = b.numeroUtilizzi || 0;
          break;
        default:
          return 0;
      }

      // Confronto stringhe o numeri
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Raggruppa utilizzi per prodotto
  useEffect(() => {
    if (myUtilizzi.length > 0) {
      groupUtilizzi(myUtilizzi);
    } else {
      setGroupedUtilizzi([]);
    }
  }, [myUtilizzi, sortConfig]);

  // Raggruppa utilizzi per prodotto, utente e settimana (come UtilizziManagement)
  const groupUtilizzi = (utilizzi) => {
    const grouped = {};

    utilizzi.forEach(utilizzo => {
      const key = `${utilizzo.userId?._id}-${utilizzo.productId?._id}-${utilizzo.settimanaId?._id}`;

      if (!grouped[key]) {
        grouped[key] = {
          key,
          userId: utilizzo.userId,
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

    // Converte in array e ordina per data ultimo utilizzo (più recenti prima) o per sorting custom
    let groupedArray = Object.values(grouped);

    if (!sortConfig.field) {
      // Ordinamento di default: più recenti prima
      groupedArray = groupedArray.sort((a, b) =>
        new Date(b.dataUltimoUtilizzo) - new Date(a.dataUltimoUtilizzo)
      );
    } else {
      // Applica sorting custom
      groupedArray = sortGroupedUtilizzi(groupedArray);
    }

    setGroupedUtilizzi(groupedArray);
  };

  // Apri modal dettagli
  const openModal = (group) => {
    setSelectedGroup(group);
    setModalUtilizzi(group.utilizzi.sort((a, b) => new Date(b.dataUtilizzo) - new Date(a.dataUtilizzo)));
    setModalOpen(true);
  };

  // Chiudi modal con animazione
  const closeModal = () => {
    modalAnimation.handleAnimatedClose();
    setModalOpen(false);
  };

  // Sort assignments with current week first
  const sortedAssignments = sortAssignmentsByCurrentWeekFirst(myAssignments);

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
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">I Miei Utilizzi</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
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
              <option value="all" className="bg-gray-800">🌍 Tutte le settimane</option>
              {sortedAssignments.map((assignment, index) => {
                const isCurrentWeek = index === 0 && getCurrentWeekAssignment(myAssignments)?._id === assignment._id;
                return (
                  <option key={assignment._id} value={assignment._id} className="bg-gray-800">
                    {isCurrentWeek ? '📅 ' : ''}{formatWeekRange(assignment.settimanaId, assignment.settimanaFineId)}{isCurrentWeek ? ' (Corrente)' : ''} - {assignment.poloId?.nome} - {assignment.mezzoId?.nome}
                  </option>
                );
              })}
            </select>
            
            {/* Info settimana selezionata */}
            {selectedWeek === 'all' ? (
              <div className="mt-4 glass-info-display p-3 rounded-xl">
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <span>🌍 <strong>Tutte le settimane</strong></span>
                  <span>📊 <strong>Visualizzazione completa di tutti i tuoi utilizzi</strong></span>
                </div>
              </div>
            ) : selectedAssignmentInfo && (
              <div className="mt-4 glass-info-display p-3 rounded-xl">
                <div className="flex items-center space-x-4 text-sm text-white/80">
                  <span>📅 <strong>{formatWeekRange(selectedAssignmentInfo.settimanaId, selectedAssignmentInfo.settimanaFineId)}</strong></span>
                  <span>🏢 <strong>{selectedAssignmentInfo.poloId?.nome}</strong></span>
                  <span>🚛 <strong>{selectedAssignmentInfo.mezzoId?.nome}</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selettore Postazione */}
        {selectedWeek && selectedWeek !== 'all' && (
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
                  <option value="all" className="bg-gray-800">🌐 Tutte le postazioni</option>
                  {availablePostazioni.map(postazione => (
                    <option key={postazione._id} value={postazione._id} className="bg-gray-800">
                      {postazione.nome} - {postazione.indirizzo || 'Nessun indirizzo'}
                    </option>
                  ))}
                </select>
                
                {/* Info postazione selezionata */}
                {selectedPostazione && (
                  <div className="mt-4 glass-info-display p-3 rounded-xl">
                    <div className="text-sm text-white/80">
                      {selectedPostazione === 'all' ? (
                        <div className="flex items-center space-x-4">
                          <span>🌐 <strong>Tutte le postazioni</strong></span>
                          <span>📊 Visualizzando utilizzi da tutte le postazioni del polo</span>
                        </div>
                      ) : (() => {
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
              <div className="glass-info-display p-4 rounded-xl text-center">
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

        {/* Tabella Utilizzi Raggruppati */}
        {((selectedWeek === 'all' && selectedPostazione === 'all') || (selectedWeek && selectedPostazione)) && groupedUtilizzi.length > 0 ? (
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
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('operatore')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Operatore</span>
                        {sortConfig.field === 'operatore' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('prodotto')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Prodotto</span>
                        {sortConfig.field === 'prodotto' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('polo')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Polo</span>
                        {sortConfig.field === 'polo' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('settimana')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Settimana</span>
                        {sortConfig.field === 'settimana' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('utilizzi')}
                    >
                      <div className="flex items-center gap-2">
                        <span>N° Utilizzi</span>
                        {sortConfig.field === 'utilizzi' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {groupedUtilizzi.map(group => {
                    return (
                      <tr 
                        key={group.key} 
                        className="glass-table-row hover:bg-white/5 transition-all duration-300 cursor-pointer"
                        onClick={() => openModal(group)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="glass-avatar w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {group.userId?.username}
                              </div>
                              <div className="text-sm text-white/50">
                                {group.userId?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-2 text-blue-300" />
                            <div>
                              <div className="text-sm font-medium text-white">
                                {group.productId?.codice ? `${group.productId.codice} - ` : ''}{group.productId?.nome}
                              </div>
                              <div className="text-sm text-white/50">
                                {group.productId?.categoria}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-orange-300" />
                            <div className="text-sm font-medium text-white">
                              {group.utilizzi[0]?.poloId?.nome || 'N/A'}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-green-300" />
                            <div className="text-sm font-medium text-white">
                              {group.settimanaId ? formatWeek(group.settimanaId) : 'N/A'}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="glass-count-badge px-2 py-1 rounded-full">
                              <span className="text-sm font-medium text-white">
                                {group.numeroUtilizzi}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
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
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (selectedWeek === 'all' && selectedPostazione === 'all') || (selectedWeek && selectedPostazione) ? (
          <div className="glass-warning-card p-6 rounded-2xl">
            <div className="flex items-center justify-center text-yellow-200">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium">Nessun utilizzo registrato</div>
                <div className="text-sm text-yellow-200/70">
                  {selectedWeek === 'all'
                    ? 'Non hai ancora utilizzato prodotti.'
                    : 'Non hai ancora utilizzato prodotti in questa postazione per la settimana selezionata.'}
                </div>
              </div>
            </div>
          </div>
        ) : selectedWeek && selectedWeek !== 'all' ? (
          <div className="glass-warning-card p-6 rounded-2xl">
            <div className="flex items-center justify-center text-yellow-200">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium">Seleziona una postazione</div>
                <div className="text-sm text-yellow-200/70">
                  Scegli una postazione dal menu sopra per visualizzare i tuoi utilizzi.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-warning-card p-6 rounded-2xl">
            <div className="flex items-center justify-center text-yellow-200">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <div className="font-medium">Seleziona una settimana</div>
                <div className="text-sm text-yellow-200/70">
                  Scegli una settimana dal menu sopra per iniziare.
                </div>
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
      {modalAnimation.isVisible && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            {...modalAnimation.backdropProps}
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${modalAnimation.backdropClasses}`}
          ></div>
          
          {/* Modal Content */}
          <div 
            {...modalAnimation.modalProps}
            className={`relative glass-modal w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl modal-glow ${modalAnimation.modalClasses}`}
          >
            {/* Header Modal */}
            <div className="glass-modal-header px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="glass-icon p-2 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Dettagli Utilizzi - {selectedGroup.productId?.codice ? `${selectedGroup.productId.codice} - ` : ''}{selectedGroup.productId?.nome}
                    </h3>
                    <p className="text-white/70">
                      {selectedGroup.userId?.username} • {selectedGroup.settimanaId ? formatWeek(selectedGroup.settimanaId) : 'N/A'}
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

            {/* Lista Dettagliata */}
            <div className="glass-modal-content p-6 overflow-y-auto max-h-96">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Utilizzi Dettagliati ({modalUtilizzi.length})
              </h4>
              
              <div className="space-y-3">
                {modalUtilizzi.map((utilizzo, index) => {
                  const dateTime = formatDateTime(utilizzo.dataUtilizzo);
                  
                  return (
                    <div 
                      key={utilizzo._id} 
                      className={`glass-utilizzo-item p-4 rounded-xl ${staggerAnimation[index]?.class || ''}`}
                      style={staggerAnimation[index]?.style || {}}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {/* Data/Ora */}
                          <div>
                            <div className="text-xs text-white/60 mb-1 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Data/Ora
                            </div>
                            <div className="text-sm text-white">{dateTime.date}</div>
                            <div className="text-xs text-white/50">{dateTime.time}</div>
                          </div>
                          
                          {/* Polo */}
                          <div>
                            <div className="text-xs text-white/60 mb-1 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              Polo
                            </div>
                            <div className="text-sm text-white">
                              {utilizzo.poloId?.nome || 'N/A'}
                            </div>
                          </div>

                          {/* Postazione */}
                          <div>
                            <div className="text-xs text-white/60 mb-1 flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              Postazione
                            </div>
                            <div className="text-sm text-white">
                              {utilizzo.postazioneId?.nome || 'N/A'}
                            </div>
                          </div>

                          {/* Settimana */}
                          <div>
                            <div className="text-xs text-white/60 mb-1 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Settimana
                            </div>
                            <div className="text-sm text-white">
                              {utilizzo.settimanaId ? formatWeek(utilizzo.settimanaId) : 'N/A'}
                            </div>
                          </div>
                          
                          {/* Quantità */}
                          <div>
                            <div className="text-xs text-white/60 mb-1">Quantità</div>
                            <div className="text-sm font-medium text-red-300">
                              -{utilizzo.quantitaUtilizzata} {utilizzo.productId?.unita}
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="glass-modal-footer px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/70">
                  📋 Cronologia completa degli utilizzi per questo prodotto
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

        .glass-avatar {
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