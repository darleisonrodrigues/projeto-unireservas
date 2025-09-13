// Central de configuração de rotas - facilita manutenção e navegação
export const ROUTES = {
  // Páginas principais
  HOME: '/',
  
  // Autenticação
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Imóveis
  PROPERTIES: {
    LIST: '/properties',
    SEARCH: '/properties/search',
    DETAILS: (id: string) => `/properties/${id}`,
    FAVORITES: '/properties/favorites',
  },
  
  // Anúncios (para proprietários/anunciantes)
  LISTINGS: {
    CREATE: '/listings/create',
    MANAGE: '/listings/manage',
    EDIT: (id: string) => `/listings/${id}/edit`,
    ANALYTICS: '/listings/analytics',
  },
  
  // Perfis
  PROFILE: {
    CLIENT: '/profile/client',
    ADVERTISER: '/profile/advertiser',
    SETTINGS: '/profile/settings',
    EDIT: '/profile/edit',
  },
  
  // Mensagens e comunicação
  MESSAGES: {
    INBOX: '/messages',
    CHAT: (userId: string) => `/messages/${userId}`,
    NOTIFICATIONS: '/notifications',
  },
  
  // Páginas de suporte
  SUPPORT: {
    HELP: '/help',
    CONTACT: '/contact',
    FAQ: '/faq',
    TERMS: '/terms',
    PRIVACY: '/privacy',
  },
  
  // Admin (futuro)
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    PROPERTIES: '/admin/properties',
    REPORTS: '/admin/reports',
  },
  
  // Páginas especiais
  NOT_FOUND: '/404',
} as const;

// Helper para navegação type-safe
export const navigate = {
  home: () => ROUTES.HOME,
  login: () => ROUTES.AUTH.LOGIN,
  register: () => ROUTES.AUTH.REGISTER,
  properties: () => ROUTES.PROPERTIES.LIST,
  propertyDetails: (id: string) => ROUTES.PROPERTIES.DETAILS(id),
  createListing: () => ROUTES.LISTINGS.CREATE,
  clientProfile: () => ROUTES.PROFILE.CLIENT,
  advertiserProfile: () => ROUTES.PROFILE.ADVERTISER,
  messages: () => ROUTES.MESSAGES.INBOX,
  chat: (userId: string) => ROUTES.MESSAGES.CHAT(userId),
};