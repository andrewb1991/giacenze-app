// components/shared/NavigationButton.js
import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { useTheme } from '../../hooks/useTheme';

const NavigationButton = ({ 
  targetPage, 
  children, 
  className = "",
  direction = 'forward',
  onClick = null,
  ...props 
}) => {
  const { navigateForward, navigateBack } = useNavigation();
  const { isLight } = useTheme();

  const handleClick = async (e) => {
    if (onClick) {
      // Esegui callback personalizzato
      onClick(e);
    } else if (targetPage) {
      // Naviga verso la pagina target
      if (direction === 'back') {
        await navigateBack();
      } else {
        await navigateForward(targetPage);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`navigation-button ${className}`}
      {...props}
    >
      {children}
      
      <style jsx>{`
        .navigation-button {
          transition: all 0.15s ease-out;
        }
        
        .navigation-button:hover {
          transform: scale(1.02);
        }
        
        .navigation-button:active {
          transform: scale(0.98);
        }
      `}</style>
    </button>
  );
};

export default NavigationButton;