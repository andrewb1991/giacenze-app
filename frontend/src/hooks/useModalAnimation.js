// hooks/useModalAnimation.js - Hook per gestire animazioni modali
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizzato per gestire le animazioni di apertura/chiusura dei modali
 * @param {boolean} isOpen - Stato del modal (aperto/chiuso)
 * @param {function} onClose - Callback da chiamare quando il modal si chiude (opzionale)
 * @param {number} duration - Durata delle animazioni in ms (default: 300)
 * @returns {object} - Oggetti e funzioni per gestire le animazioni
 */
export const useModalAnimation = (isOpen, onClose = null, duration = 300) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Effetto per gestire l'apertura del modal
  useEffect(() => {
    if (isOpen && !isVisible) {
      // Apertura: rendi visibile e inizia animazione di entrata
      setIsVisible(true);
      setIsEntering(true);
      setIsExiting(false);
      
      // Aggiungi classe per prevenire scroll del body
      document.body.classList.add('modal-open');
      
      // Rimuovi classe entering dopo l'animazione
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible, duration]);

  // Effetto per gestire la chiusura del modal
  useEffect(() => {
    if (!isOpen && isVisible) {
      // Chiusura: inizia animazione di uscita
      setIsExiting(true);
      setIsEntering(false);
      
      // Dopo l'animazione, nascondi il modal e chiama onClose
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
        document.body.classList.remove('modal-open');
        if (onClose) {
          onClose();
        }
      }, duration - 50); // Leggermente prima per smoother transition

      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible, duration, onClose]);

  // Funzione per chiusura animata
  const handleAnimatedClose = useCallback(() => {
    if (isVisible && !isExiting) {
      setIsExiting(true);
      setIsEntering(false);
    }
  }, [isVisible, isExiting]);

  // Funzione per chiusura animata con callback
  const closeModal = useCallback((callback) => {
    if (isVisible && !isExiting) {
      setIsExiting(true);
      setIsEntering(false);
      
      if (callback) {
        const timer = setTimeout(() => {
          callback();
        }, duration - 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, isExiting, duration]);

  // Funzione per gestire click su backdrop
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleAnimatedClose();
    }
  }, [handleAnimatedClose]);

  // Funzione per gestire ESC key
  const handleEscKey = useCallback((e) => {
    if (e.key === 'Escape') {
      handleAnimatedClose();
    }
  }, [handleAnimatedClose]);

  // Effetto per gestire ESC key
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isVisible, handleEscKey]);

  // Classi CSS per le animazioni
  const getModalClasses = () => {
    const classes = ['modal-transition'];
    if (isEntering) classes.push('modal-entering');
    if (isExiting) classes.push('modal-exiting');
    return classes.join(' ');
  };

  const getBackdropClasses = () => {
    const classes = ['backdrop-transition'];
    if (isEntering) classes.push('backdrop-entering');
    if (isExiting) classes.push('backdrop-exiting');
    return classes.join(' ');
  };

  return {
    // Stati
    isVisible,
    isEntering,
    isExiting,
    
    // Funzioni
    handleAnimatedClose,
    closeModal,
    handleBackdropClick,
    handleEscKey,
    
    // Classi CSS
    modalClass: getModalClasses(),
    backdropClass: getBackdropClasses(),
    modalClasses: getModalClasses(),
    backdropClasses: getBackdropClasses(),
    
    // Props per il modal
    modalProps: {
      className: getModalClasses(),
      'data-entering': isEntering,
      'data-exiting': isExiting,
    },
    
    // Props per il backdrop
    backdropProps: {
      className: getBackdropClasses(),
      onClick: handleBackdropClick,
      'data-entering': isEntering,
      'data-exiting': isExiting,
    }
  };
};

/**
 * Hook per gestire animazioni staggered (elementi che appaiono in sequenza)
 * @param {Array} items - Array di elementi da animare
 * @param {boolean} isOpen - Se il modal è aperto o chiuso
 * @param {number} delay - Ritardo tra ogni elemento (default: 50ms)
 * @returns {Array} - Array con oggetti che contengono classi CSS per ogni elemento
 */
export const useStaggerAnimation = (items, isOpen = true, delay = 50) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      setIsAnimating(true);
      const totalDuration = items.length * delay + 400; // 400ms per l'animazione base
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, totalDuration);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [items.length, delay, isOpen]);

  // Restituisce un array di oggetti con le classi per ogni elemento
  return items.map((_, index) => ({
    class: isAnimating ? 'stagger-item' : '',
    style: isAnimating ? { animationDelay: `${index * delay}ms` } : {},
    isAnimating
  }));
};

/**
 * Hook per gestire animazioni di form (slide down/up)
 * @param {boolean} isOpen - Stato del form
 * @param {function} onAnimationEnd - Callback chiamato al termine dell'animazione
 * @returns {object} - Stati e classi per l'animazione
 */
export const useFormAnimation = (isOpen, onAnimationEnd) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
        if (onAnimationEnd) onAnimationEnd();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible, onAnimationEnd]);

  const getFormClasses = () => {
    const classes = [];
    if (isVisible && !isClosing) classes.push('form-slide-down');
    if (isClosing) classes.push('form-slide-up');
    return classes.join(' ');
  };

  return {
    isVisible,
    isClosing,
    formClasses: getFormClasses()
  };
};

export default useModalAnimation;