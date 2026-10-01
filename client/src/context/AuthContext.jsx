import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const save = (u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); return u; };
  const login = async (email, password) => save((await api.post('/auth/login', { email, password })).data);
  const register = async (name, email, password) => save((await api.post('/auth/register', { name, email, password })).data);
  const updateProfile = async (data) => save((await api.put('/auth/profile', data)).data);
  const logout = () => { localStorage.removeItem('user'); setUser(null); };

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, []);

  return <AuthContext.Provider value={{ user, login, register, updateProfile, logout }}>{children}</AuthContext.Provider>;
}
