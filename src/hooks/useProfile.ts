import { useState, useEffect } from 'react';
import { profileService } from '@/services/profileService';
import type { AuthResponse } from '@/services/authFirebaseService';
import type { StudentProfile, AdvertiserProfile } from '@/types/profile';

// Tipo do perfil do usuário baseado no Firebase
type UserProfile = AuthResponse['user'];

// Mock data como fallback
const mockStudentProfile: StudentProfile = {
  id: "1",
  name: "João Silva",
  email: "joao@email.com",
  phone: "(31) 99999-9999",
  profileImage: "",
  userType: "student",
  university: "UFMG",
  course: "Engenharia da Computação",
  semester: "6º período",
  bio: "Estudante de engenharia procurando moradia próxima à universidade.",
  preferences: {
    budget: "500-800",
    roomType: "kitnet",
    amenities: ["wifi", "garagem"]
  },
  favoriteProperties: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockAdvertiserProfile: AdvertiserProfile = {
  id: "2",
  name: "Maria Santos",
  email: "maria@email.com",
  phone: "(31) 88888-8888",
  profileImage: "",
  userType: "advertiser",
  company_name: "Imóveis Premium",
  companyName: "Imóveis Premium",
  cnpj: "12.345.678/0001-90",
  description: "Empresa especializada em imóveis para estudantes universitários.",
  website: "https://imoveispremium.com",
  address: "Rua das Flores, 123, Centro, Belo Horizonte - MG",
  verified: true,
  totalProperties: 15,
  rating: 4.8,
  properties: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await profileService.getMyProfile();
      setProfile(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar perfil');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      setError(null);
      const updatedProfile = await profileService.updateMyProfile(data);
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil. Tente novamente.');
      throw err;
    }
  };

  const deleteProfile = async (): Promise<void> => {
    try {
      setError(null);
      await profileService.deleteMyProfile();
      setProfile(null);
    } catch (err) {
      console.error('Erro ao deletar perfil:', err);
      setError('Erro ao deletar conta. Tente novamente.');
      throw err;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    deleteProfile,
    refreshProfile: loadProfile
  };
};