import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Package, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Hash,
  Clipboard,
  FileText,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useGiacenze } from '../../../hooks/useGiacenze';
import { apiCall } from '../../../services/api';
import AggiungiProdottoOrdine from '../AggiungiProdottoOrdine';

const OrdineRdtModal = ({ item, onClose, onSave }) => {
  const { token, setError } = useAuth();
  const { users, assegnazioni } = useGiacenze();
  
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
  const [showAggiungiProdotti, setShowAggiungiProdotti] = useState(false);
  
  // Funzione per ricaricare i dati dell'ordine
  const ricaricaDatiOrdine = async () => {
    try {
      const endpoint = item.itemType === 'ordine' ? '/ordini' : '/rdt';
      const response = await apiCall(`${endpoint}/${item._id}`, {}, token);
      
      // Aggiorna formData con i nuovi dati
      setFormData({
        numero: response.numero || '',
        cliente: response.cliente || '',
        descrizione: response.descrizione || '',
        dataConsegna: response.dataConsegna ? new Date(response.dataConsegna).toISOString().split('T')[0] : '',
        indirizzo: response.indirizzo || {},
        contatti: response.contatti || {},
        priorita: response.priorita || 'MEDIA',
        note: response.note || '',
        prodotti: response.prodotti || [],
        valore: response.valore || 0,
        tempoStimato: response.tempoStimato || 60,
        stato: response.stato || 'CREATO'
      });
      
      console.log('🔄 Ricaricati dati ordine:', response.prodotti?.length || 0, 'prodotti');
    } catch (err) {
      console.error('Errore ricarica dati ordine:', err);
      setError('Errore nel ricaricamento dati: ' + err.message);
    }
  };
  
  // RIMOSSO: Stati per gestione prodotti (ora gestiti in AggiungiProdottoOrdine)

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
    } else {
      setAvailableAssignments([]);
    }
  }, [operatoreId, assegnazioni]);

  // RIMOSSO: Caricamento giacenze (ora gestito in AggiungiProdottoOrdine)

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

  // RIMOSSO: La gestione prodotti è stata spostata nel componente AggiungiProdottoOrdine
  // Questa funzione non è più utilizzata dal nuovo design

  // RIMOSSO: Funzioni per gestione prodotti non più necessarie (modal ora read-only)

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
              {item.stato !== 'COMPLETATO' && (
                <button
                  onClick={() => setShowAggiungiProdotti(true)}
                  className="glass-button-primary px-4 py-2 rounded-xl text-white hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Gestisci Prodotti</span>
                </button>
              )}
            </div>

            {/* Tabella prodotti con righe disabled e pulsanti modifica/elimina */}
            {formData.prodotti.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Nome Prodotto</th>
                      <th className="text-center py-3 px-4 text-white/80 font-medium">Quantità</th>
                      <th className="text-left py-3 px-4 text-white/80 font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.prodotti.map((prodotto, index) => (
                      <tr key={prodotto.id || prodotto.productId || index} className="border-b border-white/10">
                        <td className="py-3 px-4">
                          <div className="text-white font-medium">{prodotto.nome}</div>
                          <div className="text-white/50 text-xs">{prodotto.productId}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="text-white bg-white/5 px-3 py-2 rounded-lg">
                            {prodotto.quantita} {prodotto.unita}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white/70 text-sm bg-white/5 px-3 py-2 rounded-lg">
                            {prodotto.note || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-white/50">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg mb-2">Nessun prodotto associato</p>
                <p className="text-sm">
                  {item.stato !== 'COMPLETATO' 
                    ? 'Usa il pulsante "Gestisci Prodotti" per aggiungere prodotti a questo ' + item.itemType
                    : 'Questo ' + item.itemType + ' è stato finalizzato senza prodotti'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal aggiungi prodotti */}
        {showAggiungiProdotti && (
          <AggiungiProdottoOrdine
            ordine={{
              ...item,
              prodotti: formData.prodotti, // Passa i prodotti aggiornati
              numero: formData.numero,
              cliente: formData.cliente,
              stato: formData.stato
            }}
            onClose={() => setShowAggiungiProdotti(false)}
            onUpdate={async () => {
              // Ricarica i dati dell'ordine localmente
              await ricaricaDatiOrdine();
              // Ricarica anche la lista principale se necessario
              if (onSave) onSave();
              setShowAggiungiProdotti(false);
            }}
          />
        )}

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