import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Package, 
  User, 
  Calendar, 
  Building, 
  MapPin, 
  Phone, 
  Mail,
  Hash,
  Clipboard,
  DollarSign,
  Clock,
  FileText,
  Plus,
  Trash2,
  Search,
  Edit
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useGiacenze } from '../../../hooks/useGiacenze';
import { apiCall } from '../../../services/api';

const OrdineRdtModal = ({ item, onClose, onSave }) => {
  const { token, setError } = useAuth();
  const { users, settimane, assegnazioni, allProducts } = useGiacenze();
  
  const [formData, setFormData] = useState({
    numero: '',
    cliente: '',
    descrizione: '',
    dataConsegna: '',
    indirizzo: {},
    contatti: {},
    priorita: 'MEDIA',
    note: '',
    prodotti: [],
    valore: 0,
    tempoStimato: 60,
    stato: 'CREATO'
  });
  
  const [operatoreId, setOperatoreId] = useState('');
  const [assegnazioneId, setAssegnazioneId] = useState('');
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Stati per gestione prodotti
  const [newProduct, setNewProduct] = useState({
    productId: '',
    quantita: '',
    quantitaAssegnata: '',
    sogliaMinima: '',
    note: ''
  });
  const [productSearch, setProductSearch] = useState('');
  const [userGiacenze, setUserGiacenze] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);

  // Inizializza form con dati item
  useEffect(() => {
    if (item) {
      setFormData({
        numero: item.numero || '',
        cliente: item.cliente || '',
        descrizione: item.descrizione || '',
        dataConsegna: item.dataConsegna ? new Date(item.dataConsegna).toISOString().split('T')[0] : '',
        indirizzo: item.indirizzo || {},
        contatti: item.contatti || {},
        priorita: item.priorita || 'MEDIA',
        note: item.note || '',
        prodotti: item.prodotti || [],
        valore: item.valore || 0,
        tempoStimato: item.tempoStimato || 60,
        stato: item.stato || 'CREATO'
      });

      // Trova assegnazione corrente
      if (assegnazioni) {
        const assegnazione = assegnazioni.find(a => {
          if (item.itemType === 'ordine') {
            return a.ordine === item.numero && a.attiva;
          } else if (item.itemType === 'rdt') {
            return a.rdt === item.numero && a.attiva;
          }
          return false;
        });

        if (assegnazione) {
          setOperatoreId(assegnazione.userId?._id || '');
          setAssegnazioneId(assegnazione._id);
        }
      }
    }
  }, [item, assegnazioni]);

  // Aggiorna assegnazioni disponibili quando cambia operatore
  useEffect(() => {
    if (operatoreId && assegnazioni) {
      const userAssignments = assegnazioni.filter(a => 
        a.userId?._id === operatoreId && a.attiva
      );
      setAvailableAssignments(userAssignments);
      
      // Carica giacenze utente
      loadUserGiacenze(operatoreId);
    } else {
      setAvailableAssignments([]);
      setUserGiacenze([]);
    }
  }, [operatoreId, assegnazioni]);

  // Carica giacenze utente
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

  // Aggiorna campo del form
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Aggiorna indirizzo
  const updateIndirizzo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      indirizzo: { ...prev.indirizzo, [field]: value }
    }));
  };

  // Aggiorna contatti
  const updateContatti = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contatti: { ...prev.contatti, [field]: value }
    }));
  };

  // Aggiungi prodotto
  const addProduct = async () => {
    // Verifica che l'ordine non sia finalizzato
    if (formData.stato === 'COMPLETATO') {
      setError('Non è possibile aggiungere prodotti a un ordine/RDT completato');
      return;
    }
    
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

    // ⚠️ FIX: Gestione corretta delle giacenze
    // I campi quantitaAssegnata e sogliaMinima vanno usati SOLO per creare/aggiornare le giacenze
    // NON devono essere mescolati con la quantità del prodotto nell'ordine
    
    if (operatoreId && newProduct.quantitaAssegnata && newProduct.sogliaMinima) {
      const quantitaAssegnataNum = parseFloat(newProduct.quantitaAssegnata);
      const sogliaMinimaNum = parseFloat(newProduct.sogliaMinima);
      
      if (!userGiacenza) {
        // Crea nuova giacenza operatore
        try {
          await apiCall('/admin/assign-giacenza', {
            method: 'POST',
            body: JSON.stringify({
              userId: operatoreId,
              productId: newProduct.productId,
              quantitaAssegnata: quantitaAssegnataNum,
              quantitaMinima: sogliaMinimaNum
            })
          }, token);
          
          // Ricarica le giacenze operatore
          await loadUserGiacenze(operatoreId);
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
          await loadUserGiacenze(operatoreId);
        } catch (err) {
          setError('Errore nell\'aggiornamento giacenza operatore: ' + err.message);
          return;
        }
      }
    }

    // Il prodotto viene aggiunto all'ordine con la sua quantità specifica
    const product = {
      id: Date.now(), // Aggiungi ID temporaneo per gestione locale
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
    setError('✅ Prodotto aggiunto con successo');
  };

  // Rimuovi prodotto
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

  // Salva modifiche
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      // Validazioni
      if (!formData.numero || !formData.cliente || !formData.dataConsegna) {
        setError('Numero, cliente e data di consegna sono obbligatori');
        return;
      }

      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      
      // Prepara dati per l'aggiornamento
      const updateData = {
        ...formData,
        operatoreId,
        assegnazioneId
      };

      await apiCall(`${endpoint}/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }, token);

      // Gestisci l'assegnazione
      if (operatoreId && assegnazioneId) {
        const assegnazione = assegnazioni.find(a => a._id === assegnazioneId);
        if (assegnazione) {
          // Aggiorna il riferimento all'ordine/RDT nell'assegnazione
          const updateAssignmentData = {};
          if (item.itemType === 'ordine') {
            updateAssignmentData.ordine = formData.numero;
          } else {
            updateAssignmentData.rdt = formData.numero;
          }

          await apiCall(`/assegnazioni/${assegnazioneId}`, {
            method: 'PUT',
            body: JSON.stringify(updateAssignmentData)
          }, token);
        }
      }

      setError('✅ Modifiche salvate con successo!');
      setTimeout(() => {
        onSave();
      }, 1000);

    } catch (err) {
      setError('Errore nel salvataggio: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center">
            {item.itemType === 'ordine' ? (
              <Hash className="w-6 h-6 mr-3 text-blue-400" />
            ) : (
              <Clipboard className="w-6 h-6 mr-3 text-green-400" />
            )}
            Dettagli {item.itemType === 'ordine' ? 'Ordine' : 'RDT'}
          </h2>
          <button
            onClick={onClose}
            className="glass-button p-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonna sinistra */}
            <div className="space-y-6">
              {/* Informazioni base */}
              <div className="glass-card p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Informazioni Base
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Numero {item.itemType === 'ordine' ? 'Ordine' : 'RDT'} *
                    </label>
                    <input
                      type="text"
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={formData.numero}
                      onChange={(e) => updateFormData('numero', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Cliente *
                    </label>
                    <input
                      type="text"
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={formData.cliente}
                      onChange={(e) => updateFormData('cliente', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Descrizione
                    </label>
                    <textarea
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white resize-none"
                      rows={3}
                      value={formData.descrizione}
                      onChange={(e) => updateFormData('descrizione', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Date e Priorità */}
              <div className="glass-card p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Tempistiche
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Data Consegna *
                    </label>
                    <input
                      type="date"
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={formData.dataConsegna}
                      onChange={(e) => updateFormData('dataConsegna', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Priorità
                    </label>
                    <select
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={formData.priorita}
                      onChange={(e) => updateFormData('priorita', e.target.value)}
                    >
                      <option value="BASSA" className="bg-gray-800">Bassa</option>
                      <option value="MEDIA" className="bg-gray-800">Media</option>
                      <option value="ALTA" className="bg-gray-800">Alta</option>
                      <option value="URGENTE" className="bg-gray-800">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Tempo Stimato (minuti)
                    </label>
                    <input
                      type="number"
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={formData.tempoStimato}
                      onChange={(e) => updateFormData('tempoStimato', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Colonna destra */}
            <div className="space-y-6">
              {/* Assegnazione */}
              <div className="glass-card p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Assegnazione
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Operatore
                    </label>
                    <div className="glass-input w-full p-3 rounded-xl bg-gray-800/50 text-white/70 cursor-not-allowed">
                      {users?.find(u => u._id === operatoreId)?.username || 'Nessun operatore'}
                      <div className="text-xs text-white/40 mt-1">
                        ⚠️ Operatore non modificabile da questo modal
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Assegnazione
                    </label>
                    <div className="glass-input w-full p-3 rounded-xl bg-gray-800/50 text-white/70 cursor-not-allowed">
                      {availableAssignments.find(a => a._id === assegnazioneId)?.poloId?.nome || 'Nessuna assegnazione'} - 
                      Sett. {availableAssignments.find(a => a._id === assegnazioneId)?.settimanaId?.numero || 'N/A'}/
                      {availableAssignments.find(a => a._id === assegnazioneId)?.settimanaId?.anno || 'N/A'}
                      <div className="text-xs text-white/40 mt-1">
                        ⚠️ Assegnazione modificabile solo da AssignmentsManagement
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Stato
                    </label>
                    <select
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={formData.stato}
                      onChange={(e) => updateFormData('stato', e.target.value)}
                    >
                      <option value="CREATO" className="bg-gray-800">Creato</option>
                      <option value="ASSEGNATO" className="bg-gray-800">Assegnato</option>
                      <option value="IN_CORSO" className="bg-gray-800">In Corso</option>
                      <option value="COMPLETATO" className="bg-gray-800">Completato</option>
                      <option value="ANNULLATO" className="bg-gray-800">Annullato</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Note e Valore */}
              <div className="glass-card p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Dettagli Aggiuntivi
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Valore (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white"
                      value={formData.valore}
                      onChange={(e) => updateFormData('valore', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Note
                    </label>
                    <textarea
                      className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white resize-none"
                      rows={4}
                      value={formData.note}
                      onChange={(e) => updateFormData('note', e.target.value)}
                      placeholder="Aggiungi note..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Indirizzo e Contatti */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Indirizzo */}
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Indirizzo
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Via, Numero"
                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={formData.indirizzo.via || ''}
                  onChange={(e) => updateIndirizzo('via', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="CAP"
                    className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={formData.indirizzo.cap || ''}
                    onChange={(e) => updateIndirizzo('cap', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Città"
                    className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                    value={formData.indirizzo.citta || ''}
                    onChange={(e) => updateIndirizzo('citta', e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Provincia"
                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={formData.indirizzo.provincia || ''}
                  onChange={(e) => updateIndirizzo('provincia', e.target.value)}
                />
              </div>
            </div>

            {/* Contatti */}
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Contatti
              </h3>
              
              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="Telefono"
                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={formData.contatti.telefono || ''}
                  onChange={(e) => updateContatti('telefono', e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={formData.contatti.email || ''}
                  onChange={(e) => updateContatti('email', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Persona di Riferimento"
                  className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                  value={formData.contatti.riferimento || ''}
                  onChange={(e) => updateContatti('riferimento', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Prodotti */}
          <div className="glass-card p-4 rounded-xl mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Prodotti ({formData.prodotti.length})
              </h3>
              {operatoreId && (
                <button
                  onClick={() => setShowProductForm(!showProductForm)}
                  className="glass-button-primary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi Prodotto</span>
                </button>
              )}
            </div>

            {/* Form aggiunta prodotto */}
            {showProductForm && operatoreId && (
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-4">Aggiungi Nuovo Prodotto</h4>
                
                <div className="space-y-4">
                  {/* Campo ricerca prodotto con tendina automatica */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Cerca e Seleziona Prodotto
                    </label>
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
                      
                      {/* Tendina filtrata che appare automaticamente */}
                      {(productSearch.length > 0 || (!newProduct.productId && allProducts?.length > 0)) && (
                        <div className="absolute top-full left-0 right-0 z-[99999] bg-gray-900 border border-white/20 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-xl" 
                             style={{position: 'fixed', zIndex: 99999}}>
                          {allProducts?.filter(p => 
                            p.attivo && 
                            (productSearch.length === 0 || p.nome.toLowerCase().includes(productSearch.toLowerCase()))
                          ).slice(0, 50).map(product => { // Limita a 50 per performance
                            const userGiacenza = userGiacenze.find(g => g.productId._id === product._id);
                            const disponibile = userGiacenza ? userGiacenza.quantitaDisponibile : 0;
                            
                            return (
                              <div
                                key={product._id}
                                className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors"
                                onClick={() => {
                                  const userGiacenza = userGiacenze.find(g => g.productId._id === product._id);
                                  
                                  setNewProduct(prev => ({
                                    ...prev,
                                    productId: product._id,
                                    quantitaAssegnata: userGiacenza && userGiacenza.quantitaAssegnata != null ? userGiacenza.quantitaAssegnata.toString() : '',
                                    sogliaMinima: userGiacenza && userGiacenza.sogliaMinima != null ? userGiacenza.sogliaMinima.toString() : ''
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
                              {productSearch.length > 0 
                                ? `Nessun prodotto trovato per "${productSearch}"`
                                : 'Nessun prodotto disponibile'
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                        <div className="p-3 bg-white/5 rounded-lg">
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
                              <div className="text-yellow-400">
                                ⚠️ Nessuna giacenza assegnata per questo prodotto
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Quantità */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Quantità *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                        value={newProduct.quantita}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, quantita: e.target.value }))}
                      />
                    </div>
                    
                    {/* Quantità Assegnata */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Quantità Assegnata
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                        value={newProduct.quantitaAssegnata}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, quantitaAssegnata: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Soglia Minima */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Soglia Minima
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                        value={newProduct.sogliaMinima}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, sogliaMinima: e.target.value }))}
                      />
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Note
                      </label>
                      <input
                        type="text"
                        placeholder="Note aggiuntive..."
                        className="glass-input w-full p-3 rounded-xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                        value={newProduct.note}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, note: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setShowProductForm(false)}
                      className="glass-button px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={addProduct}
                      disabled={!newProduct.productId || !newProduct.quantita}
                      className="glass-button-primary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Aggiungi Prodotto
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Lista prodotti esistenti */}
            {formData.prodotti.length > 0 ? (
              <div className="space-y-3">
                {formData.prodotti.map((prodotto, index) => {
                  const productKey = prodotto.id || prodotto.productId || index;
                  return (
                    <div key={productKey} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <div className="text-white font-medium">{prodotto.nome}</div>
                        <div className="text-white/60 text-sm">
                          Quantità: {prodotto.quantita} {prodotto.unita}
                          {prodotto.note && ` - Note: ${prodotto.note}`}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => editProduct(productKey)}
                          className="glass-action-button p-2 rounded-lg hover:scale-110 transition-all duration-300"
                          title="Modifica prodotto"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => removeProduct(productKey)}
                          className="glass-action-button p-2 rounded-lg hover:scale-110 transition-all duration-300"
                          title="Rimuovi prodotto"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-white/50">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nessun prodotto aggiunto</p>
                {operatoreId && !showProductForm && (
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="mt-3 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Clicca per aggiungere il primo prodotto
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="text-white/60 text-sm">
            * Campi obbligatori
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="glass-button px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="glass-button-primary px-6 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Salvataggio...' : 'Salva Modifiche'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
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
      `}</style>
    </div>
  );
};

export default OrdineRdtModal;