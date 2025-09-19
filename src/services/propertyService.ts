import { buildUrl, API_CONFIG, ApiResponse } from '@/config/api';
import { TokenManager } from './authService';
import { Property } from '@/types/property';

// tipos para requisições de propriedades
export interface CreatePropertyData {
  title: string;
  type: 'apartamento' | 'kitnet' | 'quarto';
  price: number;
  location: string;
  university: string;
  distance: string;
  amenities: string[];
  capacity: number;
  description?: string;
  images?: string[];
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id: string;
}

export interface PropertySearchParams {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  university?: string;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

//serviços de propriedades
export const propertyService = {
  //listar todas as propriedades
  async getAll(): Promise<Property[]> {
    const response = await apiRequest<Property[]>(
      API_CONFIG.ENDPOINTS.PROPERTIES.LIST
    );
    return response.data;
  },

  //buscar propriedades com filtros
  async search(params: PropertySearchParams): Promise<PropertySearchResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await apiRequest<PropertySearchResponse>(
      `${API_CONFIG.ENDPOINTS.PROPERTIES.SEARCH}?${queryParams.toString()}`
    );
    return response.data;
  },

  //obter propriedade por ID
  async getById(id: string): Promise<Property> {
    const response = await apiRequest<Property>(
      API_CONFIG.ENDPOINTS.PROPERTIES.GET_BY_ID(id)
    );
    return response.data;
  },

  //criar nova propriedade
  async create(data: CreatePropertyData): Promise<Property> {
    const response = await apiRequest<Property>(
      API_CONFIG.ENDPOINTS.PROPERTIES.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  //atualizar propriedade
  async update(id: string, data: Partial<CreatePropertyData>): Promise<Property> {
    const response = await apiRequest<Property>(
      API_CONFIG.ENDPOINTS.PROPERTIES.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  //deletar propriedade
  async delete(id: string): Promise<void> {
    await apiRequest(
      API_CONFIG.ENDPOINTS.PROPERTIES.DELETE(id),
      {
        method: 'DELETE',
      }
    );
  },

  //upload de imagens
  async uploadImages(propertyId: string, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const token = TokenManager.getToken();
    const response = await fetch(
      buildUrl(`/properties/${propertyId}/upload-images`),
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Erro no upload das imagens');
    }

    const result = await response.json();
    return result.data.imageUrls;
  },
};