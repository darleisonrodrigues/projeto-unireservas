import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { authFirebaseService, AuthResponse, RegisterData } from '@/services/authFirebaseService';

// Tipos do contexto de autenticação Firebase
interface AuthFirebaseContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Criar contexto
const AuthFirebaseContext = createContext<AuthFirebaseContextType | undefined>(undefined);

// Provider do contexto de autenticação Firebase
export const AuthFirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação na inicialização
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Verificar se ha token armazenado
      if (!authFirebaseService.isAuthenticated()) {
        setUser(null);
        return;
      }

      // Primeiro, tentar buscar perfil completo
      const userProfile = await authFirebaseService.fetchUserProfile();
      if (userProfile) {
        setUser(userProfile);
        return;
      }

      // Se falhou, verificar se o token é válido
      const result = await authFirebaseService.verifyToken();
      if (result.valid && result.user) {
        setUser(result.user);
      } else {
        // Token inválido, fazer logout
        await authFirebaseService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação Firebase:', error);
      await authFirebaseService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authFirebaseService.login({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Erro no login Firebase:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authFirebaseService.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('Erro no registro Firebase:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authFirebaseService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout Firebase:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
    }
  };

  const value: AuthFirebaseContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthFirebaseContext.Provider value={value}>
      {children}
    </AuthFirebaseContext.Provider>
  );
};

// Hook para usar o contexto Firebase
export const useAuthFirebase = () => {
  const context = useContext(AuthFirebaseContext);
  if (context === undefined) {
    throw new Error('useAuthFirebase must be used within an AuthFirebaseProvider');
  }
  return context;
};

// Exportar contexto para uso em hook separado
export { AuthFirebaseContext };