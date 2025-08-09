// components/shared/BackButton.js
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { useTheme } from '../../hooks/useTheme';

const BackButton = ({ 
  label = "Indietro", 
  onClick = null, 
  customTarget = null,
  className = "",
  showIcon = true 
}) => {
  const { navigateBack, navigateForward, canGoBack } = useNavigation();
  const { isLight } = useTheme();

  const handleClick = async () => {
    if (onClick) {
      // Usa callback personalizzato
      onClick();
    } else if (customTarget) {
      // Naviga verso target specifico
      await navigateForward(customTarget);
    } else if (canGoBack) {
      // Naviga indietro nella cronologia
      await navigateBack();
    }
  };

  // Non mostrare il pulsante se non può andare indietro e non ha azioni personalizzate
  if (!canGoBack && !onClick && !customTarget) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`glass-back-button px-3 py-2 rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 ${
        isLight ? 'text-black' : 'text-white'
      } ${className}`}
      title={label}
    >
      {showIcon && <ArrowLeft className="w-4 h-4" />}
      <span>{label}</span>
      
      <style jsx>{`
        .glass-back-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-back-button:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .glass-back-button:active {
          transform: scale(0.98);
        }
      `}</style>
    </button>
  );
};

export default BackButton;