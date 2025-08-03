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

export const getCurrentWeekAssignment = (assignments) => {
  if (!assignments || assignments.length === 0) return null;
  
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Get the current week number using ISO week calculation
  const getISOWeek = (date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };
  
  const currentWeekNumber = getISOWeek(today);
  
  // Find assignment that matches current week and year
  const currentAssignment = assignments.find(assignment => {
    const settimana = assignment.settimanaId;
    if (!settimana || !settimana.numero || !settimana.anno) return false;
    
    return settimana.numero === currentWeekNumber && settimana.anno === currentYear;
  });
  
  // If no exact match, find assignments for current year first
  if (!currentAssignment) {
    const currentYearAssignments = assignments.filter(assignment => {
      const settimana = assignment.settimanaId;
      return settimana && settimana.anno === currentYear;
    });
    
    if (currentYearAssignments.length > 0) {
      // Sort current year assignments by week number
      currentYearAssignments.sort((a, b) => a.settimanaId.numero - b.settimanaId.numero);
      
      // Find the closest week (either current or next available)
      const closestWeek = currentYearAssignments.find(assignment => 
        assignment.settimanaId.numero >= currentWeekNumber
      ) || currentYearAssignments[currentYearAssignments.length - 1]; // Last week if all are past
      
      if (closestWeek) {
        return closestWeek;
      }
    }
    
    // If no current year assignments, try future years
    const futureAssignments = assignments.filter(assignment => {
      const settimana = assignment.settimanaId;
      return settimana && settimana.anno > currentYear;
    });
    
    if (futureAssignments.length > 0) {
      // Sort by year and week number, return the earliest
      futureAssignments.sort((a, b) => {
        const aSettimana = a.settimanaId;
        const bSettimana = b.settimanaId;
        
        if (aSettimana.anno !== bSettimana.anno) {
          return aSettimana.anno - bSettimana.anno;
        }
        return aSettimana.numero - bSettimana.numero;
      });
      
      return futureAssignments[0];
    }
  }
  
  return currentAssignment || assignments[0]; // Fallback to first assignment if nothing found
};

export const sortAssignmentsByCurrentWeekFirst = (assignments) => {
  if (!assignments || assignments.length === 0) return [];
  
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Get current week number using ISO standard
  const getISOWeek = (date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };
  
  const currentWeekNumber = getISOWeek(today);
  
  // Separate current week, current year weeks, and other weeks
  const currentWeek = [];
  const currentYearWeeks = [];
  const otherWeeks = [];
  
  assignments.forEach(assignment => {
    const settimana = assignment.settimanaId;
    if (!settimana || !settimana.numero || !settimana.anno) {
      otherWeeks.push(assignment);
      return;
    }
    
    if (settimana.anno === currentYear && settimana.numero === currentWeekNumber) {
      currentWeek.push(assignment);
    } else if (settimana.anno === currentYear) {
      currentYearWeeks.push(assignment);
    } else {
      otherWeeks.push(assignment);
    }
  });
  
  // Sort current year weeks by week number
  currentYearWeeks.sort((a, b) => a.settimanaId.numero - b.settimanaId.numero);
  
  // Sort other weeks by year then week number
  otherWeeks.sort((a, b) => {
    const aSettimana = a.settimanaId;
    const bSettimana = b.settimanaId;
    
    if (!aSettimana || !bSettimana) return 0;
    
    if (aSettimana.anno !== bSettimana.anno) {
      return aSettimana.anno - bSettimana.anno;
    }
    return aSettimana.numero - bSettimana.numero;
  });
  
  // Return: current week first, then rest of current year, then other years
  return [...currentWeek, ...currentYearWeeks, ...otherWeeks];
};

export const sortWeeksChronologically = (settimane) => {
  if (!settimane || settimane.length === 0) return [];
  
  // Sort all weeks in chronological order (past to future)
  return [...settimane].sort((a, b) => {
    if (!a || !b) return 0;
    
    // First sort by year
    if (a.anno !== b.anno) {
      return a.anno - b.anno;
    }
    
    // Then by week number
    return a.numero - b.numero;
  });
};

export const getCurrentWeekIndex = (settimane) => {
  if (!settimane || settimane.length === 0) return 0;
  
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Get current week number using ISO standard
  const getISOWeek = (date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };
  
  const currentWeekNumber = getISOWeek(today);
  
  // Find the index of the current week
  const currentWeekIndex = settimane.findIndex(settimana => 
    settimana && 
    settimana.anno === currentYear && 
    settimana.numero === currentWeekNumber
  );
  
  // If current week not found, find the closest future week
  if (currentWeekIndex === -1) {
    const futureWeekIndex = settimane.findIndex(settimana => 
      settimana && 
      (settimana.anno > currentYear || 
       (settimana.anno === currentYear && settimana.numero > currentWeekNumber))
    );
    
    return futureWeekIndex !== -1 ? futureWeekIndex : 0;
  }
  
  return currentWeekIndex;
};

export const getCurrentWeekFromList = (settimane) => {
  if (!settimane || settimane.length === 0) return null;
  
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Get current week number using ISO standard
  const getISOWeek = (date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };
  
  const currentWeekNumber = getISOWeek(today);
  
  // Find the exact current week
  const currentWeek = settimane.find(settimana => 
    settimana && 
    settimana.anno === currentYear && 
    settimana.numero === currentWeekNumber
  );
  
  if (currentWeek) return currentWeek;
  
  // If no exact match, find the closest future week
  const futureWeeks = settimane.filter(settimana => 
    settimana && 
    (settimana.anno > currentYear || 
     (settimana.anno === currentYear && settimana.numero > currentWeekNumber))
  );
  
  if (futureWeeks.length > 0) {
    // Sort and return the earliest future week
    futureWeeks.sort((a, b) => {
      if (a.anno !== b.anno) {
        return a.anno - b.anno;
      }
      return a.numero - b.numero;
    });
    return futureWeeks[0];
  }
  
  // Fallback to first available week
  return settimane[0] || null;
};

export const sortWeeksCenteredOnCurrent = (settimane) => {
  if (!settimane || settimane.length === 0) return [];
  
  // Simply return chronological order - earliest to latest
  return sortWeeksChronologically(settimane);
};