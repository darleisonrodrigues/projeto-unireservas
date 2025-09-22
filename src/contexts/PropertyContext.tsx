import React, { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { Property, FilterState, SortOption } from '@/types/property';
import { propertyService } from '@/services/propertyService';
import { authFirebaseService } from '@/services/authFirebaseService';

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

  // Carregar propriedades na inicialização
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await propertyService.getAllProperties();

      // Transformar dados do backend para formato do frontend
      const transformedProperties = data.map((property, index) => ({
        ...property,
        // Garantir que há um ID válido - usar índice como fallback para propriedades de teste
        id: property.id || `mock-${index}`,
        // Compatibilidade: o PropertyCard espera 'image' (singular) e 'isFavorited'
        image: property.images && property.images.length > 0 ? property.images[0] : undefined,
        isFavorited: property.is_favorited || false
      }));

      console.log('Propriedades carregadas do Firebase:', transformedProperties.length);
      setProperties(transformedProperties);
    } catch (err) {
      console.error('Erro ao carregar propriedades do Firebase:', err);
      setError('Erro ao carregar propriedades. Verifique sua conexão com a internet.');
      // Não usar fallback, deixar array vazio para mostrar que não há dados
      setProperties([]);
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
    // Primeiro atualizar localmente para resposta imediata
    setProperties(prev =>
      prev.map(property =>
        property.id === propertyId
          ? { ...property, isFavorited: !property.isFavorited, is_favorited: !property.is_favorited }
          : property
      )
    );

    try {
      // Verificar estado atual do favorito (antes da mudança local)
      const currentProperty = properties.find(p => p.id === propertyId);
      const willBeFavorited = currentProperty?.isFavorited || false;

      // Chamar a API correspondente
      const token = authFirebaseService.getToken();
      if (!token) {
        console.error('Usuário não está logado');
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/properties/${propertyId}/favorite`,
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
              ? { ...property, isFavorited: !property.isFavorited, is_favorited: !property.is_favorited }
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
            ? { ...property, isFavorited: !property.isFavorited, is_favorited: !property.is_favorited }
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