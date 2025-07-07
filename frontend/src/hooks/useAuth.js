// hooks/useAuth.js - Versione con persistenza del login
import { useState, useEffect, createContext, useContext } from 'react';
import { apiCall } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Importante: inizia con true
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // 🔑 Chiavi per localStorage
  const STORAGE_KEYS = {
    TOKEN: 'giacenze_token',
    USER: 'giacenze_user',
    CURRENT_PAGE: 'giacenze_current_page'
  };

  // 💾 Funzioni per gestire localStorage
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Errore nel salvare in localStorage:', error);
    }
  };

  const getFromStorage = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Errore nel leggere da localStorage:', error);
      return null;
    }
  };

  const removeFromStorage = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Errore nel rimuovere da localStorage:', error);
    }
  };

  // 🚀 Inizializzazione - Controlla se c'è un login salvato
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      const savedToken = getFromStorage(STORAGE_KEYS.TOKEN);
      const savedUser = getFromStorage(STORAGE_KEYS.USER);
      const savedPage = getFromStorage(STORAGE_KEYS.CURRENT_PAGE);

      if (savedToken && savedUser) {
        // Verifica che il token sia ancora valido
        try {
          // Fai una chiamata API di test per verificare il token
          await apiCall('/test', {}, savedToken);
          
          // Token valido, ripristina la sessione
          setToken(savedToken);
          setUser(savedUser);
          setCurrentPage(savedPage || 'dashboard');
          setError('');
        } catch (error) {
          // Token scaduto o non valido, pulisci tutto
          console.log('Token scaduto, eseguo logout automatico');
          clearAuthData();
          setError('Sessione scaduta, effettua nuovamente il login');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // 🧹 Funzione per pulire tutti i dati di autenticazione
  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    setCurrentPage('dashboard');
    removeFromStorage(STORAGE_KEYS.TOKEN);
    removeFromStorage(STORAGE_KEYS.USER);
    removeFromStorage(STORAGE_KEYS.CURRENT_PAGE);
  };

  // 🔐 Funzione di login
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('https://giacenze-app-production.up.railway.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore durante il login');
      }

      // Salva i dati di autenticazione
      setToken(data.token);
      setUser(data.user);
      
      // Determina la pagina iniziale in base al ruolo
      const initialPage = data.user.role === 'admin' ? 'admin' : 'dashboard';
      setCurrentPage(initialPage);

      // 💾 Salva tutto in localStorage
      saveToStorage(STORAGE_KEYS.TOKEN, data.token);
      saveToStorage(STORAGE_KEYS.USER, data.user);
      saveToStorage(STORAGE_KEYS.CURRENT_PAGE, initialPage);

      setError('');
    } catch (err) {
      setError(err.message);
      clearAuthData(); // Pulisci in caso di errore
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Funzione di logout
  const logout = () => {
    clearAuthData();
    setError('');
    // Non serve reindirizzare, il componente App gestirà il cambio di vista
  };

  // 📄 Aggiorna pagina corrente e salva in localStorage
  const updateCurrentPage = (page) => {
    setCurrentPage(page);
    saveToStorage(STORAGE_KEYS.CURRENT_PAGE, page);
  };

  // 🔄 Funzione per verificare periodicamente la validità del token
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        await apiCall('/test', {}, token);
      } catch (error) {
        console.log('Token verification failed, logging out');
        logout();
        setError('Sessione scaduta');
      }
    };

    // Verifica ogni 5 minuti
    const interval = setInterval(verifyToken, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [token]);

  // 👂 Listener per il beforeunload (opzionale)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Salva la pagina corrente prima di chiudere
      if (token && user) {
        saveToStorage(STORAGE_KEYS.CURRENT_PAGE, currentPage);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [token, user, currentPage]);

  const value = {
    user,
    token,
    loading,
    error,
    currentPage,
    login,
    logout,
    setError,
    setCurrentPage: updateCurrentPage,
    // Funzioni utili aggiuntive
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};