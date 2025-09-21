// projeto-unireservas/src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { authFirebaseService, AuthResponse, LoginCredentials, RegisterData } from "@/services/authFirebaseService";

interface AuthContextType {
  user: AuthResponse["user"] | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isProviderAvailable: (providerId: 'google.com' | 'apple.com') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializa verificando se há sessão válida
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const result = await authFirebaseService.verifyToken();
      if (result.valid && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authFirebaseService.login(credentials);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await authFirebaseService.register(data);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const response = await authFirebaseService.loginWithGoogle();
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const loginWithApple = async () => {
    setLoading(true);
    try {
      const response = await authFirebaseService.loginWithApple();
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authFirebaseService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        loginWithApple,
        register,
        logout,
        isAuthenticated: !!user,
        isProviderAvailable: authFirebaseService.isProviderAvailable.bind(authFirebaseService),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
