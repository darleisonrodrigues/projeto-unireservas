// Tipos para o sistema de perfis - preparado para backend
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  userType: 'cliente' | 'anunciante';
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile extends User {
  userType: 'cliente';
  university: string;
  course: string;
  semester: string;
  bio?: string;
  preferences: StudentPreferences;
  favoriteProperties: string[];
}

export interface AdvertiserProfile extends User {
  userType: 'anunciante';
  companyName: string;
  cnpj: string;
  description: string;
  address: string;
  website?: string;
  verified: boolean;
  rating: number;
  totalProperties: number;
  properties: string[];
}

export interface StudentPreferences {
  budget: string;
  roomType: 'kitnet' | 'quarto' | 'apartamento';
  amenities: string[];
  location?: string;
  maxDistance?: number;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  // Campos específicos do estudante
  university?: string;
  course?: string;
  semester?: string;
  bio?: string;
  preferences?: Partial<StudentPreferences>;
  // Campos específicos do anunciante
  companyName?: string;
  cnpj?: string;
  description?: string;
  address?: string;
  website?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ProfileContextType {
  currentUser: StudentProfile | AdvertiserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}