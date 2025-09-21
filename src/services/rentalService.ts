import { authFirebaseService } from './authFirebaseService';

const API_BASE_URL = 'http://localhost:8002/api/rentals';

export interface RentalInterest {
  property_id: string;
  message?: string;
}

export interface RentalInterestResponse {
  id: string;
  property_id: string;
  student_id: string;
  advertiser_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  property?: any;
  student?: any;
}

class RentalService {
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

  async expressInterest(propertyId: string, message?: string): Promise<RentalInterestResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/interest`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          property_id: propertyId,
          message: message
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao demonstrar interesse.');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao demonstrar interesse:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao demonstrar interesse.');
    }
  }

  async getMyInterests(): Promise<RentalInterestResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/interests/my`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar seus interesses.');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao buscar interesses:', error);
      if (error instanceof Error) throw error;
      throw new Error('Erro ao carregar seus interesses.');
    }
  }

  async getReceivedInterests(): Promise<RentalInterestResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/interests/received`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar interesses recebidos.');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao buscar interesses recebidos:', error);
      if (error instanceof Error) throw error;
      throw new Error('Erro ao carregar interesses recebidos.');
    }
  }

  async updateInterestStatus(interestId: string, status: 'pending' | 'accepted' | 'rejected'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/interests/${interestId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao atualizar status do interesse.');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao atualizar status:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao atualizar status.');
    }
  }
}

export const rentalService = new RentalService();