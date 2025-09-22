import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, Users, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { Reservation, ReservationStatusLabels, ReservationStatusColors } from "@/types/reservation";
import { reservationService } from "@/services/reservationService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdvertiserReservationsTab = () => {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingReservations, setUpdatingReservations] = useState<Set<string>>(new Set());

  const loadReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar reservas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleConfirmReservation = async (reservationId: string) => {
    try {
      setUpdatingReservations(prev => new Set([...prev, reservationId]));

      await reservationService.confirmReservation(reservationId);

      toast({
        title: "Reserva confirmada",
        description: "A reserva foi confirmada com sucesso.",
        variant: "default"
      });

      await loadReservations();
    } catch (error) {
      console.error('Erro ao confirmar reserva:', error);
      toast({
        title: "Erro ao confirmar",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setUpdatingReservations(prev => {
        const newSet = new Set(prev);
        newSet.delete(reservationId);
        return newSet;
      });
    }
  };

  const handleRejectReservation = async (reservationId: string) => {
    if (!confirm('Tem certeza que deseja rejeitar esta reserva?')) {
      return;
    }

    try {
      setUpdatingReservations(prev => new Set([...prev, reservationId]));

      await reservationService.rejectReservation(reservationId);

      toast({
        title: "Reserva rejeitada",
        description: "A reserva foi rejeitada.",
        variant: "default"
      });

      await loadReservations();
    } catch (error) {
      console.error('Erro ao rejeitar reserva:', error);
      toast({
        title: "Erro ao rejeitar",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setUpdatingReservations(prev => {
        const newSet = new Set(prev);
        newSet.delete(reservationId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    return ReservationStatusColors[status as keyof typeof ReservationStatusColors] || 'bg-gray-100 text-gray-800';
  };

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const otherReservations = reservations.filter(r => !['pending', 'confirmed'].includes(r.status));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Reservas</CardTitle>
          <CardDescription>
            Aprove ou rejeite solicitações de reserva dos seus imóveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Carregando reservas...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Reservas</CardTitle>
          <CardDescription>
            Aprove ou rejeite solicitações de reserva dos seus imóveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">Erro ao carregar reservas</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadReservations} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo das reservas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingReservations.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">{confirmedReservations.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{reservations.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservas pendentes */}
      {pendingReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Reservas Pendentes
              <Badge variant="outline">{pendingReservations.length}</Badge>
            </CardTitle>
            <CardDescription>
              Solicitações aguardando sua aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onConfirm={handleConfirmReservation}
                  onReject={handleRejectReservation}
                  isUpdating={updatingReservations.has(reservation.id)}
                  showActions={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reservas confirmadas */}
      {confirmedReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Reservas Confirmadas
              <Badge variant="outline">{confirmedReservations.length}</Badge>
            </CardTitle>
            <CardDescription>
              Reservas aprovadas e ativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {confirmedReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  isUpdating={false}
                  showActions={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outras reservas */}
      {otherReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Reservas</CardTitle>
            <CardDescription>
              Reservas canceladas e rejeitadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otherReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  isUpdating={false}
                  showActions={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reservations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhuma reserva encontrada</p>
            <p className="text-muted-foreground">
              As solicitações de reserva dos seus imóveis aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface ReservationCardProps {
  reservation: Reservation;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  isUpdating: boolean;
  showActions: boolean;
}

const ReservationCard = ({ reservation, onConfirm, onReject, isUpdating, showActions }: ReservationCardProps) => {
  const getStatusColor = (status: string) => {
    return ReservationStatusColors[status as keyof typeof ReservationStatusColors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              {reservation.property_title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {reservation.property_location}
            </div>
            <div className="text-sm text-muted-foreground">
              Solicitante: {reservation.student_name} ({reservation.student_email})
            </div>
          </div>
          <Badge className={getStatusColor(reservation.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(reservation.status)}
              {ReservationStatusLabels[reservation.status as keyof typeof ReservationStatusLabels]}
            </div>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">Check-in</div>
              <div className="text-muted-foreground">
                {formatDate(reservation.start_date)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">Check-out</div>
              <div className="text-muted-foreground">
                {formatDate(reservation.end_date)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">Hóspedes</div>
              <div className="text-muted-foreground">
                {reservation.guests} pessoa{reservation.guests > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-4">
          <span className="font-medium">Valor total</span>
          <span className="text-lg font-bold text-green-600">
            R$ {reservation.total_price.toFixed(2)}
          </span>
        </div>

        {reservation.message && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Mensagem do hóspede</span>
            </div>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              {reservation.message}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Solicitado em {format(new Date(reservation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>

          {showActions && onConfirm && onReject && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(reservation.id)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Rejeitar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => onConfirm(reservation.id)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Confirmar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvertiserReservationsTab;