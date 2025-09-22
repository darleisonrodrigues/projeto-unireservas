export interface ReservationCreate {
  property_id: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  guests: number;
  message?: string;
  total_price: number;
}

export interface ReservationUpdate {
  start_date?: string;
  end_date?: string;
  guests?: number;
  message?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
}

export interface Reservation {
  id: string;
  property_id: string;
  student_id: string;
  advertiser_id: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  guests: number;
  message?: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string

  // Informações da propriedade
  property_title?: string;
  property_type?: string;
  property_location?: string;
  property_images?: string[];

  // Informações do estudante
  student_name?: string;
  student_email?: string;

  // Informações do anunciante
  advertiser_name?: string;
  advertiser_email?: string;
}

export interface ReservationFormData {
  startDate: Date;
  endDate: Date;
  guests: number;
  message: string;
}

export const ReservationStatus = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  CANCELLED: 'cancelled' as const,
  REJECTED: 'rejected' as const,
};

export const ReservationStatusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  rejected: 'Rejeitada',
};

export const ReservationStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
};