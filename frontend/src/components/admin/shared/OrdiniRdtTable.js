import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Edit,
  Save,
  X,
  Package,
  Hash,
  Clipboard,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  Building,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useGiacenze } from '../../../hooks/useGiacenze';
import { useAppContext } from '../../../contexts/AppContext';
import { apiCall } from '../../../services/api';
import { triggerOrdiniRdtUpdate } from '../../../utils/events';
import OrdineRdtModal from './OrdineRdtModal';
import AggiungiProdottoOrdine from '../AggiungiProdottoOrdine';
import { useModalAnimation } from '../../../hooks/useModalAnimation';
import { sortWeeksCenteredOnCurrent, getCurrentWeekFromList, formatWeekRange } from '../../../utils/formatters';

const OrdiniRdtTable = ({ title = "Ordini e RDT", showActions = true, onItemsChange }) => {
  const { token, setError } = useAuth();
  const { users, settimane, assegnazioni } = useGiacenze();
  const { state, dispatch: contextDispatch } = useAppContext();

  // Stati per dati
  const [ordini, setOrdini] = useState([]);
  const [rdt, setRdt] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stati per editing
  const [editingItem, setEditingItem] = useState(null);
  const [editValues, setEditValues] = useState({});
  
  // Stati per modale
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Stati per aggiungi prodotti
  const [showAggiungiProdotti, setShowAggiungiProdotti] = useState(false);
  const [selectedOrderForProducts, setSelectedOrderForProducts] = useState(null);
  
  // Stati per popup di conferma
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ item: null, action: null });
  
  // Animazioni per i modali
  const deleteModalAnimation = useModalAnimation(showDeleteModal);
  const finalizeModalAnimation = useModalAnimation(showFinalizeModal);
  const reopenModalAnimation = useModalAnimation(showReopenModal);
  
  // Funzioni per chiudere i modali
  const closeDeleteModal = () => {
    deleteModalAnimation.closeModal(() => {
      setShowDeleteModal(false);
      setConfirmAction({ item: null, action: null });
    });
  };
  
  const closeFinalizeModal = () => {
    finalizeModalAnimation.closeModal(() => {
      setShowFinalizeModal(false);
      setConfirmAction({ item: null, action: null });
    });
  };
  
  const closeReopenModal = () => {
    reopenModalAnimation.closeModal(() => {
      setShowReopenModal(false);
      setConfirmAction({ item: null, action: null });
    });
  };
  
  // Conferma azioni
  const confirmDelete = () => {
    if (confirmAction.item) {
      handleDelete(confirmAction.item);
      closeDeleteModal();
    }
  };
  
  const confirmFinalize = () => {
    if (confirmAction.item) {
      finalizeItem(confirmAction.item);
      closeFinalizeModal();
    }
  };
  
  const confirmReopen = () => {
    if (confirmAction.item) {
      reopenItem(confirmAction.item);
      closeReopenModal();
    }
  };
  
  // Stati per filtri
  // Stato per ordinamento
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

  const [filters, setFilters] = useState({
    searchTerm: '',
    operatore: '',
    settimana: '',
    stato: '',
    tipo: '',
    cliente: ''
  });

  // Stato per checkbox "tutte le settimane"
  const [showAllWeeks, setShowAllWeeks] = useState(true);

  // Ordina settimane centrate sulla settimana corrente
  const sortedSettimane = React.useMemo(() => {
    if (!settimane?.length) return [];
    return sortWeeksCenteredOnCurrent(settimane);
  }, [settimane]);

  // Carica dati iniziali
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Set default current week for filters when showAllWeeks is false
  useEffect(() => {
    if (settimane.length > 0 && !showAllWeeks && filters.settimana === '') {
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        setFilters(prev => ({ ...prev, settimana: currentWeek._id }));
      }
    }
  }, [settimane, showAllWeeks, filters.settimana]);

  // Handle showAllWeeks toggle
  useEffect(() => {
    if (showAllWeeks) {
      // When showing all weeks, clear the week filter
      setFilters(prev => ({ ...prev, settimana: '' }));
    } else {
      // When not showing all weeks, set current week as default
      const currentWeek = getCurrentWeekFromList(settimane);
      if (currentWeek) {
        setFilters(prev => ({ ...prev, settimana: currentWeek._id }));
      }
    }
  }, [showAllWeeks, settimane]);

  // Applica filtro automatico da navigazione AssigmentsManagement
  useEffect(() => {
    if (state.filtroOrdineRdt && state.filtroOrdineRdt.searchTerm) {
      // Applica il filtro di ricerca
      setFilters(prev => ({
        ...prev,
        searchTerm: state.filtroOrdineRdt.searchTerm
      }));

      // Cancella il filtro dal contesto dopo averlo applicato
      contextDispatch({
        type: 'SET_FILTRO_ORDINE_RDT',
        payload: null
      });
    }
  }, [state.filtroOrdineRdt, contextDispatch]);

  // Listener per eventi di sincronizzazione da AssignmentsManagement
  useEffect(() => {
    const handleAssignmentSync = (event) => {
      if (event.detail.action === 'assignment_sync_completed') {
        console.log('🔔 Sincronizzazione assegnazioni ricevuta, ricarico dati ordini/RDT');
        loadData();
      }
    };
    
    window.addEventListener('ordini-rdt-updated', handleAssignmentSync);
    
    return () => {
      window.removeEventListener('ordini-rdt-updated', handleAssignmentSync);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [ordiniData, rdtData] = await Promise.all([
        apiCall('/ordini', {}, token),
        apiCall('/rdt', {}, token)
      ]);
      
      const ordiniArray = ordiniData?.ordini || [];
      const rdtArray = rdtData?.rdt || [];
      
      setOrdini(ordiniArray);
      setRdt(rdtArray);
      
      // Notifica il componente parent del cambiamento
      if (onItemsChange) {
        onItemsChange([...ordiniArray, ...rdtArray]);
      }
    } catch (err) {
      setError('Errore nel caricamento dati: ' + err.message);
      setOrdini([]);
      setRdt([]);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per ottenere assegnazione da ordine/rdt
  const getAssegnazioneForItem = (type, numero) => {
    if (!assegnazioni || !numero) return null;
    
    return assegnazioni.find(a => {
      if (type === 'ordine') {
        return a.ordine === numero && a.attiva;
      } else if (type === 'rdt') {
        return a.rdt === numero && a.attiva;
      }
      return false;
    });
  };

  // Combina ordini e RDT in un unico array
  const getAllItems = () => {
    const ordiniWithType = (ordini || []).map(item => ({ ...item, itemType: 'ordine' }));
    const rdtWithType = (rdt || []).map(item => ({ ...item, itemType: 'rdt' }));
    return [...ordiniWithType, ...rdtWithType];
  };

  // Filtra dati combinati
  const getFilteredItems = () => {
    let items = getAllItems();

    // Filtro tipo
    if (filters.tipo) {
      items = items.filter(item => item.itemType === filters.tipo);
    }

    // Filtro ricerca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      items = items.filter(item => {
        const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
        return item.numero?.toLowerCase().includes(searchLower) ||
               item.cliente?.toLowerCase().includes(searchLower) ||
               assegnazione?.userId?.username?.toLowerCase().includes(searchLower) ||
               item.operatoreId?.username?.toLowerCase().includes(searchLower);
      });
    }

    // Filtro operatore
    if (filters.operatore) {
      items = items.filter(item => {
        const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
        return assegnazione?.userId?._id === filters.operatore || item.operatoreId?._id === filters.operatore;
      });
    }

    // Filtro settimana (solo se non è selezionato "tutte le settimane")
    if (filters.settimana && !showAllWeeks) {
      items = items.filter(item => {
        const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
        return assegnazione?.settimanaId?._id === filters.settimana;
      });
    }

    // Filtro stato
    if (filters.stato) {
      items = items.filter(item => item.stato === filters.stato);
    }

    // Filtro cliente
    if (filters.cliente) {
      const clienteLower = filters.cliente.toLowerCase();
      items = items.filter(item =>
        item.cliente?.toLowerCase().includes(clienteLower)
      );
    }

    // Applica ordinamento
    if (sortConfig.field) {
      items = sortItems(items);
    }

    return items;
  };

  // Funzione per gestire il click sulle intestazioni
  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Funzione per ordinare gli items
  const sortItems = (items) => {
    if (!sortConfig.field) return items;

    return [...items].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.field) {
        case 'tipo':
          aValue = a.itemType || '';
          bValue = b.itemType || '';
          break;
        case 'numero':
          aValue = a.numero || '';
          bValue = b.numero || '';
          break;
        case 'cliente':
          aValue = a.cliente || '';
          bValue = b.cliente || '';
          break;
        case 'operatore':
          const assegnazioneA = getAssegnazioneForItem(a.itemType, a.numero);
          const assegnazioneB = getAssegnazioneForItem(b.itemType, b.numero);
          aValue = assegnazioneA?.userId?.username || a.operatoreId?.username || '';
          bValue = assegnazioneB?.userId?.username || b.operatoreId?.username || '';
          break;
        case 'settimana':
          const assA = getAssegnazioneForItem(a.itemType, a.numero);
          const assB = getAssegnazioneForItem(b.itemType, b.numero);
          aValue = assA?.settimanaId?.numero || 0;
          bValue = assB?.settimanaId?.numero || 0;
          break;
        case 'dataConsegna':
          aValue = a.dataConsegna ? new Date(a.dataConsegna).getTime() : 0;
          bValue = b.dataConsegna ? new Date(b.dataConsegna).getTime() : 0;
          break;
        case 'stato':
          aValue = a.stato || '';
          bValue = b.stato || '';
          break;
        case 'prodotti':
          aValue = a.prodotti?.length || 0;
          bValue = b.prodotti?.length || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Helper per mostrare l'icona di ordinamento
  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="w-4 h-4 inline ml-1" /> :
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  // Aggiorna filtri
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Funzione per formattare settimana con periodo (versione compatta)
  const formatWeek = (settimana) => {
    if (!settimana) return '';
    const dataInizio = new Date(settimana.dataInizio).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    const dataFine = new Date(settimana.dataFine).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    return `S${settimana.numero}/${settimana.anno} (${dataInizio}-${dataFine})`;
  };

  // Reset tutti i filtri
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      operatore: '',
      settimana: '',
      stato: '',
      tipo: '',
      cliente: ''
    });
    setShowAllWeeks(true);
  };

  // Avvia editing inline
  const startEdit = (item) => {
    const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);

    setEditingItem(item._id);
    setEditValues({
      numero: item.numero || '',
      cliente: item.cliente || '',
      dataConsegna: item.dataConsegna ? new Date(item.dataConsegna).toISOString().split('T')[0] : '',
      operatore: assegnazione?.userId?._id || item.operatoreId?._id || '',
      settimanaId: assegnazione?.settimanaId?._id || '',
      stato: item.stato || 'CREATO',
      note: item.note || ''
    });
  };

  // Controlla conflitti di assegnazione operatore-settimana
  const checkAssignmentConflict = (operatorId, weekId, currentAssignmentId = null) => {
    if (!assegnazioni || !operatorId || !weekId) return null;
    
    return assegnazioni.find(a => 
      a._id !== currentAssignmentId && // Escludi l'assegnazione corrente
      a.userId?._id === operatorId && 
      a.settimanaId?._id === weekId && 
      a.attiva
    );
  };

  // Funzione per trasferire ordine/RDT tra assegnazioni
  const transferOrderRdtBetweenAssignments = async (fromAssignmentId, toAssignmentId, item, editValues) => {
    try {
      console.log(`🔄 Trasferisco ${item.itemType} "${editValues.numero}" dall'assegnazione ${fromAssignmentId} all'assegnazione ${toAssignmentId}`);
      
      // 1. Aggiorna l'assegnazione di destinazione con il nuovo ordine/RDT
      const updateToData = {};
      if (item.itemType === 'ordine') {
        updateToData.ordine = editValues.numero;
      } else if (item.itemType === 'rdt') {
        updateToData.rdt = editValues.numero;
      }
      
      await apiCall(`/assegnazioni/${toAssignmentId}`, {
        method: 'PUT',
        body: JSON.stringify(updateToData)
      }, token);
      
      // 2. Rimuovi l'ordine/RDT dall'assegnazione di origine
      const updateFromData = {};
      if (item.itemType === 'ordine') {
        updateFromData.ordine = null;
      } else if (item.itemType === 'rdt') {
        updateFromData.rdt = null;
      }
      
      await apiCall(`/assegnazioni/${fromAssignmentId}`, {
        method: 'PUT',
        body: JSON.stringify(updateFromData)
      }, token);
      
      console.log(`✅ Trasferimento ${item.itemType} completato`);
    } catch (error) {
      console.error('❌ Errore durante il trasferimento:', error);
      throw error;
    }
  };

  // Salva modifiche inline
  const handleUpdate = async (item) => {
    try {
      setError('');
      
      // Da OrdiniManagement permettiamo il trasferimento libero di ordini/RDT tra assegnazioni
      console.log('📝 Modifica ordine/RDT da OrdiniManagement - trasferimento libero consentito');
      console.log('🔍 Valori di edit:', editValues);
      console.log('🔍 Item originale:', item);

      // Prima gestisci l'assegnazione se operatore/settimana cambiano
      const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
      let targetAssignment = null;
      
      if (editValues.operatore && editValues.settimanaId && assegnazione) {
        // Trova l'assegnazione di destinazione (se diversa da quella corrente)
        targetAssignment = assegnazioni.find(a => 
          a._id !== assegnazione._id &&
          a.userId?._id === editValues.operatore && 
          a.settimanaId?._id === editValues.settimanaId && 
          a.attiva
        );

        if (targetAssignment) {
          // TRASFERIMENTO: Sposta ordine/RDT all'assegnazione esistente
          console.log(`🔄 Trasferimento verso assegnazione esistente ${targetAssignment._id}`);
          await transferOrderRdtBetweenAssignments(assegnazione._id, targetAssignment._id, item, editValues);
        } else if (editValues.operatore !== assegnazione.userId?._id || 
                   editValues.settimanaId !== assegnazione.settimanaId?._id) {
          // CAMBIO OPERATORE/SETTIMANA: Nessuna assegnazione esistente trovata, aggiorna quella corrente
          console.log(`📝 Aggiornamento assegnazione corrente ${assegnazione._id}`);
          const updateBody = {};
          if (item.itemType === 'ordine') {
            updateBody.ordine = editValues.numero;
          } else if (item.itemType === 'rdt') {
            updateBody.rdt = editValues.numero;
          }
          updateBody.userId = editValues.operatore;
          updateBody.settimanaId = editValues.settimanaId;
          updateBody.poloId = assegnazione.poloId?._id;
          
          await apiCall(`/assegnazioni/${assegnazione._id}`, {
            method: 'PUT',
            body: JSON.stringify(updateBody)
          }, token);
        }
      }
      
      // Poi aggiorna l'ordine/RDT se necessario 
      // NON aggiornare se si sta solo cambiando operatore/settimana
      const isOnlyAssignmentChange = (
        editValues.operatore && editValues.settimanaId && 
        editValues.cliente === item.cliente &&
        editValues.dataConsegna === (item.dataConsegna ? new Date(item.dataConsegna).toISOString().split('T')[0] : '') &&
        editValues.stato === item.stato &&
        editValues.note === item.note &&
        editValues.numero === item.numero
      );
      
      const needsOrderUpdate = !isOnlyAssignmentChange && (
        editValues.cliente !== item.cliente ||
        editValues.dataConsegna !== (item.dataConsegna ? new Date(item.dataConsegna).toISOString().split('T')[0] : '') ||
        editValues.stato !== item.stato ||
        editValues.note !== item.note ||
        (editValues.numero !== item.numero && !targetAssignment)
      );
      
      if (needsOrderUpdate) {
        console.log('📝 Aggiornamento dati ordine/RDT');
        const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
        const updateData = {
          cliente: editValues.cliente,
          dataConsegna: editValues.dataConsegna,
          stato: editValues.stato,
          note: editValues.note
        };
        
        // Includi il numero solo se è effettivamente cambiato
        if (editValues.numero !== item.numero) {
          updateData.numero = editValues.numero;
        }

        await apiCall(`${endpoint}/${item._id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        }, token);
      }
      
      await loadData();
      setEditingItem(null);
      setEditValues({});
      setError('✅ Modifiche salvate con successo');
      
      // Trigger evento per sincronizzare AssignmentsManagement
      const finalTargetAssignment = targetAssignment || assegnazioni.find(a => 
        a.userId?._id === editValues.operatore && 
        a.settimanaId?._id === editValues.settimanaId && 
        a.attiva
      );
      
      triggerOrdiniRdtUpdate({
        action: 'assignment_updated',
        itemType: item.itemType,
        itemId: item._id,
        operatorId: editValues.operatore,
        weekId: editValues.settimanaId,
        poloId: finalTargetAssignment?.poloId?._id
      });
    } catch (err) {
      // Gestisce errori specifici del backend per ordini/RDT già assegnati
      if (err.message.includes('già assegnato ad un altro operatore') || 
          err.message.includes('ORDINE_ALREADY_ASSIGNED') || 
          err.message.includes('RDT_ALREADY_ASSIGNED')) {
        console.log('⚠️ Ordine/RDT già assegnato - da OrdiniManagement forziamo il trasferimento');
        
        // Trova l'assegnazione corrente e quella di destinazione
        const currentAssignment = getAssegnazioneForItem(item.itemType, item.numero);
        const fallbackTargetAssignment = assegnazioni.find(a => 
          a.userId?._id === editValues.operatore && 
          a.settimanaId?._id === editValues.settimanaId && 
          a.attiva
        );
        
        if (currentAssignment && fallbackTargetAssignment && currentAssignment._id !== fallbackTargetAssignment._id) {
          try {
            // Forza il trasferimento anche se la destinazione ha già ordini/RDT
            await transferOrderRdtBetweenAssignments(currentAssignment._id, fallbackTargetAssignment._id, item, editValues);
            
            await loadData();
            setEditingItem(null);
            setEditValues({});
            setError('✅ Ordine/RDT trasferito con successo (sovrascrittura)');
            
            // Trigger evento di sincronizzazione
            triggerOrdiniRdtUpdate({
              action: 'assignment_transferred',
              itemType: item.itemType,
              itemId: item._id,
              operatorId: editValues.operatore,
              weekId: editValues.settimanaId,
              poloId: fallbackTargetAssignment?.poloId?._id
            });
            return;
          } catch (transferErr) {
            setError('Errore nel trasferimento forzato: ' + transferErr.message);
            return;
          }
        }
      }
      
      setError('Errore nel salvataggio: ' + err.message);
    }
  };

  // Mostra popup di conferma eliminazione
  const showDeleteConfirm = (item) => {
    setConfirmAction({ item, action: 'delete' });
    setShowDeleteModal(true);
  };

  // Elimina elemento
  const handleDelete = async (item) => {

    try {
      setError('');
      setLoading(true);

      const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
      const operatoreId = assegnazione?.userId?._id;
      const isCompleted = item.stato === 'completato';

      console.log('🗑️ Eliminazione ordine:', item._id, 'Stato:', item.stato, 'Operatore:', operatoreId, 'Completato:', isCompleted);

      // Step 1: Rimuovi collegamenti dall'assegnazione se esiste
      if (assegnazione) {
        try {
          const updateData = {};
          if (item.itemType === 'ordine') {
            updateData.ordine = null;
          } else if (item.itemType === 'rdt') {
            updateData.rdt = null;
          }

          await apiCall(`/assegnazioni/${assegnazione._id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
          }, token);
          console.log('✅ Collegamento rimosso dall\'assegnazione');
        } catch (err) {
          console.warn('⚠️ Errore rimozione collegamento assegnazione:', err.message);
          // Non bloccare l'eliminazione se fallisce la rimozione collegamento
        }
      }

      // Step 2: Decrementa giacenze SOLO se l'ordine/RDT è COMPLETATO
      if (isCompleted && item.prodotti && item.prodotti.length > 0 && operatoreId) {
        try {
          for (const prodotto of item.prodotti) {
            await apiCall(`/admin/giacenze/decrement`, {
              method: 'PUT',
              body: JSON.stringify({
                userId: operatoreId,
                productId: prodotto.productId,
                quantity: prodotto.quantita
              })
            }, token);
          }
          console.log('✅ Giacenze decrementate per', item.prodotti.length, 'prodotti (ordine finalizzato)');
        } catch (err) {
          console.warn('⚠️ Errore decremento giacenze:', err.message);
          // Non bloccare l'eliminazione se fallisce il decremento
        }
      } else if (!isCompleted) {
        console.log('ℹ️ Giacenze NON decrementate: ordine/RDT non finalizzato');
      }
      
      // Step 3: Elimina l'ordine/RDT
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${item._id}`, {
        method: 'DELETE'
      }, token);
      
      await loadData();
      const successMessage = isCompleted 
        ? `✅ ${item.itemType} eliminato con successo (collegamenti e giacenze aggiornati)`
        : `✅ ${item.itemType} eliminato con successo (collegamenti rimossi)`;
      setError(successMessage);
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mostra popup di conferma finalizzazione
  const showFinalizeConfirm = (item) => {
    setConfirmAction({ item, action: 'finalize' });
    setShowFinalizeModal(true);
  };

  // Finalizza elemento
  const finalizeItem = async (item) => {

    try {
      setError('');
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      
      await apiCall(`${endpoint}/${item._id}/finalize`, {
        method: 'POST'
      }, token);

      await loadData();
      setError(`✅ ${item.itemType} finalizzato! Stato aggiornato a COMPLETATO e giacenze incrementate.`);
    } catch (err) {
      setError('Errore nella finalizzazione: ' + err.message);
    }
  };

  // Mostra popup di conferma riapertura
  const showReopenConfirm = (item) => {
    setConfirmAction({ item, action: 'reopen' });
    setShowReopenModal(true);
  };

  // Riapri elemento completato con ripristino giacenze
  const reopenItem = async (item) => {

    try {
      setError('');
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      
      await apiCall(`${endpoint}/${item._id}/reopen`, {
        method: 'POST'
      }, token);

      await loadData();
      setError(`✅ ${item.itemType} riaperto! Stato aggiornato a CREATO e giacenze decrementate.`);
    } catch (err) {
      setError('Errore nella riapertura: ' + err.message);
    }
  };

  // Apri modale dettagli
  const openModal = async (item) => {
    try {
      // Ricarica i dati completi dell'ordine/RDT dal backend
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      const fullItemData = await apiCall(`${endpoint}/${item._id}`, {}, token);
      
      // Combina i dati originali con quelli aggiornati dal backend
      const completeItem = {
        ...item,
        ...fullItemData,
        itemType: item.itemType // Mantieni il tipo dall'item originale
      };
      
      console.log('📋 Dati completi ordine per modal:', completeItem);
      setSelectedItem(completeItem);
      setShowModal(true);
    } catch (err) {
      console.error('Errore caricamento dati completi:', err);
      // Fallback: usa i dati originali
      setSelectedItem(item);
      setShowModal(true);
    }
  };

  // Chiudi modale
  const closeModal = () => {
    setSelectedItem(null);
    setShowModal(false);
  };

  // Callback per aggiornamenti dal modale
  const handleModalSave = () => {
    loadData();
    closeModal();
  };

  // Gestione modale aggiungi prodotti
  const openAggiungiProdotti = async (item) => {
    try {
      console.log('🔓 Apertura modal AggiungiProdotti per:', item);

      // Ricarica i dati completi dell'ordine/RDT dal backend con populate
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      console.log('📡 Chiamata API:', `${endpoint}/${item._id}`);

      const fullItemData = await apiCall(`${endpoint}/${item._id}`, {}, token);

      console.log('🌐 Risposta API completa:', fullItemData);
      console.log('📦 Dettaglio prodotti dalla risposta:', fullItemData.prodotti);

      // Log dettagliato di ogni prodotto
      if (fullItemData.prodotti && fullItemData.prodotti.length > 0) {
        fullItemData.prodotti.forEach((prod, idx) => {
          console.log(`📦 Prodotto[${idx}]:`, {
            nome: prod.nome,
            productId: prod.productId,
            productId_type: typeof prod.productId,
            productId_codice: prod.productId?.codice,
            productId_descrizione: prod.productId?.descrizione,
            codice_direct: prod.codice,
            descrizione_direct: prod.descrizione
          });
        });
      }

      // Combina i dati originali con quelli aggiornati dal backend
      const completeItem = {
        ...item,
        ...fullItemData,
        itemType: item.itemType // Mantieni il tipo dall'item originale
      };

      console.log('📋 Dati completi ordine per AggiungiProdotti:', completeItem);
      console.log('📋 Prodotti con populate:', completeItem.prodotti);

      setSelectedOrderForProducts(completeItem);
      setShowAggiungiProdotti(true);
    } catch (err) {
      console.error('❌ Errore caricamento dati completi:', err);
      // Fallback: usa i dati originali
      setSelectedOrderForProducts(item);
      setShowAggiungiProdotti(true);
    }
  };

  const closeAggiungiProdotti = () => {
    setSelectedOrderForProducts(null);
    setShowAggiungiProdotti(false);
  };

  const handleProductsAdded = () => {
    loadData();
    closeAggiungiProdotti();
  };

  const filteredItems = getFilteredItems();

  return (
    <>
      <div className="glass-card-large rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              {title}
              {!loading && (
                <span className="ml-2 text-sm text-white/50">
                  ({filteredItems.length} risultati)
                </span>
              )}
            </h3>

            {/* Pulsante Reset */}
            <button
              onClick={resetFilters}
              className="glass-button-reset px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
              title="Reset filtri"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filtri
            </button>
          </div>
        </div>

        {/* Filtri */}
        <div className="px-6 py-3 border-b border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="glass-input-container rounded-lg">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/50 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Cerca numero..."
                  className="glass-input w-full pl-8 pr-2 py-1.5 text-sm rounded-lg bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={filters.searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                />
              </div>
            </div>

            <div className="glass-input-container rounded-lg">
              <div className="relative">
                <Building className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/50 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Cliente..."
                  className="glass-input w-full pl-8 pr-2 py-1.5 text-sm rounded-lg bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={filters.cliente}
                  onChange={(e) => updateFilters({ cliente: e.target.value })}
                />
              </div>
            </div>

            <select
              className="glass-input px-2 py-1.5 text-sm rounded-lg bg-transparent border-0 outline-none text-white"
              value={filters.tipo}
              onChange={(e) => updateFilters({ tipo: e.target.value })}
            >
              <option value="" className="bg-gray-800">Tutti</option>
              <option value="ordine" className="bg-gray-800">Ordini</option>
              <option value="rdt" className="bg-gray-800">RDT</option>
            </select>

            <select
              className="glass-input px-2 py-1.5 text-sm rounded-lg bg-transparent border-0 outline-none text-white"
              value={filters.operatore}
              onChange={(e) => updateFilters({ operatore: e.target.value })}
            >
              <option value="" className="bg-gray-800">Tutti operatori</option>
              {users?.filter(u => u.role === 'user').map(user => (
                <option key={user._id} value={user._id} className="bg-gray-800">
                  {user.username}
                </option>
              ))}
            </select>

            <div className="relative">
              <div className="flex items-center gap-1.5">
                <select
                  className={`glass-input flex-1 px-2 py-1.5 text-sm rounded-lg bg-transparent border-0 outline-none text-white ${showAllWeeks ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={showAllWeeks ? 'all' : filters.settimana}
                  onChange={(e) => updateFilters({ settimana: e.target.value })}
                  disabled={showAllWeeks}
                >
                  {showAllWeeks ? (
                    <option value="all" className="bg-gray-800">
                      🌍 Tutte
                    </option>
                  ) : (
                    sortedSettimane?.map(settimana => {
                      const currentWeek = getCurrentWeekFromList(settimane);
                      const isCurrentWeek = currentWeek && settimana._id === currentWeek._id;
                      return (
                        <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                          {isCurrentWeek ? '📅 ' : ''}{formatWeek(settimana)}
                        </option>
                      );
                    })
                  )}
                </select>

                {/* Checkbox "Tutte le settimane" inline */}
                <label className="glass-checkbox-container flex items-center cursor-pointer shrink-0" title="Tutte le settimane">
                  <input
                    type="checkbox"
                    checked={showAllWeeks}
                    onChange={(e) => setShowAllWeeks(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`glass-checkbox w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                    showAllWeeks
                      ? 'border-blue-400 bg-blue-400/20'
                      : 'border-gray-400 bg-gray-400/10'
                  }`}>
                    {showAllWeeks && (
                      <svg className="w-2.5 h-2.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <select
              className="glass-input px-2 py-1.5 text-sm rounded-lg bg-transparent border-0 outline-none text-white"
              value={filters.stato}
              onChange={(e) => updateFilters({ stato: e.target.value })}
            >
              <option value="" className="bg-gray-800">Tutti stati</option>
              <option value="CREATO" className="bg-gray-800">Creato</option>
              <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
              <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
              <option value="COMPLETATO" className="bg-gray-800">Completato</option>
              <option value="ANNULLATO" className="bg-gray-800">Annullato</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-white/70">Caricamento...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="glass-table-header">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('tipo')}
                  >
                    Tipo/Numero {getSortIcon('tipo')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('cliente')}
                  >
                    Cliente {getSortIcon('cliente')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('dataConsegna')}
                  >
                    Data Consegna {getSortIcon('dataConsegna')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('operatore')}
                  >
                    Operatore {getSortIcon('operatore')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('settimana')}
                  >
                    Settimana {getSortIcon('settimana')}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('stato')}
                  >
                    Stato {getSortIcon('stato')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Note
                  </th>
                  {showActions && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Azioni
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => {
                  const isEditing = editingItem === item._id;
                  const assegnazione = getAssegnazioneForItem(item.itemType, item.numero);
                  
                  return (
                    <tr key={item._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                      {/* Tipo/Numero */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="glass-avatar w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                            {item.itemType === 'ordine' ? 
                              <Hash className="w-5 h-5 text-blue-400" /> : 
                              <Clipboard className="w-5 h-5 text-green-400" />
                            }
                          </div>
                          <div>
                            {isEditing ? (
                              <input
                                type="text"
                                className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                                value={editValues.numero}
                                onChange={(e) => setEditValues({...editValues, numero: e.target.value})}
                              />
                            ) : (
                              <button
                                onClick={() => openModal(item)}
                                className="text-sm font-medium text-white hover:text-blue-400 transition-colors duration-200"
                              >
                                {item.numero || `${item.itemType.toUpperCase()}-${item._id?.slice(-6) || 'N/A'}`}
                              </button>
                            )}
                            <div className="text-sm text-white/50">
                              {item.itemType === 'ordine' ? 'Ordine' : 'RDT'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.cliente}
                            onChange={(e) => setEditValues({...editValues, cliente: e.target.value})}
                          />
                        ) : (
                          <div className="text-sm text-white">
                            {item.cliente || 'N/A'}
                          </div>
                        )}
                      </td>

                      {/* Data Consegna */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="date"
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.dataConsegna}
                            onChange={(e) => setEditValues({...editValues, dataConsegna: e.target.value})}
                          />
                        ) : (
                          <div className="text-sm text-white">
                            {item.dataConsegna ? new Date(item.dataConsegna).toLocaleDateString('it-IT') : 'N/A'}
                          </div>
                        )}
                      </td>
                      
                      {/* Operatore */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.operatore}
                            onChange={(e) => {
                              const newOperatore = e.target.value;
                              setEditValues({...editValues, operatore: newOperatore});
                              
                              // Reset settimana quando cambia operatore
                              if (newOperatore) {
                                setEditValues(prev => ({...prev, settimanaId: ''}));
                              }
                            }}
                          >
                            <option value="" className="bg-gray-800">Nessun operatore</option>
                            {users?.filter(u => u.role === 'user').map(user => (
                              <option key={user._id} value={user._id} className="bg-gray-800">
                                {user.username}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-white">
                            {assegnazione?.userId?.username || item.operatoreId?.username || (
                              <span className="text-white/40 italic">Non assegnato</span>
                            )}
                          </div>
                        )}
                      </td>
                      
                      {/* Settimana */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.settimanaId}
                            onChange={(e) => setEditValues({...editValues, settimanaId: e.target.value})}
                            disabled={!editValues.operatore}
                          >
                            <option value="" className="bg-gray-800">Nessuna settimana</option>
                            {editValues.operatore && settimane?.filter(settimana => {
                              // Filtra settimane che hanno assegnazioni attive per l'operatore selezionato
                              return assegnazioni?.some(a => 
                                a.userId?._id === editValues.operatore && 
                                a.settimanaId?._id === settimana._id && 
                                a.attiva
                              );
                            }).map(settimana => (
                              <option key={settimana._id} value={settimana._id} className="bg-gray-800">
                                Settimana {settimana.numero} - {settimana.anno}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-white">
                            {assegnazione?.settimanaId ?
                              formatWeekRange(assegnazione.settimanaId, assegnazione.settimanaFineId) :
                              <span className="text-white/40 italic">Non assegnata</span>
                            }
                          </div>
                        )}
                      </td>
                      
                      {/* Stato */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.stato}
                            onChange={(e) => setEditValues({...editValues, stato: e.target.value})}
                          >
                            <option value="CREATO" className="bg-gray-800">Creato</option>
                            <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
                            <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
                            <option value="COMPLETATO" className="bg-gray-800">Completato</option>
                            <option value="ANNULLATO" className="bg-gray-800">Annullato</option>
                          </select>
                        ) : (
                          <span className={`glass-status-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            item.stato === 'COMPLETATO' ? 'text-green-200 border-green-300/30 bg-green-400/20' :
                            item.stato === 'IN_CORSO' ? 'text-blue-200 border-blue-300/30 bg-blue-400/20' :
                            item.stato === 'ASSEGNATO' ? 'text-purple-200 border-purple-300/30 bg-purple-400/20' :
                            item.stato === 'ANNULLATO' ? 'text-red-200 border-red-300/30 bg-red-400/20' :
                            'text-yellow-200 border-yellow-300/30 bg-yellow-400/20'
                          }`}>
                            {item.stato === 'COMPLETATO' ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                COMPLETATO
                              </>
                            ) : item.stato === 'ANNULLATO' ? (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                ANNULLATO
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {item.stato || 'CREATO'}
                              </>
                            )}
                          </span>
                        )}
                      </td>

                      {/* Note */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            className="glass-input w-full p-2 rounded-xl bg-transparent border-0 outline-none text-white text-sm"
                            value={editValues.note}
                            onChange={(e) => setEditValues({...editValues, note: e.target.value})}
                            placeholder="Aggiungi note..."
                          />
                        ) : (
                          <div className="text-sm text-white/70 max-w-xs truncate">
                            {item.note || '-'}
                          </div>
                        )}
                      </td>
                      
                      {/* Azioni */}
                      {showActions && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(item)}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Salva modifiche"
                                >
                                  <Save className="w-4 h-4 text-green-400" />
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Annulla modifica"
                                >
                                  <X className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => openModal(item)}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Visualizza/Modifica dettagli completi"
                                >
                                  <Eye className="w-4 h-4 text-yellow-400" />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    console.log('🛒 Pulsante Aggiungi Prodotti cliccato per:', item);
                                    openAggiungiProdotti(item);
                                  }}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Aggiungi Prodotti"
                                >
                                  <ShoppingCart className="w-4 h-4 text-purple-400" />
                                </button>
                                
                                {item.stato !== 'COMPLETATO' ? (
                                  <button
                                    onClick={() => showFinalizeConfirm(item)}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Finalizza e cambia stato a COMPLETATO"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => showReopenConfirm(item)}
                                    className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                    title="Riapri e ripristina giacenze"
                                  >
                                    <Package className="w-4 h-4 text-orange-400" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => showDeleteConfirm(item)}
                                  className="glass-action-button p-2 rounded-xl hover:scale-110 transition-all duration-300"
                                  title="Elimina"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-white/70 text-lg mb-2">Nessun elemento trovato</p>
                <p className="text-sm text-white/50">
                  Modifica i filtri per vedere più risultati
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modale dettagli */}
      {showModal && selectedItem && (
        <OrdineRdtModal
          item={selectedItem}
          onClose={closeModal}
          onSave={handleModalSave}
        />
      )}

      {/* Modale aggiungi prodotti */}
      {showAggiungiProdotti && selectedOrderForProducts && (
        <AggiungiProdottoOrdine
          ordine={selectedOrderForProducts}
          onClose={closeAggiungiProdotti}
          onUpdate={handleProductsAdded}
        />
      )}

      {/* Popup Conferma Eliminazione */}
      {showDeleteModal && confirmAction.item && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 ${deleteModalAnimation.backdropClass}`}>
          <div className={`glass-modal max-w-md w-full rounded-2xl p-6 space-y-6 ${deleteModalAnimation.modalClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="glass-icon-danger p-3 rounded-xl">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Conferma Eliminazione</h3>
                  <p className="text-white/70 text-sm">Azione irreversibile</p>
                </div>
              </div>
              <button
                onClick={closeDeleteModal}
                className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenuto */}
            <div className="space-y-4">
              <div className="glass-alert-warning p-4 rounded-xl">
                <p className="text-white font-medium mb-2">
                  {confirmAction.item?.stato === 'COMPLETATO' 
                    ? `Sei sicuro di voler eliminare questo ${confirmAction.item?.itemType}? Questo rimuoverà anche i collegamenti dalle assegnazioni e decrementerà le giacenze (poiché è finalizzato).`
                    : `Sei sicuro di voler eliminare questo ${confirmAction.item?.itemType}? Questo rimuoverà i collegamenti dalle assegnazioni.`
                  }
                </p>
              </div>

              <div className="glass-info-box p-4 rounded-xl">
                <p className="text-white/90 text-sm">
                  <strong>Eliminando questo {confirmAction.item?.itemType}:</strong>
                </p>
                <ul className="text-white/80 text-sm mt-2 space-y-1">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>I collegamenti alle assegnazioni saranno rimossi</span>
                  </li>
                  {confirmAction.item?.stato === 'COMPLETATO' && (
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>Le giacenze verranno decrementate automaticamente</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Bottoni */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Annulla
              </button>
              <button
                onClick={confirmDelete}
                className="glass-button-danger px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Conferma Finalizzazione */}
      {showFinalizeModal && confirmAction.item && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 ${finalizeModalAnimation.backdropClass}`}>
          <div className={`glass-modal max-w-md w-full rounded-2xl p-6 space-y-6 ${finalizeModalAnimation.modalClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="glass-icon-success p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Conferma Finalizzazione</h3>
                  <p className="text-white/70 text-sm">Cambio stato a COMPLETATO</p>
                </div>
              </div>
              <button
                onClick={closeFinalizeModal}
                className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenuto */}
            <div className="space-y-4">
              <div className="glass-alert-info p-4 rounded-xl">
                <p className="text-white font-medium mb-2">
                  Sei sicuro di voler finalizzare questo {confirmAction.item?.itemType}?
                </p>
              </div>

              <div className="glass-info-box p-4 rounded-xl">
                <p className="text-white/90 text-sm">
                  <strong>Finalizzando questo {confirmAction.item?.itemType}:</strong>
                </p>
                <ul className="text-white/80 text-sm mt-2 space-y-1">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Lo stato verrà cambiato a COMPLETATO</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Le giacenze verranno incrementate automaticamente</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Il {confirmAction.item?.itemType} non sarà più modificabile</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottoni */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeFinalizeModal}
                className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Annulla
              </button>
              <button
                onClick={confirmFinalize}
                className="glass-button-success px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Finalizza
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Conferma Riapertura */}
      {showReopenModal && confirmAction.item && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 ${reopenModalAnimation.backdropClass}`}>
          <div className={`glass-modal max-w-md w-full rounded-2xl p-6 space-y-6 ${reopenModalAnimation.modalClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="glass-icon-warning p-3 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Conferma Riapertura</h3>
                  <p className="text-white/70 text-sm">Ripristino giacenze</p>
                </div>
              </div>
              <button
                onClick={closeReopenModal}
                className="glass-button p-2 rounded-xl text-white/70 hover:text-white hover:scale-105 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenuto */}
            <div className="space-y-4">
              <div className="glass-alert-warning p-4 rounded-xl">
                <p className="text-white font-medium mb-2">
                  Sei sicuro di voler riaprire questo {confirmAction.item?.itemType}?
                </p>
                <p className="text-white/80 text-sm">
                  Le giacenze dei prodotti associati verranno decrementate dalle giacenze disponibili dell'operatore.
                </p>
              </div>

              <div className="glass-info-box p-4 rounded-xl">
                <p className="text-white/90 text-sm">
                  <strong>Riaprendo questo {confirmAction.item?.itemType}:</strong>
                </p>
                <ul className="text-white/80 text-sm mt-2 space-y-1">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>Lo stato verrà cambiato da COMPLETATO a BOZZA</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>Le giacenze verranno decrementate automaticamente</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>Il {confirmAction.item?.itemType} tornerà modificabile</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottoni */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeReopenModal}
                className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Annulla
              </button>
              <button
                onClick={confirmReopen}
                className="glass-button-warning px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                Riapri
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .glass-checkbox-container {
          user-select: none;
        }

        .glass-checkbox {
          flex-shrink: 0;
        }

        .glass-button-reset {
          background: rgba(239, 68, 68, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
        }

        .glass-button-reset:hover {
          background: rgba(239, 68, 68, 0.3);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }

        .glass-button-reset:active {
          transform: scale(0.98);
        }
      `}</style>
    </>
  );
};

export default OrdiniRdtTable;