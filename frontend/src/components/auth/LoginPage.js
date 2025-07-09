// // components/auth/LoginPage.js
// import React, { useState } from 'react';
// import { Package2, AlertTriangle } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';

// const LoginPage = () => {
//   const [credentials, setCredentials] = useState({ username: '', password: '' });
//   const { login, loading, error } = useAuth();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (credentials.username && credentials.password) {
//       login(credentials);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
//         <div className="text-center mb-8">
//           <Package2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-gray-800">Gestione Giacenze Personali</h1>
//           <p className="text-gray-600">Accedi al sistema</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
//             <AlertTriangle className="w-5 h-5 inline mr-2" />
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 value={credentials.username}
//                 onChange={(e) => setCredentials({...credentials, username: e.target.value})}
//                 required
//                 placeholder="Inserisci username"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 value={credentials.password}
//                 onChange={(e) => setCredentials({...credentials, password: e.target.value})}
//                 required
//                 placeholder="Inserisci password"
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
//           >
//             {loading ? 'Accesso...' : 'Accedi'}
//           </button>
//         </form>

//         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//           <p className="text-sm text-gray-600 mb-2">Credenziali di test:</p>
//           <p className="text-xs text-gray-500">Admin: admin / password123</p>
//           <p className="text-xs text-gray-500">User: operatore1 / password123</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

// components/auth/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Package2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { login, loading, error } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.username && credentials.password) {
      login(credentials);
    }
  };

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Background Effects */}
        <div className="absolute inset-0">
          {/* Animated Gradient Orbs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          
          {/* Interactive Light Effect */}
          <div 
            className="absolute w-96 h-96 bg-gradient-radial from-white/20 to-transparent rounded-full pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
              filter: 'blur(40px)',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="glass-card-large p-8 w-full max-w-md rounded-3xl">
            <div className="text-center mb-8">
              <div className="glass-icon w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                <Package2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Gestione Giacenze Personali</h1>
              <p className="text-white/70 text-lg">Accedi al sistema</p>
            </div>

            {error && (
              <div className="glass-error-card mb-6 p-4 rounded-2xl border border-red-400/30">
                <div className="flex items-center text-red-300">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Username
                  </label>
                  <div className="glass-input-container">
                    <input
                      type="text"
                      className="glass-input w-full p-4 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={credentials.username}
                      onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                      required
                      placeholder="Inserisci username"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Password
                  </label>
                  <div className="glass-input-container relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="glass-input w-full p-4 pr-12 rounded-2xl bg-transparent border-0 outline-none text-white placeholder-white/50"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      required
                      placeholder="Inserisci password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glass-button-primary w-full mt-8 py-4 px-6 rounded-2xl text-white font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Accesso...' : 'Accedi'}
              </button>
            </form>

            <div className="mt-8">
              <div className="glass-card p-4 rounded-2xl">
                <p className="text-sm text-white/70 mb-3 font-medium">Credenziali di test:</p>
                <div className="space-y-1">
                  <p className="text-xs text-white/60 font-mono">Admin: admin / password123</p>
                  <p className="text-xs text-white/60 font-mono">User: operatore1 / password123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .glass-card-large {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
        }

        .glass-icon {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glass-input-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 1rem;
          transition: all 0.3s ease;
        }

        .glass-input {
          transition: all 0.3s ease;
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.12);
        }

        .glass-input-container:focus-within {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
          background: rgba(255, 255, 255, 0.12);
        }

        .glass-button-primary {
          background: rgba(59, 130, 246, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
        }

        .glass-button-primary:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.4);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.3);
        }

        .glass-error-card {
          background: rgba(239, 68, 68, 0.1);
          backdrop-filter: blur(15px);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.1);
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .glass-card-large {
            margin: 1rem;
            padding: 1.5rem;
          }
          
          .glass-icon {
            width: 4rem;
            height: 4rem;
          }
          
          .glass-icon svg {
            width: 2rem;
            height: 2rem;
          }
          
          h1 {
            font-size: 1.5rem;
          }
        }

        /* Loading animation */
        @keyframes pulse-glass {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        .glass-button-primary:disabled {
          animation: pulse-glass 2s infinite;
        }

        /* Smooth transitions for all glass elements */
        .glass-card,
        .glass-card-large,
        .glass-input-container,
        .glass-button-primary {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced focus states */
        .glass-input:focus {
          outline: none;
        }

        /* Custom scrollbar for consistency */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default LoginPage;