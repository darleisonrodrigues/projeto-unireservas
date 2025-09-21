import { Property, PropertyCreate } from '@/types/property';
import { authFirebaseService } from './authFirebaseService';

const API_BASE_URL = 'http://localhost:8002/api/properties';

class PropertyService {
  // Metodo para obter os headers para requisições JSON
  private getAuthHeaders() {
    const token = authFirebaseService.getToken();
    if (!token) {
      throw new Error("Token de autenticação não encontrado.");
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  //Metodo para obter os headers para requisições FormData (sem Content-Type)
  private getAuthHeadersForFormData() {
    const token = authFirebaseService.getToken();
    if (!token) {
      throw new Error("Token de autenticação não encontrado.");
    }
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Cria uma nova propriedade (sem as imagens).
   * @param data Os dados da propriedade a serem criados.
   * @returns A propriedade recém-criada.
   */

  async create(data: PropertyCreate): Promise<Property> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao criar o anúncio.');
      }
      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao criar anúncio:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao criar o anúncio.');
    }
  }

  /**
   * Faz o upload de imagens para uma propriedade existente.
   * @param propertyId O ID da propriedade.
   * @param files Um array de objetos File.
   * @returns Um objeto contendo as URLs das imagens enviadas.
   */

  async uploadImages(propertyId: string, files: File[]): Promise<{ imageUrls: string[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file); // 'files' corresponde ao esperado pelo backend
    });

    try {
      const response = await fetch(`${API_BASE_URL}/${propertyId}/upload-images`, {
        method: 'POST',
        headers: this.getAuthHeadersForFormData(), // Headers específicos para FormData
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao enviar as imagens.');
      }
      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao enviar imagens:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao enviar as imagens.');
    }
  }

  // Buscar todas as propriedades
  async getAllProperties(): Promise<Property[]> {
    try {
      let headers: Record<string, string> = {};

      try {
        const token = authFirebaseService.getToken();
        if (token) {
          headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          };
        }
      } catch (authError) {
        // Se não há token, continua sem autenticação
        console.log('Sem token de autenticação disponível, carregando propriedades sem favoritos');
      }

      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar imóveis.');
      }
      const data = await response.json();
      return data.properties || data;
    } catch (error: unknown) {
      console.error('Erro ao buscar imóveis:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido.');
    }
  }

  // Buscar uma propriedade por ID
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      let headers: Record<string, string> = {};

      try {
        const token = authFirebaseService.getToken();
        if (token) {
          headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          };
        }
      } catch (authError) {
        // Se não há token, continua sem autenticação
        console.log('Sem token de autenticação disponível, carregando propriedade sem status de favorito');
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Falha ao buscar o imóvel.');
      }
      return await response.json();
    } catch (error: unknown) {
      console.error(`Erro ao buscar imóvel com ID ${id}:`, error);
      return null;
    }
  }

  // Buscar propriedades do usuário logado (apenas anunciantes)
  async getMyProperties(): Promise<Property[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/my`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar suas propriedades.');
      }

      const data = await response.json();
      return data.properties || [];
    } catch (error: unknown) {
      console.error('Erro ao buscar suas propriedades:', error);
      if (error instanceof Error) throw error;
      throw new Error('Erro ao carregar suas propriedades.');
    }
  }

  // Atualizar uma propriedade existente
  async updateProperty(id: string, data: Partial<PropertyCreate>): Promise<Property> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao atualizar a propriedade.');
      }
      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao atualizar propriedade:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao atualizar a propriedade.');
    }
  }
}

export const propertyService = new PropertyService();