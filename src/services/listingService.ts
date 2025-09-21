import { buildUrl, API_CONFIG, ApiResponse } from '@/config/api';
import { authFirebaseService } from './authFirebaseService';
import { ListingResponse as Listing } from '@/types/listing';

//tipos para requisições de listings
export interface CreateListingData {
  propertyId: string;
  title: string;
  description: string;
  price: number;
  availableFrom: string;
  availableUntil?: string;
  rules?: string[];
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  images?: string[];
}

export interface UpdateListingData extends Partial<CreateListingData> {
  id: string;
}

export interface ListingSearchParams {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  university?: string;
  propertyType?: string;
  availableFrom?: string;
  page?: number;
  limit?: number;
}

export interface ListingSearchResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// função auxiliar para fazer requisições autenticadas
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = authFirebaseService.getToken();
  
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

// serviços de listings
export const listingService = {
  async getAll(): Promise<Listing[]> {
    const response = await apiRequest<Listing[]>(
      API_CONFIG.ENDPOINTS.LISTINGS.LIST
    );
    return response.data;
  },

  //buscar listings com filtros
  async search(params: ListingSearchParams): Promise<ListingSearchResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiRequest<ListingSearchResponse>(
      `${API_CONFIG.ENDPOINTS.LISTINGS.LIST}?${queryParams.toString()}`
    );
    return response.data;
  },

  //obter listing por ID
  async getById(id: string): Promise<Listing> {
    const response = await apiRequest<Listing>(
      API_CONFIG.ENDPOINTS.LISTINGS.GET_BY_ID(id)
    );
    return response.data;
  },

  // obter listings do usuário atual
  async getMyListings(): Promise<Listing[]> {
    const response = await apiRequest<Listing[]>(
      API_CONFIG.ENDPOINTS.LISTINGS.BY_USER
    );
    return response.data;
  },

  //criar novo listing
  async create(data: CreateListingData): Promise<Listing> {
    const response = await apiRequest<Listing>(
      API_CONFIG.ENDPOINTS.LISTINGS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  //atualizar listing
  async update(id: string, data: Partial<CreateListingData>): Promise<Listing> {
    const response = await apiRequest<Listing>(
      API_CONFIG.ENDPOINTS.LISTINGS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.data;
  },

  //deletar listing
  async delete(id: string): Promise<void> {
    await apiRequest(
      API_CONFIG.ENDPOINTS.LISTINGS.DELETE(id),
      {
        method: 'DELETE',
      }
    );
  },

  //marcar como favorito
  async toggleFavorite(id: string): Promise<void> {
    await apiRequest(
      `${API_CONFIG.ENDPOINTS.LISTINGS.GET_BY_ID(id)}/favorite`,
      {
        method: 'POST',
      }
    );
  },

  //upload de imagens para listing
  async uploadImages(listingId: string, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const token = authFirebaseService.getToken();
    const response = await fetch(
      buildUrl(`/listings/${listingId}/upload-images`),
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