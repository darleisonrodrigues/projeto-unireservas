import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { Property, FilterState, SortOption } from '@/types/property';
import { propertyService } from '@/services/propertyService';
import { authFirebaseService } from '@/services/authFirebaseService';
import { useAuth } from '@/hooks/useAuth';

// Importar dados mockados - fallback caso o backend não esteja disponível
import kitnetImage from "@/assets/kitnet-1.jpg";
import roomImage from "@/assets/room-1.jpg";
import apartmentImage from "@/assets/apartment-1.jpg";
import apartamento01Image from "@/assets/apartamento01.jpg";
import apartamento02Image from "@/assets/apartamento02.jpg";
import apartamento03Image from "@/assets/apartamento03.jpg";

interface PropertyContextType {
  properties: Property[];
  filteredProperties: Property[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  updateFilter: (key: keyof FilterState, value: string | string[] | number | null) => void;
  resetFilters: () => void;
  toggleFavorite: (propertyId: string) => Promise<void>;
  refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

//dados mockados - centralizados para facilitar manutenção
const mockProperties: Property[] = [
  {
    id: "1",
    title: "Kitnet moderna próxima à UFMG",
    type: "kitnet",
    price: 650,
    location: "Pampulha, Belo Horizonte",
    university: "UFMG",
    distance: "500m",
    image: kitnetImage,
    rating: 4.8,
    amenities: ["wifi", "garagem"],
    capacity: 1,
    isFavorited: false
  },
  {
    id: "2", 
    title: "Quarto individual com banheiro privativo",
    type: "quarto",
    price: 480,
    location: "Savassi, Belo Horizonte", 
    university: "PUC Minas",
    distance: "800m",
    image: roomImage,
    rating: 4.6,
    amenities: ["wifi"],
    capacity: 1,
    isFavorited: true
  },
  {
    id: "3",
    title: "Apartamento 2 quartos para compartilhar",
    type: "apartamento",
    price: 900,
    location: "Funcionários, Belo Horizonte",
    university: "UFMG",
    distance: "1.2km", 
    image: apartmentImage,
    rating: 4.9,
    amenities: ["wifi", "garagem"],
    capacity: 2,
    isFavorited: false
  },
  {
    id: "4",
    title: "Kitnet compacta e funcional",
    type: "kitnet",
    price: 580,
    location: "Centro, Belo Horizonte",
    university: "PUC Minas", 
    distance: "600m",
    image: kitnetImage,
    rating: 4.4,
    amenities: ["wifi"],
    capacity: 1,
    isFavorited: false
  },
  {
    id: "5",
    title: "Quarto em casa compartilhada",
    type: "quarto",
    price: 420,
    location: "Ouro Preto, Belo Horizonte",
    university: "UFMG",
    distance: "400m",
    image: roomImage, 
    rating: 4.7,
    amenities: ["wifi", "garagem"],
    capacity: 1,
    isFavorited: false
  },
  {
    id: "6",
    title: "Apartamento completo com 3 quartos",
    type: "apartamento",
    price: 1200,
    location: "Coração de Jesus, Belo Horizonte",
    university: "UFMG",
    distance: "900m",
    image: apartmentImage,
    rating: 4.8,
    amenities: ["wifi", "garagem"],
    capacity: 3,
    isFavorited: true
  },
  {
    id: "7",
    title: "Apartamento com vista para a cidade",
    type: "apartamento",
    price: 1100,
    location: "Centro, Belo Horizonte",
    university: "UFMG",
    distance: "700m",
    image: apartamento01Image,
    rating: 4.7,
    amenities: ["wifi", "garagem"],
    capacity: 2,
    isFavorited: false
  },
  {
    id: "8",
    title: "Apartamento espaçoso com varanda",
    type: "apartamento",
    price: 1300,
    location: "Savassi, Belo Horizonte",
    university: "PUC Minas",
    distance: "1km",
    image: apartamento02Image,
    rating: 4.9,
    amenities: ["wifi", "garagem"],
    capacity: 3,
    isFavorited: true
  },
  {
    id: "9",
    title: "Apartamento moderno e bem localizado",
    type: "apartamento",
    price: 1250,
    location: "Funcionários, Belo Horizonte",
    university: "UFMG",
    distance: "500m",
    image: apartamento03Image,
    rating: 4.8,
    amenities: ["wifi", "garagem"],
    capacity: 2,
    isFavorited: false
  },
  {
    id: "10",
    title: "Kitnet mobiliada no centro",
    type: "kitnet",
    price: 750,
    location: "Centro, Belo Horizonte",
    university: "UFMG",
    distance: "1.5km",
    image: kitnetImage,
    rating: 4.5,
    amenities: ["wifi", "mobiliado"],
    capacity: 1,
    isFavorited: false
  },
  {
    id: "11",
    title: "Quarto próximo à universidade - aceita pets",
    type: "quarto",
    price: 550,
    location: "Pampulha, Belo Horizonte",
    university: "UFMG",
    distance: "300m",
    image: roomImage,
    rating: 4.6,
    amenities: ["wifi", "pets"],
    capacity: 1,
    isFavorited: false
  }
];

const initialFilters: FilterState = {
  propertyType: "todos",
  priceRange: "todos-precos",
  maxPrice: null,
  location: "",
  sortBy: "relevancia",
  searchTerm: "",
  amenities: []
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Carregar propriedades na inicialização e quando usuário mudar
  useEffect(() => {
    loadProperties();
  }, [user]); // Recarregar quando user mudar (login/logout)

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await propertyService.getAllProperties();

      // Transformar dados do backend para formato do frontend
      const transformedProperties = data.map(property => ({
        ...property,
        // Compatibilidade: o PropertyCard espera 'image' (singular) e 'isFavorited'
        image: property.images && property.images.length > 0 ? property.images[0] : undefined,
        isFavorited: property.is_favorited
      }));

      console.log('Propriedades carregadas do backend:', transformedProperties.length);
      setProperties(transformedProperties);
    } catch (err) {
      console.error('Erro ao carregar propriedades:', err);
      setError('Erro ao carregar propriedades. Usando dados de demonstração.');
      //fallback para dados mockados
      setProperties(mockProperties);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProperties = async () => {
    await loadProperties();
  };

  const updateFilter = (key: keyof FilterState, value: string | string[] | number | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const toggleFavorite = async (propertyId: string) => {
    try {
      // Verificar estado atual do favorito (antes da mudança local)
      const currentProperty = properties.find(p => p.id === propertyId);
      const willBeFavorited = !(currentProperty?.isFavorited || false);

      // Primeiro atualizar localmente para resposta imediata
      setProperties(prev =>
        prev.map(property =>
          property.id === propertyId
            ? { ...property, isFavorited: willBeFavorited, is_favorited: willBeFavorited }
            : property
        )
      );

      // Chamar a API correspondente
      const token = authFirebaseService.getToken();
      if (!token) {
        console.error('Usuário não está logado');
        return;
      }

      const response = await fetch(
        `http://localhost:8002/api/properties/${propertyId}/favorite`,
        {
          method: willBeFavorited ? 'POST' : 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Se falhar, reverter o estado local
        setProperties(prev =>
          prev.map(property =>
            property.id === propertyId
              ? { ...property, isFavorited: !willBeFavorited, is_favorited: !willBeFavorited }
              : property
          )
        );
        console.error('Erro ao atualizar favorito:', await response.text());
      } else {
        console.log('Favorito atualizado com sucesso');
      }
    } catch (error) {
      // Se falhar, reverter o estado local
      setProperties(prev =>
        prev.map(property =>
          property.id === propertyId
            ? { ...property, isFavorited: !willBeFavorited, is_favorited: !willBeFavorited }
            : property
        )
      );
      console.error('Erro ao conectar com o servidor:', error);
    }
  };

  //logica de filtros
  const filteredProperties = useMemo(() => {
    console.log('Recalculando filtros. Filtros atuais:', filters);
    console.log('Total de propriedades:', properties.length);
    
    let filtered = [...properties];

    // filtro por tipo de propriedade
    if (filters.propertyType !== "todos") {
      console.log('Filtrando por tipo:', filters.propertyType);
      filtered = filtered.filter(property => property.type === filters.propertyType);
      console.log('Após filtro por tipo:', filtered.length);
    }

    //filtro por faixa de preço
    if (filters.priceRange !== "todos-precos") {
      switch (filters.priceRange) {
        case "ate-500":
          filtered = filtered.filter(property => property.price <= 500);
          break;
        case "500-800":
          filtered = filtered.filter(property => property.price >= 500 && property.price <= 800);
          break;
        case "800-1200":
          filtered = filtered.filter(property => property.price >= 800 && property.price <= 1200);
          break;
        case "acima-1200":
          filtered = filtered.filter(property => property.price > 1200);
          break;
      }
    }

    //filtro por preço maximo (da busca principal)
    if (filters.maxPrice !== null) {
      filtered = filtered.filter(property => property.price <= filters.maxPrice!);
    }

    // filtro por localizaçao (busca parcial)
    if (filters.location) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.university.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // filtro por termo de busca
    if (filters.searchTerm) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        property.university.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // filtro por amenidades
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(property => 
        filters.amenities.some(amenity => property.amenities.includes(amenity))
      );
    }

    // Ordenaçao
    switch (filters.sortBy) {
      case "menor-preco":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "maior-preco":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "melhor-avaliado":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "mais-recente":
        // Para mock, vamos usar o ID como proxy para "mais recente"
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      default:
        // Relevancia - mantem ordem original
        break;
    }

    console.log('Propriedades filtradas final:', filtered.length);
    return filtered;
  }, [properties, filters]);

  const value: PropertyContextType = {
    properties,
    filteredProperties,
    filters,
    isLoading,
    error,
    updateFilter,
    resetFilters,
    toggleFavorite,
    refreshProperties
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

// exportar contexto para uso em hook separado
export { PropertyContext };