import { useState, useEffect } from 'react';
import { StudentProfile, AdvertiserProfile, ProfileUpdateRequest, ApiResponse } from '@/types/profile';

// Hook para gerenciar dados do perfil - preparado para integração com backend
export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<StudentProfile | AdvertiserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data para desenvolvimento - substituir por chamadas API reais
  const mockStudentProfile: StudentProfile = {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(31) 99999-9999',
    userType: 'cliente',
    university: 'UFMG',
    course: 'Engenharia de Software',
    semester: '5º período',
    bio: 'Estudante procurando acomodação próxima à universidade.',
    preferences: {
      budget: '500-800',
      roomType: 'kitnet',
      amenities: ['wifi', 'garagem'],
    },
    favoriteProperties: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdvertiserProfile: AdvertiserProfile = {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@imoveis.com',
    phone: '(31) 98888-8888',
    userType: 'anunciante',
    companyName: 'Imóveis Premium',
    cnpj: '12.345.678/0001-90',
    description: 'Empresa especializada em imóveis para estudantes universitários.',
    address: 'Rua das Flores, 123 - Belo Horizonte/MG',
    website: 'https://imoveis-premium.com.br',
    verified: true,
    rating: 4.8,
    totalProperties: 15,
    properties: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const fetchProfile = async (id?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Substituir por chamada API real
      // const response = await fetch(`/api/profile/${id || 'current'}`);
      // const data: ApiResponse<StudentProfile | AdvertiserProfile> = await response.json();
      
      // Simulação de delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock: alterna entre perfil de estudante e anunciante baseado no tipo na URL
      const urlParams = new URLSearchParams(window.location.search);
      const userType = urlParams.get('type') || 'cliente';
      
      const mockProfile = userType === 'anunciante' ? mockAdvertiserProfile : mockStudentProfile;
      setProfile(mockProfile);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Substituir por chamada API real
      // const response = await fetch(`/api/profile/${profile?.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // const result: ApiResponse<StudentProfile | AdvertiserProfile> = await response.json();
      
      // Simulação de delay da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock: atualiza o perfil localmente
      if (profile) {
        const updatedProfile = { ...profile, ...data, updatedAt: new Date() };
        setProfile(updatedProfile as typeof profile);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = () => {
    return fetchProfile(userId);
  };

  useEffect(() => {
    fetchProfile(userId);
  }, [userId]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
  };
};

// Hook para favoritar/desfavoritar imóveis
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async (propertyId: string) => {
    try {
      setIsLoading(true);
      
      // TODO: Substituir por chamada API real
      // const response = await fetch(`/api/favorites/${propertyId}`, {
      //   method: favorites.includes(propertyId) ? 'DELETE' : 'POST',
      // });
      
      // Mock: atualiza favoritos localmente
      setFavorites(prev => 
        prev.includes(propertyId) 
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      );
      
    } catch (err) {
      console.error('Erro ao atualizar favoritos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    favorites,
    toggleFavorite,
    isLoading,
  };
};

// Hook para gerenciar mensagens
export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (recipientId: string, content: string) => {
    try {
      setIsLoading(true);
      
      // TODO: Substituir por chamada API real
      // const response = await fetch('/api/messages', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ recipientId, content }),
      // });
      
      console.log('Mensagem enviada:', { recipientId, content });
      
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
  };
};