import { Property, PropertyCreate } from '@/types/property';
import { authFirebaseService } from './authFirebaseService';

const API_BASE_URL = 'https://backend-unireservas.onrender.com/api/properties';

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
      const response = await fetch(`${API_BASE_URL}/`, {
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

      const url = `${API_BASE_URL}/?per_page=50`;
      console.log('🔗 URL completa:', url);
      console.log('📋 Headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        mode: 'cors', // Garantir que CORS está ativo
        cache: 'no-cache' // Evitar cache do browser
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`Falha ao buscar imóveis: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Dados recebidos com sucesso:', data.total, 'propriedades');
      return data.properties || data;
    } catch (error: unknown) {
      console.error('Erro ao buscar imóveis:', error);

      // Verificar tipo específico de erro
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conexão: Verifique se o backend está rodando na porta 8000');
      }

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
      const response = await fetch(`${API_BASE_URL}/my/`, {
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
  async updateProperty(id: string, data: Partial<PropertyCreate & { images?: string[] }>): Promise<Property> {
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

  /**
   * Deleta uma propriedade e todos os dados relacionados
   * @param id O ID da propriedade a ser deletada
   */
  async deleteProperty(id: string): Promise<void> {
    console.log(`[PropertyService] Iniciando deleção da propriedade: ${id}`);

    try {
      const url = `${API_BASE_URL}/${id}`;
      const headers = this.getAuthHeaders();

      console.log(`[PropertyService] URL: ${url}`);
      console.log(`[PropertyService] Headers:`, headers);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });

      console.log(`[PropertyService] Response status: ${response.status}`);
      console.log(`[PropertyService] Response ok: ${response.ok}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error(`[PropertyService] Error data:`, errorData);
        } catch (e) {
          console.error(`[PropertyService] Erro ao parsear resposta de erro:`, e);
          errorData = { detail: `Erro HTTP ${response.status}` };
        }

        throw new Error(errorData.detail || `Falha ao deletar a propriedade (${response.status}).`);
      }

      console.log(`[PropertyService] Propriedade ${id} deletada com sucesso`);

    } catch (error: unknown) {
      console.error(`[PropertyService] Erro ao deletar propriedade ${id}:`, error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erro de conexão: Verifique se o backend está rodando na porta 8000');
      }

      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao deletar a propriedade.');
    }
  }

  /**
   * Deleta imagens específicas de uma propriedade
   * @param propertyId O ID da propriedade
   * @param imageUrls Array com as URLs das imagens a serem deletadas
   */
  async deleteImages(propertyId: string, imageUrls: string[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${propertyId}/delete-images`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ image_urls: imageUrls }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao deletar as imagens.');
      }
    } catch (error: unknown) {
      console.error('Erro ao deletar imagens:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao deletar as imagens.');
    }
  }

  /**
   * Reordena as imagens de uma propriedade
   * @param propertyId O ID da propriedade
   * @param imageUrls Array com as URLs das imagens na nova ordem
   */
  async reorderImages(propertyId: string, imageUrls: string[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${propertyId}/reorder-images`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ image_urls: imageUrls }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao reordenar as imagens.');
      }
    } catch (error: unknown) {
      console.error('Erro ao reordenar imagens:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao reordenar as imagens.');
    }
  }
}

export const propertyService = new PropertyService();