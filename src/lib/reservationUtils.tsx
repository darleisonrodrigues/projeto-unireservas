import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReservationStatusColors, ReservationStatusLabels } from "@/types/reservation";

export function formatReservationDate(dateString: string): string {
  try {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export function getStatusIcon(status: string) {
  switch (status) {
    case "confirmed": return <CheckCircle className="w-4 h-4" />;
    case "cancelled": return <XCircle className="w-4 h-4" />;
    case "rejected":  return <AlertCircle className="w-4 h-4" />;
    default:          return <Clock className="w-4 h-4" />;
  }
}

export function getStatusColor(status: string): string {
  return ReservationStatusColors[status as keyof typeof ReservationStatusColors] || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: string): string {
  return ReservationStatusLabels[status as keyof typeof ReservationStatusLabels] ?? status;
}
