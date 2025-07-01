import React, { useState, useEffect, useCallback, useMemo} from 'react';
import { 
  Package, 
  Download, 
  Settings, 
  LogOut, 
  Minus, 
  Calendar,
  MapPin,
  Truck,
  UserCheck,
  AlertTriangle,
  Search,
  Plus,
  Package2,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  ChevronRight,
  Users
} from 'lucide-react';

const GiacenzeApp = () => {
  const [user, setUser] = useState(() => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
});
  const [currentPage, setCurrentPage] = useState('login');
const [token, setToken] = useState(() => localStorage.getItem('token'));  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  // Stati per giacenze personali
  const [myGiacenze, setMyGiacenze] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [myUtilizzi, setMyUtilizzi] = useState([]);
const [dataLoaded, setDataLoaded] = useState(false);


  // Stati per admin
  const [allProducts, setAllProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [poli, setPoli] = useState([]);
  const [mezzi, setMezzi] = useState([]);
  const [settimane, setSettimane] = useState([]);
  const [assegnazioni, setAssegnazioni] = useState([]);
  const [allGiacenze, setAllGiacenze] = useState([]);

  // Stati per gestione admin
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserForGiacenze, setSelectedUserForGiacenze] = useState('');
  const [selectedWeekForGiacenze, setSelectedWeekForGiacenze] = useState('');
const [giacenzeForm, setGiacenzeForm] = useState({
  productId: '',
  quantitaAssegnata: '',
  quantitaMinima: '',
  note: '',
  aggiungiAlla: false,
  isGlobal: true,
  settimanaId: '',
  applicaATutteLeSettimane: false
});
  // Stati per form assegnazione separato
  const [assegnazioneForm, setAssegnazioneForm] = useState({
    userId: '',
    poloId: '',
    mezzoId: '',
    settimanaId: ''
  });

  const [reportFilters, setReportFilters] = useState({
    settimanaId: '',
    poloId: '',
    mezzoId: '',
    userId: ''
  });

const [editAssignmentId, setEditAssignmentId] = useState(null);
const [editForm, setEditForm] = useState({
  poloId: '',
  mezzoId: '',
  settimanaId: ''
});

  const [adminView, setAdminView] = useState('overview');
const [activeTab, setActiveTab] = useState('giacenze'); // 'overview', 'user-giacenze'

  const API_BASE = 'http://localhost:7070/api';

  // Funzione per formattare le settimane
  const formatWeek = (settimana) => {
    if (!settimana) {
      return 'Settimana non disponibile';
    }
    
    if (!settimana.numero || !settimana.anno) {
      return 'Settimana non valida';
    }
    
    if (!settimana.dataInizio || !settimana.dataFine) {
      return `Settimana ${settimana.numero}/${settimana.anno}`;
    }
    
    try {
      const startDate = new Date(settimana.dataInizio);
      const endDate = new Date(settimana.dataFine);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return `Settimana ${settimana.numero}/${settimana.anno}`;
      }
      
      const formatDate = (date) => {
        return date.toLocaleDateString('it-IT', {
          day: '2-digit',
          month: '2-digit'
        });
      };
      
      return `${formatDate(startDate)} - ${formatDate(endDate)} ${settimana.anno}`;
    } catch (error) {
      console.warn('Errore formattazione settimana:', error);
      return `Settimana ${settimana.numero}/${settimana.anno}`;
    }
  };

  // Funzione per le chiamate API
  const apiCall = async (endpoint, options = {}) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        ...options
      };

      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Errore HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  };

  // Login
  const handleLogin = async (credentials) => {
  try {
    setLoading(true);
    setError('');

    const data = await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCurrentPage('dashboard');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // Logout
const handleLogout = () => {
  setToken(null);
  setUser(null);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setCurrentPage('login');
  setDataLoaded(false);
  setMyGiacenze([]);
  setMyAssignments([]);
  setSelectedAssignment(null);
};

  // Carica dati quando utente è loggato
  useEffect(() => {
    if (token && user && !dataLoaded) {
      loadData().then(()=> setDataLoaded(true));
    }
  }, [token, user, dataLoaded]);

  const loadData = async () => {
    try {
      console.log('Caricamento dati...');
      
      // Carica giacenze personali e assegnazioni
      const [giacenzeData, assignmentsData] = await Promise.all([
        apiCall('/my-giacenze'),
        apiCall('/assegnazioni/my')
      ]);

      setMyGiacenze(giacenzeData || []);
      setMyAssignments(assignmentsData || []);

      // Se è admin, carica dati aggiuntivi
      if (user.role === 'admin') {
        try {
          const [productsData, usersData, poliData, mezziData, settimaneData, assegnazioniData, allGiacenzeData] = await Promise.all([
            apiCall('/products'),
            apiCall('/users'),
            apiCall('/poli'),
            apiCall('/mezzi'),
            apiCall('/settimane'),
            apiCall('/assegnazioni'),
            apiCall('/admin/giacenze')
          ]);

          setAllProducts(productsData || []);
          setUsers(usersData || []);
          setPoli(poliData || []);
          setMezzi(mezziData || []);
          setSettimane(settimaneData || []);
          setAssegnazioni(assegnazioniData || []);
          setAllGiacenze(allGiacenzeData || []);
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


  // Aggiungi prodotto (dalla giacenza personale)
const handleAddProduct = async (productId, quantity = 1) => {
  if (!selectedAssignment) {
    setError('Seleziona un\'assegnazione attiva');
    return;
  }

  try {
    setError('');
    const result = await apiCall('/add-product', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantitaAggiunta: quantity,
        assegnazioneId: selectedAssignment._id
      })
    });

    // Ricarica giacenze personali
    const updatedGiacenze = await apiCall('/my-giacenze');
    setMyGiacenze(updatedGiacenze);

    // Ricarica utilizzi
    const updatedUtilizzi = await apiCall('/utilizzi/my');
    setMyUtilizzi(updatedUtilizzi);

    console.log(result.message);
  } catch (err) {
    setError('Errore nel ripristino prodotto: ' + err.message);
  }
};


  // const handleAddProduct = async (productId, quantity = 1) => {
  //   if (!selectedAssignment) {
  //     setError('Seleziona un\'assegnazione attiva');
  //     return;
  //   }

  //   try {
  //     setError('');
  //     const result = await apiCall('/add-product', {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         productId,
  //         quantitaAggiunta: quantity,
  //         assegnazioneId: selectedAssignment._id
  //       })
  //     });

  
  //     // Ricarica giacenze personali
  //     const updatedGiacenze = await apiCall('/my-giacenze');
  //     setMyGiacenze(updatedGiacenze);

  //     // Mostra notifica se sotto soglia
  //     if (result.sottoSoglia) {
  //       setError(`⚠️ Attenzione: Quantità sotto soglia minima! Rimasti: ${result.nuovaQuantitaDisponibile}`);
  //     }

  //     console.log('Prodotto utilizzato con successo');
  //   } catch (err) {
  //     setError('Errore nell\'utilizzo del prodotto: ' + err.message);
  //   }
  // };



  // Usa prodotto (dalla giacenza personale)
  const handleUseProduct = async (productId, quantity = 1) => {
    if (!selectedAssignment) {
      setError('Seleziona un\'assegnazione attiva');
      return;
    }

    try {
      setError('');
      const result = await apiCall('/use-product', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantitaUtilizzata: quantity,
          assegnazioneId: selectedAssignment._id
        })
      });

  
      // Ricarica giacenze personali
      const updatedGiacenze = await apiCall('/my-giacenze');
      setMyGiacenze(updatedGiacenze);

      // Mostra notifica se sotto soglia
      if (result.sottoSoglia) {
        setError(`⚠️ Attenzione: Quantità sotto soglia minima! Rimasti: ${result.nuovaQuantitaDisponibile}`);
      }

      console.log('Prodotto utilizzato con successo');
    } catch (err) {
      setError('Errore nell\'utilizzo del prodotto: ' + err.message);
    }
  };

  
  // Admin: Assegna giacenza a utente
