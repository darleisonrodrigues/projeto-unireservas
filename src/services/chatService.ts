import { authFirebaseService } from './authFirebaseService';

const API_BASE_URL = 'https://backend-unireservas.onrender.com/api/chat';

// Tipos para o sistema de chat
export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name?: string;
  sender_type: 'student' | 'advertiser';
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Chat {
  id: string;
  property_id: string;
  student_id: string;
  advertiser_id: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;

  // Informações da propriedade
  property_title?: string;
  property_images?: string[];
  property_price?: number;

  // Informações dos participantes
  student_name?: string;
  advertiser_name?: string;

  // Última mensagem
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

export interface ChatCreate {
  property_id: string;
  initial_message: string;
}

export interface MessageCreate {
  chat_id: string;
  content: string;
}

export interface ChatListResponse {
  chats: Chat[];
  total: number;
}

export interface ChatMessagesResponse {
  chat_id: string;
  messages: ChatMessage[];
  total: number;
}

class ChatService {
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

  // Criar novo chat ou obter chat existente
  async createOrGetChat(data: ChatCreate): Promise<Chat> {
    try {
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao criar chat.');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao criar chat:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao criar chat.');
    }
  }

  // Enviar mensagem
  async sendMessage(data: MessageCreate): Promise<ChatMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao enviar mensagem.');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao enviar mensagem:', error);
      if (error instanceof Error) throw error;
      throw new Error('Ocorreu um erro desconhecido ao enviar mensagem.');
    }
  }

  // Buscar chats do usuário
  async getMyChats(): Promise<ChatListResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/my`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao buscar chats.');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao buscar chats:', error);
      if (error instanceof Error) throw error;
      throw new Error('Erro ao carregar chats.');
    }
  }

  // Buscar mensagens de um chat com paginação
  async getChatMessages(chatId: string, page: number = 1, limit: number = 20): Promise<ChatMessagesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${chatId}/messages?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao buscar mensagens.');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao buscar mensagens:', error);
      if (error instanceof Error) throw error;
      throw new Error('Erro ao carregar mensagens.');
    }
  }

  // Buscar detalhes de um chat
  async getChatDetails(chatId: string): Promise<Chat> {
    try {
      const response = await fetch(`${API_BASE_URL}/${chatId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falha ao buscar chat.');
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('Erro ao buscar chat:', error);
      if (error instanceof Error) throw error;
      throw new Error('Erro ao carregar chat.');
    }
  }

  // Função utilitária para formatar data
  formatMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      // Hoje - apenas hora
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      // Ontem
      return 'Ontem';
    } else {
      // Data completa
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  // Função utilitária para formatar última mensagem
  formatLastMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Agora';
    } else if (diffMins < 60) {
      return `${diffMins}min`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  }
}

export const chatService = new ChatService();