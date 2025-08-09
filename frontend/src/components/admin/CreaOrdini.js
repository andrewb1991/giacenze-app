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
  const [newProduct, setNewProduct] = useState({
    productId: '',
    quantita: '',
    quantitaAssegnata: '',
    sogliaMinima: '',
    note: ''
  });
  const [productSearch, setProductSearch] = useState('');
  const [userGiacenze, setUserGiacenze] = useState([]);

  // Stati per visualizzazione ordini/RDT esistenti
  const [existingItems, setExistingItems] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    tipo: '',
    operatore: '',
    stato: ''
  });

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Carica dati iniziali
  useEffect(() => {
    if (token) {
      loadExistingItems();
      // Imposta data di default a oggi
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dataConsegna: today }));
    }
  }, [token]);

  // Filtra assegnazioni e carica giacenze quando cambia operatore
  useEffect(() => {
    if (formData.operatoreId && assegnazioni) {
      const userAssignments = assegnazioni.filter(a => 
        a.userId?._id === formData.operatoreId && a.attiva
      );
      setAvailableAssignments(userAssignments);
      
      // Reset assegnazione selezionata se non più valida
      if (formData.assegnazioneId && !userAssignments.find(a => a._id === formData.assegnazioneId)) {
        setFormData(prev => ({ ...prev, assegnazioneId: '' }));
      }
      
      // Carica giacenze utente
      loadUserGiacenze(formData.operatoreId);
    } else {
      setAvailableAssignments([]);
      setUserGiacenze([]);
      setFormData(prev => ({ ...prev, assegnazioneId: '' }));
    }
  }, [formData.operatoreId, assegnazioni]);

  // Mostra automaticamente il form prodotti quando operatore e assegnazione sono selezionati
  useEffect(() => {
    if (formData.operatoreId && formData.assegnazioneId) {
      setShowProductForm(true);
    } else {
      setShowProductForm(false);
    }
  }, [formData.operatoreId, formData.assegnazioneId]);
  
  const loadUserGiacenze = async (userId) => {
    try {
      const response = await apiCall(`/admin/giacenze?userId=${userId}`, {}, token);
      setUserGiacenze(response || []);
      console.log(`🔄 Caricate ${response?.length || 0} giacenze per operatore ${userId}`);
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
    
    const quantitaNum = parseFloat(newProduct.quantita);
    
    // Validazione quantità minima
    if (quantitaNum <= 0) {
      setError('La quantità deve essere maggiore di zero');
      return;
    }

    // Gestione corretta delle giacenze (uguale al modal)
    if (formData.operatoreId && newProduct.quantitaAssegnata && newProduct.sogliaMinima) {
      const quantitaAssegnataNum = parseFloat(newProduct.quantitaAssegnata);
      const sogliaMinimaNum = parseFloat(newProduct.sogliaMinima);
      
      if (!userGiacenza) {
        // Crea nuova giacenza operatore
        try {
          await apiCall('/admin/assign-giacenza', {
            method: 'POST',
            body: JSON.stringify({
              userId: formData.operatoreId,
              productId: newProduct.productId,
              quantitaAssegnata: quantitaAssegnataNum,
              quantitaMinima: sogliaMinimaNum
            })
          }, token);
          
          // Ricarica le giacenze operatore
          await loadUserGiacenze(formData.operatoreId);
        } catch (err) {
          setError('Errore nella creazione giacenza operatore: ' + err.message);
          return;
        }
      } else if (quantitaAssegnataNum !== userGiacenza.quantitaAssegnata || sogliaMinimaNum !== userGiacenza.sogliaMinima) {
        // Aggiorna giacenza esistente se i valori sono cambiati
        try {
          await apiCall(`/admin/giacenze/${userGiacenza._id}`, {
            method: 'PUT',
            body: JSON.stringify({
              quantitaAssegnata: quantitaAssegnataNum,
              quantitaMinima: sogliaMinimaNum
            })
          }, token);
          
          // Ricarica le giacenze operatore  
          await loadUserGiacenze(formData.operatoreId);
        } catch (err) {
          setError('Errore nell\'aggiornamento giacenza operatore: ' + err.message);
          return;
        }
      }
    }

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

  // Modifica prodotto
  const editProduct = (productId) => {
    const product = formData.prodotti.find(p => p.id === productId || p.productId === productId);
    if (product) {
      setNewProduct({
        productId: product.productId,
        quantita: product.quantita.toString(),
        quantitaAssegnata: '',
        sogliaMinima: '',
        note: product.note || ''
      });
      setProductSearch(product.nome);
      setShowProductForm(true);
      
      // Rimuovi il prodotto temporaneamente dalla lista per permettere la modifica
      removeProduct(productId);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validazione
      if (!formData.nome || !formData.cliente || !formData.dataConsegna) {
        setError('Nome, cliente e data di consegna sono obbligatori');
        return;
      }

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
          nome: p.nome,
          quantita: p.quantita,
          unita: p.unita,
          note: p.note || '',
          productId: p.productId // Aggiungiamo per gestione giacenze nel backend
        })),
        note: formData.note || '',
        operatoreId: formData.operatoreId,
        assegnazioneId: formData.assegnazioneId || null
      };

      const endpoint = formData.tipo === 'ordine' ? '/ordini' : '/rdt';
      
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
        prodotti: [],
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

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Cliente *
              </label>
              <div className="glass-input-container">
                <input
                  type="text"
                  placeholder="Nome cliente"
                  className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={formData.cliente}
                  onChange={(e) => updateFormData({ cliente: e.target.value })}
                />
              </div>
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
                  {availableAssignments.map(assignment => (
                    <option key={assignment._id} value={assignment._id} className="bg-gray-800">
                      {assignment.poloId?.nome} - Settimana {assignment.settimanaId?.numero}/{assignment.settimanaId?.anno}
                    </option>
                  ))}
                </select>
              </div>
              {availableAssignments.length === 0 && formData.operatoreId && (
                <p className="text-yellow-300 text-sm mt-2">
                  ⚠️ L'operatore selezionato non ha assegnazioni attive
                </p>
              )}
            </div>
          )}

          {/* Gestione Prodotti */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Prodotti ({formData.prodotti.length})
              </h3>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="glass-button-secondary flex items-center gap-2 px-4 py-2 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Aggiungi Prodotto
              </button>
            </div>

            {/* Form aggiunta prodotto */}
            {showProductForm && (
              <div className="glass-card p-6 rounded-xl mb-4 space-y-4">
                <h4 className="text-lg font-semibold text-white">Aggiungi Prodotto</h4>
                
                {/* Campo ricerca prodotto con tendina automatica */}
                <div className="relative z-[9999]">
                  <label className="block text-sm font-medium text-white/80 mb-2">Cerca e Seleziona Prodotto *</label>
                  <div className="glass-input-container rounded-xl relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4 z-10" />
                      <input
                        type="text"
                        placeholder={newProduct.productId ? allProducts?.find(p => p._id === newProduct.productId)?.nome : "Clicca qui per selezionare o cercare un prodotto..."}
                        className="glass-input w-full pl-10 pr-4 py-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                        value={productSearch}
                        onFocus={() => setProductSearch('')}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setNewProduct(prev => ({ ...prev, productId: '' }));
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Tendina filtrata che appare automaticamente */}
                  {(productSearch.length > 0 || (!newProduct.productId && allProducts?.length > 0)) && (
                    <div className="absolute top-full left-0 right-0 z-[99999] bg-gray-900 border border-white/20 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-xl" 
                         style={{position: 'fixed', zIndex: 99999}}>
                        {allProducts?.filter(p => 
                          p.attivo && 
                          (productSearch.length === 0 || p.nome.toLowerCase().includes(productSearch.toLowerCase()))
                        ).slice(0, 50).map(product => {
                          const userGiacenza = userGiacenze.find(g => g.productId._id === product._id);
                          const disponibile = userGiacenza ? userGiacenza.quantitaDisponibile : 0;
                          
                          return (
                            <div
                              key={product._id}
                              className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors"
                              onClick={() => {
                                setNewProduct(prev => ({
                                  ...prev,
                                  productId: product._id
                                }));
                                setProductSearch(product.nome);
                              }}
                            >
                              <div className="text-white font-medium">{product.nome}</div>
                              <div className="text-white/60 text-sm">
                                {product.codice && `Codice: ${product.codice} • `}
                                Unità: {product.unita}
                                {userGiacenza && (
                                  <span className="text-green-400 ml-2">
                                    • Disponibile: {disponibile}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {allProducts?.filter(p => 
                          p.attivo && 
                          (productSearch.length === 0 || p.nome.toLowerCase().includes(productSearch.toLowerCase()))
                        ).length === 0 && (
                          <div className="p-3 text-white/60 text-center">
                            {productSearch.length === 0 ? 'Nessun prodotto disponibile' : `Nessun prodotto trovato per "${productSearch}"`}
                          </div>
                        )}
                    </div>
                  )}
                </div>
                
                {/* Prodotto selezionato */}
                {newProduct.productId && (
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <div className="text-green-400 font-medium">
                      ✓ Prodotto selezionato: {allProducts?.find(p => p._id === newProduct.productId)?.nome}
                    </div>
                  </div>
                )}
                  
                  {/* Mostra info giacenze per prodotto selezionato */}
                  {newProduct.productId && (() => {
                    const selectedProduct = allProducts?.find(p => p._id === newProduct.productId);
                    const userGiacenza = userGiacenze.find(g => g.productId._id === newProduct.productId);
                    
                    if (selectedProduct) {
                      return (
                        <div className="mt-2 p-3 bg-white/5 rounded-lg">
                          <div className="text-sm text-white/80">
                            <div className="mb-2">
                              <span className="font-medium">Prodotto selezionato:</span>
                              <span className="ml-2 text-white">{selectedProduct.nome} ({selectedProduct.unita})</span>
                            </div>
                            {userGiacenza ? (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="font-medium">Giacenza Assegnata:</span>
                                  <span className="ml-2 text-white">{userGiacenza.quantitaAssegnata} {selectedProduct.unita}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Giacenza Disponibile:</span>
                                  <span className="ml-2 text-white">{userGiacenza.quantitaDisponibile} {selectedProduct.unita}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-yellow-300">
                                ⚠️ L'operatore non ha giacenze per questo prodotto
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-green-300">
                            💡 {formData.tipo === 'ordine' ? 'Ordine' : 'RDT'}: La quantità verrà AGGIUNTA alla giacenza disponibile dell'operatore
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                
                {/* Quantità Ordine/RDT e Note */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Quantità {formData.tipo === 'ordine' ? 'Ordine' : 'RDT'} *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={`Quantità per ${formData.tipo}`}
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={newProduct.quantita}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, quantita: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Note</label>
                    <input
                      type="text"
                      placeholder="Note per questo prodotto"
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={newProduct.note}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, note: e.target.value }))}
                    />
                  </div>
                </div>

                {/* ⚠️ Sezione Gestione Giacenze - SEPARATA dalla quantità ordine */}
                <div className="border-t border-white/10 pt-4">
                  <div className="mb-3">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Gestione Giacenze Operatore
                    </h4>
                    <div className="text-sm text-white/70 mb-3">
                      💡 Questi campi aggiornano le giacenze dell'operatore, indipendentemente dalla quantità dell'{formData.tipo === 'ordine' ? 'ordine' : 'RDT'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Quantità Assegnata</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Es: 100 (giacenza totale)"
                        className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                        value={newProduct.quantitaAssegnata || ''}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, quantitaAssegnata: e.target.value }))}
                      />
                      <div className="text-xs text-white/50 mt-1">Giacenza totale assegnata all'operatore</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Soglia Minima</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Es: 10 (soglia di riordino)"
                        className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                        value={newProduct.sogliaMinima || ''}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, sogliaMinima: e.target.value }))}
                      />
                      <div className="text-xs text-white/50 mt-1">Soglia minima per alert</div>
                    </div>
                  </div>
                </div>
                
                {/* Pulsanti */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setNewProduct({ productId: '', quantita: '', note: '', quantitaAssegnata: '', sogliaMinima: '' });
                      setProductSearch('');
                    }}
                    className="glass-action-button px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    <X className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">Annulla</span>
                  </button>
                  <button
                    onClick={addProduct}
                    disabled={!newProduct.productId || !newProduct.quantita}
                    className="glass-button-primary px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Aggiungi</span>
                  </button>
                </div>
              </div>
            )}

            {/* Lista prodotti */}
            {formData.prodotti.length > 0 && (
              <div className="glass-card p-4 rounded-xl">
                <div className="space-y-2">
                  {formData.prodotti.map(product => {
                    const userGiacenza = userGiacenze.find(g => g.productId._id === product.productId);
                    return (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-white font-medium">{product.nome}</span>
                            <span className="text-white/70 font-semibold">{product.quantita} {product.unita}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              formData.tipo === 'ordine' 
                                ? 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                                : 'bg-green-400/20 text-green-300 border border-green-400/30'
                            }`}>
                              ➕ Incremento giacenza
                            </span>
                          </div>
                          {product.note && (
                            <div className="text-white/50 text-sm italic">📝 {product.note}</div>
                          )}
                          {userGiacenza && (
                            <div className="text-xs text-white/60 mt-1">
                              Giacenza operatore: {userGiacenza.quantitaAssegnata} ass., {userGiacenza.quantitaDisponibile} disp.
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editProduct(product)}
                            className="glass-action-button p-2 rounded-lg hover:scale-110 transition-all duration-300"
                            title="Modifica prodotto"
                          >
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="glass-action-button p-2 rounded-lg hover:scale-110 transition-all duration-300"
                            title="Rimuovi prodotto"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Totale Prodotti:</span>
                      <span className="text-white font-bold text-lg">
                        {formData.prodotti.length} prodotti
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
      `}</style>
    </div>
  );
};

export default CreaOrdini;
