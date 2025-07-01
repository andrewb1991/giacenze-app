// components/shared/ErrorMessage.js
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ErrorMessage = () => {
  const { error, setError } = useAuth();
  
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

export default ErrorMessage;