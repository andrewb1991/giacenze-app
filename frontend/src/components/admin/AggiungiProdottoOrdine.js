import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Plus,
  Save,
  X,
  Package,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { apiCall } from '../../services/api';

const AggiungiProdottoOrdine = ({ ordine, onClose, onUpdate }) => {
  const { token, setError } = useAuth();
  const { users, allProducts, assegnazioni } = useGiacenze();
  
  // Determina se l'ordine è in modalità readonly (completato)
  const isReadOnly = ordine?.stato === 'COMPLETATO';
  
  // Stati per la tabella prodotti unificata
  const [prodottiOrdine, setProdottiOrdine] = useState([]); // Prodotti già nell'ordine
  const [righeTabella, setRigheTabella] = useState([]);
  
  const [userGiacenze, setUserGiacenze] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Stati per gestione modifica righe (mantenuti per compatibilità con in-line editing)
  const [righeInModifica, setRigheInModifica] = useState(new Set());
  const [datiTemporanei, setDatiTemporanei] = useState({});
  
  // Timer per debounce del salvataggio automatico
  const [saveTimer, setSaveTimer] = useState(null);
  
  // Flag per prevenire reload durante modifiche in corso
  const [modificheInCorso, setModificheInCorso] = useState(false);

  // Funzione per ottenere assegnazione da ordine/rdt
  const getAssegnazioneForItem = (type, numero) => {
    if (!assegnazioni || !numero) return null;
    return assegnazioni.find(a => {
      if (type === 'ordine') return a.ordine === numero && a.attiva;
      else if (type === 'rdt') return a.rdt === numero && a.attiva;
      return false;
    });
  };

  // Carica prodotti già nell'ordine e giacenze operatore
  useEffect(() => {
    if (ordine?._id && assegnazioni && !modificheInCorso) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🔄 [${timestamp}] useEffect triggered - caricando dati per ordine:`, ordine._id);
      console.log(`🔍 [${timestamp}] Dependencies changed:`, {
        'ordine._id': ordine?._id,
        'ordine.itemType': ordine?.itemType, 
        'ordine.numero': ordine?.numero,
        'assegnazioni.length': assegnazioni?.length,
        'modificheInCorso': modificheInCorso
      });
      
      const loadData = async () => {
        // 1. Prima carica i prodotti (che popola la tabella)
        await caricaProdottiOrdine();
        
        // 2. Poi carica le giacenze (che aggiorna le righe esistenti)
        const assegnazione = getAssegnazioneForItem(ordine.itemType, ordine.numero);
        if (assegnazione?.userId?._id) {
          console.log(`🔄 [${timestamp}] Ora carico giacenze per userId:`, assegnazione.userId._id);
          await caricaGiacenzeOperatore(assegnazione.userId._id);
        }
      };
      
      loadData().catch(err => {
        console.error('Errore caricamento dati:', err);
      });
    } else if (modificheInCorso) {
      console.log(`🚫 useEffect bloccato - modifiche in corso`);
    }
  }, [ordine?._id, ordine?.itemType, ordine?.numero, ordine?.stato]);

  // Effetto separato per gestire il caricamento quando arrivano le assegnazioni
  useEffect(() => {
    if (ordine?._id && assegnazioni && assegnazioni.length > 0 && !modificheInCorso) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🔄 [${timestamp}] Assegnazioni caricate - verifico se devo caricare giacenze`);
      
      // Verifica se abbiamo già caricato i dati per questo ordine
      if (righeTabella.length === 0 && userGiacenze.length === 0) {
        console.log(`🔄 [${timestamp}] Nessun dato presente - carico tutto`);
        const loadData = async () => {
          await caricaProdottiOrdine();
          const assegnazione = getAssegnazioneForItem(ordine.itemType, ordine.numero);
          if (assegnazione?.userId?._id) {
            await caricaGiacenzeOperatore(assegnazione.userId._id);
          }
        };
        loadData().catch(err => console.error('Errore caricamento dati:', err));
      } else {
        console.log(`✅ [${timestamp}] Dati già presenti - skip reload`);
      }
    }
  }, [assegnazioni]);

  // Cleanup timer al dismount
  useEffect(() => {
    return () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
    };
  }, [saveTimer]);

  const caricaProdottiOrdine = async () => {
    try {
      console.log('🔍 AggiungiProdottoOrdine - Caricamento prodotti per:', ordine.itemType, ordine._id);
      console.log('🔍 Prodotti passati dal parent:', ordine.prodotti?.length || 0);
      
      const endpoint = ordine.itemType === 'ordine' ? '/ordini' : '/rdt';
      console.log('🌐 Chiamata API:', `${endpoint}/${ordine._id}`);
      const response = await apiCall(`${endpoint}/${ordine._id}`, {}, token);
      console.log('🌐 Risposta API completa:', response);
      console.log('🌐 Chiavi disponibili nella risposta:', Object.keys(response));
      
      const prodotti = response.prodotti || [];
      setProdottiOrdine(prodotti);
      
      console.log('📦 Prodotti dall\'API:', prodotti.length);
      console.log('📦 Dettagli prodotti:', prodotti);
      
      // Se l'API non restituisce prodotti, usa quelli passati dal parent come fallback
      let prodottiFinali = prodotti;
      if (prodotti.length === 0 && ordine.prodotti && ordine.prodotti.length > 0) {
        console.log('⚠️ API non ha prodotti, uso quelli passati dal parent:', ordine.prodotti.length);
        prodottiFinali = ordine.prodotti;
        setProdottiOrdine(ordine.prodotti);
      }
      
      // Popola la tabella con i prodotti esistenti + riga vuota
      popolaTabella(prodottiFinali);
      
    } catch (err) {
      console.error('Errore caricamento prodotti ordine:', err);
      setProdottiOrdine([]);
      popolaTabella([]);
    }
  };

  // Popola tabella con prodotti esistenti (disabled) + righe nuove
  const popolaTabella = (prodottiEsistenti) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔄 [${timestamp}] popolaTabella chiamata con:`, prodottiEsistenti.length, 'prodotti');
    console.log(`🔄 [${timestamp}] Dettaglio prodotti da popolare:`, prodottiEsistenti);
    
    const righeEsistenti = prodottiEsistenti.map((prodotto, index) => ({
      id: `existing-${index}`,
      productId: prodotto.productId || prodotto._id || '', // ← Usa _id se productId non esiste
      nome: prodotto.nome || '',
      searchTerm: prodotto.nome || '',
      quantitaDisponibile: 0, // Verrà popolata quando si caricano le giacenze
      quantitaAssegnata: 0,
      quantitaMinima: prodotto.quantitaMinima || 0, // ← Usa quantitaMinima dal prodotto se esiste
      quantitaDaAggiungere: prodotto.quantita?.toString() || '',
      note: prodotto.note || '',
      isExisting: true, // Flag per identificare prodotti esistenti
      isEditing: false, // Flag per modalità modifica
      originalData: prodotto // Backup dei dati originali
    }));

    // Aggiungi riga vuota per nuovi prodotti solo se non è readonly
    const righeFinali = [...righeEsistenti];
    if (!isReadOnly) {
      const rigaVuota = {
        id: Date.now(),
        productId: '',
        nome: '',
        searchTerm: '',
        quantitaDisponibile: 0,
        quantitaAssegnata: 0,
        quantitaMinima: 0,
        quantitaDaAggiungere: '',
        note: '',
        isExisting: false,
        isEditing: false
      };
      righeFinali.push(rigaVuota);
    }

    console.log(`🔄 [${timestamp}] Righe create:`, righeFinali.length, 'totali (', righeEsistenti.length, 'esistenti +', isReadOnly ? '0' : '1', 'nuova)');
    console.log(`🔄 [${timestamp}] POPOLAMENTO INIZIALE - giacenze a 0, saranno caricate dopo`);
    setRigheTabella(righeFinali);
  };

  const caricaGiacenzeOperatore = async (userId) => {
    try {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🌐 [${timestamp}] INIZIO caricaGiacenzeOperatore per userId:`, userId);
      const response = await apiCall(`/admin/giacenze?userId=${userId}`, {}, token);
      setUserGiacenze(response || []);
      
      // Debug completo delle giacenze caricate
      console.log(`🔄 [${timestamp}] Giacenze operatore caricate:`, response?.length || 0);
      console.log(`🔄 [${timestamp}] Dettaglio giacenze:`, response);
      
      // Aggiorna anche i dati delle giacenze nelle righe esistenti solo se necessario
      setRigheTabella(prev => {
        let needsUpdate = false;
        const newRighe = prev.map(riga => {
          if (riga.isExisting && riga.productId) {
            console.log('🔍 Cercando giacenza per riga:', riga.nome, 'ID:', riga.productId);
            
            let giacenza = (response || []).find(g => {
              const giacenzaProductId = g.productId?._id || g.productId;
              return giacenzaProductId === riga.productId;
            });
            
            // Se non trova per ID, prova a matchare per nome come fallback
            if (!giacenza && riga.nome) {
              giacenza = (response || []).find(g => {
                const nomeGiacenza = g.productId?.nome || g.nome;
                return nomeGiacenza === riga.nome;
              });
            }
            
            const newQuantitaDisponibile = giacenza?.quantitaDisponibile || 0;
            const newQuantitaAssegnata = giacenza?.quantitaAssegnata || 0;
            // Se il prodotto è già in giacenza, usa la quantità minima della giacenza
            // Se NON è in giacenza, mantieni la quantità minima del prodotto nell'ordine
            const newQuantitaMinima = giacenza ? (giacenza.quantitaMinima || 0) : riga.quantitaMinima;
            
            // Debug dettagliato per quantità minima
            console.log(`🔍 [${timestamp}] Prodotto ${riga.nome}:`, {
              vecchio: { disp: riga.quantitaDisponibile, ass: riga.quantitaAssegnata, min: riga.quantitaMinima },
              nuovo: { disp: newQuantitaDisponibile, ass: newQuantitaAssegnata, min: newQuantitaMinima },
              giacenza: giacenza ? 'trovata' : 'non trovata'
            });
            
            // Controlla se i valori sono cambiati
            if (riga.quantitaDisponibile !== newQuantitaDisponibile || 
                riga.quantitaAssegnata !== newQuantitaAssegnata || 
                riga.quantitaMinima !== newQuantitaMinima) {
              needsUpdate = true;
              console.log('🎯 Aggiornamento giacenza per', riga.nome, ':', `${newQuantitaDisponibile}/${newQuantitaAssegnata}/${newQuantitaMinima}`);
            }
            
            return {
              ...riga,
              quantitaDisponibile: newQuantitaDisponibile,
              quantitaAssegnata: newQuantitaAssegnata,
              quantitaMinima: newQuantitaMinima
            };
          }
          return riga;
        });
        
        // Ritorna il nuovo array solo se c'è stato un cambiamento
        if (needsUpdate) {
          console.log(`✅ [${timestamp}] AGGIORNAMENTO giacenze completato - righe aggiornate`);
        } else {
          console.log(`✅ [${timestamp}] Nessun aggiornamento necessario per giacenze`);
        }
        return needsUpdate ? newRighe : prev;
      });
      
      console.log(`🔄 [${timestamp}] FINE caricaGiacenzeOperatore - Caricate`, response?.length || 0, 'giacenze operatore');
    } catch (err) {
      console.error('Errore caricamento giacenze:', err);
      setUserGiacenze([]);
    }
  };

  // Aggiorna un campo della riga
  const aggiornaRiga = async (rigaId, campo, valore) => {
    // Se è una modifica di quantitàMinima o quantitàDaAggiungere, imposta il flag modifiche in corso
    const riga = righeTabella.find(r => r.id === rigaId);
    if (riga?.isExisting && (campo === 'quantitaDaAggiungere' || campo === 'quantitaMinima')) {
      setModificheInCorso(true);
      console.log('🚫 Flag modificheInCorso impostato a true - bloccherà useEffect');
    }

    // Prima aggiorna lo stato locale
    setRigheTabella(prev => prev.map(riga => {
      if (riga.id === rigaId) {
        const updated = { ...riga, [campo]: valore };
        
        // Se viene selezionato un prodotto, popola i dati
        if (campo === 'productId' && valore) {
          const prodotto = allProducts?.find(p => p._id === valore);
          const giacenza = userGiacenze.find(g => {
            const giacenzaProductId = g.productId?._id || g.productId;
            return giacenzaProductId === valore;
          });
          
          if (prodotto) {
            updated.nome = prodotto.nome;
            updated.searchTerm = prodotto.nome;
            updated.quantitaDisponibile = giacenza?.quantitaDisponibile || 0;
            updated.quantitaAssegnata = giacenza?.quantitaAssegnata || 0;
            updated.quantitaMinima = giacenza?.quantitaMinima || 0;
          }
        }
        
        return updated;
      }
      return riga;
    }));
    
    // Se è un prodotto esistente e si modifica quantitaDaAggiungere o quantitaMinima, salva automaticamente con debounce
    if (riga?.isExisting && (campo === 'quantitaDaAggiungere' || campo === 'quantitaMinima')) {
      // Cancella il timer precedente
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      
      // Imposta nuovo timer per salvataggio dopo 1 secondo
      const newTimer = setTimeout(async () => {
        try {
          console.log(`🔄 Salvataggio automatico (debounced) per prodotto esistente: ${riga.nome}, campo: ${campo}, valore: ${valore}`);
          
          // Trova e aggiorna il prodotto nell'ordine
          const prodottiAggiornati = prodottiOrdine.map(p => {
            const match = p.productId === riga.productId || p.nome === riga.nome;
            if (match) {
              const updated = { ...p };
              if (campo === 'quantitaDaAggiungere') {
                updated.quantita = parseInt(valore) || 0;
              } else if (campo === 'quantitaMinima') {
                updated.quantitaMinima = parseInt(valore) || 0;
              }
              console.log(`✅ Prodotto aggiornato:`, updated);
              return updated;
            }
            return p;
          });
          
          // Salva sul backend
          const endpoint = ordine.itemType === 'ordine' ? '/ordini' : '/rdt';
          await apiCall(`${endpoint}/${ordine._id}`, {
            method: 'PUT',
            body: JSON.stringify({ prodotti: prodottiAggiornati })
          }, token);
          
          console.log(`✅ Salvataggio automatico completato per ${campo}`);
          
          // Aggiorna lo stato locale dei prodotti ordine (senza ricaricamento)
          setProdottiOrdine(prodottiAggiornati);
          
          // Riabilita i reload dopo il salvataggio
          setTimeout(() => {
            setModificheInCorso(false);
            console.log('✅ Flag modificheInCorso reimpostato a false - useEffect sbloccato');
          }, 100);
          
        } catch (err) {
          console.error('❌ Errore salvataggio automatico:', err);
          setError('Errore salvataggio: ' + err.message);
          // Riabilita i reload anche in caso di errore
          setTimeout(() => {
            setModificheInCorso(false);
            console.log('⚠️ Flag modificheInCorso reimpostato a false dopo errore');
          }, 100);
        }
      }, 1000); // Salva dopo 1 secondo di inattività
      
      setSaveTimer(newTimer);
    }
  };

  // Aggiungi una nuova riga
  const aggiungiRiga = () => {
    setRigheTabella(prev => [...prev, {
      id: Date.now(),
      productId: '',
      nome: '',
      searchTerm: '',
      quantitaDisponibile: 0,
      quantitaAssegnata: 0,
      quantitaMinima: 0,
      quantitaDaAggiungere: '',
      note: ''
    }]);
  };

  // Rimuovi una riga
  const rimuoviRiga = (rigaId) => {
    setRigheTabella(prev => prev.filter(riga => riga.id !== rigaId));
    // Rimuovi anche dai dati temporanei se esiste
    setDatiTemporanei(prev => {
      const newData = { ...prev };
      delete newData[rigaId];
      return newData;
    });
    // Rimuovi dalla lista delle righe in modifica
    setRigheInModifica(prev => {
      const newSet = new Set(prev);
      newSet.delete(rigaId);
      return newSet;
    });
  };

  // Rimuovi riga visivamente (solo lato client, senza salvare)
  const rimuoviRigaVisivamente = (rigaId) => {
    const riga = righeTabella.find(r => r.id === rigaId);
    if (!riga) return;
    
    if (!window.confirm(`Rimuovere "${riga.nome}" dall'ordine?`)) return;
    
    console.log('🗑️ Rimozione visiva prodotto:', riga.nome);
    
    // Rimuovi la riga dalla tabella visivamente
    setRigheTabella(prev => prev.filter(r => r.id !== rigaId));
    
    // Aggiorna anche i prodotti ordine locali per mantenere la coerenza
    if (riga.isExisting) {
      setProdottiOrdine(prev => prev.filter(p => {
        const matchById = p.productId === riga.productId;
        const matchByName = p.nome === riga.nome;
        return !(matchById || matchByName);
      }));
    }
    
    // Pulisci gli stati correlati
    setDatiTemporanei(prev => {
      const newData = { ...prev };
      delete newData[rigaId];
      return newData;
    });
    
    setRigheInModifica(prev => {
      const newSet = new Set(prev);
      newSet.delete(rigaId);
      return newSet;
    });
    
    setError(`"${riga.nome}" rimosso dall'ordine - verrà salvato con il prossimo invio`);
    setTimeout(() => setError(''), 3000);
  };

  // Attiva modifica per una riga
  const attivaModificaRiga = (rigaId) => {
    const riga = righeTabella.find(r => r.id === rigaId);
    if (!riga) return;

    // Salva i dati correnti come temporanei
    setDatiTemporanei(prev => ({
      ...prev,
      [rigaId]: {
        quantitaDaAggiungere: riga.quantitaDaAggiungere,
        quantitaMinima: riga.quantitaMinima,
        note: riga.note
      }
    }));

    // Aggiungi alla lista delle righe in modifica
    setRigheInModifica(prev => new Set([...prev, rigaId]));
  };

  // Annulla modifica per una riga
  const annullaModificaRiga = (rigaId) => {
    // Rimuovi dai dati temporanei
    setDatiTemporanei(prev => {
      const newData = { ...prev };
      delete newData[rigaId];
      return newData;
    });

    // Rimuovi dalla lista delle righe in modifica
    setRigheInModifica(prev => {
      const newSet = new Set(prev);
      newSet.delete(rigaId);
      return newSet;
    });
  };

  // Aggiorna dati temporanei durante modifica
  const aggiornaDatiTemporanei = (rigaId, campo, valore) => {
    setDatiTemporanei(prev => ({
      ...prev,
      [rigaId]: {
        ...prev[rigaId],
        [campo]: valore
      }
    }));
  };

  // Salva modifica per una riga
  const salvaModificaRiga = async (rigaId) => {
    const datiTemp = datiTemporanei[rigaId];
    const riga = righeTabella.find(r => r.id === rigaId);
    if (!datiTemp || !riga) return;

    try {
      setLoading(true);
      console.log('💾 Salvataggio modifica per:', riga.nome, 'isExisting:', riga.isExisting);
      console.log('💾 Dati temporanei:', datiTemp);

      // Se è un prodotto esistente nell'ordine, aggiorna sul backend
      if (riga.isExisting) {
        // Trova il prodotto nell'ordine e aggiornalo
        const prodottiAggiornati = prodottiOrdine.map(p => {
          const match = p.productId === riga.productId || p.nome === riga.nome;
          if (match) {
            console.log('🎯 Aggiornamento prodotto esistente:', p.nome, 'da quantità:', p.quantita, 'a quantità:', datiTemp.quantitaDaAggiungere);
            return {
              ...p,
              quantita: parseInt(datiTemp.quantitaDaAggiungere) || 0,
              quantitaMinima: parseInt(datiTemp.quantitaMinima) || 0,
              note: datiTemp.note || ''
            };
          }
          return p;
        });

        console.log('📝 Prodotti aggiornati da salvare:', prodottiAggiornati.length);
        console.log('🔍 DEBUG Modifica: Prodotti con quantitaMinima:', prodottiAggiornati.map(p => ({
          nome: p.nome,
          quantita: p.quantita,
          quantitaMinima: p.quantitaMinima || 'NON DEFINITA'
        })));

        // Salva sul backend
        const endpoint = ordine.itemType === 'ordine' ? '/ordini' : '/rdt';
        await apiCall(`${endpoint}/${ordine._id}`, {
          method: 'PUT',
          body: JSON.stringify({ prodotti: prodottiAggiornati })
        }, token);

        console.log('✅ Prodotti salvati sul backend');

        // Mostra messaggio di successo immediatamente
        setError('✅ Modifica salvata con successo');
        
        // Aspetta un momento per permettere la visualizzazione del messaggio
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Ricarica i dati dell'ordine per sincronizzazione
        await caricaProdottiOrdine();
        
        // Ricarica anche le giacenze operatore per aggiornare la tabella
        const assegnazione = getAssegnazioneForItem(ordine.itemType, ordine.numero);
        if (assegnazione?.userId?._id) {
          await caricaGiacenzeOperatore(assegnazione.userId._id);
        }

        // Pulisce il messaggio dopo il refresh
        setTimeout(() => setError(''), 2000);
      } else {
        // Per prodotti nuovi, aggiorna solo localmente (verranno salvati al momento dell'aggiunta all'ordine)
        console.log('📝 Aggiornamento locale per prodotto nuovo');
        setRigheTabella(prev => prev.map(r => {
          if (r.id === rigaId) {
            return {
              ...r,
              quantitaDaAggiungere: datiTemp.quantitaDaAggiungere,
              quantitaMinima: datiTemp.quantitaMinima,
              note: datiTemp.note
            };
          }
          return r;
        }));
      }

      // Pulisci i dati temporanei e rimuovi dalla modifica
      setDatiTemporanei(prev => {
        const newData = { ...prev };
        delete newData[rigaId];
        return newData;
      });

      setRigheInModifica(prev => {
        const newSet = new Set(prev);
        newSet.delete(rigaId);
        return newSet;
      });

      console.log('🧹 Dati temporanei puliti e modalità modifica disattivata');

    } catch (err) {
      console.error('❌ Errore salvataggio modifica:', err);
      setError('Errore salvataggio modifica: ' + err.message);
    } finally {
      setLoading(false);
    }
  };




  // Rimuovi prodotto dall'ordine
  const rimuoviProdottoDallOrdine = async (rigaId) => {
    const riga = righeTabella.find(r => r.id === rigaId);
    if (!riga || !riga.isExisting) return;
    
    if (!window.confirm(`Rimuovere "${riga.nome}" dall'ordine?`)) return;

    try {
      setLoading(true);
      console.log('🗑️ Rimozione prodotto:', riga.nome, 'ProductID:', riga.productId);
      
      // Trova e filtra il prodotto dall'array
      const prodottiAggiornati = prodottiOrdine.filter(p => {
        const matchById = p.productId === riga.productId;
        const matchByName = p.nome === riga.nome;
        const shouldRemove = matchById || matchByName;
        
        if (shouldRemove) {
          console.log('🎯 Prodotto trovato e marcato per rimozione:', p.nome, p.productId);
        }
        
        return !shouldRemove; // Tieni tutti tranne quello da rimuovere
      });

      console.log('📝 Prodotti prima:', prodottiOrdine.length, 'dopo:', prodottiAggiornati.length);

      const endpoint = ordine.itemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${ordine._id}`, {
        method: 'PUT',
        body: JSON.stringify({ prodotti: prodottiAggiornati })
      }, token);

      // Mostra messaggio di successo immediatamente
      setError(`✅ "${riga.nome}" rimosso dall'ordine`);
      
      // Aspetta un momento per permettere la visualizzazione del messaggio
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Ricarica dati ordine e giacenze
      await caricaProdottiOrdine();
      
      // Ricarica anche le giacenze operatore se disponibili
      const assegnazione = getAssegnazioneForItem(ordine.itemType, ordine.numero);
      if (assegnazione?.userId?._id) {
        await caricaGiacenzeOperatore(assegnazione.userId._id);
      }

      // Pulisce il messaggio dopo il refresh
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      console.error('Errore rimozione prodotto:', err);
      setError('Errore rimozione prodotto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna giacenza operatore se necessario
  const aggiornaGiacenzaOperatore = async (productId, quantitaAssegnata, quantitaMinima) => {
    const assegnazione = getAssegnazioneForItem(ordine.itemType, ordine.numero);
    if (!assegnazione?.userId?._id) return;

    const giacenzaEsistente = userGiacenze.find(g => g.productId._id === productId);

    if (!giacenzaEsistente) {
      // Crea nuova giacenza
      await apiCall('/admin/assign-giacenza', {
        method: 'POST',
        body: JSON.stringify({
          userId: assegnazione.userId._id,
          productId: productId,
          quantitaAssegnata: parseFloat(quantitaAssegnata),
          quantitaMinima: parseFloat(quantitaMinima)
        })
      }, token);
    } else if (
      parseFloat(quantitaAssegnata) !== giacenzaEsistente.quantitaAssegnata || 
      parseFloat(quantitaMinima) !== giacenzaEsistente.quantitaMinima
    ) {
      // Aggiorna giacenza esistente
      await apiCall(`/admin/giacenze/${giacenzaEsistente._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          quantitaAssegnata: parseFloat(quantitaAssegnata),
          quantitaMinima: parseFloat(quantitaMinima)
        })
      }, token);
    }
  };

  // Aggiungi prodotti all'ordine
  const aggiungiProdottiAllOrdine = async () => {
    // Filtra righe con quantità da aggiungere > 0
    const righeComplete = righeTabella.filter(riga => 
      riga.productId && 
      riga.quantitaDaAggiungere && 
      parseInt(riga.quantitaDaAggiungere) > 0
    );

    if (righeComplete.length === 0) {
      setError('Compila almeno una riga con quantità da aggiungere');
      return;
    }

    try {
      setLoading(true);

      // Se ci sono prodotti esistenti, aggiornali; altrimenti aggiungili
      const prodottiEsistenti = righeComplete.filter(r => r.isExisting);
      const prodottiNuovi = righeComplete.filter(r => !r.isExisting);
      
      let tuttiProdotti = [...prodottiOrdine];
      
      // Aggiorna quantità per prodotti esistenti
      prodottiEsistenti.forEach(riga => {
        const index = tuttiProdotti.findIndex(p => p.productId === riga.productId || p.nome === riga.nome);
        if (index >= 0) {
          tuttiProdotti[index].quantita = parseInt(riga.quantitaDaAggiungere) || 0;
          tuttiProdotti[index].quantitaMinima = parseInt(riga.quantitaMinima) || 0;
          tuttiProdotti[index].note = riga.note || '';
        }
      });
      
      // Aggiungi prodotti nuovi
      prodottiNuovi.forEach(riga => {
        tuttiProdotti.push({
          productId: riga.productId,
          nome: riga.nome,
          quantita: parseInt(riga.quantitaDaAggiungere) || 0,
          quantitaMinima: parseInt(riga.quantitaMinima) || 0,
          note: riga.note || ''
        });
      });
      
      console.log('🔍 DEBUG Frontend: Prodotti da salvare nell\'ordine:', tuttiProdotti.map(p => ({
        nome: p.nome,
        quantita: p.quantita,
        quantitaMinima: p.quantitaMinima || 'NON DEFINITA'
      })));

      const endpoint = ordine.itemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${ordine._id}`, {
        method: 'PUT',
        body: JSON.stringify({ prodotti: tuttiProdotti })
      }, token);

      // Mostra messaggio di successo immediatamente
      setError(`✅ ${righeComplete.length} prodott${righeComplete.length > 1 ? 'i aggiunti' : 'o aggiunto'}!`);
      
      // Aspetta un momento per permettere la visualizzazione del messaggio
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Poi ricarica dati (ricaricherà automaticamente la tabella)
      await caricaProdottiOrdine();
      
      const assegnazione = getAssegnazioneForItem(ordine.itemType, ordine.numero);
      if (assegnazione?.userId?._id) {
        await caricaGiacenzeOperatore(assegnazione.userId._id);
      }

      // Pulisce il messaggio dopo il refresh
      setTimeout(() => setError(''), 2000);

      if (onUpdate) onUpdate();

    } catch (err) {
      setError('Errore aggiunta prodotti: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const operatore = getAssegnazioneForItem(ordine.itemType, ordine.numero)?.userId;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="glass-modal w-full h-full flex flex-col">
        {/* Header */}
        <div className="glass-modal-header p-6 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="glass-icon p-3 rounded-xl mr-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isReadOnly ? 'Visualizzazione' : 'Gestione'} Prodotti - {ordine?.itemType?.toUpperCase()} {ordine?.numero}
                  {isReadOnly && <span className="ml-2 text-sm bg-yellow-500/20 px-2 py-1 rounded-full">🔒 Solo Lettura</span>}
                </h2>
                <p className="text-white/70">
                  Operatore: {operatore?.username} | Cliente: {ordine?.cliente}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="glass-action-button p-2 rounded-xl">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 min-h-0">
          {/* Tabella unificata prodotti */}
          <div className="glass-card p-6 rounded-xl h-full flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              📦 Riepilogo Prodotti - {ordine?.itemType?.toUpperCase()} {ordine?.numero}
              <span className="ml-3 text-sm bg-blue-500/20 px-3 py-1 rounded-full">
                {prodottiOrdine.length} esistenti • {righeTabella.filter(r => !r.isExisting).length - 1} nuovi
              </span>
            </h3>
              
              <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-2 text-white/80 min-w-[250px]">Nome Prodotto</th>
                      <th className="text-center py-3 px-2 text-white/80 min-w-[100px]">Q.tà Disponibile</th>
                      <th className="text-center py-3 px-2 text-white/80 min-w-[100px]">Q.tà Assegnata</th>
                      <th className="text-center py-3 px-2 text-white/80 min-w-[100px]">Q.tà Minima</th>
                      <th className="text-center py-3 px-2 text-white/80 min-w-[100px]">Q.tà da Aggiungere</th>
                      <th className="text-left py-3 px-2 text-white/80 min-w-[150px]">Note</th>
                      <th className="text-center py-3 px-2 text-white/80 w-[80px]">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {righeTabella.map((riga) => (
                      <tr key={riga.id} className="border-b border-white/10">
                        {/* Nome Prodotto */}
                        <td className="py-3 px-2">
                          {riga.isExisting ? (
                            // Prodotto esistente - solo visualizzazione nome
                            <div>
                              <div className="text-white font-medium">{riga.nome}</div>
                              <div className="text-white/50 text-xs">{riga.productId}</div>
                            </div>
                          ) : (
                            // Prodotto nuovo - input con ricerca
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={isReadOnly ? "Solo lettura" : "Cerca prodotto..."}
                                className={`glass-input w-full p-2 rounded-lg text-white text-sm ${
                                  isReadOnly 
                                    ? 'bg-white/5 border-0 cursor-not-allowed'
                                    : 'bg-transparent border border-white/20'
                                }`}
                                value={riga.searchTerm}
                                onFocus={() => !isReadOnly && setOpenDropdownId(riga.id)}
                                onChange={(e) => {
                                  if (!isReadOnly) {
                                    aggiornaRiga(riga.id, 'searchTerm', e.target.value);
                                    setOpenDropdownId(riga.id);
                                  }
                                }}
                                onBlur={(e) => {
                                  setTimeout(() => {
                                    if (!e.relatedTarget?.closest('.dropdown-product')) {
                                      setOpenDropdownId(null);
                                    }
                                  }, 150);
                                }}
                                disabled={isReadOnly}
                              />
                              
                              {openDropdownId === riga.id && (
                                <div className="absolute top-full left-0 right-0 z-[999999] bg-gray-900 border border-white/20 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-2xl">
                                  {allProducts?.filter(p => 
                                    p.attivo && p.nome.toLowerCase().includes(riga.searchTerm.toLowerCase())
                                  ).slice(0, 15).map(product => (
                                    <div
                                      key={product._id}
                                      className="dropdown-product p-3 hover:bg-white/10 cursor-pointer"
                                      onClick={() => {
                                        aggiornaRiga(riga.id, 'productId', product._id);
                                        setOpenDropdownId(null);
                                      }}
                                    >
                                      <div className="text-white text-sm font-medium">{product.nome}</div>
                                      <div className="text-white/50 text-xs">{product.codice}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        
                        {/* Q.tà Disponibile (disabled) */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            className="glass-input w-full p-2 rounded-lg bg-white/5 border-0 text-white text-sm text-center"
                            value={riga.quantitaDisponibile}
                            disabled
                          />
                        </td>
                        
                        {/* Q.tà Assegnata (sempre disabled - gestita automaticamente) */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            placeholder="0"
                            className="glass-input w-full p-2 rounded-lg bg-white/5 border-0 text-white text-sm text-center cursor-not-allowed"
                            value={riga.quantitaAssegnata}
                            disabled={true}
                            title="Quantità assegnata automaticamente alla finalizzazione"
                          />
                        </td>
                        
                        {/* Q.tà Minima */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className={`glass-input w-full p-2 rounded-lg text-white text-sm text-center ${
                              (riga.isExisting && !righeInModifica.has(riga.id)) || isReadOnly
                                ? 'bg-white/5 border-0 cursor-not-allowed' 
                                : 'bg-transparent border border-orange-400/50'
                            }`}
                            value={righeInModifica.has(riga.id) && datiTemporanei[riga.id] 
                              ? datiTemporanei[riga.id].quantitaMinima 
                              : riga.quantitaMinima}
                            onChange={(e) => {
                              const value = Math.max(0, Math.floor(Number(e.target.value) || 0));
                              if (righeInModifica.has(riga.id)) {
                                aggiornaDatiTemporanei(riga.id, 'quantitaMinima', value.toString());
                              } else {
                                aggiornaRiga(riga.id, 'quantitaMinima', value.toString());
                              }
                            }}
                            disabled={(riga.isExisting && riga.quantitaDisponibile > 0 && !righeInModifica.has(riga.id)) || isReadOnly}
                            title={
                              riga.isExisting && riga.quantitaDisponibile > 0 
                                ? "Quantità minima modificabile solo in modalità modifica (prodotto già in giacenza)" 
                                : riga.isExisting 
                                  ? "Imposta quantità minima per prodotto non ancora in giacenza operatore"
                                  : "Imposta quantità minima per nuovo prodotto"
                            }
                          />
                        </td>
                        
                        {/* Q.tà da Aggiungere - SEMPRE MODIFICABILE */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className={`glass-input w-full p-2 rounded-lg text-white text-sm text-center ${
                              isReadOnly
                                ? 'bg-white/5 border-0 cursor-not-allowed' 
                                : 'bg-transparent border border-blue-400/50'
                            }`}
                            value={righeInModifica.has(riga.id) && datiTemporanei[riga.id] 
                              ? datiTemporanei[riga.id].quantitaDaAggiungere 
                              : riga.quantitaDaAggiungere}
                            onChange={(e) => {
                              const value = Math.max(0, Math.floor(Number(e.target.value) || 0));
                              if (righeInModifica.has(riga.id)) {
                                aggiornaDatiTemporanei(riga.id, 'quantitaDaAggiungere', value.toString());
                              } else {
                                aggiornaRiga(riga.id, 'quantitaDaAggiungere', value.toString());
                              }
                            }}
                            disabled={isReadOnly}
                            title="Quantità da aggiungere alle giacenze"
                          />
                        </td>
                        
                        {/* Note */}
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            placeholder="Note..."
                            className={`glass-input w-full p-2 rounded-lg text-white text-sm ${
                              (riga.isExisting && !righeInModifica.has(riga.id)) || isReadOnly
                                ? 'bg-white/5 border-0 cursor-not-allowed' 
                                : 'bg-transparent border border-white/20'
                            }`}
                            value={righeInModifica.has(riga.id) && datiTemporanei[riga.id] 
                              ? datiTemporanei[riga.id].note 
                              : riga.note}
                            onChange={(e) => {
                              if (righeInModifica.has(riga.id)) {
                                aggiornaDatiTemporanei(riga.id, 'note', e.target.value);
                              } else {
                                aggiornaRiga(riga.id, 'note', e.target.value);
                              }
                            }}
                            disabled={(riga.isExisting && !righeInModifica.has(riga.id)) || isReadOnly}
                          />
                        </td>
                        
                        {/* Azioni */}
                        <td className="py-3 px-2 text-center">
                          {isReadOnly ? (
                            // Modalità readonly - nessun pulsante
                            <div className="text-white/40 text-xs">
                              Solo lettura
                            </div>
                          ) : riga.isExisting ? (
                            // Prodotto esistente - solo pulsante elimina
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => rimuoviRigaVisivamente(riga.id)}
                                className="glass-action-button p-1 rounded-lg hover:scale-110 transition-all"
                                title="Rimuovi dall'ordine"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          ) : (
                            // Pulsante per righe nuove - solo elimina
                            <button
                              onClick={() => rimuoviRiga(riga.id)}
                              className="glass-action-button p-1 rounded-lg hover:scale-110 transition-all"
                              title="Rimuovi riga"
                            >
                              <X className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {!isReadOnly && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={aggiungiRiga}
                    className="glass-button-secondary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Aggiungi Riga</span>
                  </button>
                  
                  <div className="text-white/60 text-sm">
                    💡 Compila i campi e usa "Aggiungi all'Ordine" per salvare
                  </div>
                </div>
              )}
              
              {isReadOnly && (
                <div className="mt-4 text-center">
                  <div className="text-white/60 text-sm">
                    🔒 Ordine finalizzato - Solo visualizzazione. Per modificare, riapri l'ordine.
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Footer */}
        <div className="glass-modal-footer p-6 border-t border-white/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="glass-button-secondary flex items-center gap-2 px-6 py-3 rounded-xl hover:scale-105 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Chiudi</span>
            </button>
            
            {!isReadOnly && (
              <button
                onClick={aggiungiProdottiAllOrdine}
                disabled={loading}
                className="glass-button-primary px-8 py-3 rounded-xl text-white hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Package className="w-4 h-4" />
                <span>{loading ? 'Aggiungendo...' : 'Aggiungi all\'Ordine'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-modal {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .glass-modal-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-modal-footer {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          transition: all 0.3s ease;
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .glass-button-primary {
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
        }

        .glass-button-secondary {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-action-button {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .glass-action-button:hover {
          background: rgba(255, 255, 255, 0.12);
        }
      `}</style>
    </div>
  );
};

export default AggiungiProdottoOrdine;