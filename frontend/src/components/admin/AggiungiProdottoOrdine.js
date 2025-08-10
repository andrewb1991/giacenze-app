import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Plus,
  Save,
  X,
  Package,
  ArrowLeft,
  Edit
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
    if (ordine?._id && assegnazioni) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🔄 [${timestamp}] useEffect triggered - caricando dati per ordine:`, ordine._id);
      
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
    }
  }, [ordine?._id, ordine?.itemType, ordine?.numero, assegnazioni?.length]);

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
      quantitaMinima: 0,
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
            const newQuantitaMinima = giacenza?.quantitaMinima || 0;
            
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
  const aggiornaRiga = (rigaId, campo, valore) => {
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
  };

  // Attiva modalità editing per un prodotto esistente
  const attivaModifica = (rigaId) => {
    setRigheTabella(prev => prev.map(riga => {
      if (riga.id === rigaId && riga.isExisting) {
        return { ...riga, isEditing: true };
      }
      return riga;
    }));
  };

  // Annulla modifica e ripristina dati originali
  const annullaModifica = (rigaId) => {
    setRigheTabella(prev => prev.map(riga => {
      if (riga.id === rigaId && riga.isExisting) {
        return {
          ...riga,
          quantitaDaAggiungere: riga.originalData.quantita?.toString() || '',
          note: riga.originalData.note || '',
          isEditing: false
        };
      }
      return riga;
    }));
  };

  // Salva modifica prodotto esistente
  const salvaModificaProdottoEsistente = async (rigaId) => {
    const riga = righeTabella.find(r => r.id === rigaId);
    if (!riga || !riga.isExisting) return;

    try {
      const prodottiAggiornati = prodottiOrdine.map(p => {
        if (p.productId === riga.productId || p.nome === riga.nome) {
          return {
            ...p,
            quantita: parseFloat(riga.quantitaDaAggiungere),
            note: riga.note
          };
        }
        return p;
      });

      const endpoint = ordine.itemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${ordine._id}`, {
        method: 'PUT',
        body: JSON.stringify({ prodotti: prodottiAggiornati })
      }, token);

      // Aggiorna i dati originali e disattiva editing
      setRigheTabella(prev => prev.map(r => {
        if (r.id === rigaId) {
          return {
            ...r,
            isEditing: false,
            originalData: {
              ...r.originalData,
              quantita: parseFloat(r.quantitaDaAggiungere),
              note: r.note
            }
          };
        }
        return r;
      }));

      await caricaProdottiOrdine();
      setError(`✅ Prodotto "${riga.nome}" modificato`);
      setTimeout(() => setError(''), 3000);

    } catch (err) {
      setError('Errore modifica prodotto: ' + err.message);
    }
  };

  // Rimuovi prodotto dall'ordine
  const rimuoviProdottoDallOrdine = async (rigaId) => {
    const riga = righeTabella.find(r => r.id === rigaId);
    if (!riga || !riga.isExisting) return;
    
    if (!window.confirm(`Rimuovere "${riga.nome}" dall'ordine?`)) return;

    try {
      const prodottiAggiornati = prodottiOrdine.filter(p => 
        p.productId !== riga.productId || p.nome !== riga.nome
      );

      const endpoint = ordine.itemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${ordine._id}`, {
        method: 'PUT',
        body: JSON.stringify({ prodotti: prodottiAggiornati })
      }, token);

      await caricaProdottiOrdine();
      setError(`✅ "${riga.nome}" rimosso dall'ordine`);
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Errore rimozione prodotto: ' + err.message);
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
    // Filtra solo le righe NUOVE complete (non quelle esistenti)
    const righeComplete = righeTabella.filter(riga => 
      !riga.isExisting && // Solo prodotti nuovi
      riga.productId && 
      riga.quantitaDaAggiungere && 
      parseFloat(riga.quantitaDaAggiungere) > 0
    );

    if (righeComplete.length === 0) {
      setError('Compila almeno una riga con prodotto nuovo e quantità');
      return;
    }

    try {
      setLoading(true);

      // 1. Aggiorna giacenze operatore se necessario
      for (const riga of righeComplete) {
        if (riga.quantitaAssegnata && riga.quantitaMinima) {
          await aggiornaGiacenzaOperatore(riga.productId, riga.quantitaAssegnata, riga.quantitaMinima);
        }
      }

      // 2. Aggiungi prodotti all'ordine
      const nuoviProdotti = righeComplete.map(riga => ({
        productId: riga.productId,
        nome: riga.nome,
        quantita: parseFloat(riga.quantitaDaAggiungere),
        note: riga.note || ''
      }));

      const tuttiProdotti = [...prodottiOrdine, ...nuoviProdotti];
      
      const endpoint = ordine.itemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${ordine._id}`, {
        method: 'PUT',
        body: JSON.stringify({ prodotti: tuttiProdotti })
      }, token);

      // 3. Ricarica dati (ricaricherà automaticamente la tabella)
      await caricaProdottiOrdine();
      
      const assegnazione = getAssegnazioneForItem(ordine.itemType, ordine.numero);
      if (assegnazione?.userId?._id) {
        await caricaGiacenzeOperatore(assegnazione.userId._id);
      }

      setError(`✅ ${righeComplete.length} prodott${righeComplete.length > 1 ? 'i aggiunti' : 'o aggiunto'}!`);
      setTimeout(() => setError(''), 3000);

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
                        
                        {/* Q.tà Assegnata */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className={`glass-input w-full p-2 rounded-lg text-white text-sm text-center ${
                              (riga.isExisting && !riga.isEditing) || isReadOnly
                                ? 'bg-white/5 border-0 cursor-not-allowed' 
                                : 'bg-transparent border border-green-400/50'
                            }`}
                            value={riga.quantitaAssegnata}
                            onChange={(e) => aggiornaRiga(riga.id, 'quantitaAssegnata', e.target.value)}
                            disabled={(riga.isExisting && !riga.isEditing) || isReadOnly}
                          />
                        </td>
                        
                        {/* Q.tà Minima */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className={`glass-input w-full p-2 rounded-lg text-white text-sm text-center ${
                              (riga.isExisting && !riga.isEditing) || isReadOnly
                                ? 'bg-white/5 border-0 cursor-not-allowed' 
                                : 'bg-transparent border border-orange-400/50'
                            }`}
                            value={riga.quantitaMinima}
                            onChange={(e) => aggiornaRiga(riga.id, 'quantitaMinima', e.target.value)}
                            disabled={(riga.isExisting && !riga.isEditing) || isReadOnly}
                          />
                        </td>
                        
                        {/* Q.tà da Aggiungere */}
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className={`glass-input w-full p-2 rounded-lg text-white text-sm text-center ${
                              (riga.isExisting && !riga.isEditing) || isReadOnly
                                ? 'bg-white/5 border-0 cursor-not-allowed' 
                                : 'bg-transparent border border-blue-400/50'
                            }`}
                            value={riga.quantitaDaAggiungere}
                            onChange={(e) => aggiornaRiga(riga.id, 'quantitaDaAggiungere', e.target.value)}
                            disabled={(riga.isExisting && !riga.isEditing) || isReadOnly}
                          />
                        </td>
                        
                        {/* Note */}
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            placeholder="Note..."
                            className={`glass-input w-full p-2 rounded-lg text-white text-sm ${
                              (riga.isExisting && !riga.isEditing) || isReadOnly
                                ? 'bg-white/5 border-0 cursor-not-allowed' 
                                : 'bg-transparent border border-white/20'
                            }`}
                            value={riga.note}
                            onChange={(e) => aggiornaRiga(riga.id, 'note', e.target.value)}
                            disabled={(riga.isExisting && !riga.isEditing) || isReadOnly}
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
                            // Pulsanti per prodotti esistenti
                            <div className="flex items-center justify-center gap-1">
                              {riga.isEditing ? (
                                // Modalità editing - pulsanti salva/annulla
                                <>
                                  <button
                                    onClick={() => salvaModificaProdottoEsistente(riga.id)}
                                    className="glass-action-button p-1 rounded-lg hover:scale-110 transition-all"
                                    title="Salva modifiche"
                                  >
                                    <Save className="w-4 h-4 text-green-400" />
                                  </button>
                                  <button
                                    onClick={() => annullaModifica(riga.id)}
                                    className="glass-action-button p-1 rounded-lg hover:scale-110 transition-all"
                                    title="Annulla modifiche"
                                  >
                                    <X className="w-4 h-4 text-yellow-400" />
                                  </button>
                                </>
                              ) : (
                                // Modalità visualizzazione - pulsanti modifica/elimina
                                <>
                                  <button
                                    onClick={() => attivaModifica(riga.id)}
                                    className="glass-action-button p-1 rounded-lg hover:scale-110 transition-all"
                                    title="Modifica prodotto"
                                  >
                                    <Edit className="w-4 h-4 text-blue-400" />
                                  </button>
                                  <button
                                    onClick={() => rimuoviProdottoDallOrdine(riga.id)}
                                    className="glass-action-button p-1 rounded-lg hover:scale-110 transition-all"
                                    title="Rimuovi dall'ordine"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            // Pulsante per righe nuove
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