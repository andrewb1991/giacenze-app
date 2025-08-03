// contexts/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  // Auth
  user: null,
  token: null,
  currentPage: 'login',
  
  // Loading & Error
  loading: false,
  error: '',
  dataLoaded: false,
  
  // User Data
  myGiacenze: [],
  myAssignments: [],
  selectedAssignment: null,
  myUtilizzi: [],
  
  // Admin Data
  allProducts: [],
  users: [],
  poli: [],
  mezzi: [],
  settimane: [],
  assegnazioni: [],
  allGiacenze: [],
  
  // Forms
  selectedUser: '',
  selectedUserForGiacenze: '',
  selectedWeekForGiacenze: '',
  giacenzeForm: {
    productId: '',
    quantitaAssegnata: '',
    quantitaMinima: '',
    note: '',
    aggiungiAlla: false,
    isGlobal: true,
    settimanaId: '',
    applicaATutteLeSettimane: false
  },
  assegnazioneForm: {
    userId: '',
    poloId: '',
    mezzoId: '',
    settimanaId: ''
  },
  reportFilters: {
    settimanaId: '',
    poloId: '',
    mezzoId: '',
    userId: ''
  },
  editAssignmentId: null,
  editForm: {
    poloId: '',
    mezzoId: '',
    settimanaId: ''
  },
  
  // Admin View
  adminView: 'overview',
  activeTab: 'giacenze'
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_DATA_LOADED':
      return { ...state, dataLoaded: action.payload };
    
    case 'SET_MY_GIACENZE':
      return { ...state, myGiacenze: action.payload };
    
    case 'SET_MY_ASSIGNMENTS':
      return { ...state, myAssignments: action.payload };
    
    case 'SET_SELECTED_ASSIGNMENT':
      return { ...state, selectedAssignment: action.payload };
    
    case 'SET_MY_UTILIZZI':
      return { ...state, myUtilizzi: action.payload };
    
    case 'SET_ALL_PRODUCTS':
      return { ...state, allProducts: action.payload };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_POLI':
      return { ...state, poli: action.payload };
    
    case 'SET_MEZZI':
      return { ...state, mezzi: action.payload };
    
    case 'SET_SETTIMANE':
      return { ...state, settimane: action.payload };
    
    case 'SET_ASSEGNAZIONI':
      return { ...state, assegnazioni: action.payload };
    
    case 'SET_ALL_GIACENZE':
      return { ...state, allGiacenze: action.payload };
    
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.payload };
    
    case 'SET_SELECTED_USER_FOR_GIACENZE':
      return { ...state, selectedUserForGiacenze: action.payload };
    
    case 'SET_GIACENZE_FORM':
      return { ...state, giacenzeForm: { ...state.giacenzeForm, ...action.payload } };
    
    case 'RESET_GIACENZE_FORM':
      return { 
        ...state, 
        giacenzeForm: {
          productId: '',
          quantitaAssegnata: '',
          quantitaMinima: '',
          note: '',
          aggiungiAlla: false,
          isGlobal: true,
          settimanaId: '',
          applicaATutteLeSettimane: false
        }
      };
    
    case 'SET_ASSEGNAZIONE_FORM':
      return { ...state, assegnazioneForm: { ...state.assegnazioneForm, ...action.payload } };
    
    case 'RESET_ASSEGNAZIONE_FORM':
      return {
        ...state,
        assegnazioneForm: {
          userId: '',
          poloId: '',
          mezzoId: '',
          settimanaId: ''
        }
      };
    
    case 'SET_REPORT_FILTERS':
      return { ...state, reportFilters: { ...state.reportFilters, ...action.payload } };
    
    case 'SET_EDIT_ASSIGNMENT_ID':
      return { ...state, editAssignmentId: action.payload };
    
    case 'SET_EDIT_FORM':
      return { ...state, editForm: { ...state.editForm, ...action.payload } };
    
    case 'SET_ADMIN_VIEW':
      return { ...state, adminView: action.payload };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'LOGOUT':
      return {
        ...initialState,
        currentPage: 'login',
        dataLoaded: false
      };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token')
  });

  // Effetto per salvare dati in localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [state.user]);

  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }
  }, [state.token]);

  const value = {
    state,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};