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

const CreaOrdini = () => {
  const { token, setError, setCurrentPage } = useAuth();
  const { users, settimane, assegnazioni, prodotti } = useGiacenze();
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
    nome: '',
    quantita: '',
    unita: 'pz',
    prezzo: ''
  });

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

  // Filtra assegnazioni quando cambia operatore
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
    } else {
      setAvailableAssignments([]);
      setFormData(prev => ({ ...prev, assegnazioneId: '' }));
    }
  }, [formData.operatoreId, assegnazioni]);

  const loadExistingItems = async () => {
    try {
      setLoading(true);
      
      const [ordiniData, rdtData] = await Promise.all([
        apiCall('/ordini', {}, token),
        apiCall('/rdt', {}, token)
      ]);
      
      console.log('Risposta ordini:', ordiniData);
      console.log('Risposta RDT:', rdtData);
      
      const ordiniArray = ordiniData?.ordini || [];
      const rdtArray = rdtData?.rdt || [];
      
      console.log('Ordini estratti:', ordiniArray.length);
      console.log('RDT estratti:', rdtArray.length);
      
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

  const addProduct = () => {
    if (!newProduct.nome || !newProduct.quantita) {
      setError('Nome prodotto e quantità sono obbligatori');
      return;
    }

    const product = {
      id: Date.now(),
      nome: newProduct.nome.trim(),
      quantita: parseFloat(newProduct.quantita),
      unita: newProduct.unita,
      prezzo: parseFloat(newProduct.prezzo) || 0
    };

    setFormData(prev => ({
      ...prev,
      prodotti: [...prev.prodotti, product]
    }));

    setNewProduct({
      nome: '',
      quantita: '',
      unita: 'pz',
      prezzo: ''
    });
    setShowProductForm(false);
  };

  const removeProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      prodotti: prev.prodotti.filter(p => p.id !== productId)
    }));
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
          prezzo: p.prezzo || 0
        })),
        valore: valoreCalcolato,
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

          {/* Checkbox per selezione tipo */}
          <div className="mb-6">
            <label className="glass-checkbox-container flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tipo === 'rdt'}
                onChange={(e) => updateFormData({ tipo: e.target.checked ? 'rdt' : 'ordine' })}
                className="sr-only"
              />
              <div className={`glass-checkbox w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                formData.tipo === 'rdt' 
                  ? 'border-green-400 bg-green-400/20' 
                  : 'border-white/30 bg-transparent'
              }`}>
                {formData.tipo === 'rdt' && (
                  <svg className="w-3 h-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="ml-3 text-white font-medium">
                {formData.tipo === 'rdt' ? '📋 RDT (Richiesta Di Trasferimento)' : '📦 Ordine'}
              </span>
            </label>
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
              <div className="glass-card p-4 rounded-xl mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nome prodotto"
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={newProduct.nome}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, nome: e.target.value }))}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Quantità"
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={newProduct.quantita}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, quantita: e.target.value }))}
                    />
                  </div>
                  <div>
                    <select
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={newProduct.unita}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, unita: e.target.value }))}
                    >
                      <option value="pz" className="bg-gray-800">pz</option>
                      <option value="kg" className="bg-gray-800">kg</option>
                      <option value="litri" className="bg-gray-800">litri</option>
                      <option value="metri" className="bg-gray-800">metri</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Prezzo"
                      className="glass-input flex-1 p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={newProduct.prezzo}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, prezzo: e.target.value }))}
                    />
                    <button
                      onClick={addProduct}
                      className="glass-button-primary px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowProductForm(false)}
                      className="glass-action-button px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista prodotti */}
            {formData.prodotti.length > 0 && (
              <div className="glass-card p-4 rounded-xl">
                <div className="space-y-2">
                  {formData.prodotti.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="text-white font-medium">{product.nome}</span>
                          <span className="text-white/70">{product.quantita} {product.unita}</span>
                          {product.prezzo > 0 && (
                            <span className="text-green-300">€{product.prezzo.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="glass-action-button p-2 rounded-lg hover:scale-110 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.prodotti.some(p => p.prezzo > 0) && (
                    <div className="border-t border-white/10 pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Valore Totale:</span>
                        <span className="text-green-300 font-bold text-lg">
                          €{formData.prodotti.reduce((sum, p) => sum + (p.quantita * p.prezzo), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
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

        {/* Tabella Ordini/RDT esistenti */}
        <div className="glass-card-large rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Ordini e RDT Esistenti
              {!loading && (
                <span className="ml-2 text-sm text-white/50">
                  ({filteredExisting.length} risultati)
                </span>
              )}
            </h3>
          </div>

          {/* Filtri rapidi */}
          <div className="px-6 py-4 border-b border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-input-container rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cerca..."
                    className="glass-input w-full pl-10 pr-4 py-2 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>
              </div>
              
              <select
                className="glass-input px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.tipo}
                onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
              >
                <option value="" className="bg-gray-800">Tutti i tipi</option>
                <option value="ordine" className="bg-gray-800">Solo Ordini</option>
                <option value="rdt" className="bg-gray-800">Solo RDT</option>
              </select>

              <select
                className="glass-input px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.operatore}
                onChange={(e) => setFilters(prev => ({ ...prev, operatore: e.target.value }))}
              >
                <option value="" className="bg-gray-800">Tutti gli operatori</option>
                {users?.filter(u => u.role === 'user').map(user => (
                  <option key={user._id} value={user._id} className="bg-gray-800">
                    {user.username}
                  </option>
                ))}
              </select>

              <select
                className="glass-input px-3 py-2 rounded-xl bg-transparent border-0 outline-none text-white"
                value={filters.stato}
                onChange={(e) => setFilters(prev => ({ ...prev, stato: e.target.value }))}
              >
                <option value="" className="bg-gray-800">Tutti gli stati</option>
                <option value="CREATO" className="bg-gray-800">Creato</option>
                <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
                <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
                <option value="COMPLETATO" className="bg-gray-800">Completato</option>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Tipo/Numero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Operatore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Prodotti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Valore
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
                  {filteredExisting.map(item => {
                    const assegnazione = assegnazioni?.find(a => 
                      (item.itemType === 'ordine' ? a.ordine === item.numero : a.rdt === item.numero) && a.attiva
                    );
                    
                    return (
                      <tr key={item._id} className="glass-table-row hover:bg-white/5 transition-all duration-300">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="glass-avatar w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                              {item.itemType === 'ordine' ? 
                                <Hash className="w-5 h-5 text-blue-400" /> : 
                                <Clipboard className="w-5 h-5 text-green-400" />
                              }
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {item.numero}
                              </div>
                              <div className="text-sm text-white/50">
                                {item.itemType === 'ordine' ? 'Ordine' : 'RDT'}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{item.cliente}</div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {assegnazione?.userId?.username || (
                              <span className="text-white/40 italic">Non assegnato</span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {item.prodotti?.length || 0} prodotti
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-300 font-medium">
                            €{(item.valore || 0).toFixed(2)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`glass-status-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            item.stato === 'COMPLETATO' ? 'text-green-200 border-green-300/30 bg-green-400/20' :
                            item.stato === 'IN_CORSO' ? 'text-blue-200 border-blue-300/30 bg-blue-400/20' :
                            item.stato === 'ASSEGNATO' ? 'text-purple-200 border-purple-300/30 bg-purple-400/20' :
                            'text-yellow-200 border-yellow-300/30 bg-yellow-400/20'
                          }`}>
                            {item.stato || 'CREATO'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {item.stato === 'CREATO' && (
                              <button
                                onClick={() => finalizeItem(item)}
                                className="glass-button-primary px-3 py-2 rounded-xl hover:scale-105 transition-all duration-300 text-xs"
                                title="Finalizza e aggiungi alle giacenze"
                              >
                                Finalizza
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredExisting.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="glass-icon w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-white/70 text-lg mb-2">Nessun elemento trovato</p>
                  <p className="text-sm text-white/50">
                    Crea il tuo primo ordine o RDT usando il form sopra
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

        .glass-checkbox-container {
          transition: all 0.3s ease;
        }

        .glass-checkbox {
          transition: all 0.3s ease;
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

export default CreaOrdini;