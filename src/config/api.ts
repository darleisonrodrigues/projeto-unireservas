// Configuração da API
export const API_CONFIG = {
  BASE_URL: 'https://backend-unireservas.onrender.com/', 
  ENDPOINTS: {
    // Autenticaçao (JWT tradicional)
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      VERIFY_TOKEN: '/api/auth/verify-token',
      REFRESH_TOKEN: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout'
    },
    // Autenticação Firebase
    AUTH_FIREBASE: {
      REGISTER: '/api/auth-firebase/register',
      VERIFY_TOKEN: '/api/auth-firebase/verify-token',
      ME: '/api/auth-firebase/me',
      LOGOUT: '/api/auth-firebase/logout'
    },
    // Propriedades
    PROPERTIES: {
      LIST: '/api/properties',
      CREATE: '/api/properties',
      GET_BY_ID: (id: string) => `/api/properties/${id}`,
      UPDATE: (id: string) => `/api/properties/${id}`,
      DELETE: (id: string) => `/api/properties/${id}`,
      SEARCH: '/api/properties/search'
    },
    // Anuncios / Listings
    LISTINGS: {
      LIST: '/api/listings',
      CREATE: '/api/listings',
      GET_BY_ID: (id: string) => `/api/listings/${id}`,
      UPDATE: (id: string) => `/api/listings/${id}`,
      DELETE: (id: string) => `/api/listings/${id}`,
      BY_USER: '/api/listings/user'
    },
    // Perfis
    PROFILES: {
      GET: '/api/profiles/me',
      UPDATE: '/api/profiles/me',
      GET_BY_ID: (id: string) => `/api/profiles/${id}`,
      UPLOAD_IMAGE: '/api/profiles/upload-image'
    }
  }
} as const;

// Tipos de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  details?: unknown;
}

// helper para construir URLs fix
export const buildUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// helper para verificar se é um erro da API
export const isApiError = (response: unknown): response is ApiError => {
  return response && typeof response === 'object' && response !== null && 
         'success' in response && response.success === false;
};