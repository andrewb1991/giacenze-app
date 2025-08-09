// hooks/useNavigation.js
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const { setCurrentPage, currentPage } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationDirection, setNavigationDirection] = useState('forward'); // 'forward' | 'back'
  const [navigationHistory, setNavigationHistory] = useState([]);

  // Inizializza la cronologia con la pagina corrente
  useEffect(() => {
    if (currentPage && navigationHistory.length === 0) {
      setNavigationHistory([currentPage]);
      console.log('🏠 Initialized navigation history with:', currentPage);
    }
  }, [currentPage, navigationHistory.length]);

  // Naviga con animazione
  const navigateWithAnimation = (targetPage, direction = 'forward', preloadDelay = 1000) => {
    return new Promise((resolve) => {
      console.log(`🧭 Navigating to ${targetPage} (${direction}) with ${preloadDelay}ms preload`);
      
      // Prima cambia la pagina (senza animazione) per preloadare
      setCurrentPage(targetPage);
      
      // Aggiorna la cronologia
      setNavigationHistory(prev => {
        const newHistory = [...prev];
        if (direction === 'forward') {
          newHistory.push(targetPage);
        } else if (direction === 'back' && newHistory.length > 1) {
          newHistory.pop();
        }
        console.log('📚 Navigation history:', newHistory);
        return newHistory;
      });
      
      // Aspetta che il componente si carichi completamente
      setTimeout(() => {
        console.log(`⏳ Preload completed, starting animation for ${targetPage}`);
        setIsNavigating(true);
        setNavigationDirection(direction);
        
        // Termina l'animazione
        setTimeout(() => {
          setIsNavigating(false);
          console.log(`✅ Navigation animation completed to ${targetPage}`);
          resolve();
        }, 300);
      }, preloadDelay);
    });
  };

  // Naviga indietro
  const navigateBack = () => {
    if (navigationHistory.length > 1) {
      const previousPage = navigationHistory[navigationHistory.length - 2];
      return navigateWithAnimation(previousPage, 'back');
    }
    return Promise.resolve();
  };

  // Naviga in avanti
  const navigateForward = (targetPage) => {
    return navigateWithAnimation(targetPage, 'forward');
  };

  // Reset della cronologia (utile dopo login/logout)
  const resetHistory = (initialPage) => {
    setNavigationHistory([initialPage]);
  };

  const value = {
    isNavigating,
    navigationDirection,
    navigationHistory,
    navigateWithAnimation,
    navigateBack,
    navigateForward,
    resetHistory,
    canGoBack: navigationHistory.length > 1
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};