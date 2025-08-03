import { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from './useAuth';
import { apiCall } from '../services/api';

export const useGiacenze = () => {
  const { state, dispatch } = useAppContext();
  const { token, user, setError } = useAuth();
  
  const {
    myGiacenze,
    myAssignments,
    selectedAssignment,
    myUtilizzi,
    dataLoaded,
    allProducts,
    users,
    poli,
    mezzi,
    settimane,
    assegnazioni,
    allGiacenze
  } = state;

  // Carica dati iniziali
  useEffect(() => {
    if (token && user) {
      // Reset dataLoaded quando cambia l'utente
      dispatch({ type: 'SET_DATA_LOADED', payload: false });
      loadData().then(() => dispatch({ type: 'SET_DATA_LOADED', payload: true }));
    }
  }, [token, user?.id]); // Dipende dall'ID utente, non da dataLoaded

  // Ascolta i cambi di utente per ricaricare i dati
  useEffect(() => {
    const handleUserChange = () => {
      if (token && user) {
        console.log('🔄 Ricaricamento dati per nuovo utente');
        dispatch({ type: 'SET_DATA_LOADED', payload: false });
        loadData().then(() => dispatch({ type: 'SET_DATA_LOADED', payload: true }));
      }
    };

    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, [token, user]);

  const loadData = async () => {
    try {
      console.log('Caricamento dati...');
      
      // Carica giacenze personali e assegnazioni
      const [giacenzeData, assignmentsData] = await Promise.all([
        apiCall('/my-giacenze', {}, token),
        apiCall('/assegnazioni/my', {}, token)
      ]);

      dispatch({ type: 'SET_MY_GIACENZE', payload: giacenzeData || [] });
      dispatch({ type: 'SET_MY_ASSIGNMENTS', payload: assignmentsData || [] });

      // Se è admin, carica dati aggiuntivi
      if (user.role === 'admin') {
        try {
          const [productsData, usersData, poliData, mezziData, settimaneData, assegnazioniData, allGiacenzeData] = await Promise.all([
            apiCall('/products', {}, token),
            apiCall('/users', {}, token),
            apiCall('/poli', {}, token),
            apiCall('/mezzi', {}, token),
            apiCall('/settimane', {}, token),
            apiCall('/assegnazioni', {}, token),
            apiCall('/admin/giacenze', {}, token)
          ]);

          dispatch({ type: 'SET_ALL_PRODUCTS', payload: productsData || [] });
          dispatch({ type: 'SET_USERS', payload: usersData || [] });
          dispatch({ type: 'SET_POLI', payload: poliData || [] });
          dispatch({ type: 'SET_MEZZI', payload: mezziData || [] });
          dispatch({ type: 'SET_SETTIMANE', payload: settimaneData || [] });
          dispatch({ type: 'SET_ASSEGNAZIONI', payload: assegnazioniData || [] });
          dispatch({ type: 'SET_ALL_GIACENZE', payload: allGiacenzeData || [] });
        } catch (adminErr) {
          console.error('Errore caricamento dati admin:', adminErr);
        }
      }

      console.log('Dati caricati con successo');
    } catch (err) {
      console.error('Errore caricamento dati:', err);
      setError('Errore nel caricamento dei dati: ' + err.message);
    }
  };

  const useProduct = async (productId, quantity = 1, postazioneId = null) => {
    if (!selectedAssignment) {
      setError('Seleziona un\'assegnazione attiva');
      return;
    }

    try {
      setError('');
      const body = {
        productId,
        quantitaUtilizzata: quantity,
        assegnazioneId: selectedAssignment._id
      };
      
      // Aggiungi postazioneId se fornito
      if (postazioneId) {
        body.postazioneId = postazioneId;
      }

      const result = await apiCall('/use-product', {
        method: 'POST',
        body: JSON.stringify(body)
      }, token);

      // Ricarica giacenze personali
      const updatedGiacenze = await apiCall('/my-giacenze', {}, token);
      dispatch({ type: 'SET_MY_GIACENZE', payload: updatedGiacenze });

      // Mostra notifica se sotto soglia
      if (result.sottoSoglia) {
        setError(`⚠️ Attenzione: Quantità sotto soglia minima! Rimasti: ${result.nuovaQuantitaDisponibile}`);
      }

      console.log('Prodotto utilizzato con successo');
    } catch (err) {
      setError('Errore nell\'utilizzo del prodotto: ' + err.message);
    }
  };

  const addProduct = async (productId, quantity = 1, postazioneId = null) => {
    if (!selectedAssignment) {
      setError('Seleziona un\'assegnazione attiva');
      return;
    }

    try {
      setError('');
      
      // Trova la giacenza corrente per verificare i limiti
      const currentGiacenza = myGiacenze.find(g => g.productId._id === productId);
      
      if (!currentGiacenza) {
        setError('Prodotto non trovato nelle tue giacenze');
        return;
      }

      // Controlla se l'aggiunta supererebbe la quantità assegnata
      const nuovaQuantita = currentGiacenza.quantitaDisponibile + quantity;
      if (nuovaQuantita > currentGiacenza.quantitaAssegnata) {
        setError(`⚠️ Non puoi aggiungere ${quantity} unità. Quantità massima disponibile: ${currentGiacenza.quantitaAssegnata - currentGiacenza.quantitaDisponibile}`);
        return;
      }

      const result = await apiCall('/add-product', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantitaAggiunta: quantity,
          assegnazioneId: selectedAssignment._id
        })
      }, token);

      // Ricarica giacenze personali
      const updatedGiacenze = await apiCall('/my-giacenze', {}, token);
      dispatch({ type: 'SET_MY_GIACENZE', payload: updatedGiacenze });

      // Ricarica utilizzi
      const updatedUtilizzi = await apiCall('/utilizzi/my', {}, token);
      dispatch({ type: 'SET_MY_UTILIZZI', payload: updatedUtilizzi });

      console.log(result.message || 'Prodotto reintegrato con successo');
    } catch (err) {
      setError('Errore nel ripristino prodotto: ' + err.message);
    }
  };

  const loadUtilizzi = async (assignmentId, postazioneId = null) => {
    try {
      setError('');
      const assignment = myAssignments.find(a => a._id === assignmentId);
      const settimanaId = assignment?.settimanaId?._id || assignment?.settimanaId;
      
      if (!settimanaId) {
        console.warn('Nessun settimanaId valido trovato.');
        return;
      }

      let url = `/utilizzi/my?settimanaId=${settimanaId}`;
      if (postazioneId) {
        url += `&postazioneId=${postazioneId}`;
      }

      console.log('🔗 Loading utilizzi with URL:', url);
      const data = await apiCall(url, {}, token);
      dispatch({ type: 'SET_MY_UTILIZZI', payload: Array.isArray(data) ? data : [data] });
    } catch (err) {
      console.error('Errore nel caricamento utilizzi:', err);
      setError('Errore nel caricamento utilizzi: ' + err.message);
    }
  };

  const assignGiacenza = async (targetUser, giacenzeForm) => {
    if (!targetUser || !giacenzeForm.productId || !giacenzeForm.quantitaAssegnata) {
      setError('Compila tutti i campi obbligatori');
      return;
    }

    try {
      setError('');
      await apiCall('/admin/assign-giacenza', {
        method: 'POST',
        body: JSON.stringify({
          userId: targetUser,
          ...giacenzeForm,
          quantitaAssegnata: parseInt(giacenzeForm.quantitaAssegnata),
          quantitaMinima: parseInt(giacenzeForm.quantitaMinima) || 0,
          settimanaId: giacenzeForm.isGlobal ? null : giacenzeForm.settimanaId,
          applicaATutteLeSettimane: giacenzeForm.applicaATutteLeSettimane
        })
      }, token);

      // Reset form
      dispatch({ type: 'RESET_GIACENZE_FORM' });

      // Ricarica giacenze
      const updatedGiacenze = await apiCall('/admin/giacenze', {}, token);
      dispatch({ type: 'SET_ALL_GIACENZE', payload: updatedGiacenze });

      console.log('Giacenza assegnata con successo');
    } catch (err) {
      setError('Errore nell\'assegnazione giacenza: ' + err.message);
    }
  };

  const updateGiacenza = async (giacenzaId, updates) => {
    if (!giacenzaId) {
      setError('ID giacenza mancante');
      return;
    }

    try {
      setError('');
      // Costruisci payload solo con i campi forniti
      const payload = {};
      if (updates.quantitaAssegnata !== undefined) {
        payload.quantitaAssegnata = parseInt(updates.quantitaAssegnata);
      }
      if (updates.quantitaDisponibile !== undefined) {
        payload.quantitaDisponibile = parseInt(updates.quantitaDisponibile);
      }
      if (updates.quantitaMinima !== undefined) {
        payload.quantitaMinima = parseInt(updates.quantitaMinima) || 0;
      }
      if (updates.note !== undefined) {
        payload.note = updates.note || '';
      }

      console.log('🔧 updateGiacenza payload:', payload);

      await apiCall(`/admin/giacenze/${giacenzaId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }, token);

      // Ricarica giacenze
      const updatedGiacenze = await apiCall('/admin/giacenze', {}, token);
      dispatch({ type: 'SET_ALL_GIACENZE', payload: updatedGiacenze });

      console.log('Giacenza aggiornata con successo');
      return true;
    } catch (err) {
      setError('Errore nell\'aggiornamento giacenza: ' + err.message);
      return false;
    }
  };

  const deleteGiacenza = async (giacenzaId) => {
    if (!giacenzaId) {
      setError('ID giacenza mancante');
      return;
    }

    try {
      setError('');
      await apiCall(`/admin/giacenze/${giacenzaId}`, {
        method: 'DELETE'
      }, token);

      // Ricarica giacenze
      const updatedGiacenze = await apiCall('/admin/giacenze', {}, token);
      dispatch({ type: 'SET_ALL_GIACENZE', payload: updatedGiacenze });

      console.log('Giacenza eliminata con successo');
      return true;
    } catch (err) {
      setError('Errore nell\'eliminazione giacenza: ' + err.message);
      return false;
    }
  };

  const loadUserGiacenze = async (userId, filters = {}) => {
  try {
    setLoading(true);
    setError('');
    
    // Costruisci i parametri della query
    const queryParams = new URLSearchParams();
    
    // Aggiungi userId se specificato (per admin che visualizza giacenze di un utente)
    if (userId) {
      queryParams.append('userId', userId);
    }
    
    // Aggiungi tutti i filtri
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });
    
    // Determina quale endpoint usare
    const endpoint = userId 
      ? `/admin/giacenze?${queryParams}` // Admin che visualizza giacenze di un utente
      : `/my-giacenze?${queryParams}`;   // Utente che visualizza le sue giacenze
    
    console.log('🔍 Caricando giacenze da:', endpoint);
    
    const data = await apiCall(endpoint, {}, token);
    setAllGiacenze(Array.isArray(data) ? data : []);
  } catch (err) {
    setError('Errore nel caricamento giacenze: ' + err.message);
    setAllGiacenze([]);
  } finally {
    setLoading(false);
  }
};
  const setSelectedAssignment = (assignment) => {
    dispatch({ type: 'SET_SELECTED_ASSIGNMENT', payload: assignment });
  };

  return {
    // State
    myGiacenze,
    myAssignments,
    selectedAssignment,
    myUtilizzi,
    allProducts,
    users,
    poli,
    mezzi,
    settimane,
    assegnazioni,
    allGiacenze,
    dataLoaded,
    
    // Actions
    loadData,
    useProduct,
    addProduct,
    loadUtilizzi,
    assignGiacenza,
    updateGiacenza,
    deleteGiacenza,
    setSelectedAssignment
  };
};

