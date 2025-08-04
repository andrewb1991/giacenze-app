import React, { useState, useEffect } from 'react';
import { 
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  Star,
  Building,
  Truck,
  FileText,
  TrendingUp,
  BarChart3,
  Users,
  ShoppingCart,
  X,
  Save,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiCall } from '../../services/api';

const OrdiniManagement = () => {
  const { token, setError } = useAuth();
  
  // Stati principali
  const [ordini, setOrdini] = useState([]);
  const [rdt, setRdt] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('lista');
  const [assegnazioni, setAssegnazioni] = useState([]);
  const [users, setUsers] = useState([]);
  const [settimane, setSettimane] = useState([]);

  // Stati per form nuovo ordine/RDT
  const [showNewModal, setShowNewModal] = useState(false);
  const [modalType, setModalType] = useState('ordine'); // 'ordine' o 'rdt'
  const [nuovoItem, setNuovoItem] = useState({
    numero: '',
    cliente: '',
    dataConsegna: '',
    priorita: 'MEDIA',
    prodotti: [],
    indirizzo: {
      via: '',
      citta: '',
      cap: '',
      provincia: ''
    },
    contatti: {
      telefono: '',
      email: '',
      referente: ''
    },
    note: '',
    assegnazioneId: '' // Nuova assegnazione obbligatoria
  });

  // Stati per gestione prodotti
  const [newProduct, setNewProduct] = useState({
    productId: '',
    quantita: 0
  });
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productSelectionMode, setProductSelectionMode] = useState('search'); // 'search' o 'dropdown'

  // Stati per modal assegnazione
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignItem, setAssignItem] = useState(null);
  const [assignItemType, setAssignItemType] = useState('ordine');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [assignmentMode, setAssignmentMode] = useState('existing'); // 'existing' o 'custom'

  // Stati per modal dettagli ordine/RDT
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [detailsItemType, setDetailsItemType] = useState('ordine');
  const [editingProducts, setEditingProducts] = useState([]);

  // Stati per modal conferma finalizzazione
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeItem, setFinalizeItem] = useState(null);
  const [finalizeItemType, setFinalizeItemType] = useState('ordine');
  const [finalizeAssignment, setFinalizeAssignment] = useState('');

  // Stati per filtri
  const [filtri, setFiltri] = useState({
    stato: '',
    priorita: '',
    cliente: '',
    searchTerm: ''
  });

  // Carica dati iniziali
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordiniData, rdtData, assegnazioniData, usersData, settimaneData, productsData] = await Promise.all([
        apiCall('/ordini', {}, token),
        apiCall('/rdt', {}, token),
        apiCall('/assegnazioni', {}, token),
        apiCall('/users', {}, token),
        apiCall('/settimane', {}, token),
        apiCall('/products', {}, token)
      ]);

      setOrdini(ordiniData.ordini || ordiniData || []);
      setRdt(rdtData.rdt || rdtData || []);
      setAssegnazioni(assegnazioniData || []);
      setUsers(usersData || []);
      setSettimane(settimaneData || []);
      setProducts(productsData || []);
      
      // Debug log per verificare i dati caricati
      console.log('📊 Dati caricati:', {
        ordini: ordiniData?.length || 0,
        rdt: rdtData?.length || 0,
        assegnazioni: assegnazioniData?.length || 0,
        users: usersData?.length || 0,
        settimane: settimaneData?.length || 0,
        products: productsData?.length || 0
      });
      
      // Debug dettagliato per assegnazioni
      console.log('🔍 Assegnazioni dettaglio:', assegnazioniData?.slice(0, 3));
      console.log('👥 Users dettaglio:', usersData?.slice(0, 3));
      console.log('📅 Settimane dettaglio:', settimaneData?.slice(0, 3));
    } catch (err) {
      console.error('❌ Errore caricamento:', err);
      setError('Errore nel caricamento dati: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async () => {
    try {
      // Validazione migliorata
      if (!nuovoItem.numero || !nuovoItem.numero.trim()) {
        setError('Il numero ordine/RDT è obbligatorio');
        return;
      }
      if (!nuovoItem.cliente || !nuovoItem.cliente.trim()) {
        setError('Il cliente è obbligatorio');
        return;
      }
      if (!nuovoItem.dataConsegna) {
        setError('La data di consegna è obbligatoria');
        return;
      }
      if (!nuovoItem.assegnazioneId) {
        setError('L\'assegnazione è obbligatoria');
        return;
      }

      const endpoint = modalType === 'ordine' ? '/ordini' : '/rdt';
      
      // Crea payload con validazione esplicita dei campi
      const payload = {
        numero: nuovoItem.numero.trim(),
        cliente: nuovoItem.cliente.trim(),
        dataConsegna: nuovoItem.dataConsegna,
        priorita: nuovoItem.priorita || 'MEDIA',
        note: nuovoItem.note || '',
        indirizzo: {
          via: nuovoItem.indirizzo.via?.trim() || '',
          citta: nuovoItem.indirizzo.citta?.trim() || '',
          cap: nuovoItem.indirizzo.cap?.trim() || '',
          provincia: nuovoItem.indirizzo.provincia?.trim() || ''
        },
        contatti: {
          telefono: nuovoItem.contatti.telefono?.trim() || '',
          email: nuovoItem.contatti.email?.trim() || '',
          referente: nuovoItem.contatti.referente?.trim() || ''
        },
        // Converti prodotti per il backend (rimuovi productId e tieni solo i campi schema)
        prodotti: nuovoItem.prodotti.map(prod => ({
          nome: prod.nome.trim(),
          quantita: parseInt(prod.quantita) || 0,
          unita: prod.unita || 'pz',
          prezzo: parseFloat(prod.prezzo) || 0
        })),
        valore: nuovoItem.prodotti.reduce((sum, prod) => {
          return sum + (parseInt(prod.quantita || 0) * parseFloat(prod.prezzo || 0));
        }, 0)
      };
      
      console.log('🔍 Payload da inviare:', payload);

      // Controllo duplicati delegato al backend per maggiore affidabilità
      // Il frontend potrebbe avere dati non aggiornati
      console.log(`🔍 Tentativo creazione ${modalType} con numero: "${payload.numero}"`);;

      // Crea l'ordine/RDT
      const createdItem = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      }, token);

      const itemId = createdItem._id || createdItem.id;

      // Collega immediatamente all'assegnazione
      if (modalType === 'ordine') {
        await apiCall(`/assegnazioni/${nuovoItem.assegnazioneId}/ordini`, {
          method: 'POST',
          body: JSON.stringify({
            ordineId: itemId,
            priorita: nuovoItem.priorita,
            tempoStimato: 60,
            note: nuovoItem.note
          })
        }, token);
      } else {
        await apiCall(`/assegnazioni/${nuovoItem.assegnazioneId}`, {
          method: 'PUT',
          body: JSON.stringify({
            rdt: itemId,
            note: nuovoItem.note
          })
        }, token);
      }

      // Aggiorna giacenze per ogni prodotto
      for (const prodotto of nuovoItem.prodotti) {
        try {
          await apiCall(`/admin/giacenze/update-global`, {
            method: 'POST',
            body: JSON.stringify({
              productId: prodotto.productId,
              quantitaUtilizzata: prodotto.quantita,
              operazione: 'sottrai',
              nota: `${modalType === 'ordine' ? 'Ordine' : 'RDT'} ${nuovoItem.numero} - ${nuovoItem.cliente}`
            })
          }, token);
        } catch (err) {
          console.warn(`Errore aggiornamento giacenza per prodotto ${prodotto.productId}:`, err);
        }
      }

      // Reset form e chiudi modal
      setNuovoItem({
        numero: '',
        cliente: '',
        dataConsegna: '',
        priorita: 'MEDIA',  
        prodotti: [],
        indirizzo: {
          via: '',
          citta: '',
          cap: '',
          provincia: ''
        },
        contatti: {
          telefono: '',
          email: '',
          referente: ''
        },
        note: '',
        assegnazioneId: ''
      });
      setShowNewModal(false);
      
      // Ricarica dati
      await loadData();
      
    } catch (err) {
      console.error(`❌ Errore creazione ${modalType}:`, err);
      
      // Gestione errori specifici
      if (err.message.includes('E11000') || err.message.includes('duplicate') || err.message.includes('già esistente')) {
        setError(`Il numero ${modalType} "${nuovoItem.numero}" è già in uso. Scegli un numero diverso.`);
      } else if (err.message.includes('required') || err.message.includes('obbligatori')) {
        setError('Compila tutti i campi obbligatori');
      } else if (err.message.includes('Numero ordine già esistente') || err.message.includes('Numero RDT già esistente')) {
        setError(`Il numero ${modalType} "${nuovoItem.numero}" è già in uso. Scegli un numero diverso.`);
      } else {
        setError(`Errore nella creazione ${modalType}: ` + err.message);
      }
      
      // Ricarica i dati per assicurarsi che siano aggiornati per il prossimo tentativo
      await loadData();
    }
  };

  const addProductToItem = () => {
    if (!newProduct.productId || newProduct.quantita <= 0) {
      setError('Seleziona un prodotto e inserisci una quantità valida');
      return;
    }

    const selectedProduct = products.find(p => p._id === newProduct.productId);
    if (!selectedProduct) {
      setError('Prodotto non trovato');
      return;
    }

    // Controlla se il prodotto è già presente
    const existingProductIndex = nuovoItem.prodotti.findIndex(p => 
      p.productId === newProduct.productId || p.nome === selectedProduct.nome
    );

    if (existingProductIndex >= 0) {
      // Se esiste già, aggiorna la quantità
      const updatedProducts = [...nuovoItem.prodotti];
      updatedProducts[existingProductIndex].quantita += parseInt(newProduct.quantita);
      setNuovoItem({
        ...nuovoItem,
        prodotti: updatedProducts
      });
    } else {
      // Altrimenti aggiungi nuovo prodotto
      const prodotto = {
        productId: newProduct.productId,
        nome: selectedProduct.nome,
        quantita: parseInt(newProduct.quantita),
        unita: selectedProduct.unita || 'pz',
        prezzo: selectedProduct.prezzo || 0
      };

      setNuovoItem({
        ...nuovoItem,
        prodotti: [...nuovoItem.prodotti, prodotto]
      });
    }

    // Reset form prodotto
    setNewProduct({
      productId: '',
      quantita: 0
    });
    setProductSearch('');
    setError(''); // Pulisce eventuali errori
  };

  const removeProduct = (index) => {
    setNuovoItem({
      ...nuovoItem,
      prodotti: nuovoItem.prodotti.filter((_, i) => i !== index)
    });
  };

  const openDetailsModal = (itemId, itemType) => {
    const item = itemType === 'ordine' 
      ? ordini.find(o => o._id === itemId) 
      : rdt.find(r => r._id === itemId);
    
    setDetailsItem(item);
    setDetailsItemType(itemType);
    setEditingProducts([...item.prodotti]); // Copia per editing
    setShowDetailsModal(true);
  };

  const saveProductChanges = async () => {
    try {
      const endpoint = detailsItemType === 'ordine' ? '/ordini' : '/rdt';
      
      // Calcola nuovo valore
      const nuovoValore = editingProducts.reduce((sum, prod) => {
        const product = products.find(p => p._id === prod.productId);
        return sum + ((prod.quantita || 0) * (product?.prezzo || prod.prezzo || 0));
      }, 0);

      await apiCall(`${endpoint}/${detailsItem._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          prodotti: editingProducts.map(prod => ({
            nome: prod.nome,
            quantita: prod.quantita,
            unita: prod.unita,
            prezzo: prod.prezzo
          })),
          valore: nuovoValore
        })
      }, token);

      // Ricarica dati
      await loadData();
      setShowDetailsModal(false);
      
    } catch (err) {
      setError(`Errore nel salvataggio prodotti: ` + err.message);
    }
  };

  const addProductToDetails = () => {
    if (!newProduct.productId || newProduct.quantita <= 0) {
      setError('Seleziona un prodotto e inserisci una quantità valida');
      return;
    }

    const selectedProductObj = products.find(p => p._id === newProduct.productId);
    if (!selectedProductObj) {
      setError('Prodotto non trovato');
      return;
    }

    // Controlla se il prodotto è già presente
    const existingProductIndex = editingProducts.findIndex(p => 
      p.productId === newProduct.productId || p.nome === selectedProductObj.nome
    );

    if (existingProductIndex >= 0) {
      // Se esiste già, aggiorna la quantità
      const updatedProducts = [...editingProducts];
      updatedProducts[existingProductIndex].quantita += parseInt(newProduct.quantita);
      setEditingProducts(updatedProducts);
    } else {
      // Altrimenti aggiungi nuovo prodotto
      const prodotto = {
        productId: newProduct.productId,
        nome: selectedProductObj.nome,
        quantita: parseInt(newProduct.quantita),
        unita: selectedProductObj.unita || 'pz',
        prezzo: selectedProductObj.prezzo || 0
      };
      setEditingProducts([...editingProducts, prodotto]);
    }

    // Reset form di aggiunta
    setNewProduct({ productId: '', quantita: 0 });
    setProductSearch('');
    setProductSelectionMode('search');
    setError(''); // Pulisce eventuali errori
  };

  const removeProductFromDetails = (index) => {
    setEditingProducts(editingProducts.filter((_, i) => i !== index));
  };

  const updateProductQuantity = (index, newQuantity) => {
    const updated = [...editingProducts];
    updated[index].quantita = parseInt(newQuantity) || 0;
    setEditingProducts(updated);
  };

  const openFinalizeModal = (itemId, itemType) => {
    const item = itemType === 'ordine' 
      ? ordini.find(o => o._id === itemId) 
      : rdt.find(r => r._id === itemId);
    
    setFinalizeItem(item);
    setFinalizeItemType(itemType);
    setFinalizeAssignment('');
    setShowFinalizeModal(true);
  };

  const executeFinalization = async () => {
    try {
      if (!finalizeAssignment) {
        setError('Seleziona un\'assegnazione per finalizzare');
        return;
      }

      // Trova l'assegnazione selezionata
      const assignment = assegnazioni.find(ass => ass._id === finalizeAssignment);
      if (!assignment) {
        setError('Assegnazione non trovata');
        return;
      }

      // Collega l'ordine/RDT all'assegnazione
      if (finalizeItemType === 'ordine') {
        await apiCall(`/assegnazioni/${finalizeAssignment}/ordini`, {
          method: 'POST',
          body: JSON.stringify({
            ordineId: finalizeItem._id,
            priorita: finalizeItem.priorita,
            tempoStimato: finalizeItem.tempoStimato || 60,
            note: 'Finalizzato da OrdiniManagement'
          })
        }, token);
      } else {
        await apiCall(`/assegnazioni/${finalizeAssignment}`, {
          method: 'PUT',
          body: JSON.stringify({
            rdt: finalizeItem._id,
            note: 'Finalizzato da OrdiniManagement'
          })
        }, token);
      }

      // Aggiorna giacenze OPERATORE - AGGIUNGE le quantità
      if (finalizeItem.prodotti && finalizeItem.prodotti.length > 0) {
        for (const prodotto of finalizeItem.prodotti) {
          try {
            // Cerca il prodotto nel sistema per ottenere l'ID
            const prodottoSistema = products.find(p => 
              p.nome.toLowerCase() === prodotto.nome.toLowerCase() ||
              p._id === prodotto.productId
            );

            if (prodottoSistema) {
              // AGGIUNGE alla giacenza dell'operatore specifico
              await apiCall(`/add-product`, {
                method: 'POST',
                body: JSON.stringify({
                  productId: prodottoSistema._id,
                  quantitaAggiunta: prodotto.quantita,
                  assegnazioneId: finalizeAssignment,
                  note: `${finalizeItemType === 'ordine' ? 'Ordine' : 'RDT'} ${finalizeItem.numero} - ${finalizeItem.cliente}`
                })
              }, token);
            }
          } catch (err) {
            console.warn(`Errore aggiornamento giacenza operatore per ${prodotto.nome}:`, err);
          }
        }
      }

      // Aggiorna stato ordine/RDT
      const endpoint = finalizeItemType === 'ordine' ? '/ordini' : '/rdt';
      await apiCall(`${endpoint}/${finalizeItem._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          stato: 'ASSEGNATO'
        })
      }, token);

      // Reset e chiudi modal
      setFinalizeAssignment('');
      setShowFinalizeModal(false);
      
      // Ricarica dati
      await loadData();
      
    } catch (err) {
      setError(`Errore nella finalizzazione ${finalizeItemType}: ` + err.message);
    }
  };

  const executeAssignment = async () => {
    try {
      let assegnazioneDaUsare = selectedAssignment;
      
      // Se modalità custom, crea o trova l'assegnazione
      if (assignmentMode === 'custom') {
        if (!selectedUser || !selectedWeek) {
          setError('Seleziona operatore e settimana');
          return;
        }
        
        // Cerca se esiste già un'assegnazione per questo operatore e settimana
        const existingAssignment = assegnazioni.find(ass => 
          ((typeof ass.userId === 'object' && ass.userId) ? ass.userId._id : ass.userId) === selectedUser &&
          ((typeof ass.settimanaId === 'object' && ass.settimanaId) ? ass.settimanaId._id : ass.settimanaId) === selectedWeek
        );
        
        if (existingAssignment) {
          assegnazioneDaUsare = existingAssignment._id;
        } else {
          // Crea nuova assegnazione
          const newAssignment = await apiCall('/assegnazioni', {
            method: 'POST',
            body: JSON.stringify({
              userId: selectedUser,
              settimanaId: selectedWeek,
              attiva: true,
              note: assignmentNote || 'Creata automaticamente per ordine/RDT'
            })
          }, token);
          assegnazioneDaUsare = newAssignment._id || newAssignment.id;
        }
      } else {
        if (!selectedAssignment || !assignItem) {
          setError('Seleziona un\'assegnazione');
          return;
        }
      }

      if (assignItemType === 'ordine') {
        // Collega ordine all'assegnazione
        await apiCall(`/assegnazioni/${assegnazioneDaUsare}/ordini`, {
          method: 'POST',
          body: JSON.stringify({
            ordineId: assignItem._id,
            priorita: assignItem.priorita,
            tempoStimato: assignItem.tempoStimato || 60,
            note: assignmentNote
          })
        }, token);
      } else {
        // Collega RDT all'assegnazione (aggiorna il campo rdt direttamente)
        await apiCall(`/assegnazioni/${assegnazioneDaUsare}`, {
          method: 'PUT',
          body: JSON.stringify({
            rdt: assignItem._id,
            note: assignmentNote
          })
        }, token);
      }

      // Aggiorna giacenze globali per i prodotti dell'ordine/RDT
      if (assignItem.prodotti && assignItem.prodotti.length > 0) {
        for (const prodotto of assignItem.prodotti) {
          try {
            // Cerca il prodotto nel sistema per ottenere l'ID
            const prodottiDisponibili = await apiCall('/products', {}, token);
            const prodottoSistema = prodottiDisponibili.find(p => 
              p.nome.toLowerCase().includes(prodotto.nome.toLowerCase())
            );

            if (prodottoSistema) {
              // Aggiorna la giacenza globale sottraendo la quantità utilizzata
              await apiCall(`/admin/giacenze/update-global`, {
                method: 'POST',
                body: JSON.stringify({
                  productId: prodottoSistema._id,
                  quantitaUtilizzata: prodotto.quantita,
                  operazione: 'sottrai',
                  nota: `${assignItemType === 'ordine' ? 'Ordine' : 'RDT'} ${assignItem.numero} - ${assignItem.cliente}`
                })
              }, token);
            }
          } catch (err) {
            console.warn(`Errore aggiornamento giacenza per ${prodotto.nome}:`, err);
          }
        }
      }

      // Reset form e chiudi modal
      setSelectedAssignment('');
      setAssignmentNote('');
      setSelectedUser('');
      setSelectedWeek('');
      setAssignmentMode('existing');
      setShowAssignModal(false);
      
      // Ricarica dati
      await loadData();
      
    } catch (err) {
      setError(`Errore nell'assegnazione ${assignItemType}: ` + err.message);
    }
  };

  const getAssignazioniForItem = (itemType, itemId) => {
    return assegnazioni.filter(ass => {
      if (!ass || !itemId) return false;
      
      if (itemType === 'ordine') {
        // Lo schema usa un campo 'ordine' singolo, non array 'ordini'
        return ass.ordine === itemId;
      } else {
        // Per RDT, controlla sia string ID che object ID
        if (!ass.rdt) return false;
        const rdtId = typeof ass.rdt === 'object' && ass.rdt ? ass.rdt._id : ass.rdt;
        return rdtId === itemId;
      }
    });
  };

  const priorityColors = {
    'BASSA': 'bg-gray-100 text-gray-800',
    'MEDIA': 'bg-blue-100 text-blue-800', 
    'ALTA': 'bg-orange-100 text-orange-800',
    'URGENTE': 'bg-red-100 text-red-800'
  };

  const statusColors = {
    'CREATO': 'bg-yellow-100 text-yellow-800',
    'ASSEGNATO': 'bg-blue-100 text-blue-800',
    'IN_CORSO': 'bg-purple-100 text-purple-800',
    'COMPLETATO': 'bg-green-100 text-green-800',
    'ANNULLATO': 'bg-red-100 text-red-800'
  };

  const renderItemCard = (item, type) => {
    if (!item || !item._id) return null;
    const assignments = getAssignazioniForItem(type, item._id);
    
    return (
      <div 
        key={item._id} 
        className="bg-white rounded-lg shadow border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => openDetailsModal(item._id, type)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {item.numero}
            </h3>
            <p className="text-sm text-gray-600">{item.cliente}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[item.priorita]}`}>
              {item.priorita}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.stato]}`}>
              {item.stato}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(item.dataConsegna).toLocaleDateString('it-IT')}
          </div>
          
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            €{item.valore?.toFixed(2) || '0.00'}
          </div>
          
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-2" />
            {item.prodotti?.length || 0} prodotti
          </div>
          
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {item.tempoStimato || 0} min
          </div>
        </div>

        {/* Sezione Assegnazioni */}
        {assignments.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Assegnazioni Collegate:
            </h4>
            {assignments.map(ass => {
              // Gestisci sia oggetti popolati che ID stringhe con controlli null
              const operatore = (typeof ass.userId === 'object' && ass.userId) 
                ? ass.userId 
                : users.find(u => u._id === ass.userId);
              const settimana = (typeof ass.settimanaId === 'object' && ass.settimanaId) 
                ? ass.settimanaId 
                : settimane.find(s => s._id === ass.settimanaId);
              
              return (
                <div key={ass._id} className="flex items-center text-xs text-gray-600 mb-1">
                  <User className="w-3 h-3 mr-1" />
                  <span className="font-medium">{operatore?.username || 'N/A'}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Settimana {settimana?.numero || settimana?.numeroSettimana || 'N/A'}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-3 border-t">
          {item.stato === 'CREATO' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openFinalizeModal(item._id, type);
              }}
              className="flex items-center px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Finalizza
            </button>
          )}
          
          {item.stato === 'ASSEGNATO' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetailsModal(item._id, type);
              }}
              className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              <Edit className="w-4 h-4 mr-1" />
              Modifica
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestione Ordini e RDT
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Crea e gestisci ordini e richieste di trasferimento
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setModalType('ordine');
                  setShowNewModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuovo Ordine
              </button>
              
              <button
                onClick={() => {
                  setModalType('rdt');
                  setShowNewModal(true);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuovo RDT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('lista')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lista'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lista Completa
            </button>
            
            <button
              onClick={() => setActiveTab('riepilogo')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'riepilogo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Riepilogo Assegnazioni
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'lista' && (
          <div>
            {/* Ordini */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-2" />
                Ordini ({ordini.length})
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ordini.filter(ordine => ordine && ordine._id).map(ordine => renderItemCard(ordine, 'ordine'))}
                </div>
              )}
            </div>

            {/* RDT */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-6 h-6 mr-2" />
                RDT ({rdt.length})
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rdt.filter(rdtItem => rdtItem && rdtItem._id).map(rdtItem => renderItemCard(rdtItem, 'rdt'))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'riepilogo' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Riepilogo Assegnazioni
            </h2>
            
            {/* Lista assegnazioni con ordini/RDT collegati */}
            <div className="space-y-4">
              {assegnazioni.filter(ass => ass && ass._id).map(ass => {
                // Gestisci sia oggetti popolati che ID stringhe con controlli null
                const operatore = (typeof ass.userId === 'object' && ass.userId) 
                  ? ass.userId 
                  : users.find(u => u._id === ass.userId);
                const settimana = (typeof ass.settimanaId === 'object' && ass.settimanaId) 
                  ? ass.settimanaId 
                  : settimane.find(s => s._id === ass.settimanaId);
                // Gestisce sia oggetti popolati che ID stringhe per ordini
                const ordiniCollegati = [];
                if (ass.ordine) {
                  const ordineId = typeof ass.ordine === 'object' ? ass.ordine._id : ass.ordine;
                  const ordineObj = ordini.find(o => o._id === ordineId);
                  if (ordineObj) {
                    ordiniCollegati.push(ordineObj);
                  }
                }
                
                // Gestisce sia oggetti popolati che ID stringhe per RDT
                const rdtCollegati = [];
                if (ass.rdt) {
                  const rdtId = typeof ass.rdt === 'object' ? ass.rdt._id : ass.rdt;
                  const rdtObj = rdt.find(r => r._id === rdtId);
                  if (rdtObj) {
                    rdtCollegati.push(rdtObj);
                  }
                }
                
                return (
                  <div key={ass._id} className="bg-white rounded-lg shadow border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {operatore?.username || 'Operatore N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Settimana {settimana?.numero || settimana?.numeroSettimana || 'N/A'} - {settimana?.descrizione || ''}
                        </p>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {ordiniCollegati.length} ordini, {rdtCollegati.length} RDT
                      </div>
                    </div>

                    {/* Ordini collegati */}
                    {(ass.ordine && (typeof ass.ordine === 'object' || ordiniCollegati.length > 0)) && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Ordini:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {typeof ass.ordine === 'object' ? (
                            <div className="text-xs bg-blue-50 rounded p-2">
                              <div className="font-medium">{ass.ordine.numero}</div>
                              <div className="text-gray-600">{ass.ordine.cliente}</div>
                            </div>
                          ) : ordiniCollegati.map(ordine => (
                            <div key={ordine._id} className="text-xs bg-blue-50 rounded p-2">
                              <div className="font-medium">{ordine.numero}</div>
                              <div className="text-gray-600">{ordine.cliente}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RDT collegati */}
                    {(ass.rdt && (typeof ass.rdt === 'object' || rdtCollegati.length > 0)) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">RDT:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {typeof ass.rdt === 'object' ? (
                            <div className="text-xs bg-green-50 rounded p-2">
                              <div className="font-medium">{ass.rdt.numero}</div>
                              <div className="text-gray-600">{ass.rdt.cliente}</div>
                            </div>
                          ) : rdtCollegati.map(rdtItem => (
                            <div key={rdtItem._id} className="text-xs bg-green-50 rounded p-2">
                              <div className="font-medium">{rdtItem.numero}</div>
                              <div className="text-gray-600">{rdtItem.cliente}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuovo Ordine/RDT */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Nuovo {modalType === 'ordine' ? 'Ordine' : 'RDT'}
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numero {modalType === 'ordine' ? 'Ordine' : 'RDT'} *
                  </label>
                  <input
                    type="text"
                    value={nuovoItem.numero}
                    onChange={(e) => setNuovoItem({...nuovoItem, numero: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Inserisci numero ${modalType}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <input
                    type="text"
                    value={nuovoItem.cliente}
                    onChange={(e) => setNuovoItem({...nuovoItem, cliente: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome cliente"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Consegna *
                  </label>
                  <input
                    type="date"
                    value={nuovoItem.dataConsegna}
                    onChange={(e) => setNuovoItem({...nuovoItem, dataConsegna: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorità
                  </label>
                  <select
                    value={nuovoItem.priorita}
                    onChange={(e) => setNuovoItem({...nuovoItem, priorita: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BASSA">Bassa</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Indirizzo */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Indirizzo Consegna (opzionale)</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Via <span className="text-gray-400 text-xs">(opzionale)</span>
                    </label>
                    <input
                      type="text"
                      value={nuovoItem.indirizzo.via}
                      onChange={(e) => setNuovoItem({
                        ...nuovoItem, 
                        indirizzo: {...nuovoItem.indirizzo, via: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Via, numero civico"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Città <span className="text-gray-400 text-xs">(opzionale)</span>
                    </label>
                    <input
                      type="text"
                      value={nuovoItem.indirizzo.citta}
                      onChange={(e) => setNuovoItem({
                        ...nuovoItem, 
                        indirizzo: {...nuovoItem.indirizzo, citta: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Città"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CAP <span className="text-gray-400 text-xs">(opzionale)</span>
                    </label>
                    <input
                      type="text"
                      value={nuovoItem.indirizzo.cap}
                      onChange={(e) => setNuovoItem({
                        ...nuovoItem, 
                        indirizzo: {...nuovoItem.indirizzo, cap: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CAP"
                    />
                  </div>
                </div>
              </div>

              {/* Assegnazione */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assegnazione *
                </label>
                <select
                  value={nuovoItem.assegnazioneId}
                  onChange={(e) => setNuovoItem({...nuovoItem, assegnazioneId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleziona un'assegnazione --</option>
                  {assegnazioni.length === 0 ? (
                    <option disabled>Nessuna assegnazione disponibile</option>
                  ) : (
                    assegnazioni
                      .filter(ass => ass.attiva !== false) // Includi anche quelle senza campo attiva
                      .map(ass => {
                        // Gestisci sia oggetti popolati che ID stringhe con controlli null
                        const userObj = (typeof ass.userId === 'object' && ass.userId) 
                          ? ass.userId 
                          : users.find(u => u._id === ass.userId);
                        const settimanaObj = (typeof ass.settimanaId === 'object' && ass.settimanaId) 
                          ? ass.settimanaId 
                          : settimane.find(s => s._id === ass.settimanaId);
                        
                        
                        return (
                          <option key={ass._id} value={ass._id}>
                            {userObj?.username || 'Operatore N/A'} - Settimana {settimanaObj?.numero || settimanaObj?.numeroSettimana || settimanaObj?.descrizione || 'N/A'}
                          </option>
                        );
                      })
                  )}
                </select>
                {/* Debug info */}
                <div className="text-xs text-gray-500 mt-1">
                  Trovate {assegnazioni.length} assegnazioni totali, 
                  {assegnazioni.filter(ass => ass.attiva !== false).length} attive
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note <span className="text-gray-400 text-xs">(opzionale)</span>
                </label>
                <textarea
                  value={nuovoItem.note}
                  onChange={(e) => setNuovoItem({...nuovoItem, note: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Note aggiuntive..."
                />
              </div>

              {/* Lista prodotti */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prodotti ({nuovoItem.prodotti.length})
                </label>

                {/* Sezione aggiunta prodotto inline per nuovo ordine/RDT */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {/* Selezione prodotto */}
                    <div className="md:col-span-2">
                      <select
                        value={newProduct.productId}
                        onChange={(e) => setNewProduct({...newProduct, productId: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Seleziona prodotto --</option>
                        {products
                          .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
                          .map(product => (
                            <option key={product._id} value={product._id}>
                              {product.nome} - €{product.prezzo?.toFixed(2) || '0.00'}/{product.unita || 'pz'}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Quantità */}
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={newProduct.quantita}
                        onChange={(e) => setNewProduct({...newProduct, quantita: e.target.value})}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Qtà"
                      />
                    </div>

                    {/* Pulsante aggiungi */}
                    <div>
                      <button
                        onClick={addProductToItem}
                        disabled={!newProduct.productId || !newProduct.quantita || newProduct.quantita <= 0}
                        className="w-full flex items-center justify-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Aggiungi
                      </button>
                    </div>
                  </div>
                </div>
                
                {nuovoItem.prodotti.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {nuovoItem.prodotti.map((prod, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="text-sm">
                          <span className="font-medium">{prod.nome}</span>
                          <span className="text-gray-600 ml-2">
                            {prod.quantita} {prod.unita} x €{prod.prezzo?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <button
                          onClick={() => removeProduct(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={createItem}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Crea {modalType === 'ordine' ? 'Ordine' : 'RDT'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal Assegnazione */}
      {showAssignModal && assignItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Assegna {assignItemType === 'ordine' ? 'Ordine' : 'RDT'}
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Dettagli item */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {assignItem.numero}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Cliente: {assignItem.cliente}</div>
                  <div>
                    Consegna: {new Date(assignItem.dataConsegna).toLocaleDateString('it-IT')}
                  </div>
                  <div>Priorità: {assignItem.priorita}</div>
                  {assignItem.prodotti && assignItem.prodotti.length > 0 && (
                    <div>Prodotti: {assignItem.prodotti.length} articoli</div>
                  )}
                </div>
              </div>

              {/* Modalità di assegnazione */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalità Assegnazione
                </label>
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="existing"
                      checked={assignmentMode === 'existing'}
                      onChange={(e) => setAssignmentMode(e.target.value)}
                      className="mr-2"
                    />
                    Assegnazione Esistente
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="custom"
                      checked={assignmentMode === 'custom'}
                      onChange={(e) => setAssignmentMode(e.target.value)}
                      className="mr-2"
                    />
                    Crea/Modifica Assegnazione
                  </label>
                </div>
              </div>

              {/* Selezione assegnazione esistente */}
              {assignmentMode === 'existing' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleziona Assegnazione Esistente *
                  </label>
                  <select
                    value={selectedAssignment}
                    onChange={(e) => setSelectedAssignment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seleziona un'assegnazione --</option>
                    {assegnazioni.filter(ass => ass.attiva !== false).map(ass => {
                      // Gestisci sia oggetti popolati che ID stringhe con controlli null
                      const operatore = (typeof ass.userId === 'object' && ass.userId) 
                        ? ass.userId 
                        : users.find(u => u._id === ass.userId);
                      const settimana = (typeof ass.settimanaId === 'object' && ass.settimanaId) 
                        ? ass.settimanaId 
                        : settimane.find(s => s._id === ass.settimanaId);
                      
                      return (
                        <option key={ass._id} value={ass._id}>
                          {operatore?.username || 'Operatore N/A'} - Settimana {settimana?.numero || settimana?.numeroSettimana || 'N/A'}
                        </option>
                      );
                    })}
                  </select>
                  
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mt-1">
                    {assegnazioni.length} assegnazioni totali, {users.length} operatori, {settimane.length} settimane
                  </div>
                </div>
              )}

              {/* Selezione operatore e settimana personalizzata */}
              {assignmentMode === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleziona Operatore *
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Seleziona un operatore --</option>
                      {users.filter(user => user.role !== 'admin').map(user => (
                        <option key={user._id} value={user._id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleziona Settimana *
                    </label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Seleziona una settimana --</option>
                      {settimane
                        .sort((a, b) => {
                          // Ordina per anno e poi per numero settimana
                          if (a.anno !== b.anno) return b.anno - a.anno;
                          return (b.numero || b.numeroSettimana || 0) - (a.numero || a.numeroSettimana || 0);
                        })
                        .map(settimana => (
                          <option key={settimana._id} value={settimana._id}>
                            Settimana {settimana.numero || settimana.numeroSettimana} - {settimana.anno} 
                            {settimana.descrizione && ` (${settimana.descrizione})`}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )}

              {/* Note assegnazione */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Assegnazione
                </label>
                <textarea
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Note aggiuntive per l'assegnazione..."
                />
              </div>

              {/* Avviso giacenze */}
              {assignItem.prodotti && assignItem.prodotti.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <div className="font-medium mb-1">Aggiornamento Giacenze</div>
                      <div>
                        L'assegnazione aggiornerà automaticamente le giacenze globali 
                        sottraendo le quantità dei prodotti inclusi in questo {assignItemType}.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAssignment('');
                  setAssignmentNote('');
                  setSelectedUser('');
                  setSelectedWeek('');
                  setAssignmentMode('existing');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={executeAssignment}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Users className="w-4 h-4 mr-2" />
                {assignmentMode === 'existing' 
                  ? `Assegna ${assignItemType === 'ordine' ? 'Ordine' : 'RDT'}` 
                  : `Crea Assegnazione e Collega ${assignItemType === 'ordine' ? 'Ordine' : 'RDT'}`
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dettagli Ordine/RDT */}
      {showDetailsModal && detailsItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Dettagli {detailsItemType === 'ordine' ? 'Ordine' : 'RDT'}: {detailsItem.numero}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Informazioni generali */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informazioni Generali</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Cliente:</span> {detailsItem.cliente}</div>
                    <div><span className="font-medium">Data Consegna:</span> {new Date(detailsItem.dataConsegna).toLocaleDateString('it-IT')}</div>
                    <div><span className="font-medium">Priorità:</span> {detailsItem.priorita}</div>
                    <div><span className="font-medium">Stato:</span> {detailsItem.stato}</div>
                    <div><span className="font-medium">Valore Totale:</span> €{detailsItem.valore?.toFixed(2) || '0.00'}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Indirizzo</h3>
                  <div className="space-y-2 text-sm">
                    <div>{detailsItem.indirizzo?.via || 'Non specificato'}</div>
                    <div>{detailsItem.indirizzo?.citta || ''} {detailsItem.indirizzo?.cap || ''}</div>
                    <div>{detailsItem.indirizzo?.provincia || ''}</div>
                  </div>
                  {detailsItem.note && (
                    <div className="mt-4">
                      <span className="font-medium">Note:</span>
                      <p className="text-sm text-gray-600 mt-1">{detailsItem.note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gestione Prodotti */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Prodotti ({editingProducts.length})
                  </h3>
                </div>

                {/* Sezione aggiunta prodotto inline */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">Aggiungi Nuovo Prodotto</h4>
                  
                  {/* Modalità di selezione */}
                  <div className="mb-3">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="search"
                          checked={productSelectionMode === 'search'}
                          onChange={(e) => {
                            setProductSelectionMode(e.target.value);
                            setNewProduct({ productId: '', quantita: 0 });
                            setProductSearch('');
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-blue-800">Ricerca Libera</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="dropdown"
                          checked={productSelectionMode === 'dropdown'}
                          onChange={(e) => {
                            setProductSelectionMode(e.target.value);
                            setNewProduct({ productId: '', quantita: 0 });
                            setProductSearch('');
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-blue-800">Menu Dropdown</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Selezione prodotto */}
                    <div className="md:col-span-2">
                      {productSelectionMode === 'search' ? (
                        <div>
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Cerca prodotto (nome, codice, categoria, etc.)..."
                          />
                          
                          {/* Lista prodotti filtrati */}
                          {productSearch && (
                            <div className="absolute z-10 w-full max-w-md max-h-48 overflow-y-auto border rounded-md mt-1 bg-white shadow-lg">
                              {products
                                .filter(product => {
                                  const searchTerm = productSearch.toLowerCase();
                                  return (
                                    product.nome?.toLowerCase().includes(searchTerm) ||
                                    product.codice?.toLowerCase().includes(searchTerm) ||
                                    product.categoria?.toLowerCase().includes(searchTerm) ||
                                    product.descrizione?.toLowerCase().includes(searchTerm) ||
                                    product.marca?.toLowerCase().includes(searchTerm) ||
                                    product.fornitore?.toLowerCase().includes(searchTerm)
                                  );
                                })
                                .slice(0, 10)
                                .map(product => (
                                  <button
                                    key={product._id}
                                    onClick={() => {
                                      setNewProduct({...newProduct, productId: product._id});
                                      setProductSearch(product.nome);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                                  >
                                    <div className="font-medium text-sm">{product.nome}</div>
                                    <div className="text-xs text-gray-600">
                                      {product.codice && `${product.codice} • `}
                                      €{product.prezzo?.toFixed(2) || '0.00'}/{product.unita || 'pz'}
                                    </div>
                                  </button>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      ) : (
                        <select
                          value={newProduct.productId}
                          onChange={(e) => setNewProduct({...newProduct, productId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">-- Seleziona prodotto --</option>
                          {products
                            .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
                            .map(product => (
                              <option key={product._id} value={product._id}>
                                {product.nome} 
                                {product.codice && ` (${product.codice})`} 
                                - €{product.prezzo?.toFixed(2) || '0.00'}/{product.unita || 'pz'}
                              </option>
                            ))
                          }
                        </select>
                      )}
                    </div>

                    {/* Quantità */}
                    <div>
                      <input
                        type="number"
                        min="1"
                        value={newProduct.quantita}
                        onChange={(e) => setNewProduct({...newProduct, quantita: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Qtà"
                      />
                    </div>
                  </div>

                  {/* Prodotto selezionato e pulsante aggiungi */}
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex-1">
                      {newProduct.productId && (
                        <div className="text-sm text-blue-700">
                          {(() => {
                            const selectedProduct = products.find(p => p._id === newProduct.productId);
                            return selectedProduct ? (
                              <span>
                                <span className="font-medium">{selectedProduct.nome}</span> - 
                                €{selectedProduct.prezzo?.toFixed(2) || '0.00'}/{selectedProduct.unita || 'pz'}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={addProductToDetails}
                      disabled={!newProduct.productId || !newProduct.quantita || newProduct.quantita <= 0}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Aggiungi
                    </button>
                  </div>
                </div>

                {/* Lista prodotti con editing */}
                <div className="space-y-3">
                  {editingProducts.map((prod, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{prod.nome}</div>
                        <div className="text-sm text-gray-600">
                          €{prod.prezzo?.toFixed(2) || '0.00'} per {prod.unita}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <label className="text-sm font-medium text-gray-700 mr-2">Qtà:</label>
                          <input
                            type="number"
                            min="0"
                            value={prod.quantita}
                            onChange={(e) => updateProductQuantity(index, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                        </div>
                        
                        <div className="text-sm font-medium">
                          €{((prod.quantita || 0) * (prod.prezzo || 0)).toFixed(2)}
                        </div>
                        
                        <button
                          onClick={() => removeProductFromDetails(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {editingProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nessun prodotto aggiunto
                    </div>
                  )}
                </div>

                {/* Totale */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-end">
                    <div className="text-lg font-semibold">
                      Totale: €{editingProducts.reduce((sum, prod) => 
                        sum + ((prod.quantita || 0) * (prod.prezzo || 0)), 0
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={saveProductChanges}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Finalizza */}
      {showFinalizeModal && finalizeItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Finalizza {finalizeItemType === 'ordine' ? 'Ordine' : 'RDT'}
              </h2>
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Dettagli item */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {finalizeItem.numero}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Cliente: {finalizeItem.cliente}</div>
                  <div>
                    Consegna: {new Date(finalizeItem.dataConsegna).toLocaleDateString('it-IT')}
                  </div>
                  <div>Priorità: {finalizeItem.priorita}</div>
                  <div>Valore: €{finalizeItem.valore?.toFixed(2) || '0.00'}</div>
                  {finalizeItem.prodotti && finalizeItem.prodotti.length > 0 && (
                    <div>Prodotti: {finalizeItem.prodotti.length} articoli</div>
                  )}
                </div>
              </div>

              {/* Selezione assegnazione */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona Assegnazione *
                </label>
                <select
                  value={finalizeAssignment}
                  onChange={(e) => setFinalizeAssignment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleziona un'assegnazione --</option>
                  {assegnazioni
                    .filter(ass => {
                      // Solo assegnazioni attive
                      if (ass.attiva === false) return false;
                      
                      // Per RDT: solo assegnazioni senza ordini collegati
                      if (finalizeItemType === 'rdt') {
                        return !ass.ordine;
                      }
                      
                      // Per ordini: tutte le assegnazioni attive
                      return true;
                    })
                    .map(ass => {
                      const operatore = (typeof ass.userId === 'object' && ass.userId) 
                        ? ass.userId 
                        : users.find(u => u._id === ass.userId);
                      const settimana = (typeof ass.settimanaId === 'object' && ass.settimanaId) 
                        ? ass.settimanaId 
                        : settimane.find(s => s._id === ass.settimanaId);
                      
                      return (
                        <option key={ass._id} value={ass._id}>
                          {operatore?.username || 'Operatore N/A'} - Settimana {settimana?.numero || settimana?.numeroSettimana || 'N/A'}
                        </option>
                      );
                    })
                  }
                </select>
              </div>

              {/* Avviso giacenze */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <div className="font-medium mb-1">Aggiornamento Giacenze Operatore</div>
                    <div>
                      La finalizzazione aggiungerà automaticamente le quantità dei prodotti 
                      alle giacenze dell'operatore selezionato e cambierà lo stato in "ASSEGNATO".
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={executeFinalization}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Conferma Finalizzazione
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdiniManagement;