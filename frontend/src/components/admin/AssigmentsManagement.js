
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  RotateCcw, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Truck,
  User,
  Plus,
  Edit,
  Settings,
  UserCheck,
  Building,
  Users,
  CalendarDays,
  FileText,
  Clipboard,
  Hash,
  BarChart3,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { apiCall } from '../../services/api';
import { formatWeek, sortAssignmentsByCurrentWeekFirst, sortWeeksChronologically, getCurrentWeekIndex, getCurrentWeekFromList, sortWeeksCenteredOnCurrent } from '../../utils/formatters';

const AssignmentsManagement = () => {
  const { token, setError } = useAuth();
  const { users, poli, mezzi, settimane } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { assegnazioneForm, editAssignmentId, editForm } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [postazioni, setPostazioni] = useState([]);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [stats, setStats] = useState({});

  // Stati per filtri - ✅ AGGIUNTI ordine e rdt
  const [filters, setFilters] = useState({
    userId: '',
    poloId: '',
    mezzoId: '',
    settimanaId: '',
    attiva: '',
    ordine: '',     // ✅ NUOVO FILTRO
    rdt: '',        // ✅ NUOVO FILTRO
    searchTerm: ''
  });
  
  // Stato per checkbox "tutte le settimane"
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  
  // Stati per dati
  const [assegnazioni, setAssegnazioni] = useState([]);
  const [filteredAssegnazioni, setFilteredAssegnazioni] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mouse tracking
  useEffect(() => {
    const loadPostazioni = async () => {
      try {
        const data = await apiCall('/postazioni', {}, token);
        setPostazioni(data || []);
      } catch (err) {
        console.error('Errore caricamento postazioni:', err);
      }
    };
    
    loadPostazioni();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set default current week for assignment form (only when form is empty)
  useEffect(() => {
    if (settimane.length > 0 && (!assegnazioneForm.settimanaId || assegnazioneForm.settimanaId === '')) {
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        updateAssegnazioneForm({ settimanaId: currentWeek._id });
      }
    }
  }, [settimane]);

  // Set default current week for filters when showAllWeeks is false
  useEffect(() => {
    if (settimane.length > 0 && !showAllWeeks && filters.settimanaId === '') {
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        updateFilters({ settimanaId: currentWeek._id });
      }
    }
  }, [settimane, showAllWeeks]);

  // Handle showAllWeeks toggle
  useEffect(() => {
    if (showAllWeeks) {
      // When showing all weeks, clear the week filter
      updateFilters({ settimanaId: '' });
    } else {
      // When not showing all weeks, set current week as default
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        updateFilters({ settimanaId: currentWeek._id });
      }
    }
  }, [showAllWeeks, settimane]);

  // Sort weeks centered on current week for dropdown
  const sortedSettimane = React.useMemo(() => {
    if (!settimane.length) return [];
    return sortWeeksCenteredOnCurrent(settimane);
  }, [settimane]);

  const updateAssegnazioneForm = (updates) => {
    dispatch({ type: 'SET_ASSEGNAZIONE_FORM', payload: updates });
  };

  const setEditAssignmentId = (id) => {
    dispatch({ type: 'SET_EDIT_ASSIGNMENT_ID', payload: id });
  };

  const updateEditForm = (updates) => {
    dispatch({ type: 'SET_EDIT_FORM', payload: updates });
  };

  // ✅ CARICA STATISTICHE
  const loadStats = async () => {
    try {
      const data = await apiCall('/assegnazioni/stats', {}, token);
      setStats(data || {});
    } catch (err) {
      console.error('Errore caricamento statistiche:', err);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      // ✅ AGGIUNTO: Validazione per assegnazioni multiple
      const existingAssignments = assegnazioni.filter(a => 
        a.poloId?._id === assegnazioneForm.poloId && 
        a.settimanaId?._id === assegnazioneForm.settimanaId &&
        a.attiva
      );

      if (existingAssignments.length >= 2) {
        setError('⚠️ Massimo 2 operatori per polo/settimana. Questo polo è già al completo.');
        return;
      }

      // ✅ AGGIUNTO: Controllo se l'operatore ha già un'assegnazione per questa settimana
      const userAlreadyAssigned = assegnazioni.find(a => 
        a.userId?._id === assegnazioneForm.userId && 
        a.settimanaId?._id === assegnazioneForm.settimanaId &&
        a.attiva
      );

      if (userAlreadyAssigned) {
        setError('⚠️ Questo operatore ha già un\'assegnazione per questa settimana.');
        return;
      }

      // ✅ NUOVO: Gestione mezzo condiviso
      let mezzoToUse = assegnazioneForm.mezzoId;
      
      // Se c'è già un'assegnazione per questo polo/settimana, usa lo stesso mezzo
      if (existingAssignments.length === 1) {
        const existingMezzo = existingAssignments[0].mezzoId?._id;
        if (existingMezzo && mezzoToUse !== existingMezzo) {
          // Chiedi conferma se vuole usare un mezzo diverso
          const useSharedVehicle = window.confirm(
            `⚠️ C'è già un operatore (${existingAssignments[0].userId?.username}) assegnato a questo polo/settimana con il mezzo "${existingAssignments[0].mezzoId?.nome}". \n\nVuoi condividere lo stesso mezzo? \n\n• Sì = Usa il mezzo condiviso "${existingAssignments[0].mezzoId?.nome}" \n• No = Mantieni il mezzo selezionato "${mezzi.find(m => m._id === mezzoToUse)?.nome}"`
          );
          
          if (useSharedVehicle) {
            mezzoToUse = existingMezzo;
          }
        }
      }

      // ✅ CREA L'ASSEGNAZIONE con i nuovi campi ordine e rdt
      const assegnazioneData = {
        ...assegnazioneForm,
        mezzoId: mezzoToUse,
        ordine: assegnazioneForm.ordine?.trim() || null,    // ✅ NUOVO CAMPO
        rdt: assegnazioneForm.rdt?.trim() || null           // ✅ NUOVO CAMPO
      };

      const response = await apiCall('/assegnazioni', {
        method: 'POST',
        body: JSON.stringify(assegnazioneData)
      }, token);
      
      await loadAssegnazioni();
      await loadStats(); // ✅ RICARICA STATISTICHE
      dispatch({ type: 'RESET_ASSEGNAZIONE_FORM' });
      
      const remainingSlots = 2 - existingAssignments.length - 1;
      const mezzoName = mezzi.find(m => m._id === mezzoToUse)?.nome;
      const isShared = existingAssignments.length === 1 && mezzoToUse === existingAssignments[0].mezzoId?._id;
      
      let successMessage = `✅ Assegnazione creata! ${isShared ? `Mezzo "${mezzoName}" condiviso.` : ''} (${remainingSlots} posto/i rimasto/i)`;
      
      // ✅ AGGIUNGI INFO sui nuovi campi nel messaggio di successo
      if (assegnazioneData.ordine) successMessage += ` | Ordine: ${assegnazioneData.ordine}`;
      if (assegnazioneData.rdt) successMessage += ` | RDT: ${assegnazioneData.rdt}`;
      
      setError(successMessage);
    } catch (err) {
      // ✅ GESTISCE ERRORI SPECIFICI per ordine/rdt duplicati
      if (err.message.includes('ORDINE_ALREADY_ASSIGNED')) {
        setError('❌ Questo numero di ordine è già assegnato ad un altro operatore');
      } else if (err.message.includes('RDT_ALREADY_ASSIGNED')) {
        setError('❌ Questo codice RDT è già assegnato ad un altro operatore');
      } else {
        setError('Errore nella creazione assegnazione: ' + err.message);
      }
    }
  };

  const handleUpdateAssignment = async (assignmentId) => {
    try {
      // ✅ INCLUDI i nuovi campi nella modifica
      const updateData = {
        ...editForm,
        ordine: editForm.ordine?.trim() || null,    // ✅ NUOVO CAMPO
        rdt: editForm.rdt?.trim() || null           // ✅ NUOVO CAMPO
      };

      await apiCall(`/assegnazioni/${assignmentId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);

      await loadAssegnazioni();
      await loadStats(); // ✅ RICARICA STATISTICHE
      setEditAssignmentId(null);
      setError('✅ Assegnazione modificata con successo');
    } catch (err) {
      // ✅ GESTISCE ERRORI SPECIFICI per ordine/rdt duplicati
      if (err.message.includes('ORDINE_ALREADY_ASSIGNED')) {
        setError('❌ Questo numero di ordine è già assegnato ad un altro operatore');
      } else if (err.message.includes('RDT_ALREADY_ASSIGNED')) {
        setError('❌ Questo codice RDT è già assegnato ad un altro operatore');
      } else {
        setError('Errore nella modifica: ' + err.message);
      }
    }
  };

  // Carica assegnazioni con filtri aggiornati
  const loadAssegnazioni = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams();
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.poloId) queryParams.append('poloId', filters.poloId);
      if (filters.mezzoId) queryParams.append('mezzoId', filters.mezzoId);
      if (filters.settimanaId) queryParams.append('settimanaId', filters.settimanaId);
      if (filters.ordine) queryParams.append('ordine', filters.ordine);     // ✅ NUOVO FILTRO
      if (filters.rdt) queryParams.append('rdt', filters.rdt);             // ✅ NUOVO FILTRO
      
      if (filters.attiva !== '') {
        queryParams.append('attiva', filters.attiva);
      }
      
      const data = await apiCall(`/assegnazioni?${queryParams}`, {}, token);
      setAssegnazioni(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Errore nel caricamento assegnazioni: ' + err.message);
      setAssegnazioni([]);
    } finally {
      setLoading(false);
    }
  };

  // Applica filtri locali - ✅ AGGIORNATO per includere ordine e rdt nella ricerca
  useEffect(() => {
    let filtered = assegnazioni;
    
    if (filters.searchTerm) {
      filtered = filtered.filter(assegnazione => 
        assegnazione.userId?.username.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assegnazione.userId?.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assegnazione.poloId?.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        assegnazione.mezzoId?.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (assegnazione.ordine && (
          typeof assegnazione.ordine === 'object' 
            ? assegnazione.ordine.numero?.toLowerCase().includes(filters.searchTerm.toLowerCase())
            : assegnazione.ordine.toLowerCase().includes(filters.searchTerm.toLowerCase())
        )) ||  // ✅ NUOVO
        (assegnazione.rdt && (
          typeof assegnazione.rdt === 'object' 
            ? assegnazione.rdt.numero?.toLowerCase().includes(filters.searchTerm.toLowerCase())
            : assegnazione.rdt.toLowerCase().includes(filters.searchTerm.toLowerCase())
        ))             // ✅ NUOVO
      );
    }
    
    setFilteredAssegnazioni(filtered);
  }, [assegnazioni, filters.searchTerm]);

  // Ricarica quando cambiano i filtri principali - ✅ AGGIORNATO
  useEffect(() => {
    loadAssegnazioni();
  }, [filters.userId, filters.poloId, filters.mezzoId, filters.settimanaId, filters.attiva, filters.ordine, filters.rdt, showAllWeeks]);

  // Carica dati iniziali
  useEffect(() => {
    loadAssegnazioni();
    loadStats(); // ✅ CARICA STATISTICHE INIZIALI
  }, []);

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Soft delete (disattiva)
  const handleSoftDelete = async (assegnazioneId) => {
    if (!window.confirm('Sei sicuro di voler disattivare questa assegnazione?')) return;
    
    try {
      setError('');
      await apiCall(`/assegnazioni/${assegnazioneId}`, { method: 'DELETE' }, token);
      await loadAssegnazioni();
      await loadStats(); // ✅ RICARICA STATISTICHE
      setError('Assegnazione disattivata con successo');
    } catch (err) {
      setError('Errore nella disattivazione: ' + err.message);
    }
  };

  // Hard delete (eliminazione definitiva)
  const handleHardDelete = async (assegnazioneId) => {
    const confirmed = window.confirm(
      '⚠️ ATTENZIONE: Questa azione eliminerà DEFINITIVAMENTE l\'assegnazione e ripristinerà tutti gli utilizzi correlati. Questa operazione NON può essere annullata. Sei sicuro?'
    );
    
    if (!confirmed) return;
    
    try {
      setError('');
      const response = await apiCall(`/assegnazioni/${assegnazioneId}/permanent`, { method: 'DELETE' }, token);
      await loadAssegnazioni();
      await loadStats(); // ✅ RICARICA STATISTICHE
      setError(`Eliminazione completata: ${response.utilizziRipristinati} utilizzi ripristinati`);
    } catch (err) {
      setError('Errore nell\'eliminazione definitiva: ' + err.message);
    }
  };

  // Ripristina assegnazione
  const handleRestore = async (assegnazioneId) => {
    if (!window.confirm('Sei sicuro di voler ripristinare questa assegnazione?')) return;
    
    try {
      setError('');
      await apiCall(`/assegnazioni/${assegnazioneId}/restore`, { method: 'PATCH' }, token);
      await loadAssegnazioni();
      await loadStats(); // ✅ RICARICA STATISTICHE
      setError('Assegnazione ripristinata con successo');
    } catch (err) {
      setError('Errore nel ripristino: ' + err.message);
    }
  };

  // ✅ AGGIUNTO: Funzione per verificare quante assegnazioni ci sono per polo/settimana
  const getAssignmentCountForPoloWeek = (poloId, settimanaId) => {
    return assegnazioni.filter(a => 
      a.poloId?._id === poloId && 
      a.settimanaId?._id === settimanaId &&
      a.attiva
    ).length;
  };

  // ✅ AGGIUNTO: Funzione per ottenere le assegnazioni per polo/settimana
  const getAssignmentsForPoloWeek = (poloId, settimanaId) => {
    return assegnazioni.filter(a => 
      a.poloId?._id === poloId && 
      a.settimanaId?._id === settimanaId &&
      a.attiva
    );
  };

  if (showCalendarView) {
    return <CalendarView 
      assegnazioni={assegnazioni}
      poli={poli}
      settimane={settimane}
      onBackToList={() => setShowCalendarView(false)}
    />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-white/20 to-transparent rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-6">
        {/* Form Nuova Assegnazione */}
        <div className="glass-assignment-card p-8 rounded-3xl">
          <div className="glass-card-header mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="glass-icon p-4 rounded-2xl mr-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Crea Nuova Assegnazione</h2>
                  <p className="text-white/70">
                    ✅ Massimo 2 operatori per polo/settimana • 1 operatore per settimana
                  </p>
                </div>
              </div>
              
              {/* ✅ AGGIUNTO: Pulsante per vista calendario */}
              <button
                onClick={() => setShowCalendarView(true)}
                className="glass-button-secondary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <CalendarDays className="w-5 h-5" />
                <span className="font-medium">Vista Calendario</span>
              </button>
            </div>
          </div>
          
          {/* Form fields for assignment creation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <UserCheck className="w-4 h-4 inline mr-2" />
                Utente *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.userId}
                  onChange={(e) => updateAssegnazioneForm({ userId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona utente</option>
                  {users.filter(u => u.role === 'user').map(user => (
                    <option key={user._id} value={user._id} className="bg-gray-800">
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Polo *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.poloId}
                  onChange={(e) => updateAssegnazioneForm({ poloId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona polo</option>
                  {poli.map(polo => (
                    <option key={polo._id} value={polo._id} className="bg-gray-800">
                      {polo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Truck className="w-4 h-4 inline mr-2" />
                Mezzo *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.mezzoId}
                  onChange={(e) => updateAssegnazioneForm({ mezzoId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona mezzo</option>
                  {mezzi.map(mezzo => (
                    <option key={mezzo._id} value={mezzo._id} className="bg-gray-800">
                      {mezzo.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Settimana *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.settimanaId}
                  onChange={(e) => updateAssegnazioneForm({ settimanaId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona settimana</option>
                  {sortedSettimane.map((settimana, index) => {
                    const count = getAssignmentCountForPoloWeek(assegnazioneForm.poloId, settimana._id);
                    const isPoloSelected = assegnazioneForm.poloId;
                    const remainingSlots = isPoloSelected ? 2 - count : 2;
                    const currentWeek = getCurrentWeekFromList(settimane);
                    const isCurrentWeek = currentWeek && settimana._id === currentWeek._id;
                    
                    return (
                      <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                        {isCurrentWeek ? '📅 ' : ''}{formatWeek(settimana)}{isCurrentWeek ? ' (Corrente)' : ''} 
                        {isPoloSelected && ` (${remainingSlots} posto/i libero/i)`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

          </div>

          {/* ✅ AGGIUNTO: Informazioni sui posti disponibili */}
          {assegnazioneForm.poloId && assegnazioneForm.settimanaId && (
            <div className="mb-6 p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30">
              {(() => {
                const assignments = getAssignmentsForPoloWeek(assegnazioneForm.poloId, assegnazioneForm.settimanaId);
                const remainingSlots = 2 - assignments.length;
                
                return (
                  <div className="text-white/80 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">
                        Posti occupati per questo polo/settimana: {assignments.length}/2
                      </span>
                    </div>
                    {assignments.length > 0 && (
                      <div className="space-y-1">
                        {assignments.map((a, idx) => (
                          <div key={a._id} className="text-xs text-white/60 flex items-center gap-2">
                            <span>{idx + 1}. {a.userId?.username}</span>
                            <div className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              <span className="font-medium text-yellow-300">{a.mezzoId?.nome}</span>
                            </div>
                            {/* ✅ NUOVO: Mostra ordine e RDT degli operatori esistenti */}
                            {a.ordine && (
                              <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                <span className="text-green-300">{a.ordine}</span>
                              </div>
                            )}
                            {a.rdt && (
                              <div className="flex items-center gap-1">
                                <Clipboard className="w-3 h-3" />
                                <span className="text-purple-300">{a.rdt}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* ✅ NUOVO: Informazioni sul mezzo condiviso */}
                    {assignments.length === 1 && (
                      <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                        <div className="text-yellow-200 text-xs font-medium mb-1">
                          🚗 Mezzo Disponibile per Condivisione:
                        </div>
                        <div className="text-yellow-100 text-xs">
                          "{assignments[0].mezzoId?.nome}" può essere condiviso con il secondo operatore
                        </div>
                      </div>
                    )}
                    
                    {remainingSlots > 0 ? (
                      <div className="text-green-300 text-xs mt-2">
                        ✅ {remainingSlots} posto/i ancora disponibile/i
                      </div>
                    ) : (
                      <div className="text-red-300 text-xs mt-2">
                        ❌ Polo al completo per questa settimana
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <div className="space-y-4">
            {/* Reminder message about order/RDT association */}
            <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                <div className="text-blue-200 text-sm">
                  <p className="font-medium mb-1">📋 Promemoria Ordini e RDT</p>
                  <p className="text-blue-200/80">
                    Dopo aver creato l'assegnazione, ricorda di associare ordine e RDT dalla sezione <strong>Ordini</strong> per allineare le giacenze.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCreateAssignment}
              disabled={!assegnazioneForm.userId || !assegnazioneForm.poloId || !assegnazioneForm.mezzoId || !assegnazioneForm.settimanaId}
              className="glass-button-primary flex items-center gap-3 px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Crea Assegnazione</span>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="glass-icon p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Gestione Assegnazioni</h2>
                <p className="text-white/70">Visualizza e gestisci tutte le assegnazioni operatori</p>
              </div>
            </div>
{/* ✅ AGGIORNATE: Statistiche con nuovi campi */}
            <div className="glass-stats-container p-4 rounded-xl">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats.totaleAssegnazioni || assegnazioni.filter(a => a.attiva).length}
                  </div>
                  <div className="text-xs text-white/60">Assegnazioni Attive</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {stats.operatoriAttivi || new Set(assegnazioni.filter(a => a.attiva).map(a => a.userId?._id)).size}
                  </div>
                  <div className="text-xs text-white/60">Operatori Attivi</div>
                </div>
                {/* ✅ NUOVE STATISTICHE */}
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {stats.ordiniAssegnati || 0}
                  </div>
                  <div className="text-xs text-white/60">Ordini Assegnati</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {stats.rdtAssegnati || 0}
                  </div>
                  <div className="text-xs text-white/60">RDT Assegnati</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtri Avanzati
          </h3>
          
          {/* ✅ AGGIORNATA: Griglia con 6 filtri invece di 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Filtro Utente */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Operatore
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.userId}
                onChange={(e) => updateFilters({ userId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti gli operatori</option>
                {users.filter(u => u.role === 'user').map(user => (
                  <option key={user._id} value={user._id} className="bg-gray-800">
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Polo */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Polo
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.poloId}
                onChange={(e) => updateFilters({ poloId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti i poli</option>
                {poli.map(polo => (
                  <option key={polo._id} value={polo._id} className="bg-gray-800">
                    {polo.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Mezzo */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Mezzo
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.mezzoId}
                onChange={(e) => updateFilters({ mezzoId: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti i mezzi</option>
                {mezzi.map(mezzo => (
                  <option key={mezzo._id} value={mezzo._id} className="bg-gray-800">
                    {mezzo.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Settimana */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Settimana
              </label>
              
              {/* Dropdown settimane (visibile solo quando checkbox non è selezionata) */}
              {!showAllWeeks && (
                <select
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                  value={filters.settimanaId}
                  onChange={(e) => updateFilters({ settimanaId: e.target.value })}
                >
                  {sortedSettimane.map((settimana) => {
                    const currentWeek = getCurrentWeekFromList(settimane);
                    const isCurrentWeek = currentWeek && settimana._id === currentWeek._id;
                    return (
                      <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                        {isCurrentWeek ? '📅 ' : ''}{formatWeek(settimana)}{isCurrentWeek ? ' (Corrente)' : ''}
                      </option>
                    );
                  })}
                </select>
              )}

              {/* Checkbox "Tutte le settimane" */}
              <div className="mt-3">
                <label className="glass-checkbox-container flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllWeeks}
                    onChange={(e) => setShowAllWeeks(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`glass-checkbox w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                    showAllWeeks 
                      ? 'border-blue-400 bg-blue-400/20' 
                      : 'border-white/30 bg-transparent'
                  }`}>
                    {showAllWeeks && (
                      <svg className="w-3 h-3 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="ml-2 text-sm text-white/80">🌍 Tutte le settimane</span>
                </label>
              </div>
            </div>

            {/* ✅ NUOVO FILTRO: Ordine */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Hash className="w-4 h-4 mr-2" />
                Numero Ordine
              </label>
              <div className="glass-input-container rounded-xl">
                <input
                  type="text"
                  placeholder="Cerca per ordine..."
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={filters.ordine}
                  onChange={(e) => updateFilters({ ordine: e.target.value })}
                />
              </div>
            </div>

            {/* ✅ NUOVO FILTRO: RDT */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center">
                <Clipboard className="w-4 h-4 mr-2" />
                Codice RDT
              </label>
              <div className="glass-input-container rounded-xl">
                <input
                  type="text"
                  placeholder="Cerca per RDT..."
                  className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={filters.rdt}
                  onChange={(e) => updateFilters({ rdt: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro Stato */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Stato Assegnazione
              </label>
              <select
                className="glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.attiva}
                onChange={(e) => updateFilters({ attiva: e.target.value })}
              >
                <option value="" className="bg-gray-800">Tutti gli stati</option>
                <option value="true" className="bg-gray-800">Solo Attive</option>
                <option value="false" className="bg-gray-800">Solo Inattive</option>
              </select>
            </div>

            {/* Ricerca per Nome */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Ricerca Libera
              </label>
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cerca operatore, polo, mezzo, ordine, RDT..."
                    className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella Assegnazioni */}
        <div className="glass-card-large rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Assegnazioni Trovate
              {!loading && (
                <span className="ml-2 text-sm text-white/50">
                  ({filteredAssegnazioni.length} risultati)
                </span>
              )}
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-white/70">Caricamento assegnazioni...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="glass-table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Operatore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Polo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Postazione
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Mezzo
                    </th>
                    {/* ✅ NUOVE COLONNE */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Ordine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      RDT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Settimana
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAssegnazioni.map(assegnazione => (
                    <tr key={assegnazione._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="glass-avatar w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {assegnazione.userId?.username}
                            </div>
                            <div className="text-sm text-white/50">
                              {assegnazione.userId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* ✅ POLO - con modifica inline */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {editAssignmentId === assegnazione._id ? (
                            <div className="glass-input-container">
                              <select
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.poloId}
                                onChange={(e) => updateEditForm({ poloId: e.target.value })}
                              >
                                <option value="" className="bg-gray-800">Seleziona Polo</option>
                                {poli.map(p => (
                                  <option key={p._id} value={p._id} className="bg-gray-800">{p.nome}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-white">
                                {assegnazione.poloId?.nome || 'N/A'}
                              </div>
                              {/* ✅ AGGIUNTO: Indicatore posti occupati + mezzo condiviso */}
                              <div className="ml-2 flex items-center gap-1">
                                {(() => {
                                  const count = getAssignmentCountForPoloWeek(assegnazione.poloId?._id, assegnazione.settimanaId?._id);
                                  const assignments = getAssignmentsForPoloWeek(assegnazione.poloId?._id, assegnazione.settimanaId?._id);
                                  const hasSharedVehicle = assignments.length === 2 && 
                                    assignments[0].mezzoId?._id === assignments[1].mezzoId?._id;
                                  
                                  return (
                                    <>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        count === 1 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                                      }`}>
                                        {count}/2
                                      </span>
                                      {hasSharedVehicle && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 flex items-center gap-1">
                                          <Truck className="w-3 h-3" />
                                          Condiviso
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ✅ POSTAZIONE - sola visualizzazione */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-orange-400" />
                          <div className="text-sm text-white">
                            {assegnazione.postazioneId?.nome || 'Non assegnata'}
                          </div>
                        </div>
                      </td>
                      
                      {/* ✅ MEZZO - con modifica inline */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {editAssignmentId === assegnazione._id ? (
                            <div className="glass-input-container">
                              <select
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editForm.mezzoId}
                                onChange={(e) => updateEditForm({ mezzoId: e.target.value })}
                              >
                                <option value="" className="bg-gray-800">Seleziona Mezzo</option>
                                {mezzi.map(m => (
                                  <option key={m._id} value={m._id} className="bg-gray-800">{m.nome}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-white">
                                {assegnazione.mezzoId?.nome || 'N/A'}
                              </div>
                              {/* ✅ NUOVO: Indicatore se il mezzo è condiviso */}
                              {(() => {
                                const assignments = getAssignmentsForPoloWeek(assegnazione.poloId?._id, assegnazione.settimanaId?._id);
                                const sharedUsers = assignments.filter(a => a.mezzoId?._id === assegnazione.mezzoId?._id);
                                
                                if (sharedUsers.length > 1) {
                                  const otherUser = sharedUsers.find(a => a._id !== assegnazione._id);
                                  return (
                                    <div className="ml-2">
                                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                                        Condiviso con {otherUser?.userId?.username}
                                      </span>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ✅ ORDINE - con modifica inline */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {editAssignmentId === assegnazione._id ? (
                            <div className="glass-input-container">
                              <input
                                type="text"
                                placeholder="Numero Ordine"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm placeholder-white/50"
                                value={editForm.ordine || ''}
                                onChange={(e) => updateEditForm({ ordine: e.target.value })}
                              />
                            </div>
                          ) : (
                            <>
                              <Hash className="w-4 h-4 mr-2 text-green-400" />
                              <div className="text-sm text-white">
                                {assegnazione.ordine ? (
                                  typeof assegnazione.ordine === 'object' 
                                    ? assegnazione.ordine.numero 
                                    : assegnazione.ordine
                                ) : (
                                  <span className="text-white/40 italic">Non assegnato</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* ✅ RDT - con modifica inline */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {editAssignmentId === assegnazione._id ? (
                            <div className="glass-input-container">
                              <input
                                type="text"
                                placeholder="Codice RDT"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm placeholder-white/50"
                                value={editForm.rdt || ''}
                                onChange={(e) => updateEditForm({ rdt: e.target.value })}
                              />
                            </div>
                          ) : (
                            <>
                              <Clipboard className="w-4 h-4 mr-2 text-purple-400" />
                              <div className="text-sm text-white">
                                {assegnazione.rdt ? (
                                  typeof assegnazione.rdt === 'object' 
                                    ? assegnazione.rdt.numero 
                                    : assegnazione.rdt
                                ) : (
                                  <span className="text-white/40 italic">Non assegnato</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      
                      {/* ✅ SETTIMANA - con modifica inline */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editAssignmentId === assegnazione._id ? (
                          <div className="glass-input-container">
                            <select
                              className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                              value={editForm.settimanaId}
                              onChange={(e) => updateEditForm({ settimanaId: e.target.value })}
                            >
                              <option value="" className="bg-gray-800">Seleziona Settimana</option>
                              {sortedSettimane.map(s => (
                                <option key={s._id} value={s._id} className="bg-gray-800">
                                  {formatWeek(s)}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-white">
                              Settimana {assegnazione.settimanaId?.numero}/{assegnazione.settimanaId?.anno}
                            </div>
                            <div className="text-sm text-white/50">
                              {new Date(assegnazione.settimanaId?.dataInizio).toLocaleDateString('it-IT')} - {new Date(assegnazione.settimanaId?.dataFine).toLocaleDateString('it-IT')}
                            </div>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`glass-status-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          assegnazione.attiva 
                            ? 'text-green-200 border-green-300/30 bg-green-400/20' 
                            : 'text-red-200 border-red-300/30 bg-red-400/20'
                        }`}>
                          {assegnazione.attiva ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              ATTIVA
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              INATTIVA
                            </>
                          )}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {assegnazione.attiva ? (
                            <>
                              {editAssignmentId === assegnazione._id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateAssignment(assegnazione._id)}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Salva modifiche"
                                  >
                                    <Save className="w-4 h-4 text-green-400" />
                                  </button>
                                  <button
                                    onClick={() => setEditAssignmentId(null)}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Annulla modifica"
                                  >
                                    <X className="w-4 h-4 text-red-400" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditAssignmentId(assegnazione._id);
                                      updateEditForm({
                                        poloId: assegnazione.poloId?._id || '',
                                        mezzoId: assegnazione.mezzoId?._id || '',
                                        settimanaId: assegnazione.settimanaId?._id || '',
                                        ordine: (typeof assegnazione.ordine === 'object' ? assegnazione.ordine?.numero : assegnazione.ordine) || '',      // ✅ NUOVO CAMPO
                                        rdt: (typeof assegnazione.rdt === 'object' ? assegnazione.rdt?.numero : assegnazione.rdt) || ''             // ✅ NUOVO CAMPO
                                      });
                                    }}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Modifica assegnazione"
                                  >
                                    <Edit className="w-4 h-4 text-blue-400" />
                                  </button>
                                  <button
                                    onClick={() => handleSoftDelete(assegnazione._id)}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Disattiva assegnazione"
                                  >
                                    <EyeOff className="w-4 h-4 text-yellow-400" />
                                  </button>
                                  <button
                                    onClick={() => handleHardDelete(assegnazione._id)}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Elimina definitivamente"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(assegnazione._id)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Ripristina assegnazione"
                              >
                                <RotateCcw className="w-4 h-4 text-green-400" />
                              </button>
                              <button
                                onClick={() => handleHardDelete(assegnazione._id)}
                                className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                title="Elimina definitivamente"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAssegnazioni.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-white/70 text-lg mb-2">Nessuna assegnazione trovata</p>
                  <p className="text-sm text-white/50">
                    Modifica i filtri per vedere più risultati
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
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

        .glass-assignment-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        .glass-card-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 1.5rem;
        }

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-avatar {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-stats-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-input-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 1rem;
          transition: all 0.3s ease;
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .glass-input-container:focus-within {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
          background: rgba(255, 255, 255, 0.12);
        }

        .glass-table-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-table-row {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
        }

        .glass-status-badge {
          backdrop-filter: blur(10px);
        }

        .glass-button-primary {
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
          color: white;
        }

        .glass-button-primary:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.4);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3);
        }

        .glass-button-success {
          background: rgba(34, 197, 94, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: white;
        }

        .glass-button-success:hover {
          background: rgba(34, 197, 94, 0.4);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
        }

        .glass-button-warning {
          background: rgba(251, 191, 36, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(251, 191, 36, 0.4);
          color: white;
        }

        .glass-button-warning:hover {
          background: rgba(251, 191, 36, 0.4);
          box-shadow: 0 8px 24px rgba(251, 191, 36, 0.3);
        }

        .glass-button-danger {
          background: rgba(239, 68, 68, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: white;
        }

        .glass-button-danger:hover {
          background: rgba(239, 68, 68, 0.4);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
        }

        .glass-button-secondary {
          background: rgba(107, 114, 128, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 114, 128, 0.4);
          box-shadow: 0 4px 16px rgba(107, 114, 128, 0.2);
          color: white;
        }

        .glass-button-secondary:hover {
          background: rgba(107, 114, 128, 0.4);
          box-shadow: 0 8px 24px rgba(107, 114, 128, 0.3);
        }

        .glass-action-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .glass-action-button:hover {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
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

        /* Responsive */
        @media (max-width: 768px) {
          .glass-assignment-card {
            padding: 1rem;
          }
          
          .grid {
            grid-template-columns: 1fr;
          }
          
          .px-6 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// ✅ AGGIORNATO: Componente CalendarView con supporto per ordine e RDT
const CalendarView = ({ assegnazioni, poli, settimane, onBackToList }) => {
  const [filteredPoli, setFilteredPoli] = useState(poli);
  const [filteredSettimane, setFilteredSettimane] = useState(settimane);
  
  // Ordina settimane cronologicamente
  const sortedSettimane = sortWeeksChronologically(filteredSettimane);
  
  // Trova l'indice della settimana corrente per lo scroll automatico
  const currentWeekIndex = getCurrentWeekIndex(sortedSettimane);
  
  // Ref per lo scroll automatico alla settimana corrente
  const tableRef = useRef(null);
  const currentWeekRef = useRef(null);
  
  // Scroll alla settimana corrente quando il componente si monta
  useEffect(() => {
    if (currentWeekRef.current && tableRef.current) {
      // Scroll orizzontale alla settimana corrente
      const currentWeekColumn = currentWeekRef.current;
      const table = tableRef.current;
      
      // Calcola la posizione dello scroll per centrare la settimana corrente
      const columnRect = currentWeekColumn.getBoundingClientRect();
      const tableRect = table.getBoundingClientRect();
      const scrollLeft = currentWeekColumn.offsetLeft - (tableRect.width / 2) + (columnRect.width / 2);
      
      table.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  }, [sortedSettimane, currentWeekIndex]);
  
  // Funzione per ottenere assegnazioni per polo/settimana
  const getAssignmentsForCell = (poloId, settimanaId) => {
    return assegnazioni.filter(a => 
      a.poloId?._id === poloId && 
      a.settimanaId?._id === settimanaId &&
      a.attiva
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="glass-icon p-3 rounded-xl">
              <CalendarDays className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Calendario Assegnazioni</h2>
              <p className="text-white/70">Vista calendario per polo e settimana</p>
            </div>
          </div>
          
          <button
            onClick={onBackToList}
            className="glass-button-secondary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Torna alla Lista</span>
          </button>
        </div>
      </div>

      {/* Calendario */}
      <div className="glass-card-large rounded-2xl overflow-hidden">
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full">
            <thead className="glass-table-header">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider sticky left-0 bg-gray-800/50 backdrop-blur-md">
                  Polo
                </th>
                {sortedSettimane.map((settimana, index) => {
                  const isCurrentWeek = index === currentWeekIndex;
                  return (
                    <th 
                      key={settimana._id} 
                      ref={isCurrentWeek ? currentWeekRef : null}
                      className={`px-3 py-3 text-center text-xs font-medium uppercase tracking-wider min-w-[200px] ${
                        isCurrentWeek 
                          ? 'bg-blue-600/30 text-blue-200 border-blue-400/50 border-2' 
                          : 'text-white/80'
                      }`}
                    >
                      <div className={isCurrentWeek ? 'font-bold' : ''}>
                        Sett. {settimana.numero}/{settimana.anno}
                        {isCurrentWeek && <span className="ml-1">📅</span>}
                      </div>
                      <div className={`text-xs font-normal ${
                        isCurrentWeek ? 'text-blue-200/80' : 'text-white/50'
                      }`}>
                        {new Date(settimana.dataInizio).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} - 
                        {new Date(settimana.dataFine).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredPoli.map(polo => (
                <tr key={polo._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                  <td className="px-4 py-4 font-medium text-white sticky left-0 bg-gray-800/50 backdrop-blur-md border-r border-white/10">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                      {polo.nome}
                    </div>
                  </td>
                  {sortedSettimane.map(settimana => {
                    const assignments = getAssignmentsForCell(polo._id, settimana._id);
                    
                    return (
                      <td key={settimana._id} className="px-3 py-4 text-center border-r border-white/5">
                        <div className="space-y-2">
                          {assignments.length === 0 ? (
                            <div className="text-white/30 text-sm italic">
                              Nessuna assegnazione
                            </div>
                          ) : (
                            assignments.map((assignment, idx) => (
                              <div 
                                key={assignment._id}
                                className={`glass-assignment-cell p-2 rounded-xl text-xs ${
                                  assignments.length === 1 ? 'bg-blue-500/20 border border-blue-400/30' :
                                  idx === 0 ? 'bg-green-500/20 border border-green-400/30' :
                                  'bg-orange-500/20 border border-orange-400/30'
                                }`}
                              >
                                <div className="font-medium text-white flex items-center justify-center gap-1">
                                  <User className="w-3 h-3" />
                                  {assignment.userId?.username}
                                </div>
                                <div className="text-white/70 flex items-center justify-center gap-1 mt-1">
                                  <Truck className="w-3 h-3" />
                                  {assignment.mezzoId?.nome}
                                  {/* ✅ NUOVO: Indicatore mezzo condiviso nel calendario */}
                                  {(() => {
                                    const allAssignments = getAssignmentsForCell(polo._id, settimana._id);
                                    const sharedVehicle = allAssignments.length === 2 && 
                                      allAssignments[0].mezzoId?._id === allAssignments[1].mezzoId?._id;
                                    
                                    if (sharedVehicle) {
                                      return <span className="text-blue-300 text-xs ml-1">🤝</span>;
                                    }
                                    return null;
                                  })()}
                                </div>
                                {assignment.postazioneId && (
                                  <div className="text-white/60 flex items-center justify-center gap-1 mt-1">
                                    <Building className="w-3 h-3" />
                                    {assignment.postazioneId.nome}
                                  </div>
                                )}
                                {/* ✅ NUOVO: Mostra ordine nel calendario */}
                                {assignment.ordine && (
                                  <div className="text-green-300 flex items-center justify-center gap-1 mt-1">
                                    <Hash className="w-3 h-3" />
                                    <span className="text-xs">
                                      {typeof assignment.ordine === 'object' ? assignment.ordine.numero : assignment.ordine}
                                    </span>
                                  </div>
                                )}
                                {/* ✅ NUOVO: Mostra RDT nel calendario */}
                                {assignment.rdt && (
                                  <div className="text-purple-300 flex items-center justify-center gap-1 mt-1">
                                    <Clipboard className="w-3 h-3" />
                                    <span className="text-xs">
                                      {typeof assignment.rdt === 'object' ? assignment.rdt.numero : assignment.rdt}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                          
                          {/* Indicatore posti liberi */}
                          {assignments.length < 2 && (
                            <div className="text-white/40 text-xs">
                              {2 - assignments.length} posto/i libero/i
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ AGGIORNATA: Legenda con nuovi elementi */}
      <div className="glass-card p-4 rounded-2xl mt-6">
        <h3 className="text-lg font-semibold text-white mb-3">Legenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500/20 border border-blue-400/30 rounded"></div>
            <span className="text-white/80">Assegnazione singola</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/20 border border-green-400/30 rounded"></div>
            <span className="text-white/80">Prima assegnazione (2 operatori)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500/20 border border-orange-400/30 rounded"></div>
            <span className="text-white/80">Seconda assegnazione (2 operatori)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-300 text-lg">🤝</span>
            <span className="text-white/80">Mezzo condiviso tra operatori</span>
          </div>
          {/* ✅ NUOVE ICONE NELLA LEGENDA */}
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-green-300" />
            <span className="text-white/80">Numero Ordine</span>
          </div>
          <div className="flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-purple-300" />
            <span className="text-white/80">Codice RDT</span>
          </div>
        </div>
      </div>

      {/* Stili per il calendario */}
      <style jsx>{`
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

        .glass-button-secondary {
          background: rgba(107, 114, 128, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 114, 128, 0.4);
          box-shadow: 0 4px 16px rgba(107, 114, 128, 0.2);
          color: white;
        }

        .glass-button-secondary:hover {
          background: rgba(107, 114, 128, 0.4);
          box-shadow: 0 8px 24px rgba(107, 114, 128, 0.3);
        }

        .glass-table-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-table-row {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(5px);
        }

        .glass-assignment-cell {
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .glass-assignment-cell:hover {
          transform: scale(1.05);
        }

        /* Sticky column */
        .sticky {
          position: sticky;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default AssignmentsManagement;