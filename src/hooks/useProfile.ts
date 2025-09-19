import { useState, useEffect } from 'react';
import { StudentProfile, AdvertiserProfile } from '@/types/profile';
import { profileService, ProfileData, UpdateProfileData } from '@/services/profileService';

// Mock data como fallback
const mockStudentProfile: StudentProfile = {
  id: "1",
  name: "João Silva",
  email: "joao@email.com",
  phone: "(31) 99999-9999",
  profileImage: "",
  userType: "cliente",
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
  userType: "anunciante",
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
  const [profile, setProfile] = useState<ProfileData | null>(null);
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
      setError('Erro ao carregar perfil. Usando dados de demonstração.');
      // Fallback para dados mockados - assumindo perfil estudante
      setProfile(mockStudentProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      setError(null);
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil. Tente novamente.');
      throw err;
    }
  };

  const uploadProfileImage = async (file: File): Promise<void> => {
    try {
      setError(null);
      const imageUrl = await profileService.uploadProfileImage(file);
      if (profile) {
        setProfile({ ...profile, profileImage: imageUrl });
      }
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      setError('Erro ao fazer upload da imagem. Tente novamente.');
      throw err;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadProfileImage,
    refreshProfile: loadProfile
  };
};