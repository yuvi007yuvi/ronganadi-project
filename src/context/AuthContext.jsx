import { createContext, useContext, useState, useEffect } from 'react';
import { adminAccount, defaultSurveyors } from '../data/mockData.js';
import { getApiBaseUrl } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ronganadi_user');
    const storedToken = localStorage.getItem('ronganadi_token');
    if (storedUser && storedToken && storedUser !== 'undefined') {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('ronganadi_user');
        localStorage.removeItem('ronganadi_token');
      }
    } else {
      localStorage.removeItem('ronganadi_user');
      localStorage.removeItem('ronganadi_token');
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }

      const { user, token } = data.data;
      console.log('API auth data:', data);
      console.log('Setting currentUser to:', user);
      
      setCurrentUser(user);
      localStorage.setItem('ronganadi_user', JSON.stringify(user));
      localStorage.setItem('ronganadi_token', token);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Network error or server unavailable' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ronganadi_user');
    localStorage.removeItem('ronganadi_token');
  };

  const updateProfile = async (updates) => {
    try {
      const token = localStorage.getItem('ronganadi_token');
      const response = await fetch(`${getApiBaseUrl()}/update_profile.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Update failed' };
      }

      const { user, token: newToken } = data.data;
      
      setCurrentUser(user);
      localStorage.setItem('ronganadi_user', JSON.stringify(user));
      if (newToken) {
        localStorage.setItem('ronganadi_token', newToken);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Network error or server unavailable' };
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isSurveyor = currentUser?.role === 'surveyor';

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateProfile, isAdmin, isSurveyor, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
