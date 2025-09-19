import { buildUrl, API_CONFIG, ApiResponse, ApiError, isApiError } from '@/config/api';

//     Tipos para autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: 'student' | 'advertiser';
  university?: string;
  course?: string;
  semester?: string;
  companyName?: string;
  cnpj?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    userType: 'student' | 'advertiser';
  };
  token: string;
  refreshToken: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    userType: 'student' | 'advertiser';
  };
}

// classe para gerenciar tokens
class TokenManager {
  private static readonly TOKEN_KEY = 'unireservas_token';
  private static readonly REFRESH_TOKEN_KEY = 'unireservas_refresh_token';
  private static readonly USER_KEY = 'unireservas_user';

  static setTokens(token: string, refreshToken: string, user: AuthResponse['user']) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getUser(): AuthResponse['user'] | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// função para fazer requisições com token
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = TokenManager.getToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(buildUrl(endpoint), config);
    const data = await response.json();

    if (!response.ok) {
      //se token expirou, tentar renovar
      if (response.status === 401 && token) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          // Tentar novamente com o token renovado
          const newToken = TokenManager.getToken();
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          const retryResponse = await fetch(buildUrl(endpoint), retryConfig);
          return retryResponse.json();
        } else {
          // Refresh falhou, redirecionar para login
          TokenManager.clearTokens();
          window.location.href = '/login';
          throw new Error('Sessão expirada');
        }
      }
      
      throw new Error(data.message || `Erro ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

//Função para renovar token
async function refreshAuthToken(): Promise<boolean> {
  const refreshToken = TokenManager.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data: ApiResponse<AuthResponse> = await response.json();
      if (data.success) {
        TokenManager.setTokens(
          data.data.token,
          data.data.refreshToken,
          data.data.user
        );
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

//serviços de autenticação
export const authService = {
  //fazer login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.success) {
      TokenManager.setTokens(
        response.data.token,
        response.data.refreshToken,
        response.data.user
      );
      return response.data;
    } else {
      throw new Error(response.message || 'Erro no login');
    }
  },

  // fazer registro
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (response.success) {
      TokenManager.setTokens(
        response.data.token,
        response.data.refreshToken,
        response.data.user
      );
      return response.data;
    } else {
      throw new Error(response.message || 'Erro no registro');
    }
  },

  // verificar se token é válido
  async verifyToken(): Promise<VerifyTokenResponse> {
    try {
      const response = await apiRequest<VerifyTokenResponse>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN
      );
      return response.data;
    } catch {
      return { valid: false };
    }
  },

  // gfazer logout
  async logout(): Promise<void> {
    try {
      await apiRequest(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } catch {
      // Ignorar erro no logout
    } finally {
      TokenManager.clearTokens();
    }
  },

  // verificar se está autenticado
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  },

  // obter usuário atual
  getCurrentUser(): AuthResponse['user'] | null {
    return TokenManager.getUser();
  },
};

export { TokenManager };