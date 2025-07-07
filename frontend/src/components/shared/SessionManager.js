// components/shared/SessionManager.js - Gestione avanzata della sessione
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const SessionManager = () => {
  const { logout, setError } = useAuth();
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // ⏰ Gestione scadenza sessione (24 ore dal JWT)
  useEffect(() => {
    const token = localStorage.getItem('giacenze_token');
    if (!token) return;

    try {
      // Decodifica il JWT per ottenere la scadenza
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Converti in millisecondi
      
      const checkExpiration = () => {
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;
        
        // Avvisa 5 minuti prima della scadenza
        if (timeUntilExpiration <= 5 * 60 * 1000 && timeUntilExpiration > 0) {
          setSessionWarning(true);
          setTimeLeft(Math.ceil(timeUntilExpiration / 1000 / 60)); // Minuti rimanenti
        } else if (timeUntilExpiration <= 0) {
          // Sessione scaduta
          logout();
          setError('Sessione scaduta. Effettua nuovamente il login.');
        }
      };

      // Controlla immediatamente
      checkExpiration();
      
      // Controlla ogni minuto
      const interval = setInterval(checkExpiration, 60 * 1000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Errore nel parsing del token:', error);
    }
  }, [logout, setError]);

  // 🔄 Funzione per estendere la sessione (se implementata nel backend)
  const extendSession = async () => {
    try {
      // Qui potresti implementare una chiamata API per rinnovare il token
      // const newToken = await apiCall('/refresh-token', {}, token);
      // localStorage.setItem('giacenze_token', newToken);
      
      setSessionWarning(false);
      setTimeLeft(null);
      setError('Sessione estesa con successo!');
    } catch (error) {
      setError('Errore nell\'estensione della sessione');
    }
  };

  // 📱 Gestione visibilità della pagina
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Quando l'utente torna sulla pagina, verifica la sessione
        const token = localStorage.getItem('giacenze_token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            
            if (Date.now() >= expirationTime) {
              logout();
              setError('Sessione scaduta durante l\'assenza');
            }
          } catch (error) {
            console.error('Errore nella verifica del token:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [logout, setError]);

  // Non renderizzare nulla se non c'è avviso
  if (!sessionWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-start">
        <Clock className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium">Sessione in scadenza</div>
          <div className="text-sm">
            La tua sessione scadrà tra {timeLeft} minuti.
          </div>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={extendSession}
              className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 flex items-center"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Estendi
            </button>
            <button
              onClick={() => setSessionWarning(false)}
              className="text-xs text-yellow-700 hover:text-yellow-900"
            >
              Ignora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;