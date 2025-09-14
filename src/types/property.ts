export type PropertyType = 'kitnet' | 'quarto' | 'apartamento';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  location: string;
  university: string;
  distance: string;
  image: string;
  rating: number;
  amenities: string[];
  capacity: number;
  isFavorited: boolean;
}

export interface FilterState {
  propertyType: string;
  priceRange: string;
  maxPrice: number | null;
  location: string;
  sortBy: string;
  searchTerm: string;
  amenities: string[];
}

export type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'mais-recente' | 'melhor-avaliado';