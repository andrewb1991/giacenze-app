const getApiBaseUrl = () => {
  // Priorità: variabile ambiente > fallback per ambiente
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback basato su NODE_ENV
  return process.env.NODE_ENV === 'production' 
    ? 'https://giacenze-app-production.up.railway.app/api'
    : 'http://localhost:7070/api';
};

const API_BASE = getApiBaseUrl();

// 🐛 Debug info
console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 API Base URL: ${API_BASE}`);
console.log(`📝 REACT_APP_API_URL: ${process.env.REACT_APP_API_URL || 'non definita'}`);

export const apiCall = async (endpoint, options = {}, token = null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };
    
    const url = `${API_BASE}${endpoint}`;
    console.log(`📡 API Call: ${config.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Gestisci specificatamente gli errori di autorizzazione
      if (response.status === 401) {
        throw new Error('Token non valido');
      }
      
      throw new Error(errorData.message || `Errore HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('❌ API Error:', err);
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
    if (filters.postazioneId) queryParams.append('postazioneId', filters.postazioneId);

    const url = `${API_BASE}/reports/excel?${queryParams}`;
    console.log(`📊 Download Excel: ${url}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Errore nel download del report');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `report_giacenze_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
    
    console.log('✅ Report Excel scaricato con successo');
    return { success: true, message: 'Report scaricato con successo' };
  } catch (err) {
    console.error('❌ Download Error:', err);
    throw new Error('Errore nel download del report: ' + err.message);
  }
};

// 🆕 Funzione helper per download generico (compatibilità futura)
export const downloadFile = async (endpoint, filename, token = null) => {
  try {
    const url = `${API_BASE}${endpoint}`;
    console.log(`📥 Download File: ${url}`);
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { 
      method: 'GET',
      headers 
    });

    if (!response.ok) {
      throw new Error(`Errore download: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    console.log(`✅ File ${filename} scaricato con successo`);
  } catch (error) {
    console.error(`❌ Download Error: ${endpoint}`, error);
    throw error;
  }
};