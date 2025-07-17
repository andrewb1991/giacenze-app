import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Package,
  Users,
  TrendingUp,
  Search,
  Filter,
  Eye,
  ShoppingCart,
  X,
  Check
} from 'lucide-react';

const OrdiniManagement = () => {
  const [activeTab, setActiveTab] = useState('report');
  const [reportData, setReportData] = useState({
    utilizzi: [],
    ordiniSuggeri: [],
    giacenze: [],
    stats: {}
  });
  const [filtri, setFiltri] = useState({
    settimanaId: '',
    poloId: '',
    mezzoId: '',
    userId: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    items: [],
    note: '',
    motivazione: ''
  });
  const [settimane, setSettimane] = useState([]);
  const [ordiniStorico, setOrdiniStorico] = useState([]);

  // Carica dati iniziali
  useEffect(() => {
    fetchReportData();
    fetchSettimane();
    fetchOrdiniStorico();
  }, [filtri]);

const fetchReportData = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams(filtri);
    const response = await fetch(`/api/reports/json?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Errore nel caricamento dati');
    
    const data = await response.json();
    setReportData(data);
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    setLoading(false);
  }
};

  const fetchSettimane = async () => {
    try {
      const response = await fetch('/api/settimane', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSettimane(data);
    } catch (error) {
      console.error('Errore nel caricamento settimane:', error);
    }
  };

  const fetchOrdiniStorico = async () => {
    try {
      const response = await fetch('/api/ordini', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOrdiniStorico(data.ordini || []);
    } catch (error) {
      console.error('Errore nel caricamento ordini:', error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const params = new URLSearchParams(filtri);
      const response = await fetch(`/api/reports/excel?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Errore nel download');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_completo_giacenze_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Errore nel download:', error);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleGenerateOrder = () => {
    if (selectedItems.length === 0) {
      alert('Seleziona almeno un prodotto da ordinare');
      return;
    }
    
    const items = selectedItems.map(item => ({
      productId: item.id,
      prodotto: item.prodotto,
      quantitaRichiesta: item.quantitaDaOrdinare,
      unita: item.unita,
      note: ''
    }));
    
    setOrderForm({
      items,
      note: '',
      motivazione: 'Riordino automatico - Prodotti sotto soglia minima'
    });
    setShowOrderModal(true);
  };

  const handleSubmitOrder = async () => {
    try {
      const response = await fetch('/api/ordini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: orderForm.items.map(item => ({
            productId: item.productId,
            quantitaRichiesta: item.quantitaRichiesta,
            note: item.note
          })),
          assegnazioneId: filtri.assegnazioneId, // Dovresti recuperare questo ID
          settimanaId: filtri.settimanaId,
          note: orderForm.note,
          motivazione: orderForm.motivazione
        })
      });
      
      if (!response.ok) throw new Error('Errore nella creazione ordine');
      
      const nuovoOrdine = await response.json();
      setOrdiniStorico(prev => [nuovoOrdine, ...prev]);
      setShowOrderModal(false);
      setSelectedItems([]);
      setOrderForm({ items: [], note: '', motivazione: '' });
      
      alert('Ordine creato con successo!');
    } catch (error) {
      console.error('Errore nella creazione ordine:', error);
      alert('Errore nella creazione dell\'ordine');
    }
  };

  const getStatoColor = (stato) => {
    switch (stato) {
      case 'CRITICO': return 'text-red-600 bg-red-50';
      case 'OK': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOrdineStatoColor = (stato) => {
    switch (stato) {
      case 'bozza': return 'text-gray-600 bg-gray-100';
      case 'inviato': return 'text-blue-600 bg-blue-100';
      case 'in_elaborazione': return 'text-yellow-600 bg-yellow-100';
      case 'completato': return 'text-green-600 bg-green-100';
      case 'annullato': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestione Ordini e Giacenze</h1>
        <p className="text-gray-600">Monitora le giacenze e genera ordini automatici</p>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Prodotti Totali</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.stats.totaleProdotti}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Prodotti Critici</p>
              <p className="text-2xl font-bold text-red-600">{reportData.stats.prodottiCritici}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Prodotti OK</p>
              <p className="text-2xl font-bold text-green-600">{reportData.stats.prodottiOk}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Da Ordinare</p>
              <p className="text-2xl font-bold text-orange-600">{reportData.stats.ordiniDaGenerare}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Settimana</label>
            <select
              value={filtri.settimanaId}
              onChange={(e) => setFiltri({...filtri, settimanaId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tutte le settimane</option>
              {/* {settimana.map(settimana => (
                <option key={settimana._id} value={settimana._id}>
                  Sett. {settimana.numero}/{settimana.anno}
                </option>
              ))} */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Polo</label>
            <select
              value={filtri.poloId}
              onChange={(e) => setFiltri({...filtri, poloId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tutti i poli</option>
              <option value="polo1">Polo Nord</option>
              <option value="polo2">Polo Sud</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mezzo</label>
            <select
              value={filtri.mezzoId}
              onChange={(e) => setFiltri({...filtri, mezzoId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tutti i mezzi</option>
              <option value="mezzo1">Mezzo A1</option>
              <option value="mezzo2">Mezzo B2</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'report'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Report Utilizzi
            </button>
            <button
              onClick={() => setActiveTab('ordini')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'ordini'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingCart className="h-4 w-4 inline mr-2" />
              Lista Ordini
            </button>
            <button
              onClick={() => setActiveTab('giacenze')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'giacenze'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Giacenze per Operatore
            </button>
            <button
              onClick={() => setActiveTab('storico')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'storico'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Storico Ordini
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Report Utilizzi */}
          {activeTab === 'report' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Report Utilizzi e Prodotti da Ordinare</h3>
                <div className="flex space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedItems.length} prodotti selezionati
                  </span>
                  <button
                    onClick={handleGenerateOrder}
                    disabled={selectedItems.length === 0}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Genera Ordine
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === reportData.utilizzi.filter(u => u.daOrdinare === 'SÌ').length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(reportData.utilizzi.filter(u => u.daOrdinare === 'SÌ'));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Utente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qta Utilizzata</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disponibile</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Da Ordinare</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">% Rimasta</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Polo/Mezzo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.utilizzi.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`${item.statoGiacenza === 'CRITICO' ? 'bg-red-50' : ''} hover:bg-gray-50`}
                      >
                        <td className="px-4 py-2">
                          {item.daOrdinare === 'SÌ' && (
                            <input
                              type="checkbox"
                              checked={selectedItems.some(s => s.id === item.id)}
                              onChange={() => handleSelectItem(item)}
                              className="rounded"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.utente}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.prodotto}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{item.categoria}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.quantitaTotaleUtilizzata} {item.unita}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.quantitaDisponibile} {item.unita}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {item.daOrdinare === 'SÌ' ? (
                            <span className="text-orange-600">{item.quantitaDaOrdinare} {item.unita}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatoColor(item.statoGiacenza)}`}>
                            {item.statoGiacenza}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.percentualeRimasta}</td>
                        <td className="px-4 py-2 text-xs text-gray-600">
                          {item.polo}<br/>{item.mezzo}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Lista Ordini Suggeriti */}
          {activeTab === 'ordini' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Lista Prodotti da Ordinare</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Utente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qta da Ordinare</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disponibile</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Soglia Min</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.ordiniSuggeri.map((item, index) => (
                      <tr key={index} className="bg-orange-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.prodotto}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{item.categoria}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.utente}</td>
                        <td className="px-4 py-2 text-sm font-medium text-orange-600">
                          {item.quantitaDaOrdinare} {item.unita}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.disponibile} {item.unita}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.minima} {item.unita}
                        </td>
                        <td className="px-4 py-2 text-sm text-red-600 font-medium">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Giacenze per Operatore */}
          {activeTab === 'giacenze' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Giacenze per Operatore</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Operatore</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assegnata</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disponibile</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Soglia Min</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">% Rimasta</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Settimana</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.giacenze.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`${item.stato === 'CRITICO' ? 'bg-red-50' : ''} hover:bg-gray-50`}
                      >
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.operatore}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{item.email}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.prodotto}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{item.categoria}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.quantitaAssegnata} {item.unita}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.quantitaDisponibile} {item.unita}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.sogliaMinima} {item.unita}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatoColor(item.stato)}`}>
                            {item.stato}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.percentualeRimasta}</td>
                        <td className="px-4 py-2 text-xs text-gray-600">{item.settimana}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Storico Ordini */}
          {activeTab === 'storico' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Storico Ordini</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Ordine</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Utente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prodotti</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priorità</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordiniStorico.map((ordine) => (
                      <tr key={ordine._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-blue-600">
                          {ordine.numeroOrdine}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(ordine.dataRichiesta).toLocaleDateString('it-IT')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {ordine.userId?.username}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {ordine.items?.length} prodotti
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrdineStatoColor(ordine.stato)}`}>
                            {ordine.stato}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {ordine.priorita}
                        </td>
                        <td className="px-4 py-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Creazione Ordine */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Crea Nuovo Ordine</h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Prodotti selezionati:</h4>
                <div className="space-y-2">
                  {orderForm.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <span className="font-medium">{item.prodotto}</span>
                        <span className="text-gray-600 ml-2">
                          {item.quantitaRichiesta} {item.unita}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={item.quantitaRichiesta}
                        onChange={(e) => {
                          const newItems = [...orderForm.items];
                          newItems[index].quantitaRichiesta = parseFloat(e.target.value) || 0;
                          setOrderForm({...orderForm, items: newItems});
                        }}
                        className="w-20 p-1 border border-gray-300 rounded text-center"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivazione
                </label>
                <input
                  type="text"
                  value={orderForm.motivazione}
                  onChange={(e) => setOrderForm({...orderForm, motivazione: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Motivo dell'ordine..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note aggiuntive
                </label>
                <textarea
                  value={orderForm.note}
                  onChange={(e) => setOrderForm({...orderForm, note: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Note aggiuntive..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSubmitOrder}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Conferma Ordine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdiniManagement;