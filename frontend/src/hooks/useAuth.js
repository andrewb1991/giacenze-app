// hooks/useAuth.js
import { useAppContext } from '../contexts/AppContext';
import { apiCall } from '../services/api';

export const useAuth = () => {
  const { state, dispatch } = useAppContext();
  const { user, token, currentPage, loading, error } = state;

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: '' });

      const data = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }, token);

      dispatch({ type: 'SET_TOKEN', payload: data.token });
      dispatch({ type: 'SET_USER', payload: data.user });
      
      // Redirect diverso in base al ruolo
      const redirectPage = data.user.role === 'admin' ? 'admin' : 'dashboard';
      dispatch({ type: 'SET_CURRENT_PAGE', payload: redirectPage });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const setCurrentPage = (page) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  return {
    user,
    token,
    currentPage,
    loading,
    error,
    login,
    logout,
    setCurrentPage,
    setError
  };
};