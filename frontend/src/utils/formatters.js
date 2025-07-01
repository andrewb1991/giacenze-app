// utils/formatters.js

export const formatWeek = (settimana) => {
  if (!settimana) {
    return 'Settimana non disponibile';
  }
  
  if (!settimana.numero || !settimana.anno) {
    return 'Settimana non valida';
  }
  
  if (!settimana.dataInizio || !settimana.dataFine) {
    return `Settimana ${settimana.numero}/${settimana.anno}`;
  }
  
  try {
    const startDate = new Date(settimana.dataInizio);
    const endDate = new Date(settimana.dataFine);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return `Settimana ${settimana.numero}/${settimana.anno}`;
    }
    
    const formatDate = (date) => {
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)} ${settimana.anno}`;
  } catch (error) {
    console.warn('Errore formattazione settimana:', error);
    return `Settimana ${settimana.numero}/${settimana.anno}`;
  }
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('it-IT');
};

export const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('it-IT'),
      time: date.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    };
  } catch (error) {
    return {
      date: 'Data non valida',
      time: 'Ora non valida'
    };
  }
};

export const calculatePercentage = (current, total) => {
  if (total === 0) return 0;
  return (current / total) * 100;
};

export const getStatusClass = (isUnderThreshold) => {
  return isUnderThreshold 
    ? 'bg-red-100 text-red-800' 
    : 'bg-green-100 text-green-800';
};

export const getProgressBarColor = (percentage) => {
  if (percentage <= 20) return 'bg-red-500';
  if (percentage <= 40) return 'bg-yellow-500';
  return 'bg-green-500';
};