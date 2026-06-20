import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // { email, fullName, role }
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);  // true once we've checked storage

  // Restore session on page load
  useEffect(() => {
    const savedToken = sessionStorage.getItem('rs_token');
    const savedUser  = sessionStorage.getItem('rs_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setReady(true);
  }, []);

  const login = (authResponse) => {
    const { token, ...userData } = authResponse;
    sessionStorage.setItem('rs_token', token);
    sessionStorage.setItem('rs_user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('rs_token');
    sessionStorage.removeItem('rs_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);