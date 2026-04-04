import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '@/api/base44Client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Controla a tela de carregamento

  // Quando o site liga, ele verifica no Supabase se você já estava logado antes
  useEffect(() => {
    const verifySession = async () => {
      try {
        const session = await apiClient.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      await apiClient.auth.login(email, password);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro do AuthProvider');
  return context;
};