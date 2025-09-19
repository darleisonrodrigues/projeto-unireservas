import { buildUrl, API_CONFIG, ApiResponse } from '@/config/api';
import { TokenManager } from './authService';
import { StudentProfile, AdvertiserProfile } from '@/types/profile';

//tipos unificados para perfil
export type ProfileData = StudentProfile | AdvertiserProfile;

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  //campos específicos para estudante
  university?: string;
  course?: string;
  semester?: string;
  bio?: string;
  preferences?: {
    maxPrice?: number;
    preferredLocation?: string;
    roomType?: string;
    amenities?: string[];
  };
  //campos específicos para anunciante
  companyName?: string;
  cnpj?: string;
  description?: string;
  website?: string;
  address?: string;
}

export interface UploadImageResponse {
  imageUrl: string;
}

//função auxiliar para fazer requisições autenticadas
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
      throw new Error(data.message || `Erro ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

//serviços de perfil
export const profileService = {
  //obter perfil do usuário atual
  async getMyProfile(): Promise<ProfileData> {
    const response = await apiRequest<ProfileData>(
      API_CONFIG.ENDPOINTS.PROFILES.GET
    );
    return response.data;
  },

  //obter perfil por ID
  async getById(id: string): Promise<ProfileData> {
    const response = await apiRequest<ProfileData>(
      API_CONFIG.ENDPOINTS.PROFILES.GET_BY_ID(id)
    );
    return response.data;
  },

  //atualizar perfil
  async updateProfile(data: UpdateProfileData): Promise<ProfileData> {
    const response = await apiRequest<ProfileData>(
      API_CONFIG.ENDPOINTS.PROFILES.UPDATE,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  //upload de imagem do perfil
  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const token = TokenManager.getToken();
    const response = await fetch(
      buildUrl(API_CONFIG.ENDPOINTS.PROFILES.UPLOAD_IMAGE),
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro no upload da imagem');
    }

    const result: ApiResponse<UploadImageResponse> = await response.json();
    return result.data.imageUrl;
  },

  //deletar conta
  async deleteAccount(): Promise<void> {
    await apiRequest(
      API_CONFIG.ENDPOINTS.PROFILES.GET, // Usar o mesmo endpoint com DELETE
      {
        method: 'DELETE',
      }
    );
  },
};