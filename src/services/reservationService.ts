import { Reservation, ReservationCreate, ReservationUpdate } from '@/types/reservation';
import { authFirebaseService } from './authFirebaseService';

const API_BASE_URL = 'http://localhost:8000/api/reservations';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

class ReservationService {
  // Método para obter os headers de autenticação
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

  /**
   * Criar nova reserva
   */
  async createReservation(data: ReservationCreate): Promise<Reservation> {
    try {
      console.log('[ReservationService] Criando reserva:', data);

      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao criar reserva.');
      }

      const result: ApiResponse<{ reservation: Reservation }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Erro ao criar reserva');
      }

      console.log('[ReservationService] Reserva criada com sucesso:', result.data.reservation);
      return result.data.reservation;
    } catch (error: unknown) {
      console.error('Erro ao criar reserva:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao criar a reserva.');
    }
  }

  /**
   * Buscar reservas do usuário
   */
  async getMyReservations(): Promise<Reservation[]> {
    try {
      console.log('[ReservationService] Buscando minhas reservas');

      const response = await fetch(`${API_BASE_URL}/my`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao buscar reservas.');
      }

      const result: ApiResponse<{ reservations: Reservation[]; total: number }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Erro ao buscar reservas');
      }

      console.log('[ReservationService] Reservas encontradas:', result.data.total);
      return result.data.reservations;
    } catch (error: unknown) {
      console.error('Erro ao buscar reservas:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao buscar as reservas.');
    }
  }

  /**
   * Buscar reserva específica por ID
   */
  async getReservationById(id: string): Promise<Reservation> {
    try {
      console.log('[ReservationService] Buscando reserva:', id);

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao buscar reserva.');
      }

      const result: ApiResponse<{ reservation: Reservation }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Reserva não encontrada');
      }

      return result.data.reservation;
    } catch (error: unknown) {
      console.error('Erro ao buscar reserva:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao buscar a reserva.');
    }
  }

  /**
   * Atualizar reserva
   */
  async updateReservation(id: string, data: ReservationUpdate): Promise<Reservation> {
    try {
      console.log('[ReservationService] Atualizando reserva:', id, data);

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao atualizar reserva.');
      }

      const result: ApiResponse<{ reservation: Reservation }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Erro ao atualizar reserva');
      }

      console.log('[ReservationService] Reserva atualizada com sucesso');
      return result.data.reservation;
    } catch (error: unknown) {
      console.error('Erro ao atualizar reserva:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao atualizar a reserva.');
    }
  }

  /**
   * Cancelar reserva
   */
  async cancelReservation(id: string): Promise<void> {
    try {
      console.log('[ReservationService] Cancelando reserva:', id);

      const response = await fetch(`${API_BASE_URL}/${id}/cancel`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao cancelar reserva.');
      }

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Erro ao cancelar reserva');
      }

      console.log('[ReservationService] Reserva cancelada com sucesso');
    } catch (error: unknown) {
      console.error('Erro ao cancelar reserva:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao cancelar a reserva.');
    }
  }

  /**
   * Confirmar reserva (apenas anunciantes)
   */
  async confirmReservation(id: string): Promise<Reservation> {
    try {
      console.log('[ReservationService] Confirmando reserva:', id);

      const response = await fetch(`${API_BASE_URL}/${id}/confirm`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao confirmar reserva.');
      }

      const result: ApiResponse<{ reservation: Reservation }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Erro ao confirmar reserva');
      }

      console.log('[ReservationService] Reserva confirmada com sucesso');
      return result.data.reservation;
    } catch (error: unknown) {
      console.error('Erro ao confirmar reserva:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao confirmar a reserva.');
    }
  }

  /**
   * Rejeitar reserva (apenas anunciantes)
   */
  async rejectReservation(id: string): Promise<Reservation> {
    try {
      console.log('[ReservationService] Rejeitando reserva:', id);

      const response = await fetch(`${API_BASE_URL}/${id}/reject`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao rejeitar reserva.');
      }

      const result: ApiResponse<{ reservation: Reservation }> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Erro ao rejeitar reserva');
      }

      console.log('[ReservationService] Reserva rejeitada');
      return result.data.reservation;
    } catch (error: unknown) {
      console.error('Erro ao rejeitar reserva:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao rejeitar a reserva.');
    }
  }

  /**
   * Calcular preço total da reserva
   */
  calculateTotalPrice(dailyRate: number, startDate: Date, endDate: Date): number {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, days) * dailyRate;
  }
}

export const reservationService = new ReservationService();