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
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
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

      // Verificar se há token no localStorage primeiro
      const token = authFirebaseService.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      // Tentar buscar perfil do localStorage primeiro (mais rápido)
      const cachedProfile = localStorage.getItem('user_profile');
      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile);
          setUser(parsedProfile);

          // Verificar se o token ainda é válido em background
          authFirebaseService.verifyToken().then(result => {
            if (!result.valid) {
              // Token inválido, fazer logout
              setUser(null);
              localStorage.removeItem('user_profile');
              localStorage.removeItem('firebase_token');
            }
          }).catch(() => {
            // Em caso de erro, manter o usuário logado mas verificar na próxima ação
          });

          return;
        } catch (e) {
          console.warn('Erro ao parsear perfil em cache:', e);
        }
      }

      // Se não há cache, buscar perfil completo
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
      // Salvar perfil no localStorage para persistir sessão
      localStorage.setItem('user_profile', JSON.stringify(response.user));
    } catch (error) {
      console.error('Erro no login Firebase:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authFirebaseService.register(data);
      setUser(response.user);
      // Salvar perfil no localStorage para persistir sessão
      localStorage.setItem('user_profile', JSON.stringify(response.user));
    } catch (error) {
      console.error('Erro no registro Firebase:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authFirebaseService.logout();
      setUser(null);
      // Limpar localStorage
      localStorage.removeItem('user_profile');
      localStorage.removeItem('firebase_token');
    } catch (error) {
      console.error('Erro no logout Firebase:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
      localStorage.removeItem('user_profile');
      localStorage.removeItem('firebase_token');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const response = await authFirebaseService.loginWithGoogle();
      setUser(response.user);
      // Salvar perfil no localStorage para persistir sessão
      localStorage.setItem('user_profile', JSON.stringify(response.user));
    } catch (error) {
      console.error('Erro no login com Google:', error);
      throw error;
    }
  };

  const loginWithApple = async () => {
    try {
      const response = await authFirebaseService.loginWithApple();
      setUser(response.user);
      // Salvar perfil no localStorage para persistir sessão
      localStorage.setItem('user_profile', JSON.stringify(response.user));
    } catch (error) {
      console.error('Erro no login com Apple:', error);
      throw error;
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
    loginWithGoogle,
    loginWithApple,
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