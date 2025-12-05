
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
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { useAppContext } from '../../contexts/AppContext';
import { apiCall } from '../../services/api';
import { formatWeek, formatWeekRange, sortAssignmentsByCurrentWeekFirst, sortWeeksChronologically, getCurrentWeekIndex, getCurrentWeekFromList, sortWeeksCenteredOnCurrent } from '../../utils/formatters';
import { listenToOrdiniRdtUpdates, triggerOrdiniRdtUpdate } from '../../utils/events';
// import OrdineRdtModal from './shared/OrdineRdtModal'; // Non più necessario - usiamo DOM puro

const AssignmentsManagement = () => {
  const { token, setError } = useAuth();
  const { users, poli, mezzi, settimane } = useGiacenze();
  const { state, dispatch } = useAppContext();
  const { assegnazioneForm, editAssignmentId, editForm, activeTab } = state;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [stats, setStats] = useState({});
  
  // Stati per ordini e RDT completi
  const [ordiniData, setOrdiniData] = useState([]);
  const [rdtData, setRdtData] = useState([]);
  
  // Stati per il modal ordine/RDT
  const [selectedOrdineRdt, setSelectedOrdineRdt] = useState(null);
  const [showOrdineRdtModal, setShowOrdineRdtModal] = useState(false);


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
  
  // Stato per checkbox "tutte le settimane" - ATTIVO DI DEFAULT
  const [showAllWeeks, setShowAllWeeks] = useState(true);

  // Stati per sorting
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: 'asc'
  });

  // Stati per dati
  const [assegnazioni, setAssegnazioni] = useState([]);
  const [filteredAssegnazioni, setFilteredAssegnazioni] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mouse tracking

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

  // ✅ CARICA STATISTICHE - TEMPORANEAMENTE DISABILITATO PER DEBUGGING
  const loadStats = async () => {
    try {
      console.log('⚠️ DEBUG: Skipping stats caricamento per evitare errori API');
      // const data = await apiCall('/assegnazioni/stats', {}, token);
      setStats({});
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

      console.log('🔍 DEBUG - assegnazioneForm prima dell\'invio:', assegnazioneForm);
      console.log('🔍 DEBUG - assegnazioneData da inviare:', assegnazioneData);

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

  // Trasferisce ordine/RDT da un'assegnazione all'altra
  const transferOrderRdtToAssignment = async (fromAssignmentId, toAssignmentId, assignmentData) => {
    try {
      const fromAssignment = assegnazioni.find(a => a._id === fromAssignmentId);
      const toAssignment = assegnazioni.find(a => a._id === toAssignmentId);
      
      if (!fromAssignment || !toAssignment) {
        console.error('Assegnazioni non trovate per il trasferimento');
        return;
      }

      const updates = [];

      // Trasferisci ordine se presente
      if (fromAssignment.ordine) {
        const numeroOrdine = typeof fromAssignment.ordine === 'object' 
          ? fromAssignment.ordine.numero 
          : fromAssignment.ordine;

        // Aggiorna l'ordine con i nuovi dati
        const ordineCompleto = ordiniData.find(o => o.numero === numeroOrdine);
        if (ordineCompleto) {
          updates.push(
            apiCall(`/ordini/${ordineCompleto._id}`, {
              method: 'PUT',
              body: JSON.stringify({
                operatoreId: assignmentData.userId,
                settimanaId: assignmentData.settimanaId,
                poloId: assignmentData.poloId
              })
            }, token)
          );
        }

        // Aggiungi ordine all'assegnazione di destinazione (solo il campo ordine)
        updates.push(
          apiCall(`/assegnazioni/${toAssignmentId}`, {
            method: 'PUT',
            body: JSON.stringify({
              ordine: numeroOrdine
            })
          }, token)
        );

        // Rimuovi ordine dall'assegnazione di origine (solo il campo ordine)
        updates.push(
          apiCall(`/assegnazioni/${fromAssignmentId}`, {
            method: 'PUT', 
            body: JSON.stringify({
              ordine: null
            })
          }, token)
        );
      }

      // Trasferisci RDT se presente
      if (fromAssignment.rdt) {
        const numeroRdt = typeof fromAssignment.rdt === 'object' 
          ? fromAssignment.rdt.numero 
          : fromAssignment.rdt;

        // Aggiorna l'RDT con i nuovi dati
        const rdtCompleto = rdtData.find(r => r.numero === numeroRdt);
        if (rdtCompleto) {
          updates.push(
            apiCall(`/rdt/${rdtCompleto._id}`, {
              method: 'PUT',
              body: JSON.stringify({
                operatoreId: assignmentData.userId,
                settimanaId: assignmentData.settimanaId,
                poloId: assignmentData.poloId
              })
            }, token)
          );
        }

        // Aggiungi RDT all'assegnazione di destinazione (solo il campo rdt)
        updates.push(
          apiCall(`/assegnazioni/${toAssignmentId}`, {
            method: 'PUT',
            body: JSON.stringify({
              rdt: numeroRdt
            })
          }, token)
        );

        // Rimuovi RDT dall'assegnazione di origine (solo il campo rdt)
        updates.push(
          apiCall(`/assegnazioni/${fromAssignmentId}`, {
            method: 'PUT',
            body: JSON.stringify({
              rdt: null
            })
          }, token)
        );
      }

      // Esegui tutti gli aggiornamenti
      if (updates.length > 0) {
        await Promise.all(updates);
        console.log('✅ Trasferimento completato', { from: fromAssignmentId, to: toAssignmentId });
      }

    } catch (err) {
      console.error('❌ Errore nel trasferimento:', err);
      throw err; // Rilancia l'errore per gestirlo nel chiamante
    }
  };

  // Sincronizza ordini/RDT con i dati aggiornati dell'assegnazione  
  const syncOrdersRdtWithAssignment = async (assignmentId, assignmentData) => {
    try {
      // Trova l'assegnazione corrente per ottenere ordine/RDT collegati
      const currentAssignment = assegnazioni.find(a => a._id === assignmentId);
      if (!currentAssignment) return;

      const updates = [];

      // Sincronizza ordine se presente nell'assegnazione corrente
      if (currentAssignment.ordine) {
        const numeroOrdine = typeof currentAssignment.ordine === 'object' 
          ? currentAssignment.ordine.numero 
          : currentAssignment.ordine;
        
        const ordineCompleto = ordiniData.find(o => o.numero === numeroOrdine);
        if (ordineCompleto) {
          updates.push(
            apiCall(`/ordini/${ordineCompleto._id}`, {
              method: 'PUT',
              body: JSON.stringify({
                operatoreId: assignmentData.userId,
                settimanaId: assignmentData.settimanaId,
                poloId: assignmentData.poloId
              })
            }, token)
          );
        }
      }

      // Sincronizza RDT se presente nell'assegnazione corrente
      if (currentAssignment.rdt) {
        const numeroRdt = typeof currentAssignment.rdt === 'object' 
          ? currentAssignment.rdt.numero 
          : currentAssignment.rdt;
        
        const rdtCompleto = rdtData.find(r => r.numero === numeroRdt);
        if (rdtCompleto) {
          updates.push(
            apiCall(`/rdt/${rdtCompleto._id}`, {
              method: 'PUT',
              body: JSON.stringify({
                operatoreId: assignmentData.userId,
                settimanaId: assignmentData.settimanaId,
                poloId: assignmentData.poloId
              })
            }, token)
          );
        }
      }

      // Esegui tutti gli aggiornamenti
      if (updates.length > 0) {
        await Promise.all(updates);
        console.log('✅ Ordini/RDT sincronizzati con l\'assegnazione', { assignmentId, updates: updates.length });
      }
    } catch (err) {
      console.error('❌ Errore nella sincronizzazione ordini/RDT:', err);
      // Non bloccare l'operazione principale per errori di sincronizzazione
    }
  };

  const handleUpdateAssignment = async (assignmentId) => {
    try {
      // Controllo conflitti avanzato: verifica se la nuova assegnazione ha già ordini/RDT
      if (editForm.userId && editForm.settimanaId) {
        const targetAssignment = assegnazioni.find(a => 
          a._id !== assignmentId && // Escludi l'assegnazione corrente
          a.userId?._id === editForm.userId && 
          a.settimanaId?._id === editForm.settimanaId && 
          a.attiva
        );

        if (targetAssignment) {
          // Controlla se la nuova assegnazione ha già ordini o RDT associati
          if (targetAssignment.ordine || targetAssignment.rdt) {
            const operatoreName = users.find(u => u._id === editForm.userId)?.username || 'Operatore';
            const weekName = settimane.find(s => s._id === editForm.settimanaId)?.nome || 'Settimana';
            const poloName = targetAssignment.poloId?.nome || 'Polo sconosciuto';
            const hasOrdine = targetAssignment.ordine ? `ordine "${targetAssignment.ordine}"` : '';
            const hasRdt = targetAssignment.rdt ? `RDT "${targetAssignment.rdt}"` : '';
            const items = [hasOrdine, hasRdt].filter(Boolean).join(' e ');
            
            setError(`🚫 CONFLITTO: L'assegnazione di ${operatoreName} per ${weekName} al polo "${poloName}" ha già ${items} associati. Non è possibile trasferire ordini/RDT verso un'assegnazione già occupata.`);
            return;
          }
          // Se non ha ordini/RDT, il trasferimento è possibile e continua
        }
      }

      // Prepara i dati di aggiornamento preservando ordine/RDT esistenti
      const currentAssignment = assegnazioni.find(a => a._id === assignmentId);
      const updateData = {
        userId: editForm.userId,
        poloId: editForm.poloId,
        mezzoId: editForm.mezzoId,
        settimanaId: editForm.settimanaId,
        note: editForm.note,
        // Preserva ordine e RDT esistenti
        ordine: currentAssignment?.ordine || null,
        rdt: currentAssignment?.rdt || null
      };

      // Implementa trasferimento se necessario
      const targetAssignment = assegnazioni.find(a => 
        a._id !== assignmentId &&
        a.userId?._id === updateData.userId && 
        a.settimanaId?._id === updateData.settimanaId && 
        a.attiva
      );

      if (targetAssignment) {
        // TRASFERIMENTO: Sposta ordine/RDT all'assegnazione esistente
        await transferOrderRdtToAssignment(assignmentId, targetAssignment._id, updateData);
      } else {
        // AGGIORNAMENTO: Modifica direttamente l'assegnazione corrente
        await apiCall(`/assegnazioni/${assignmentId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        }, token);

        // Sincronizza ordini/RDT collegati con i nuovi dati dell'assegnazione
        await syncOrdersRdtWithAssignment(assignmentId, updateData);
      }

      await loadAssegnazioni();
      await loadStats(); // ✅ RICARICA STATISTICHE
      await loadOrdiniRdtData(); // ✅ RICARICA ORDINI/RDT DOPO SINCRONIZZAZIONE
      setEditAssignmentId(null);
      
      // Messaggio diverso per trasferimento o aggiornamento
      const wasTransferred = targetAssignment && (currentAssignment?.ordine || currentAssignment?.rdt);
      if (wasTransferred) {
        setError('✅ Assegnazione modificata con successo. Ordini/RDT trasferiti all\'assegnazione esistente.');
      } else {
        setError('✅ Assegnazione modificata con successo. Ordini/RDT sincronizzati.');
      }
      
      // Trigger evento per notificare OrdiniManagement della modifica
      triggerOrdiniRdtUpdate({
        action: 'assignment_sync_completed',
        assignmentId: assignmentId,
        operatorId: updateData.userId,
        weekId: updateData.settimanaId,
        poloId: updateData.poloId
      });
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
  // Carica dati di ordini e RDT
  const loadOrdiniRdtData = async (showNotification = false) => {
    try {
      const [ordiniResponse, rdtResponse] = await Promise.all([
        apiCall('/ordini', {}, token),
        apiCall('/rdt', {}, token)
      ]);
      
      const newOrdiniData = ordiniResponse?.ordini || [];
      const newRdtData = rdtResponse?.rdt || [];
      
      // Controlla se ci sono cambiamenti nei dati
      const hasChanges = JSON.stringify(newOrdiniData) !== JSON.stringify(ordiniData) ||
                        JSON.stringify(newRdtData) !== JSON.stringify(rdtData);
      
      setOrdiniData(newOrdiniData);
      setRdtData(newRdtData);
      
      // Mostra notifica solo se richiesta e ci sono cambiamenti
      if (showNotification && hasChanges && (newOrdiniData.length > 0 || newRdtData.length > 0)) {
        showUpdateNotification();
      }
      
    } catch (err) {
      console.error('Errore nel caricamento ordini/RDT:', err);
      setOrdiniData([]);
      setRdtData([]);
    }
  };

  // Funzione per mostrare notifica di aggiornamento
  const showUpdateNotification = () => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(34, 197, 94, 0.9);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      z-index: 1000000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = '🔄 Dati ordini/RDT aggiornati';
    document.body.appendChild(notification);
    
    // Rimuovi notifica dopo 3 secondi
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // Funzione utility per inviare evento di aggiornamento (esportabile per altri componenti)
  const triggerOrdiniRdtUpdate = (details = {}) => {
    const event = new CustomEvent('ordini-rdt-updated', { 
      detail: { 
        timestamp: Date.now(), 
        source: 'AssignmentsManagement',
        ...details 
      } 
    });
    window.dispatchEvent(event);
    console.log('📡 Evento ordini-rdt-updated inviato', details);
  };

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

  // Funzione per gestire il sorting
  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Funzione per ordinare le assegnazioni
  const sortAssegnazioni = (data) => {
    if (!sortConfig.field) return data;

    return [...data].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.field) {
        case 'operatore':
          aVal = a.userId?.username || '';
          bVal = b.userId?.username || '';
          break;
        case 'polo':
          aVal = a.poloId?.nome || '';
          bVal = b.poloId?.nome || '';
          break;
        case 'mezzo':
          aVal = a.mezzoId?.nome || '';
          bVal = b.mezzoId?.nome || '';
          break;
        case 'ordine':
          aVal = (typeof a.ordine === 'object' ? a.ordine?.numero : a.ordine) || '';
          bVal = (typeof b.ordine === 'object' ? b.ordine?.numero : b.ordine) || '';
          break;
        case 'rdt':
          aVal = (typeof a.rdt === 'object' ? a.rdt?.numero : a.rdt) || '';
          bVal = (typeof b.rdt === 'object' ? b.rdt?.numero : b.rdt) || '';
          break;
        case 'settimana':
          aVal = a.settimanaId?.numero || 0;
          bVal = b.settimanaId?.numero || 0;
          // Se hanno lo stesso numero, ordina per anno
          if (aVal === bVal) {
            aVal = a.settimanaId?.anno || 0;
            bVal = b.settimanaId?.anno || 0;
          }
          break;
        case 'stato':
          aVal = a.attiva ? 1 : 0;
          bVal = b.attiva ? 1 : 0;
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

  // ✅ FUNZIONE PER RAGGRUPPARE ASSEGNAZIONI con stesso polo/settimana
  const groupAssegnazioni = (assegnazioni) => {
    const grouped = new Map();
    const result = [];

    assegnazioni.forEach(assegnazione => {
      // Crea chiave univoca: polo + settimana + settimanaFine
      const key = `${assegnazione.poloId?._id || ''}_${assegnazione.settimanaId?._id || ''}_${assegnazione.settimanaFineId?._id || ''}`;

      if (!grouped.has(key)) {
        // Prima assegnazione di questo gruppo
        grouped.set(key, {
          ...assegnazione,
          operatore2: null  // Placeholder per il secondo operatore
        });
      } else {
        // Seconda assegnazione dello stesso gruppo - aggiungi come operatore2
        const existing = grouped.get(key);
        existing.operatore2 = assegnazione.userId;  // Salva il secondo operatore
        existing._id2 = assegnazione._id;  // Salva anche l'ID della seconda assegnazione per eliminazione
      }
    });

    // Converti Map in array
    grouped.forEach(value => result.push(value));

    return result;
  };

  // Applica filtri locali - ✅ AGGIORNATO per includere ordine e rdt nella ricerca + raggruppamento
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

    // Applica sorting
    filtered = sortAssegnazioni(filtered);

    // ✅ RAGGRUPPA assegnazioni con stesso polo/settimana
    filtered = groupAssegnazioni(filtered);

    setFilteredAssegnazioni(filtered);
  }, [assegnazioni, filters.searchTerm, sortConfig]);

  // Ricarica quando cambiano i filtri principali - ✅ AGGIORNATO
  useEffect(() => {
    loadAssegnazioni();
  }, [filters.userId, filters.poloId, filters.mezzoId, filters.settimanaId, filters.attiva, filters.ordine, filters.rdt, showAllWeeks]);

  // Carica dati iniziali - dipende dal token
  useEffect(() => {
    if (token) {
      loadAssegnazioni();
      loadStats(); // ✅ CARICA STATISTICHE INIZIALI
      loadOrdiniRdtData(); // ✅ CARICA DATI ORDINI E RDT
    }
  }, [token]);

  // Aggiornamento automatico dei dati quando si torna alla tab assegnazioni
  useEffect(() => {
    if (activeTab === 'assegnazioni') {
      loadOrdiniRdtData();
    }
  }, [activeTab]);

  // Ricarica dati quando il componente diventa visibile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && token) {
        loadOrdiniRdtData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token]);

  // Sistema di eventi per aggiornamento immediato quando dati vengono modificati
  useEffect(() => {
    const handleOrdiniRdtUpdate = (event) => {
      console.log('🔔 Evento ricevuto: dati ordini/RDT modificati', event.detail);
      loadOrdiniRdtData();
      showUpdateNotification();
    };

    // Ascolta eventi di aggiornamento ordini/RDT
    window.addEventListener('ordini-rdt-updated', handleOrdiniRdtUpdate);
    
    return () => {
      window.removeEventListener('ordini-rdt-updated', handleOrdiniRdtUpdate);
    };
  }, []);

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Helper per trovare i dati completi di un ordine
  const getOrdineCompleto = (numeroOrdine) => {
    if (!numeroOrdine) return null;
    return ordiniData.find(ordine => ordine.numero === numeroOrdine);
  };

  // Helper per trovare i dati completi di un RDT
  const getRdtCompleto = (numeroRdt) => {
    if (!numeroRdt) return null;
    return rdtData.find(rdt => rdt.numero === numeroRdt);
  };

  // Apri modal per ordine/RDT
  const openOrdineRdtModal = (numeroOrdine, numeroRdt) => {
    let itemData = null;
    
    // Trova i dati reali dell'ordine/RDT
    if (numeroOrdine) {
      itemData = getOrdineCompleto(numeroOrdine);
      if (itemData) {
        itemData.itemType = 'ordine';
      }
    } else if (numeroRdt) {
      itemData = getRdtCompleto(numeroRdt);
      if (itemData) {
        itemData.itemType = 'rdt';
      }
    }
    
    if (itemData) {
      createDOMModal(itemData);
    } else {
      setError('Dati non trovati per ' + (numeroOrdine ? 'ordine ' + numeroOrdine : 'RDT ' + numeroRdt));
    }
  };
  
  // Funzione per creare modal con DOM puro usando dati reali
  const createDOMModal = (itemData) => {
    // Rimuovi modal esistente
    const existingModal = document.getElementById('real-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Ottieni il tema corrente
    const colorMode = state.colorMode || 'default';
    const themes = {
      default: 'linear-gradient(to bottom right, rgb(49, 46, 129), rgb(88, 28, 135), rgb(157, 23, 77))',
      blue: 'linear-gradient(to bottom right, rgb(30, 58, 138), rgb(29, 78, 216), rgb(37, 99, 235))',
      green: 'linear-gradient(to bottom right, rgb(20, 83, 45), rgb(22, 101, 52), rgb(21, 128, 61))',
      sunset: 'linear-gradient(to bottom right, rgb(124, 58, 237), rgb(236, 72, 153), rgb(251, 146, 60))',
      ocean: 'linear-gradient(to bottom right, rgb(13, 148, 136), rgb(6, 182, 212), rgb(14, 165, 233))',
      dark: 'linear-gradient(to bottom right, rgb(17, 24, 39), rgb(31, 41, 55), rgb(55, 65, 81))'
    };
    const bgGradient = themes[colorMode] || themes.default;

    const modalDiv = document.createElement('div');
    modalDiv.id = 'real-modal';
    modalDiv.style.cssText = `
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999999;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    `;
    
    modalDiv.innerHTML = `
      <div class="glass-card-large" style="
        max-width: 900px;
        width: 95%;
        max-height: calc(90vh - 64px);
        overflow-y: auto;
        border-radius: 24px;
        padding: 2rem;
        margin: 1rem;
        background: ${bgGradient};
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      ">
        <!-- Header del modal -->
        <div class="glass-card-header" style="
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding-bottom: 1.5rem;
        ">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="glass-icon" style="
              width: 3rem; 
              height: 3rem; 
              border-radius: 12px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              font-size: 1.5rem;
            ">
              ${itemData.itemType === 'ordine' ? '📦' : '📋'}
            </div>
            <h2 style="
              margin: 0; 
              font-size: 1.875rem; 
              font-weight: 700; 
              color: white;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            ">
              ${itemData.itemType === 'ordine' ? 'Dettagli Ordine' : 'Dettagli RDT'}
            </h2>
          </div>
          <button id="close-real-modal" style="
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 0.75rem;
            cursor: pointer;
            font-size: 1.5rem;
            color: white;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
            ✕
          </button>
        </div>
        
        <!-- Contenuto principale -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
          <div class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
            <label style="
              display: block; 
              font-weight: 600; 
              color: rgba(255, 255, 255, 0.9); 
              margin-bottom: 0.75rem;
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">Numero</label>
            <div style="
              font-size: 1.125rem;
              font-weight: 600;
              color: white;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            ">
              ${itemData.numero}
            </div>
          </div>
          
          <div class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
            <label style="
              display: block; 
              font-weight: 600; 
              color: rgba(255, 255, 255, 0.9); 
              margin-bottom: 0.75rem;
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">Cliente</label>
            <div style="
              font-size: 1.125rem;
              font-weight: 600;
              color: white;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            ">
              ${itemData.cliente}
            </div>
          </div>
          
          <div class="glass-card" style="grid-column: 1 / -1; padding: 1.5rem; border-radius: 16px;">
            <label style="
              display: block; 
              font-weight: 600; 
              color: rgba(255, 255, 255, 0.9); 
              margin-bottom: 0.75rem;
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">Descrizione</label>
            <div style="
              font-size: 1rem;
              color: rgba(255, 255, 255, 0.9);
              line-height: 1.5;
            ">
              ${itemData.descrizione || 'Nessuna descrizione'}
            </div>
          </div>
          
          <div class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
            <label style="
              display: block; 
              font-weight: 600; 
              color: rgba(255, 255, 255, 0.9); 
              margin-bottom: 0.75rem;
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">Data Consegna</label>
            <div style="
              font-size: 1.125rem;
              font-weight: 600;
              color: white;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            ">
              ${new Date(itemData.dataConsegna).toLocaleDateString('it-IT')}
            </div>
          </div>
          
          <div class="glass-card" style="padding: 1.5rem; border-radius: 16px;">
            <label style="
              display: block; 
              font-weight: 600; 
              color: rgba(255, 255, 255, 0.9); 
              margin-bottom: 0.75rem;
              font-size: 0.875rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            ">Priorità</label>
            <div style="
              font-size: 1.125rem;
              font-weight: 600;
              color: white;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            ">
              ${itemData.priorita}
            </div>
          </div>
        </div>
        
        ${itemData.prodotti && itemData.prodotti.length > 0 ? `
        <div class="glass-card" style="margin-bottom: 2rem; padding: 1.5rem; border-radius: 16px;">
          <label style="
            display: block; 
            font-weight: 600; 
            color: rgba(255, 255, 255, 0.9); 
            margin-bottom: 1rem;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">Prodotti</label>
          <div style="space-y: 0.5rem;">
            ${itemData.prodotti.map(p => `
              <div style="
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                margin-bottom: 0.5rem;
              ">
                <div style="
                  font-weight: 600;
                  color: white;
                  margin-bottom: 0.25rem;
                ">${p.nome}</div>
                <div style="
                  font-size: 0.875rem;
                  color: rgba(255, 255, 255, 0.8);
                ">
                  Quantità: ${p.quantita} ${p.unita || 'pz'}
                  ${p.prezzo ? ` • €${p.prezzo.toFixed(2)}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- Pulsanti -->
        <div style="
          display: flex; 
          justify-content: flex-end; 
          gap: 1rem; 
          margin-top: 2rem;
        ">
          <button id="close-real-modal-btn" class="glass-card" style="
            padding: 0.875rem 1.75rem;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.transform='translateY(0)'">
            Chiudi
          </button>
          <button id="goto-management-btn" class="glass-card" style="
            padding: 0.875rem 1.75rem;
            border-radius: 12px;
            border: 1px solid rgba(59, 130, 246, 0.5);
            background: rgba(59, 130, 246, 0.2);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          " onmouseover="this.style.background='rgba(59, 130, 246, 0.3)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(59, 130, 246, 0.2)'; this.style.transform='translateY(0)'">
            ${itemData.itemType === 'ordine' ? 'Vai a Ordini' : 'Vai a RDT'}
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modalDiv);
    
    // Event listeners
    document.getElementById('close-real-modal').onclick = () => modalDiv.remove();
    document.getElementById('close-real-modal-btn').onclick = () => modalDiv.remove();
    
    // Pulsante "Vai a Ordini/RDT" - naviga a OrdiniManagement
    document.getElementById('goto-management-btn').onclick = () => {
      console.log('🔍 DEBUG: Click su Vai a Ordini');
      console.log('🔍 DEBUG: activeTab attuale:', activeTab);
      
      modalDiv.remove();
      
      try {
        if (activeTab !== 'ordini') {
          // Solo naviga se non siamo già nella sezione ordini
          dispatch({ type: 'SET_ACTIVE_TAB', payload: 'ordini' });
          console.log('✅ DEBUG: Navigato alla sezione ordini');
        } else {
          console.log('✅ DEBUG: Già nella sezione ordini - scroll verso alto');
        }
        
        // Scroll verso l'alto per una migliore UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('❌ DEBUG: Errore nel dispatch:', error);
        alert('Errore nella navigazione: ' + error.message);
      }
    };
    
    // Chiudi cliccando fuori dal modal
    modalDiv.onclick = (e) => {
      if (e.target === modalDiv) {
        modalDiv.remove();
      }
    };
  };

  // Chiudi modal
  const closeOrdineRdtModal = () => {
    setSelectedOrdineRdt(null);
    setShowOrdineRdtModal(false);
  };

  // Callback per aggiornamenti dal modal
  const handleOrdineRdtModalSave = () => {
    loadOrdiniRdtData(); // Ricarica i dati aggiornati
    loadAssegnazioni();  // Ricarica le assegnazioni per vedere i cambiamenti
    closeOrdineRdtModal();
  };

  // Soft delete (disattiva) - ✅ AGGIORNATO per gestire assegnazioni collegate
  const handleSoftDelete = async (assegnazioneId) => {
    // Trova l'assegnazione corrente per vedere se ha un operatore2
    const assegnazione = filteredAssegnazioni.find(a => a._id === assegnazioneId);
    const hasOperatore2 = assegnazione?.operatore2 && assegnazione?._id2;

    const message = hasOperatore2
      ? `Questa assegnazione ha 2 operatori collegati. Vuoi disattivare entrambe le assegnazioni?`
      : 'Sei sicuro di voler disattivare questa assegnazione?';

    if (!window.confirm(message)) return;

    try {
      setError('');

      // Disattiva la prima assegnazione
      await apiCall(`/assegnazioni/${assegnazioneId}`, { method: 'DELETE' }, token);

      // Se ha operatore2, disattiva anche la seconda assegnazione
      if (hasOperatore2) {
        await apiCall(`/assegnazioni/${assegnazione._id2}`, { method: 'DELETE' }, token);
      }

      await loadAssegnazioni();
      await loadStats(); // ✅ RICARICA STATISTICHE

      const successMessage = hasOperatore2
        ? 'Entrambe le assegnazioni disattivate con successo'
        : 'Assegnazione disattivata con successo';

      setError(successMessage);
    } catch (err) {
      setError('Errore nella disattivazione: ' + err.message);
    }
  };

  // Hard delete (eliminazione definitiva) - ✅ AGGIORNATO per gestire assegnazioni collegate
  const handleHardDelete = async (assegnazioneId) => {
    // Trova l'assegnazione corrente per vedere se ha un operatore2
    const assegnazione = filteredAssegnazioni.find(a => a._id === assegnazioneId);
    const hasOperatore2 = assegnazione?.operatore2 && assegnazione?._id2;

    const message = hasOperatore2
      ? '⚠️ ATTENZIONE: Questa assegnazione ha 2 operatori collegati. Questa azione eliminerà DEFINITIVAMENTE ENTRAMBE le assegnazioni e ripristinerà tutti gli utilizzi correlati. Questa operazione NON può essere annullata. Sei sicuro?'
      : '⚠️ ATTENZIONE: Questa azione eliminerà DEFINITIVAMENTE l\'assegnazione e ripristinerà tutti gli utilizzi correlati. Questa operazione NON può essere annullata. Sei sicuro?';

    if (!window.confirm(message)) return;

    try {
      setError('');

      // Elimina la prima assegnazione
      const response1 = await apiCall(`/assegnazioni/${assegnazioneId}/permanent`, { method: 'DELETE' }, token);
      let totalUtilizzi = response1.utilizziRipristinati || 0;

      // Se ha operatore2, elimina anche la seconda assegnazione
      if (hasOperatore2) {
        const response2 = await apiCall(`/assegnazioni/${assegnazione._id2}/permanent`, { method: 'DELETE' }, token);
        totalUtilizzi += response2.utilizziRipristinati || 0;
      }

      await loadAssegnazioni();
      await loadStats(); // ✅ RICARICA STATISTICHE

      const successMessage = hasOperatore2
        ? `Eliminazione completata: ${totalUtilizzi} utilizzi totali ripristinati (entrambe le assegnazioni)`
        : `Eliminazione completata: ${totalUtilizzi} utilizzi ripristinati`;

      setError(successMessage);
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
      ordiniData={ordiniData}
      rdtData={rdtData}
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
                Operatore 1 *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.userId}
                  onChange={(e) => updateAssegnazioneForm({ userId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona operatore 1</option>
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
                <UserCheck className="w-4 h-4 inline mr-2" />
                Operatore 2 (opzionale)
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.userId2 || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : e.target.value;
                    updateAssegnazioneForm({ userId2: value });
                  }}
                >
                  <option value="" className="bg-gray-800">Nessuno (solo operatore 1)</option>
                  {users
                    .filter(u => u.role === 'user' && u._id !== assegnazioneForm.userId)
                    .map(user => (
                      <option key={user._id} value={user._id} className="bg-gray-800">
                        {user.username}
                      </option>
                    ))
                  }
                </select>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Crea 2 assegnazioni collegate per lo stesso polo/settimana
              </p>
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

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <CalendarDays className="w-4 h-4 inline mr-2" />
                Settimana Fine (opzionale)
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={assegnazioneForm.settimanaFineId || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : e.target.value;
                    console.log('settimanaFineId onChange:', value);
                    updateAssegnazioneForm({ settimanaFineId: value });
                  }}
                >
                  <option value="" className="bg-gray-800">Nessuna (singola settimana)</option>
                  {sortedSettimane
                    .filter(s => {
                      // Mostra solo settimane successive o uguali a settimanaId
                      if (!assegnazioneForm.settimanaId) return false;
                      const inizioWeek = settimane.find(w => w._id === assegnazioneForm.settimanaId);
                      if (!inizioWeek) return false;
                      return (s.anno > inizioWeek.anno) ||
                             (s.anno === inizioWeek.anno && s.numero >= inizioWeek.numero);
                    })
                    .map((settimana) => (
                      <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                        {formatWeek(settimana)}
                      </option>
                    ))
                  }
                </select>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Lascia vuoto per assegnazione di una singola settimana
              </p>
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
              
              {/* Dropdown settimane (sempre visibile, disabilitato quando checkbox è selezionata) */}
              <select
                className={`glass-input w-full px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white ${showAllWeeks ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={filters.settimanaId}
                onChange={(e) => updateFilters({ settimanaId: e.target.value })}
                disabled={showAllWeeks}
              >
                <option value="" className="bg-gray-800">
                  {showAllWeeks ? 'Tutte le settimane selezionate' : 'Seleziona settimana'}
                </option>
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
          
          <div className="overflow-x-auto">
            {loading ? (
              // Skeleton loading animation
              <div className="space-y-2">
                {/* Header skeleton */}
                <div className="glass-table-header-row flex">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-1 px-6 py-3">
                      <div className="animate-pulse bg-white/20 h-4 rounded"></div>
                    </div>
                  ))}
                </div>
                
                {/* Row skeletons */}
                {[...Array(5)].map((_, rowIndex) => (
                  <div key={rowIndex} className="glass-table-row flex border-t border-white/5">
                    {[...Array(4)].map((_, colIndex) => (
                      <div key={colIndex} className="flex-1 px-6 py-4">
                        <div className="animate-pulse bg-white/10 h-4 rounded" 
                             style={{ animationDelay: `${(rowIndex * 4 + colIndex) * 100}ms` }}>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
                <table className="min-w-full divide-y divide-white/10">
                <thead className="glass-table-header">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('operatore')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Operatore 1</span>
                        {sortConfig.field === 'operatore' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Operatore 2</span>
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
                      onClick={() => handleSort('mezzo')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Mezzo</span>
                        {sortConfig.field === 'mezzo' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    {/* ✅ NUOVE COLONNE */}
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('ordine')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Ordine</span>
                        {sortConfig.field === 'ordine' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('rdt')}
                    >
                      <div className="flex items-center gap-2">
                        <span>RDT</span>
                        {sortConfig.field === 'rdt' && (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => handleSort('stato')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Stato</span>
                        {sortConfig.field === 'stato' && (
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

                      {/* ✅ OPERATORE 2 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assegnazione.operatore2 ? (
                          <div className="flex items-center">
                            <div className="glass-avatar w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {assegnazione.operatore2.username}
                              </div>
                              <div className="text-sm text-white/50">
                                {assegnazione.operatore2.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-white/30 italic">
                            -
                          </div>
                        )}
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
                              {sortedSettimane.filter(s => {
                                // Mostra solo settimane dove l'operatore selezionato ha assegnazioni attive
                                if (!editForm.userId) return true; // Se nessun operatore selezionato, mostra tutte
                                return assegnazioni.some(a =>
                                  a.userId?._id === editForm.userId &&
                                  a.settimanaId?._id === s._id &&
                                  a.attiva
                                );
                              }).map(s => (
                                <option key={s._id} value={s._id} className="bg-gray-800">
                                  {formatWeek(s)}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-white">
                              {formatWeekRange(assegnazione.settimanaId, assegnazione.settimanaFineId)}
                            </div>
                          </div>
                        )}
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

                      {/* ✅ ORDINE - cliccabile con dati completi */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {editAssignmentId === assegnazione._id ? (
                            <div className="text-white/70 italic text-sm">
                              {editForm.ordine || 'Nessun ordine'}
                              <div className="text-xs text-white/50 mt-1">
                                Modificabile solo da Ordini Management
                              </div>
                            </div>
                          ) : (
                            <>
                              <Hash className="w-4 h-4 mr-2 text-green-400" />
                              <div className="text-sm text-white">
                                {assegnazione.ordine ? (
                                  (() => {
                                    const numeroOrdine = typeof assegnazione.ordine === 'object' 
                                      ? assegnazione.ordine.numero 
                                      : assegnazione.ordine;
                                    const ordineCompleto = getOrdineCompleto(numeroOrdine);
                                    
                                    return (
                                      <button
                                        onClick={() => openOrdineRdtModal(ordineCompleto?.numero || numeroOrdine, null)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors underline"
                                        title={ordineCompleto ? `Cliente: ${ordineCompleto.cliente}` : 'Clicca per vedere dettagli'}
                                      >
                                        {ordineCompleto?.numero || numeroOrdine}
                                        {ordineCompleto && (
                                          <div className="text-xs text-white/60 mt-1">
                                            {ordineCompleto.cliente}
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })()
                                ) : (
                                  <span className="text-white/40 italic">Non assegnato</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* ✅ RDT - cliccabile con dati completi */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {editAssignmentId === assegnazione._id ? (
                            <div className="text-white/70 italic text-sm">
                              {editForm.rdt || 'Nessun RDT'}
                              <div className="text-xs text-white/50 mt-1">
                                Modificabile solo da Ordini Management
                              </div>
                            </div>
                          ) : (
                            <>
                              <Clipboard className="w-4 h-4 mr-2 text-purple-400" />
                              <div className="text-sm text-white">
                                {assegnazione.rdt ? (
                                  (() => {
                                    const numeroRdt = typeof assegnazione.rdt === 'object' 
                                      ? assegnazione.rdt.numero 
                                      : assegnazione.rdt;
                                    const rdtCompleto = getRdtCompleto(numeroRdt);
                                    
                                    return (
                                      <button
                                        onClick={() => openOrdineRdtModal(null, rdtCompleto?.numero || numeroRdt)}
                                        className="text-purple-400 hover:text-purple-300 transition-colors underline"
                                        title={rdtCompleto ? `Cliente: ${rdtCompleto.cliente}` : 'Clicca per vedere dettagli'}
                                      >
                                        {rdtCompleto?.numero || numeroRdt}
                                        {rdtCompleto && (
                                          <div className="text-xs text-white/60 mt-1">
                                            {rdtCompleto.cliente}
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })()
                                ) : (
                                  <span className="text-white/40 italic">Non assegnato</span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
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
              )}

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
const CalendarView = ({ assegnazioni, poli, settimane, ordiniData, rdtData, onBackToList }) => {
  const [filteredPoli, setFilteredPoli] = useState(poli);
  const [filteredSettimane, setFilteredSettimane] = useState(settimane);
  
  // Stato per loading iniziale del calendario
  const [loading, setLoading] = useState(true);
  
  // Simula caricamento iniziale per il calendario
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Helper per trovare i dati completi di un ordine
  const getOrdineCompleto = (numeroOrdine) => {
    if (!numeroOrdine) return null;
    return ordiniData.find(ordine => ordine.numero === numeroOrdine);
  };

  // Helper per trovare i dati completi di un RDT
  const getRdtCompleto = (numeroRdt) => {
    if (!numeroRdt) return null;
    return rdtData.find(rdt => rdt.numero === numeroRdt);
  };
  
  // Ordina settimane cronologicamente
  const sortedSettimane = sortWeeksChronologically(filteredSettimane);
  
  // Trova l'indice della settimana corrente per lo scroll automatico
  const currentWeekIndex = getCurrentWeekIndex(sortedSettimane);
  
  // Ref per lo scroll automatico alla settimana corrente
  const tableRef = useRef(null);
  const currentWeekRef = useRef(null);
  const hasScrolledToCurrentWeek = useRef(false);

  // Scroll alla settimana corrente SOLO al primo montaggio
  useEffect(() => {
    if (currentWeekRef.current && tableRef.current && !hasScrolledToCurrentWeek.current) {
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

      hasScrolledToCurrentWeek.current = true;
    }
  }, [sortedSettimane, currentWeekIndex]);
  
  // Funzione per ottenere assegnazioni per polo/settimana
  const getAssignmentsForCell = (poloId, settimanaId) => {
    // Trova la settimana corrente per confrontare
    const currentSettimana = sortedSettimane.find(s => s._id === settimanaId);
    if (!currentSettimana) return [];

    return assegnazioni.filter(a => {
      if (a.poloId?._id !== poloId || !a.attiva) return false;

      const settimanaInizio = a.settimanaId;
      const settimanaFine = a.settimanaFineId || a.settimanaId; // Se non c'è fine, usa inizio

      if (!settimanaInizio) return false;

      // Controlla se la settimana corrente è nel range dell'assegnazione
      const currentYear = currentSettimana.anno;
      const currentWeek = currentSettimana.numero;

      const startYear = settimanaInizio.anno;
      const startWeek = settimanaInizio.numero;

      const endYear = settimanaFine.anno;
      const endWeek = settimanaFine.numero;

      // Confronto: current >= start && current <= end
      const isAfterStart = (currentYear > startYear) || (currentYear === startYear && currentWeek >= startWeek);
      const isBeforeEnd = (currentYear < endYear) || (currentYear === endYear && currentWeek <= endWeek);

      return isAfterStart && isBeforeEnd;
    });
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
          {loading ? (
            // Skeleton loading animation
            <div className="space-y-2">
              {/* Header skeleton */}
              <div className="glass-table-header-row flex">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-1 px-4 py-3">
                    <div className="animate-pulse bg-white/20 h-4 rounded"></div>
                  </div>
                ))}
              </div>
              
              {/* Row skeletons */}
              {[...Array(8)].map((_, rowIndex) => (
                <div key={rowIndex} className="glass-table-row flex border-t border-white/5">
                  {[...Array(6)].map((_, colIndex) => (
                    <div key={colIndex} className="flex-1 px-4 py-2">
                      <div className="animate-pulse bg-white/10 h-8 rounded" 
                           style={{ animationDelay: `${(rowIndex * 6 + colIndex) * 100}ms` }}>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
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
                                {/* ✅ NUOVO: Mostra ordine nel calendario */}
                                {assignment.ordine && (
                                  <div className="text-green-300 flex items-center justify-center gap-1 mt-1">
                                    <Hash className="w-3 h-3" />
                                    <span className="text-xs">
                                      {(() => {
                                        const numeroOrdine = typeof assignment.ordine === 'object' ? assignment.ordine.numero : assignment.ordine;
                                        const ordineCompleto = getOrdineCompleto(numeroOrdine);
                                        return ordineCompleto?.numero || numeroOrdine;
                                      })()}
                                    </span>
                                  </div>
                                )}
                                {/* ✅ NUOVO: Mostra RDT nel calendario */}
                                {assignment.rdt && (
                                  <div className="text-purple-300 flex items-center justify-center gap-1 mt-1">
                                    <Clipboard className="w-3 h-3" />
                                    <span className="text-xs">
                                      {(() => {
                                        const numeroRdt = typeof assignment.rdt === 'object' ? assignment.rdt.numero : assignment.rdt;
                                        const rdtCompleto = getRdtCompleto(numeroRdt);
                                        return rdtCompleto?.numero || numeroRdt;
                                      })()}
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
          )}
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

      {/* Modal gestito con DOM JavaScript puro - vedi funzione createDOMModal */}
    </div>
  );
};

export default AssignmentsManagement;