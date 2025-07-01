// components/admin/AdminStats.js
import React from 'react';
import { useGiacenze } from '../../hooks/useGiacenze';

const AdminStats = () => {
  const { users, allProducts, allGiacenze, assegnazioni } = useGiacenze();

  const operatorsCount = users.filter(u => u.role === 'user').length;
  const criticalGiacenzeCount = allGiacenze.filter(g => g.quantitaDisponibile <= g.quantitaMinima).length;

  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-2xl font-bold text-blue-600">{operatorsCount}</div>
        <div className="text-sm text-gray-600">Operatori</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-2xl font-bold text-green-600">{allProducts.length}</div>
        <div className="text-sm text-gray-600">Prodotti</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-2xl font-bold text-purple-600">{allGiacenze.length}</div>
        <div className="text-sm text-gray-600">Giacenze Assegnate</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-2xl font-bold text-red-600">{criticalGiacenzeCount}</div>
        <div className="text-sm text-gray-600">Sotto Soglia</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-2xl font-bold text-yellow-600">{assegnazioni.length}</div>
        <div className="text-sm text-gray-600">Assegnazioni</div>
      </div>
    </div>
  );
};

export default AdminStats;