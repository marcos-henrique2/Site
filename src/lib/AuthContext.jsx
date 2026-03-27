import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Verifica se você já logou antes
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mallki_admin_logged') === 'true';
  });

  // Função de login com uma senha de teste
  const login = (email, password) => {
    // Por enquanto, a senha está aqui no código. 
    // Quando formos para o banco de dados real, isso será verificado na nuvem!
    if (email === 'admin@mallkiprint.com' && password === 'mallki123') {
      setIsAuthenticated(true);
      localStorage.setItem('mallki_admin_logged', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mallki_admin_logged');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro do AuthProvider');
  return context;
};