import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  RotateCcw, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Truck,
  User,
  Plus,
  Save,
  X,
  Package,
  FileText,
  Hash,
  Clipboard,
  Edit2,
  ShoppingCart,
  DollarSign,
  Building
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGiacenze } from '../../hooks/useGiacenze';
import { apiCall } from '../../services/api';
import OrdiniRdtTable from './shared/OrdiniRdtTable';

const CreaOrdini = () => {
  const { token, setError, setCurrentPage } = useAuth();
  const { users, settimane, assegnazioni, allProducts } = useGiacenze();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Stati per il form
  const [formData, setFormData] = useState({
    tipo: 'ordine', // 'ordine' o 'rdt'
    nome: '',
    cliente: '',
    dataConsegna: '',
    operatoreId: '',
    assegnazioneId: '',
    prodotti: [],
    note: ''
  });

  // Stati per gestione
  const [loading, setLoading] = useState(false);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);

  // Stati per clienti
  const [clienti, setClienti] = useState([]);
  const [clientiFiltered, setClientiFiltered] = useState([]);
  const [showClientiDropdown, setShowClientiDropdown] = useState(false);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [tableProducts, setTableProducts] = useState([{ 
    id: Date.now(),
    productId: '',
    nome: '',
    searchTerm: '',
    quantitaDisponibile: 0,
    quantitaAssegnata: 0,
    quantitaDaAggiungere: '',
    isSaved: false,
    showDropdown: false
  }]);
  const [newProduct, setNewProduct] = useState({
    productId: '',
    quantita: '',
    quantitaAssegnata: '',
    sogliaMinima: '',
    note: ''
  });
  const [productSearch, setProductSearch] = useState('');
  const [userGiacenze, setUserGiacenze] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Stati per visualizzazione ordini/RDT esistenti
  const [existingItems, setExistingItems] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    tipo: '',
    operatore: '',
    stato: '',
    cliente: ''
  });

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Carica clienti dal database
  useEffect(() => {
    const loadClienti = async () => {
      try {
        const data = await apiCall('/clienti', {}, token);
        setClienti(data || []);
      } catch (err) {
        console.error('Errore caricamento clienti:', err);
      }
    };

    if (token) {
      loadClienti();
    }
  }, [token]);

  // Chiudi dropdown clienti quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClientiDropdown && !event.target.closest('.relative')) {
        setShowClientiDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showClientiDropdown]);

  // Carica dati iniziali
  useEffect(() => {
    if (token) {
      loadExistingItems();
      // Imposta data di default a oggi
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dataConsegna: today }));
    }
  }, [token]);

  // Funzione per determinare se un'assegnazione è libera per il tipo di documento corrente
  const getAssignmentStatus = (assignment) => {
    const isOccupiedByOrder = assignment.ordine && assignment.ordine.trim() !== '';
    const isOccupiedByRdt = assignment.rdt && assignment.rdt.trim() !== '';
    
    if (formData.tipo === 'ordine') {
      // Se stiamo creando un ordine, l'assegnazione è libera se non ha già un ordine
      // Ma mostriamo anche quelle occupate da ordini esistenti (disabled)
      return {
        isAvailable: !isOccupiedByOrder,
        occupiedBy: isOccupiedByOrder ? `Ordine: ${assignment.ordine}` : (isOccupiedByRdt ? `RDT: ${assignment.rdt}` : null),
        occupationType: isOccupiedByOrder ? 'ordine' : (isOccupiedByRdt ? 'rdt' : null)
      };
    } else {
      // Se stiamo creando un RDT, l'assegnazione è libera se non ha già un RDT  
      // Ma mostriamo anche quelle occupate da RDT esistenti (disabled)
      return {
        isAvailable: !isOccupiedByRdt,
        occupiedBy: isOccupiedByRdt ? `RDT: ${assignment.rdt}` : (isOccupiedByOrder ? `Ordine: ${assignment.ordine}` : null),
        occupationType: isOccupiedByRdt ? 'rdt' : (isOccupiedByOrder ? 'ordine' : null)
      };
    }
  };

  // Filtra assegnazioni e carica giacenze quando cambia operatore
  useEffect(() => {
    if (formData.operatoreId && assegnazioni) {
      const userAssignments = assegnazioni.filter(a => 
        a.userId?._id === formData.operatoreId && a.attiva
      );
      setAvailableAssignments(userAssignments);
      
      // Reset assegnazione selezionata se non più valida o se è diventata occupata
      if (formData.assegnazioneId) {
        const selectedAssignment = userAssignments.find(a => a._id === formData.assegnazioneId);
        if (!selectedAssignment || !getAssignmentStatus(selectedAssignment).isAvailable) {
          setFormData(prev => ({ ...prev, assegnazioneId: '' }));
        }
      }
      
      // Carica giacenze utente
      loadUserGiacenze(formData.operatoreId);
    } else {
      setAvailableAssignments([]);
      setUserGiacenze([]);
      setFormData(prev => ({ ...prev, assegnazioneId: '' }));
    }
  }, [formData.operatoreId, assegnazioni, formData.tipo]);

  // Mostra automaticamente il form prodotti quando operatore è selezionato (assegnazione facoltativa)
  useEffect(() => {
    if (formData.operatoreId) {
      setShowProductForm(true);
    } else {
      setShowProductForm(false);
    }
  }, [formData.operatoreId]);
  
  const loadUserGiacenze = async (userId) => {
    try {
      console.log('📞 CreaOrdini: Caricamento giacenze per operatore:', userId);
      const response = await apiCall(`/admin/giacenze?userId=${userId}`, {}, token);
      setUserGiacenze(response || []);
      console.log(`🔄 CreaOrdini: Caricate ${response?.length || 0} giacenze per operatore ${userId}`);
    } catch (err) {
      console.error('Errore caricamento giacenze utente:', err);
      setUserGiacenze([]);
    }
  };

  const loadExistingItems = async () => {
    try {
      setLoading(true);
      
      const [ordiniData, rdtData] = await Promise.all([
        apiCall('/ordini', {}, token),
        apiCall('/rdt', {}, token)
      ]);
      
      const ordiniArray = ordiniData?.ordini || [];
      const rdtArray = rdtData?.rdt || [];
      
      const ordiniWithType = ordiniArray.map(item => ({ ...item, itemType: 'ordine' }));
      const rdtWithType = rdtArray.map(item => ({ ...item, itemType: 'rdt' }));
      
      setExistingItems([...ordiniWithType, ...rdtWithType]);
    } catch (err) {
      setError('Errore nel caricamento dati: ' + err.message);
      setExistingItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addProduct = async () => {
    if (!newProduct.productId || !newProduct.quantita) {
      setError('Prodotto e quantità sono obbligatori');
      return;
    }
    
    const selectedProduct = allProducts?.find(p => p._id === newProduct.productId);
    const userGiacenza = userGiacenze.find(g => g.productId._id === newProduct.productId);
    
    if (!selectedProduct) {
      setError('Prodotto non trovato');
      return;
    }
    
    const quantitaNum = parseInt(newProduct.quantita) || 0;
    
    // Validazione quantità minima
    if (quantitaNum <= 0) {
      setError('La quantità deve essere maggiore di zero');
      return;
    }

    // RIMOSSO: La gestione delle giacenze ora avviene solo alla finalizzazione dell'ordine
    // Non aggiornare le giacenze qui, solo quando l'ordine viene finalizzato

    // Oggetto per la visualizzazione locale (con dati aggiuntivi per UI)
    const product = {
      id: Date.now(),
      productId: newProduct.productId,
      nome: selectedProduct.nome,
      quantita: quantitaNum,
      unita: selectedProduct.unita,
      note: newProduct.note.trim()
    };

    setFormData(prev => ({
      ...prev,
      prodotti: [...prev.prodotti, product]
    }));

    setNewProduct({
      productId: '',
      quantita: '',
      quantitaAssegnata: '',
      sogliaMinima: '',
      note: ''
    });
    setProductSearch('');
    setShowProductForm(false);
    setError('✅ Prodotto aggiunto con successo');
  };

  const removeProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      prodotti: prev.prodotti.filter(p => (p.id !== productId && p.productId !== productId))
    }));
  };

  // Gestione ricerca clienti
  const handleClienteSearch = (value) => {
    setClienteSearchTerm(value);
    updateFormData({ cliente: value });

    if (value.length > 0) {
      const filtered = clienti.filter(c =>
        c.nome.toLowerCase().includes(value.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(value.toLowerCase())) ||
        (c.partitaIva && c.partitaIva.toLowerCase().includes(value.toLowerCase()))
      );
      setClientiFiltered(filtered);
      setShowClientiDropdown(true);
    } else {
      setClientiFiltered([]);
      setShowClientiDropdown(false);
    }
  };

  const selectCliente = (cliente) => {
    setClienteSearchTerm(cliente.nome);
    updateFormData({ cliente: cliente.nome });
    setShowClientiDropdown(false);
  };

  // Modifica prodotto
  const editProduct = (product) => {
    if (product) {
      // Trova le giacenze operatore per questo prodotto (se esistono)
      const userGiacenza = userGiacenze.find(g => g.productId._id === product.productId);
      
      setNewProduct({
        productId: product.productId,
        quantita: product.quantita.toString(),
        quantitaAssegnata: userGiacenza?.quantitaAssegnata?.toString() || '',
        sogliaMinima: userGiacenza?.sogliaMinima?.toString() || '',
        note: product.note || ''
      });
      setProductSearch(product.nome);
      setShowProductForm(true);
      
      // Rimuovi il prodotto temporaneamente dalla lista per permettere la modifica
      removeProduct(product.id);
    }
  };

  // Funzioni per gestire la tabella prodotti
  const updateTableProduct = (rowId, field, value) => {
    setTableProducts(prev => prev.map(row => {
      if (row.id === rowId) {
        const updated = { ...row, [field]: value };
        
        // Se è stato selezionato un nuovo prodotto, popola i campi
        if (field === 'productId' && value) {
          const product = allProducts?.find(p => p._id === value);
          const userGiacenza = userGiacenze.find(g => g.productId?._id === value);

          console.log('🔍 CreaOrdini: Ricerca giacenza per prodotto', value);
          console.log('📦 Giacenze disponibili:', userGiacenze.length);
          console.log('🎯 Giacenza trovata:', userGiacenza);

          if (product) {
            updated.nome = product.nome;
            // Se non esiste giacenza operatore, usa valori di default
            updated.quantitaAssegnata = userGiacenza?.quantitaAssegnata || 0;
            updated.quantitaDisponibile = userGiacenza?.quantitaDisponibile || 0;
            updated.showDropdown = false;
            console.log('✅ Prodotto selezionato:', product.nome, 'Giacenza:', {
              assegnata: updated.quantitaAssegnata,
              disponibile: updated.quantitaDisponibile
            });
            // searchTerm verrà chiuso dal click handler
          }
        }
        
        return updated;
      }
      return row;
    }));
  };

  const addTableRow = () => {
    setTableProducts(prev => [...prev, {
      id: Date.now(),
      productId: '',
      nome: '',
      searchTerm: '',
      quantitaDisponibile: 0,
      quantitaAssegnata: 0,
      quantitaDaAggiungere: '',
      isSaved: false,
      showDropdown: false
    }]);
  };

  const removeTableRow = (rowId) => {
    setTableProducts(prev => prev.filter(row => row.id !== rowId));
  };

  // Salva singolo prodotto dalla tabella
  const saveTableProduct = (rowId) => {
    const row = tableProducts.find(r => r.id === rowId);
    if (!row || !row.productId || !row.quantitaDaAggiungere) {
      setError('Seleziona un prodotto e inserisci la quantità da aggiungere');
      return;
    }

    // Marca la riga come salvata e disabilita
    setTableProducts(prev => prev.map(r => 
      r.id === rowId ? { ...r, isSaved: true } : r
    ));

    setError('✅ Riga salvata! Usa "Salva Prodotti" per associare all\'ordine');
    setTimeout(() => setError(''), 3000);
  };

  // Salva tutti i prodotti dalla tabella all'ordine
  const saveAllTableProducts = () => {
    const savedProducts = tableProducts.filter(row => row.isSaved && row.productId && row.quantitaDaAggiungere);
    
    console.log('💾 SaveAllTableProducts chiamato');
    console.log('📝 Prodotti salvati nella tabella:', savedProducts);
    
    if (savedProducts.length === 0) {
      setError('Nessun prodotto salvato da associare all\'ordine');
      return;
    }

    const newProducts = savedProducts.map(row => ({
      productId: row.productId,
      quantita: parseInt(row.quantitaDaAggiungere) || 0,
      nome: row.nome,
      note: ''
    }));

    setFormData(prev => {
      const updated = {
        ...prev,
        prodotti: [...prev.prodotti, ...newProducts]
      };
      console.log('📦 FormData aggiornato con nuovi prodotti:', updated);
      console.log('🔢 Totale prodotti nell\'ordine:', updated.prodotti.length);
      return updated;
    });

    // Rimuovi solo i prodotti salvati dalla tabella
    setTableProducts(prev => prev.filter(row => !row.isSaved));
    
    setError(`✅ ${savedProducts.length} prodott${savedProducts.length > 1 ? 'i associati' : 'o associato'} all'ordine!`);
    setTimeout(() => setError(''), 3000);
  };

  const handleSubmit = async () => {
    try {
      // Validazione
      if (!formData.nome || !formData.cliente || !formData.dataConsegna) {
        setError('Nome, cliente e data di consegna sono obbligatori');
        return;
      }

      console.log('📋 FormData al momento del submit:', formData);
      console.log('📦 Prodotti in formData:', formData.prodotti);

      if (!formData.operatoreId) {
        setError('Operatore è obbligatorio');
        return;
      }

      setLoading(true);
      setError('');

      // Calcola valore totale
      const valoreCalcolato = formData.prodotti.reduce((sum, p) => sum + (p.quantita * p.prezzo), 0);

      // Prepara dati per l'API 
      const dataToSend = {
        numero: formData.nome,
        cliente: formData.cliente,
        dataConsegna: formData.dataConsegna,
        prodotti: formData.prodotti.map(p => ({
          productId: p.productId,
          quantita: p.quantita,
          nome: p.nome,
          note: p.note || ''
        })),
        note: formData.note || '',
        operatoreId: formData.operatoreId,
        assegnazioneId: formData.assegnazioneId || null
      };

      const endpoint = formData.tipo === 'ordine' ? '/ordini' : '/rdt';
      
      console.log('🚀 Dati inviati al server:', dataToSend);
      console.log('📦 Prodotti nell\'ordine:', dataToSend.prodotti);
      
      await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(dataToSend)
      }, token);

      // Reset form
      setFormData({
        tipo: 'ordine',
        nome: '',
        cliente: '',
        dataConsegna: new Date().toISOString().split('T')[0],
        operatoreId: '',
        assegnazioneId: '',
        note: ''
      });

      await loadExistingItems();
      setError(`✅ ${formData.tipo} creato con successo!`);
      
      // Reindirizza a OrdiniManagement dopo il salvataggio
      setTimeout(() => {
        setCurrentPage('ordini');
      }, 1500);
    } catch (err) {
      setError('Errore nella creazione: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const finalizeItem = async (item) => {
    if (!window.confirm(`Sei sicuro di voler finalizzare questo ${item.itemType}? I prodotti verranno aggiunti alle giacenze globali dell'operatore.`)) {
      return;
    }

    try {
      setError('');
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      
      await apiCall(`${endpoint}/${item._id}/finalize`, {
        method: 'POST'
      }, token);

      await loadExistingItems();
      setError(`✅ ${item.itemType} finalizzato! Prodotti aggiunti alle giacenze globali.`);
    } catch (err) {
      setError('Errore nella finalizzazione: ' + err.message);
    }
  };

  // Filtra esistenti per visualizzazione
  const getFilteredExisting = () => {
    let items = existingItems;
    
    if (filters.tipo) {
      items = items.filter(item => item.itemType === filters.tipo);
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      items = items.filter(item => 
        item.numero?.toLowerCase().includes(searchLower) ||
        item.cliente?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.operatore) {
      items = items.filter(item => {
        // Trova l'assegnazione collegata
        const assegnazione = assegnazioni?.find(a => 
          (item.itemType === 'ordine' ? a.ordine === item.numero : a.rdt === item.numero) && a.attiva
        );
        return assegnazione?.userId?._id === filters.operatore;
      });
    }
    
    if (filters.stato) {
      items = items.filter(item => item.stato === filters.stato);
    }

    if (filters.cliente) {
      const clienteLower = filters.cliente.toLowerCase();
      items = items.filter(item =>
        item.cliente?.toLowerCase().includes(clienteLower)
      );
    }

    return items;
  };

  const filteredExisting = getFilteredExisting();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* Navigation */}
      {/* Navigation rimossa - usa quella globale */}
      
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
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="glass-icon p-3 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Crea Ordini e RDT</h2>
                <p className="text-white/70">Crea nuovi ordini o RDT e associali agli operatori</p>
              </div>
            </div>
            
            <button
              onClick={() => setCurrentPage('ordini')}
              className="glass-button-secondary flex items-center gap-3 px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300"
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Torna alla Lista</span>
            </button>
          </div>
        </div>

        {/* Form Creazione */}
        <div className="glass-assignment-card p-8 rounded-3xl">
          <div className="glass-card-header mb-6">
            <div className="flex items-center">
              <div className="glass-icon p-4 rounded-2xl mr-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Nuovo {formData.tipo === 'ordine' ? 'Ordine' : 'RDT'}</h2>
                <p className="text-white/70">
                  Compila i dati per creare un nuovo {formData.tipo === 'ordine' ? 'ordine' : 'RDT'}
                </p>
              </div>
            </div>
          </div>

          {/* Radio buttons per selezione tipo */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tipo di documento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="glass-radio-container flex items-center cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]" 
                     style={{
                       borderColor: formData.tipo === 'ordine' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                       backgroundColor: formData.tipo === 'ordine' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                     }}>
                <input
                  type="radio"
                  name="tipo"
                  value="ordine"
                  checked={formData.tipo === 'ordine'}
                  onChange={(e) => updateFormData({ tipo: e.target.value })}
                  className="sr-only"
                />
                <div className={`glass-radio w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center mr-3 ${
                  formData.tipo === 'ordine' 
                    ? 'border-blue-400 bg-blue-400/20' 
                    : 'border-white/30 bg-transparent'
                }`}>
                  {formData.tipo === 'ordine' && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center">
                  <Hash className="w-6 h-6 text-blue-400 mr-3" />
                  <div>
                    <div className="text-white font-medium">📦 Ordine</div>
                    <div className="text-white/60 text-sm">Ordine da fornitore</div>
                  </div>
                </div>
              </label>
              
              <label className="glass-radio-container flex items-center cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]"
                     style={{
                       borderColor: formData.tipo === 'rdt' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                       backgroundColor: formData.tipo === 'rdt' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                     }}>
                <input
                  type="radio"
                  name="tipo"
                  value="rdt"
                  checked={formData.tipo === 'rdt'}
                  onChange={(e) => updateFormData({ tipo: e.target.value })}
                  className="sr-only"
                />
                <div className={`glass-radio w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center mr-3 ${
                  formData.tipo === 'rdt' 
                    ? 'border-green-400 bg-green-400/20' 
                    : 'border-white/30 bg-transparent'
                }`}>
                  {formData.tipo === 'rdt' && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center">
                  <Clipboard className="w-6 h-6 text-green-400 mr-3" />
                  <div>
                    <div className="text-white font-medium">📋 RDT</div>
                    <div className="text-white/60 text-sm">Richiesta Di Trasferimento</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Campi principali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                Nome/Numero {formData.tipo === 'ordine' ? 'Ordine' : 'RDT'} *
              </label>
              <div className="glass-input-container">
                <input
                  type="text"
                  placeholder={`es. ${formData.tipo === 'ordine' ? 'ORD-2025-001' : 'RDT-ABC123'}`}
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={formData.nome}
                  onChange={(e) => updateFormData({ nome: e.target.value })}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Cliente *
              </label>
              <div className="glass-input-container">
                <input
                  type="text"
                  placeholder="Cerca cliente per nome, email o P.IVA..."
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={clienteSearchTerm || formData.cliente}
                  onChange={(e) => handleClienteSearch(e.target.value)}
                  onFocus={() => {
                    if (clienteSearchTerm && clientiFiltered.length > 0) {
                      setShowClientiDropdown(true);
                    }
                  }}
                />
              </div>

              {/* Dropdown clienti */}
              {showClientiDropdown && clientiFiltered.length > 0 && (
                <div className="absolute z-50 w-full mt-2 glass-dropdown rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                  {clientiFiltered.map((cliente) => (
                    <div
                      key={cliente._id}
                      className="glass-dropdown-item p-4 cursor-pointer hover:bg-white/20 transition-all duration-200"
                      onClick={() => selectCliente(cliente)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-white">{cliente.nome}</div>
                          {cliente.email && (
                            <div className="text-sm text-white/70">{cliente.email}</div>
                          )}
                          {cliente.partitaIva && (
                            <div className="text-xs text-white/50">P.IVA: {cliente.partitaIva}</div>
                          )}
                          {cliente.citta && (
                            <div className="text-xs text-white/50">{cliente.citta}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showClientiDropdown && clientiFiltered.length === 0 && clienteSearchTerm && (
                <div className="absolute z-50 w-full mt-2 glass-dropdown rounded-2xl p-4">
                  <div className="text-white/70 text-sm text-center">
                    Nessun cliente trovato. Digita il nome manualmente o crea un nuovo cliente.
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data Consegna *
              </label>
              <div className="glass-input-container">
                <input
                  type="date"
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={formData.dataConsegna}
                  onChange={(e) => updateFormData({ dataConsegna: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Operatore *
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={formData.operatoreId}
                  onChange={(e) => updateFormData({ operatoreId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Seleziona operatore</option>
                  {users?.filter(u => u.role === 'user').map(user => (
                    <option key={user._id} value={user._id} className="bg-gray-800">
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Assegnazione collegata */}
          {formData.operatoreId && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-white/80 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Assegnazione (Opzionale)
              </label>
              <div className="glass-input-container">
                <select
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white"
                  value={formData.assegnazioneId}
                  onChange={(e) => updateFormData({ assegnazioneId: e.target.value })}
                >
                  <option value="" className="bg-gray-800">Nessuna assegnazione specifica</option>
                  {availableAssignments.map(assignment => {
                    const status = getAssignmentStatus(assignment);
                    const baseText = `${assignment.poloId?.nome} - Settimana ${assignment.settimanaId?.numero}/${assignment.settimanaId?.anno}`;
                    const optionText = status.isAvailable 
                      ? `✅ ${baseText} (Libera per ${formData.tipo})`
                      : `🔒 ${baseText} (${status.occupiedBy})`;
                    
                    return (
                      <option 
                        key={assignment._id} 
                        value={status.isAvailable ? assignment._id : ''} 
                        className={status.isAvailable ? "bg-gray-800" : "bg-gray-700 text-gray-400"}
                        disabled={!status.isAvailable}
                      >
                        {optionText}
                      </option>
                    );
                  })}
                </select>
              </div>
              {availableAssignments.length === 0 && formData.operatoreId && (
                <p className="text-yellow-300 text-sm mt-2">
                  ⚠️ L'operatore selezionato non ha assegnazioni attive
                </p>
              )}
              {availableAssignments.length > 0 && (
                <div className="mt-2">
                  <p className="text-white/60 text-xs">
                    📝 Le assegnazioni libere per {formData.tipo} sono contrassegnate con ✅
                  </p>
                  <p className="text-white/60 text-xs">
                    🔒 Le assegnazioni già occupate sono mostrate per riferimento ma non selezionabili
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Informazioni prodotti - gestiti separatamente */}
          <div className="mb-8">
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-center text-white/70">
                <Package className="w-8 h-8 mr-3" />
                <div className="text-center">
                  <h4 className="text-lg font-medium mb-2">Gestione Prodotti</h4>
                  <p className="text-sm">I prodotti verranno gestiti dopo la creazione dell'{formData.tipo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Note
            </label>
            <div className="glass-input-container">
              <textarea
                placeholder="Note aggiuntive..."
                className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50 resize-none"
                rows="3"
                value={formData.note}
                onChange={(e) => updateFormData({ note: e.target.value })}
              />
            </div>
          </div>

          {/* Pulsante Crea */}
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.nome || !formData.cliente || !formData.dataConsegna || !formData.operatoreId}
            className="glass-button-primary flex items-center gap-3 px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">
              {loading ? 'Creazione...' : `Crea ${formData.tipo === 'ordine' ? 'Ordine' : 'RDT'}`}
            </span>
          </button>
        </div>

        {/* Tabella Ordini/RDT esistenti - Componente unificato */}
        <OrdiniRdtTable 
          title="Ordini e RDT Esistenti" 
          showActions={true}
        />
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

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
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

        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
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

        .glass-button-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .glass-button-secondary {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1);
          color: white;
        }

        .glass-button-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 12px 32px rgba(255, 255, 255, 0.2);
        }

        .glass-button-success {
          background: rgba(34, 197, 94, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(34, 197, 94, 0.4);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
          color: white;
        }

        .glass-button-success:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.4);
          box-shadow: 0 12px 32px rgba(34, 197, 94, 0.3);
        }

        .glass-action-button {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .glass-action-button:hover {
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
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

        .glass-dropdown {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .glass-dropdown-item {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-dropdown-item:last-child {
          border-bottom: none;
        }

        .glass-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        .glass-dropdown::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .glass-dropdown::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .glass-dropdown::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CreaOrdini;