const handleAssignGiacenza = async () => {
  const targetUser = adminView === 'user-giacenze' ? selectedUserForGiacenze : selectedUser;
  
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
    });

    // Reset form
    setGiacenzeForm({
      productId: '',
      quantitaAssegnata: '',
      quantitaMinima: '',
      note: '',
      aggiungiAlla: false,
      isGlobal: true,
      settimanaId: '',
      applicaATutteLeSettimane: false
    });

    // Ricarica giacenze
    const updatedGiacenze = await apiCall('/admin/giacenze');
    setAllGiacenze(updatedGiacenze);

    console.log('Giacenza assegnata con successo');
  } catch (err) {
    setError('Errore nell\'assegnazione giacenza: ' + err.message);
  }
};
  // Scarica report Excel
  const downloadExcelReport = async () => {
    try {
      setError('');
      const queryParams = new URLSearchParams();
      if (reportFilters.settimanaId) queryParams.append('settimanaId', reportFilters.settimanaId);
      if (reportFilters.poloId) queryParams.append('poloId', reportFilters.poloId);
      if (reportFilters.mezzoId) queryParams.append('mezzoId', reportFilters.mezzoId);
      if (reportFilters.userId) queryParams.append('userId', reportFilters.userId);

      const response = await fetch(`${API_BASE}/reports/excel?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Errore nel download del report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_giacenze_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Report scaricato con successo');
    } catch (err) {
      setError('Errore nel download del report: ' + err.message);
    }
  };

  // Componente Login
  const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (credentials.username && credentials.password) {
        handleLogin(credentials);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Package2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Gestione Giacenze Personali</h1>
            <p className="text-gray-600">Accedi al sistema</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  required
                  placeholder="Inserisci username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  required
                  placeholder="Inserisci password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Accesso...' : 'Accedi'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Credenziali di test:</p>
            <p className="text-xs text-gray-500">Admin: admin / password123</p>
            <p className="text-xs text-gray-500">User: operatore1 / password123</p>
          </div>
        </div>
      </div>
    );
  };

  // Componente Dashboard
  const Dashboard = () => {
    const giacenzeInScadenza = myGiacenze.filter(g => g.quantitaDisponibile <= g.quantitaMinima);
    const giacenzeOk = myGiacenze.filter(g => g.quantitaDisponibile > g.quantitaMinima);

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Package2 className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-800">Giacenze Personali</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user?.username} ({user?.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Lista Assegnazioni */}
          {myAssignments.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Le Tue Assegnazioni</h2>
              <div className="space-y-3">
                {myAssignments.map(assignment => (
                  <div 
                    key={assignment._id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedAssignment?._id === assignment._id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">
                          {assignment.settimanaId ? formatWeek(assignment.settimanaId) : 'Settimana N/A'}
                        </span>
                        <MapPin className="w-5 h-5 text-green-600" />
                        <span>{assignment.poloId?.nome || 'N/A'}</span>
                        <Truck className="w-5 h-5 text-purple-600" />
                        <span>{assignment.mezzoId?.nome || 'N/A'}</span>
                      </div>
                      {selectedAssignment?._id === assignment._id && (
                        <span className="text-sm text-blue-600 font-medium">Selezionata</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Clicca su un'assegnazione per gestire le giacenze di quella settimana
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              Nessuna assegnazione attiva. Contatta l'amministratore.
            </div>
          )}

          {/* Statistiche Giacenze */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">{myGiacenze.length}</div>
                  <div className="text-sm text-gray-600">Prodotti Assegnati</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{giacenzeOk.length}</div>
                  <div className="text-sm text-gray-600">Giacenze OK</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <TrendingDown className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{giacenzeInScadenza.length}</div>
                  <div className="text-sm text-gray-600">Sotto Soglia</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-800">{myAssignments.length}</div>
                  <div className="text-sm text-gray-600">Settimane Assegnate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Principale */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => setCurrentPage('giacenze')}
              className="bg-white hover:bg-gray-50 p-6 rounded-lg shadow-md transition duration-200"
            >
              <Package2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">Le Mie Giacenze</h3>
              <p className="text-sm text-gray-600">Scorte personali</p>
              <p className="text-xs text-gray-500 mt-2">{myGiacenze.length} prodotti assegnati</p>
            </button>

            <button
              onClick={() => setCurrentPage('utilizzi')}
              className="bg-white hover:bg-gray-50 p-6 rounded-lg shadow-md transition duration-200"
            >
              <UserCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">I Miei Utilizzi</h3>
              <p className="text-sm text-gray-600">Storico consumi</p>
            </button>

            <button
              onClick={() => setCurrentPage('reports')}
              className="bg-white hover:bg-gray-50 p-6 rounded-lg shadow-md transition duration-200"
            >
              <Download className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">Report</h3>
              <p className="text-sm text-gray-600">Scarica Excel</p>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setCurrentPage('admin');
                  setAdminView('overview');
                }}
                className="bg-white hover:bg-gray-50 p-6 rounded-lg shadow-md transition duration-200"
              >
                <Settings className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">Amministrazione</h3>
                <p className="text-sm text-gray-600">Gestisci sistema</p>
              </button>
            )}
          </div>

          {/* Alert Giacenze Sotto Soglia */}
          {giacenzeInScadenza.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-sm font-semibold text-red-800">
                  {giacenzeInScadenza.length} prodotti sotto soglia minima
                </h3>
              </div>
              <div className="text-sm text-red-700">
                {giacenzeInScadenza.slice(0, 3).map(g => g.productId?.nome).join(', ')}
                {giacenzeInScadenza.length > 3 && ` e altri ${giacenzeInScadenza.length - 3}...`}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente Le Mie Giacenze
  const GiacenzePage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGiacenze = myGiacenze.filter(giacenza =>
      giacenza.productId?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="text-blue-600 hover:text-blue-800 mr-4 underline"
                >
                  ← Torna al Dashboard
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Le Mie Giacenze</h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Selettore Settimana */}
          {myAssignments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona Settimana
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedAssignment?._id || ''}
                onChange={(e) => {
                  const assignment = myAssignments.find(a => a._id === e.target.value);
                  setSelectedAssignment(assignment);
                }}
              >
                <option value="">Seleziona una settimana</option>
                {myAssignments.map(assignment => (
                  <option key={assignment._id} value={assignment._id}>
                    {formatWeek(assignment.settimanaId)} - {assignment.poloId?.nome} - {assignment.mezzoId?.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!selectedAssignment && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              Seleziona una settimana per visualizzare e gestire le giacenze.
            </div>
          )}

          {selectedAssignment && (
            <>
              {/* Info Settimana Selezionata */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Settimana Selezionata:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatWeek(selectedAssignment.settimanaId)}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedAssignment.poloId?.nome}
                  </div>
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    {selectedAssignment.mezzoId?.nome}
                  </div>
                </div>
              </div>

              {/* Barra di ricerca */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cerca nelle tue giacenze..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Lista Giacenze */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGiacenze.map(giacenza => {
                  const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                  const percentualeRimasta = (giacenza.quantitaDisponibile / giacenza.quantitaAssegnata) * 100;
                  
                  return (
                    <div key={giacenza._id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                      isSottoSoglia ? 'border-red-500' : 'border-green-500'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {giacenza.productId?.nome}
                          </h3>
                          <p className="text-sm text-gray-600">{giacenza.productId?.categoria}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isSottoSoglia ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {isSottoSoglia ? 'SOTTO SOGLIA' : 'OK'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Disponibile:</span>
                          <span className={`text-sm font-medium ${
                            isSottoSoglia ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Assegnata:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Soglia minima:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {giacenza.quantitaMinima} {giacenza.productId?.unita}
                          </span>
                        </div>

                        {/* Barra progresso */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              percentualeRimasta <= 20 ? 'bg-red-500' : 
                              percentualeRimasta <= 40 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.max(percentualeRimasta, 5)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {percentualeRimasta.toFixed(0)}% della quantità assegnata
                        </div>
                      </div>
<div className="flex items-center justify-between mt-4 mb-2">
  <div className="flex flex-col">  <span className="text-sm text-gray-600">Usa prodotto:</span>
  <button
    onClick={() => handleUseProduct(giacenza.productId._id, 1)}
    disabled={giacenza.quantitaDisponibile <= 0}
    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center disabled:cursor-not-allowed"
  >
    <Minus className="w-4 h-4 mr-1" />
    1
  </button>
</div>
<div className="flex flex-col justfy-be">
    <span className="text-sm text-gray-600">Reintegra prodotto:</span>
    <button
    onClick={() => handleAddProduct(giacenza.productId._id, 1)}
    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center disabled:cursor-not-allowed"
  >
    <Plus className="w-4 h-4 mr-1" />
    1
  </button>
</div>
</div>

                      {giacenza.note && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          <strong>Note:</strong> {giacenza.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredGiacenze.length === 0 && (
                <div className="text-center py-8">
                  <Package2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Nessun prodotto trovato con i criteri di ricerca' : 'Nessun prodotto assegnato per questa settimana'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Componente I Miei Utilizzi


const UtilizziPage = () => {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [debugData, setDebugData] = useState(null); // per mostrare i dati grezzi

  useEffect(() => {
    if (!selectedWeek && selectedAssignment?._id) {
            loadUtilizzi(selectedWeek);
      setSelectedWeek(selectedAssignment._id);
    }
  }, [selectedAssignment, selectedWeek]);

  useEffect(() => {
    if (selectedWeek) {
      loadUtilizzi(selectedWeek);
    }
  }, [selectedWeek]);

  const loadUtilizzi = async (assignmentId) => {
    try {
      setError('');
      const assignment = myAssignments.find(a => a._id === assignmentId);

      console.log('Assignment selezionato:', assignment);

      const settimanaId = assignment?.settimanaId?._id || assignment?.settimanaId;
      if (!settimanaId) {
        console.warn('Nessun settimanaId valido trovato.');
        return;
      }

      const data = await apiCall(`/utilizzi/my?settimanaId=${settimanaId}`);
      console.log("Dati ricevuti da API:", data);
      setDebugData(data); // salva per visualizzarlo nel frontend
      setMyUtilizzi(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Errore nel caricamento utilizzi:', err);
      setError('Errore nel caricamento utilizzi: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="text-blue-600 hover:text-blue-800 mr-4 underline"
              >
                ← Torna al Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-800">I Miei Utilizzi</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Selettore settimana */}
        {myAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Settimana
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="">Seleziona una settimana</option>
              {myAssignments.map(assignment => (
                <option key={assignment._id} value={assignment._id}>
                  {formatWeek(assignment.settimanaId)} - {assignment.poloId?.nome} - {assignment.mezzoId?.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabella o fallback */}
        {selectedWeek && myUtilizzi.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantità Usata</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rimasta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Ora</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myUtilizzi.map(utilizzo => (
                  <tr key={utilizzo._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {utilizzo.productId?.nome || 'N/D'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {utilizzo.productId?.categoria || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      -{utilizzo.quantitaUtilizzata} {utilizzo.productId?.unita}
                    </td>
                    <td className="px-6 py-4">{utilizzo.quantitaPrimaDellUso ?? 'N/A'}</td>
                    <td className="px-6 py-4">{utilizzo.quantitaRimasta ?? 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div>{new Date(utilizzo.dataUtilizzo).toLocaleDateString('it-IT')}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(utilizzo.dataUtilizzo).toLocaleTimeString('it-IT')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedWeek ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Nessun utilizzo registrato per questa settimana.
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            Seleziona una settimana per visualizzare gli utilizzi.
          </div>
        )}

        {/* 🔍 DEBUG VIEW (solo dev) */}
        {debugData && (
          <pre className="mt-6 text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};



  // Componente Reports
  const ReportsPage = () => {
    useEffect(() => {
      if (settimane.length === 0 || poli.length === 0 || mezzi.length === 0) {
        loadFilterData();
      }
    }, []);

    const loadFilterData = async () => {
      try {
        const [settimaneData, poliData, mezziData] = await Promise.all([
          apiCall('/settimane'),
          apiCall('/poli'),
          apiCall('/mezzi')
        ]);

        setSettimane(settimaneData || []);
        setPoli(poliData || []);
        setMezzi(mezziData || []);

        if (user.role === 'admin') {
          const usersData = await apiCall('/users');
          setUsers(usersData || []);
        }
      } catch (err) {
        console.error('Errore caricamento dati filtri:', err);
        setError('Errore nel caricamento dei filtri: ' + err.message);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="text-blue-600 hover:text-blue-800 mr-4 underline"
                >
                  ← Torna al Dashboard
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Report Giacenze</h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Genera Report Excel</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Settimana
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={reportFilters.settimanaId}
                  onChange={(e) => setReportFilters({...reportFilters, settimanaId: e.target.value})}
                >
                  <option value="">Tutte le settimane</option>
                  {settimane.length > 0 ? (
                    settimane.map(settimana => (
                      <option key={settimana._id} value={settimana._id}>
                        {formatWeek(settimana)}
                      </option>
                    ))
                  ) : (
                    <option disabled>Caricamento settimane...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Polo
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={reportFilters.poloId}
                  onChange={(e) => setReportFilters({...reportFilters, poloId: e.target.value})}
                >
                  <option value="">Tutti i poli</option>
                  {poli.map(polo => (
                    <option key={polo._id} value={polo._id}>
                      {polo.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mezzo
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={reportFilters.mezzoId}
                  onChange={(e) => setReportFilters({...reportFilters, mezzoId: e.target.value})}
                >
                  <option value="">Tutti i mezzi</option>
                  {mezzi.map(mezzo => (
                    <option key={mezzo._id} value={mezzo._id}>
                      {mezzo.nome}
                    </option>
                  ))}
                </select>
              </div>

              {user.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utente
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={reportFilters.userId}
                    onChange={(e) => setReportFilters({...reportFilters, userId: e.target.value})}
                  >
                    <option value="">Tutti gli utenti</option>
                    {users.filter(u => u.role === 'user').map(user => (
                      <option key={user._id} value={user._id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={downloadExcelReport}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center mx-auto"
              >
                <Download className="w-5 h-5 mr-2" />
                Scarica Report Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Admin
  const AdminPage = () => {
    // Vista Gestione Giacenze per Utente
    const UserGiacenzeView = () => {
      const userAssignments = assegnazioni.filter(a => a.userId?._id === selectedUserForGiacenze);
      const userGiacenze = allGiacenze.filter(g => g.userId?._id === selectedUserForGiacenze);

      return (
        <div className="space-y-6">
          {/* Header con info utente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Gestione Giacenze: {users.find(u => u._id === selectedUserForGiacenze)?.username}
                </h2>
                <p className="text-sm text-gray-600">
                  {users.find(u => u._id === selectedUserForGiacenze)?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setAdminView('overview');
                  setSelectedUserForGiacenze('');
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Torna alla lista utenti
              </button>
            </div>

            {/* Settimane assegnate all'utente */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Settimane Assegnate:</h3>
              <div className="space-y-2">
                {userAssignments.map(assignment => (
                  <div key={assignment._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{formatWeek(assignment.settimanaId)}</span>
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{assignment.poloId?.nome}</span>
                        <Truck className="w-4 h-4 text-purple-600" />
                        <span>{assignment.mezzoId?.nome}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        assignment.attiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {assignment.attiva ? 'Attiva' : 'Inattiva'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

{/* Form assegnazione giacenza */}
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">
    Assegna/Aggiorna Giacenza Prodotto
  </h3>
    <form onSubmit={(e) => e.preventDefault()}>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Prodotto *
      </label>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        value={giacenzeForm.productId}
        onChange={(e) => setGiacenzeForm({...giacenzeForm, productId: e.target.value})}
        onClick={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
      >
        <option value="">Seleziona prodotto</option>
        {allProducts.map(product => (
          <option key={product._id} value={product._id}>
            {product.nome} ({product.categoria})
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Quantità *
      </label>
      <input
        type="number"
        min="0"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        value={giacenzeForm.quantitaAssegnata}
        onChange={(e) => setGiacenzeForm({...giacenzeForm, quantitaAssegnata: e.target.value})}
          onClick={(e) => e.stopPropagation()}
  onFocus={(e) => e.stopPropagation()}
        placeholder="es. 100"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Soglia Minima
      </label>
      <input
        type="number"
        min="0"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        value={giacenzeForm.quantitaMinima}
        onChange={(e) => setGiacenzeForm({...giacenzeForm, quantitaMinima: e.target.value})}
          onClick={(e) => e.stopPropagation()}
  onFocus={(e) => e.stopPropagation()}
        placeholder="es. 20"
      />
    </div>

    <div className="lg:col-span-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tipo di giacenza
      </label>
      <div className="mb-3">
        <input
          type="checkbox"
          id="isGlobal"
          checked={giacenzeForm.isGlobal !== false}
          onChange={(e) => setGiacenzeForm({...giacenzeForm, isGlobal: e.target.checked})}

            onClick={(e) => e.stopPropagation()}
  onFocus={(e) => e.stopPropagation()}
          className="mr-2"
        />
        <label htmlFor="isGlobal" className="text-sm text-gray-700">
          Giacenza globale (valida per tutte le settimane)
        </label>
      </div>

      {!giacenzeForm.isGlobal && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Settimana specifica
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={giacenzeForm.settimanaId || ''}
            onChange={(e) => setGiacenzeForm({...giacenzeForm, settimanaId: e.target.value})}
              onClick={(e) => e.stopPropagation()}
  onFocus={(e) => e.stopPropagation()}
          >
            <option value="">Seleziona settimana</option>
            {userAssignments.map(assignment => (
              <option key={assignment.settimanaId._id} value={assignment.settimanaId._id}>
                {formatWeek(assignment.settimanaId)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-3">
        <input
          type="checkbox"
          id="applicaATutteLeSettimane"
          checked={giacenzeForm.applicaATutteLeSettimane || false}
          onChange={(e) => setGiacenzeForm({...giacenzeForm, applicaATutteLeSettimane: e.target.checked})}
            onClick={(e) => e.stopPropagation()}
  onFocus={(e) => e.stopPropagation()}
          className="mr-2"
          disabled={giacenzeForm.isGlobal}
        />
        <label htmlFor="applicaATutteLeSettimane" className="text-sm text-gray-700">
          Applica a tutte le settimane assegnate all'utente
        </label>
      </div>

      <div className="mb-3">
        <input
          type="checkbox"
          id="aggiungiAlla"
          checked={giacenzeForm.aggiungiAlla}
          onChange={(e) => setGiacenzeForm({...giacenzeForm, aggiungiAlla: e.target.checked})}
            onClick={(e) => e.stopPropagation()}
  onFocus={(e) => e.stopPropagation()}
          className="mr-2"
        />
        <label htmlFor="aggiungiAlla" className="text-sm text-gray-700">
          Aggiungi alla quantità esistente (invece di sostituire)
        </label>
      </div>
    </div>
  </div>
</form>
  <button type="button"
    onClick={handleAssignGiacenza}
    disabled={!giacenzeForm.productId || !giacenzeForm.quantitaAssegnata}
    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
  >
    <Plus className="w-4 h-4 inline mr-2" />
    {giacenzeForm.aggiungiAlla ? 'Ricarica Giacenza' : 'Assegna Giacenza'}
  </button>
</div>
          {/* Lista giacenze utente */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Giacenze Attuali</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prodotto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantità Assegnata
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disponibile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Soglia Min
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userGiacenze.map(giacenza => {
                    const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                    
                    return (
                      <tr key={giacenza._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {giacenza.productId?.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {giacenza.productId?.categoria}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            isSottoSoglia ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {giacenza.quantitaMinima} {giacenza.productId?.unita}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isSottoSoglia ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {isSottoSoglia ? 'CRITICO' : 'OK'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="text-blue-600 hover:text-blue-800 mr-4 underline"
                >
                  ← Torna al Dashboard
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Amministrazione Giacenze</h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {adminView === 'user-giacenze' ? (
            <UserGiacenzeView />
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('giacenze')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'giacenze'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Gestione Giacenze
                  </button>
                  <button
                    onClick={() => setActiveTab('assegnazioni')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'assegnazioni'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Assegnazioni
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'giacenze' && (
                <div className="space-y-6">
                  {/* Pulsante Le Mie Giacenze */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestione Giacenze Utenti</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Seleziona un utente per gestire le sue giacenze personali e vedere le settimane assegnate
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.filter(u => u.role === 'user').map(user => {
                        const userGiacenzeCount = allGiacenze.filter(g => g.userId?._id === user._id).length;
                        const userAssignmentsCount = assegnazioni.filter(a => a.userId?._id === user._id).length;
                        const criticalCount = allGiacenze.filter(g => 
                          g.userId?._id === user._id && g.quantitaDisponibile <= g.quantitaMinima
                        ).length;
                        
                        return (
                          <button
                            key={user._id}
                            onClick={() => {
                              setSelectedUserForGiacenze(user._id);
                              setAdminView('user-giacenze');
                            }}
                            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 transition-all text-left"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Users className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                  <h3 className="font-semibold text-gray-800">{user.username}</h3>
                                  <p className="text-xs text-gray-600">{user.email}</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                              <div className="text-center">
                                <div className="font-semibold text-gray-700">{userGiacenzeCount}</div>
                                <div className="text-gray-500">Prodotti</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-gray-700">{userAssignmentsCount}</div>
                                <div className="text-gray-500">Settimane</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-semibold ${criticalCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {criticalCount}
                                </div>
                                <div className="text-gray-500">Critici</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Assegnazione Giacenza Veloce */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Assegnazione Veloce Giacenza
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Utente *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                        >
                          <option value="">Seleziona utente</option>
                          {users.filter(u => u.role === 'user').map(user => (
                            <option key={user._id} value={user._id}>
                              {user.username} ({user.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prodotto *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={giacenzeForm.productId}
                          onChange={(e) => setGiacenzeForm({...giacenzeForm, productId: e.target.value})}
                        >
                          <option value="">Seleziona prodotto</option>
                          {allProducts.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.nome} ({product.categoria})
                            </option>
                          ))}
                        </select>
                      </div>




                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantità *
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={giacenzeForm.quantitaAssegnata}
                          onChange={(e) => setGiacenzeForm({...giacenzeForm, quantitaAssegnata: e.target.value})}
                          placeholder="es. 100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Soglia Minima
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={giacenzeForm.quantitaMinima}
                          onChange={(e) => setGiacenzeForm({...giacenzeForm, quantitaMinima: e.target.value})}
                          placeholder="es. 20"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Note
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={giacenzeForm.note}
                          onChange={(e) => setGiacenzeForm({...giacenzeForm, note: e.target.value})}
                          placeholder="Note opzionali per l'assegnazione"
                        />
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="aggiungiAlla"
                        checked={giacenzeForm.aggiungiAlla}
                        onChange={(e) => setGiacenzeForm({...giacenzeForm, aggiungiAlla: e.target.checked})}
                        className="mr-2"
                      />
                      <label htmlFor="aggiungiAlla" className="text-sm text-gray-700">
                        Aggiungi alla quantità esistente (invece di sostituire)
                      </label>
                    </div>

                    <button
                      onClick={handleAssignGiacenza}
                      disabled={!selectedUser || !giacenzeForm.productId || !giacenzeForm.quantitaAssegnata}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      {giacenzeForm.aggiungiAlla ? 'Ricarica Giacenza' : 'Assegna/Aggiorna Giacenza'}
                    </button>
                  </div>

                  {/* Lista Giacenze Globale */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Tutte le Giacenze</h2>
                      <p className="text-sm text-gray-600">Panoramica completa delle giacenze di tutti gli operatori</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Utente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Prodotto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assegnata
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Disponibile
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Soglia Min
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stato
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data Assegnazione
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allGiacenze.map(giacenza => {
                            const isSottoSoglia = giacenza.quantitaDisponibile <= giacenza.quantitaMinima;
                            const percentualeRimasta = (giacenza.quantitaDisponibile / giacenza.quantitaAssegnata) * 100;
                            
                            return (
                              <tr key={giacenza._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {giacenza.userId?.username}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {giacenza.userId?.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {giacenza.productId?.nome}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {giacenza.productId?.categoria}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {giacenza.quantitaAssegnata} {giacenza.productId?.unita}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`text-sm font-medium ${
                                    isSottoSoglia ? 'text-red-600' : 'text-gray-900'
                                  }`}>
                                    {giacenza.quantitaDisponibile} {giacenza.productId?.unita}
                                  </div>
                                  <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                    <div 
                                      className={`h-1 rounded-full ${
                                        percentualeRimasta <= 20 ? 'bg-red-500' : 
                                        percentualeRimasta <= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.max(percentualeRimasta, 5)}%` }}
                                    ></div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {giacenza.quantitaMinima} {giacenza.productId?.unita}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isSottoSoglia ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                    {isSottoSoglia ? 'CRITICO' : 'OK'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {new Date(giacenza.dataAssegnazione).toLocaleDateString('it-IT')}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    da {giacenza.assegnatoDa?.username}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {allGiacenze.length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <Package2 className="w-12 h-12 mx-auto" />
                          </div>
                          <p className="text-gray-500">Nessuna giacenza assegnata</p>
                          <p className="text-sm text-gray-400">Usa il form sopra per assegnare prodotti agli operatori</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assegnazioni' && (
                <div className="space-y-6">
                  {/* Form Nuova Assegnazione */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Crea Nuova Assegnazione</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Utente *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={assegnazioneForm.userId}
                          onChange={(e) => setAssegnazioneForm({...assegnazioneForm, userId: e.target.value})}
                        >
                          <option value="">Seleziona utente</option>
                          {users.filter(u => u.role === 'user').map(user => (
                            <option key={user._id} value={user._id}>
                              {user.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Polo *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={assegnazioneForm.poloId}
                          onChange={(e) => setAssegnazioneForm({...assegnazioneForm, poloId: e.target.value})}
                        >
                          <option value="">Seleziona polo</option>
                          {poli.map(polo => (
                            <option key={polo._id} value={polo._id}>
                              {polo.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mezzo *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={assegnazioneForm.mezzoId}
                          onChange={(e) => setAssegnazioneForm({...assegnazioneForm, mezzoId: e.target.value})}
                        >
                          <option value="">Seleziona mezzo</option>
                          {mezzi.map(mezzo => (
                            <option key={mezzo._id} value={mezzo._id}>
                              {mezzo.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Settimana *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={assegnazioneForm.settimanaId}
                          onChange={(e) => setAssegnazioneForm({...assegnazioneForm, settimanaId: e.target.value})}
                        >
                          <option value="">Seleziona settimana</option>
                          {settimane.map(settimana => (
                            <option key={settimana._id} value={settimana._id}>
                              {formatWeek(settimana)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await apiCall('/assegnazioni', {
                            method: 'POST',
                            body: JSON.stringify(assegnazioneForm)
                          });
                          
                          const updatedAssegnazioni = await apiCall('/assegnazioni');
                          setAssegnazioni(updatedAssegnazioni);
                          
                          setAssegnazioneForm({
                            userId: '',
                            poloId: '',
                            mezzoId: '',
                            settimanaId: ''
                          });
                        } catch (err) {
                          setError('Errore nella creazione assegnazione: ' + err.message);
                        }
                      }}
                      disabled={!assegnazioneForm.userId || !assegnazioneForm.poloId || !assegnazioneForm.mezzoId || !assegnazioneForm.settimanaId}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Crea Assegnazione
                    </button>
                  </div>

                  {/* Lista Assegnazioni */}
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Assegnazioni Attive</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Utente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Polo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mezzo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Settimana
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stato
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Azioni
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assegnazioni.map(assegnazione => (
                            <tr key={assegnazione._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {assegnazione.userId?.username}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {assegnazione.poloId?.nome}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {assegnazione.mezzoId?.nome}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {assegnazione.settimanaId ? formatWeek(assegnazione.settimanaId) : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  assegnazione.attiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {assegnazione.attiva ? 'Attiva' : 'Disattiva'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button
  onClick={(e) => {
    e.preventDefault()
    setEditAssignmentId(assegnazione._id);
    setEditForm({
      poloId: assegnazione.poloId?._id || '',
      mezzoId: assegnazione.mezzoId?._id || '',
      settimanaId: assegnazione.settimanaId?._id || ''
    });
  }}
  className="text-blue-600 hover:text-blue-900"
>
  <Edit className="w-4 h-4" />
</button>
                                  {/* <button
                                  onClick={async () => {
  const nuovoPoloId = prompt('Inserisci ID nuovo Polo:');
  const nuovoMezzoId = prompt('Inserisci ID nuovo Mezzo:');
  const nuovaSettimanaId = prompt('Inserisci ID nuova Settimana:');
  
  try {
    const response = await fetch(`${API_BASE}/assegnazioni/${assegnazione._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        poloId: nuovoPoloId,
        mezzoId: nuovoMezzoId,
        settimanaId: nuovaSettimanaId
      })
    });

    if (!response.ok) {
      throw new Error('Errore nella modifica');
    }

    // Aggiorna la lista assegnazioni dopo modifica
    const updated = await apiCall('/assegnazioni');
    setAssegnazioni(updated);
  } catch (err) {
    setError('Errore nella modifica: ' + err.message);
  }
}} */}

                                    {/* // onClick={() => { */}
                                    {/* //   // Implementare modifica assegnazione
                                    //   console.log('Modifica assegnazione:', assegnazione._id);
                                    // }}
                                  //   className="text-blue-600 hover:text-blue-900"
                                  // >
                                  //   <Edit className="w-4 h-4" />
                                  // </button> */}
                                  <button
                                  onClick={async (e) => {  
                                    e.preventDefault()                               
  if (window.confirm('Sei sicuro di voler eliminare questa assegnazione?')) {
    try {
      const response = await fetch(`${API_BASE}/assegnazioni/${assegnazione._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione');
      }

      // Aggiorna la lista assegnazioni dopo eliminazione
      const updated = await apiCall('/assegnazioni');
      setAssegnazioni(updated);
      setError(`Assegnazione Elimata`);
    } catch (err) {
      setError('Errore nell\'eliminazione: ' + err.message);
    }
  }
}}                                  
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                {editAssignmentId === assegnazione._id && (
  <div className="bg-gray-100 p-4 rounded mt-2">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <select
        className="border border-gray-300 rounded p-2"
        value={editForm.poloId}
        onChange={(e) => {e.preventDefault();
          setEditForm({ ...editForm, poloId: e.target.value })}
}
      >
        <option value="">Seleziona Polo</option>
        {poli.map(p => (
          <option key={p._id} value={p._id}>{p.nome}</option>
        ))}
      </select>

      <select
        className="border border-gray-300 rounded p-2"
        value={editForm.mezzoId}
        onChange={(e) => {e.preventDefault();
          setEditForm({ ...editForm, mezzoId: e.target.value })}}
      >
        <option value="">Seleziona Mezzo</option>
        {mezzi.map(m => (
          <option key={m._id} value={m._id}>{m.nome}</option>
        ))}
      </select>

      <select
        className="border border-gray-300 rounded p-2"
        value={editForm.settimanaId}
        onChange={(e) => {
          e.preventDefault();
          setEditForm({ ...editForm, settimanaId: e.target.value })}}
      >
        <option value="">Seleziona Settimana</option>
        {settimane.map(s => (
          <option key={s._id} value={s._id}>
            {formatWeek(s)}
          </option>
        ))}
      </select>
    </div>

    <div className="flex space-x-2">
      <button
        onClick={async (e) => {
          e.preventDefault();

          try {
            const response = await fetch(`${API_BASE}/assegnazioni/${assegnazione._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(editForm)
            });

            if (!response.ok) throw new Error('Errore nella modifica');

            const updated = await apiCall('/assegnazioni');
            setAssegnazioni(updated);
            setEditAssignmentId(null);
            setError(`Assegnazione Modificata`);

          } catch (err) {
            setError('Errore nella modifica: ' + err.message);

          }
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Salva
      </button>

      <button
        onClick={(e) => {e.preventDefault(); setEditAssignmentId(null)}}
        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
      >
        Annulla
      </button>
    </div>
  </div>
)}

                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {assegnazioni.length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <Settings className="w-12 h-12 mx-auto" />
                          </div>
                          <p className="text-gray-500">Nessuna assegnazione creata</p>
                          <p className="text-sm text-gray-400">Crea la prima assegnazione usando il form sopra</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Statistiche Admin */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'user').length}</div>
                  <div className="text-sm text-gray-600">Operatori</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-green-600">{allProducts.length}</div>
                  <div className="text-sm text-gray-600">Prodotti</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-purple-600">{allGiacenze.length}</div>
                  <div className="text-sm text-gray-600">Giacenze Assegnate</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-red-600">
                    {allGiacenze.filter(g => g.quantitaDisponibile <= g.quantitaMinima).length}
                  </div>
                  <div className="text-sm text-gray-600">Sotto Soglia</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-yellow-600">{assegnazioni.length}</div>
                  <div className="text-sm text-gray-600">Assegnazioni</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Messaggio di errore globale
  const ErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="ml-4 text-red-500 hover:text-red-700 flex-shrink-0"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  // Rendering principale
  return (
    <div>
      <ErrorMessage />
      
      {/* Routing */}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'dashboard' && user && <Dashboard />}
      {currentPage === 'giacenze' && user && <GiacenzePage />}
      {currentPage === 'utilizzi' && user && <UtilizziPage />}
      {currentPage === 'reports' && user && <ReportsPage />}
      {currentPage === 'admin' && user && user.role === 'admin' && <AdminPage activeTab={activeTab} setActiveTab={setActiveTab} />}
      
      {/* Fallback */}
      {!user && currentPage !== 'login' && <LoginPage />}
      {currentPage === 'admin' && user && user.role !== 'admin' && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Accesso Negato</h2>
            <p className="text-gray-600 mb-4">Non hai i permessi per accedere alla sezione amministrazione.</p>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Torna al Dashboard
            </button>
          </div>
      )
        </div>
      )}
    </div>
  );
};

export default GiacenzeApp;