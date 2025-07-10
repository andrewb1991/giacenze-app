// // components/shared/ErrorMessage.js
// import React from 'react';
// import { AlertTriangle } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';

// const ErrorMessage = () => {
//   const { error, setError } = useAuth();
  
//   if (!error) return null;
  
//   return (
//     <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
//       <div className="flex items-start">
//         <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
//         <div className="flex-1">
//           <span className="text-sm">{error}</span>
//         </div>
//         <button
//           onClick={() => setError('')}
//           className="ml-4 text-red-500 hover:text-red-700 flex-shrink-0"
//         >
//           ×
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ErrorMessage;

// components/shared/ErrorMessage.js
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CheckCircle  } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';


const ErrorMessage = () => {
  const { error, setError } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Mouse tracking per effetti interattivi
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animazione di entrata/uscita
  useEffect(() => {
    if (error) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [error]);

  // Auto-dismiss dopo 5 secondi
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);
  
  if (!error) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Background Effects per il toast */}
      <div className="absolute inset-0">
        {/* Interactive Light Effect */}
        <div 
          className="absolute w-48 h-48 bg-gradient-radial from-red-400/20 to-transparent rounded-full pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 96,
            top: mousePosition.y - 96,
            filter: 'blur(30px)',
          }}
        />
      </div>

      <div className={`fixed top-4 right-4 max-w-md pointer-events-auto transform transition-all duration-500 ease-out ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}>
        <div className="glass-error-container p-4 rounded-2xl">
          <div className="flex items-start space-x-3">
            <div className="glass-error-icon p-2 rounded-xl flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/90 leading-relaxed">
                {error}
              </div>
            </div>
            <button
              onClick={() => setError('')}
              className="glass-close-button p-1 rounded-lg flex-shrink-0 hover:scale-110 transition-all duration-300"
            >
              <X className="w-4 h-4 text-white/70 hover:text-white" />
            </button>
          </div>

          {/* Progress bar per auto-dismiss */}
          <div className="mt-3 glass-progress-bg h-1 rounded-full overflow-hidden">
            <div className="glass-progress-fill h-full rounded-full animate-progress"></div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 glass-error-glow rounded-2xl -z-10 animate-pulse"></div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-error-container {
          background: rgba(68, 239, 134, 0.2);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(68, 239, 134, 0.2);
          box-shadow: 0 8px 32px rgba(68, 239, 134, 0.2);
        }

        .glass-error-icon {
          background: rgba(68, 239, 134, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(85, 171, 45, 0.3);
        }

        .glass-close-button {
          background: rgba(68, 239, 134, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(68, 239, 134, 0.2);
        }

        .glass-close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .glass-progress-bg {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
        }

        .glass-progress-fill {
          background: linear-gradient(90deg, rgba(68, 239, 134, 0.2), rgba(68, 239, 134, 0.2));
          backdrop-filter: blur(5px);
        }

        .glass-error-glow {
          background: rgba(239, 68, 68, 0.1);
          filter: blur(20px);
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        @keyframes progress {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }

        .animate-progress {
          animation: progress 5s linear forwards;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ErrorMessage;