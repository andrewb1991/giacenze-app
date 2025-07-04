// services/api.js
const API_BASE = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://giacenze-app-production.up.railway.app/api'
  : 'http://localhost:7070/api';

export const apiCall = async (endpoint, options = {}, token = null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Errore HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
};

export const downloadExcelReport = async (filters, token) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.settimanaId) queryParams.append('settimanaId', filters.settimanaId);
    if (filters.poloId) queryParams.append('poloId', filters.poloId);
    if (filters.mezzoId) queryParams.append('mezzoId', filters.mezzoId);
    if (filters.userId) queryParams.append('userId', filters.userId);

    const response = await fetch(`${API_BASE}/reports/excel?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Errore nel download del report');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_giacenze_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true, message: 'Report scaricato con successo' };
  } catch (err) {
    throw new Error('Errore nel download del report: ' + err.message);
  }
};