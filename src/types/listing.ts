export type PropertyType = 'kitnet' | 'quarto' | 'apartamento';

export interface Amenity {
  id: string;
  label: string;
  value: string;
}

export interface ListingFormData {
  title: string;
  type: PropertyType;
  price: number;
  description: string;
  address: string;
  neighborhood: string;
  university: string;
  distance: string;
  capacity: number;
  amenities: string[];
  photos: File[];
}

export interface ListingResponse extends Omit<ListingFormData, 'photos'> {
  id: string;
  photos: string[]; // URLs das fotos após upload
  createdAt: string;
  updatedAt: string;
  userId: string;
}