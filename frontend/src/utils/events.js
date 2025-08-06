// utils/events.js
// Sistema di eventi personalizzati per comunicazione tra componenti

/**
 * Invia un evento quando ordini o RDT vengono modificati
 * @param {Object} details - Dettagli dell'aggiornamento
 */
export const triggerOrdiniRdtUpdate = (details = {}) => {
  const event = new CustomEvent('ordini-rdt-updated', { 
    detail: { 
      timestamp: Date.now(), 
      ...details 
    } 
  });
  window.dispatchEvent(event);
  console.log('📡 Evento ordini-rdt-updated inviato', details);
};

/**
 * Ascolta gli eventi di aggiornamento ordini/RDT
 * @param {Function} callback - Funzione da chiamare quando l'evento viene ricevuto
 * @returns {Function} - Funzione di cleanup per rimuovere il listener
 */
export const listenToOrdiniRdtUpdates = (callback) => {
  const handleUpdate = (event) => {
    console.log('🔔 Evento ordini-rdt-updated ricevuto', event.detail);
    callback(event);
  };

  window.addEventListener('ordini-rdt-updated', handleUpdate);
  
  // Restituisce funzione di cleanup
  return () => {
    window.removeEventListener('ordini-rdt-updated', handleUpdate);
  };
};