// Define o tipo para os dados de criação de uma propriedade
export type PropertyCreate = {
  title: string;
  type: 'apartamento' | 'kitnet' | 'quarto';
  price: number;
  location: string;
  university: string;
  distance: string;
  amenities: string[];
  capacity: number;
  description: string;
  images: string[]; // Inicia vazio, as imagens são enviadas depois
};

// Mantém a definição existente do tipo Property
export type Property = {
  id: string;
  owner_id?: string;
  title: string;
  type: 'apartamento' | 'kitnet' | 'quarto';
  price: number;
  location: string;
  university: string;
  distance: string;
  images: string[];
  amenities: string[];
  capacity: number;
  description?: string;
  rating: number;
  is_favorited: boolean;
  created_at?: string; // ou Date
  updated_at?: string; // ou Date
  is_active?: boolean;

  // Propriedades para compatibilidade com PropertyCard
  image?: string;
  isFavorited?: boolean;
};

// Tipos para filtragem
export type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'melhor-avaliado' | 'mais-recente';

export type FilterState = {
  propertyType: string;
  priceRange: string;
  maxPrice: number | null;
  location: string;
  sortBy: SortOption;
  searchTerm: string;
  amenities: string[];
};