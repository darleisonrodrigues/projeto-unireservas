// Conteúdo FINAL e CORRIGIDO para: projeto-unireservas/src/services/profileService.ts

import { authFirebaseService } from './authFirebaseService'; // Usando Firebase Auth Service
import type { AuthResponse } from './authFirebaseService';

const API_BASE_URL = 'https://backend-unireservas.onrender.com/api/profiles';

// Tipo do perfil do usuário
type UserProfile = AuthResponse['user'];

class ProfileService {
  // Método privado para obter os headers de autenticação
  private getAuthHeaders() {
    const token = authFirebaseService.getToken();
    if (!token) {
      throw new Error('Usuário não autenticado.');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Buscar o perfil do usuario logado
  async getMyProfile(): Promise<UserProfile> {  //Usa o tipo UserProfile
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar o perfil do usuário.');
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error: unknown) {
      console.error('Erro ao buscar perfil:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ocorreu um erro desconhecido ao buscar o perfil.');
    }
  }

  // Atualizar o perfil do usuário logado
  async updateMyProfile(profileData: Partial<UserProfile>): Promise<UserProfile> { 
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o perfil.');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: unknown) {
      console.error('Erro ao atualizar perfil:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ocorreu um erro desconhecido ao atualizar o perfil.');
    }
  }

  // Deletar conta do usuário logado
  async deleteMyProfile(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha ao deletar a conta: ${errorText}`);
      }

      // Apos deletar no backend, tambem fazer logout do Firebase
      await authFirebaseService.logout();

    } catch (error: unknown) {
      console.error('Erro ao deletar conta:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Ocorreu um erro desconhecido ao deletar a conta.');
    }
  }
}

export const profileService = new ProfileService();