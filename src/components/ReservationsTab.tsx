import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, Users, MessageSquare, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Reservation, ReservationStatusLabels, ReservationStatusColors } from "@/types/reservation";
import { reservationService } from "@/services/reservationService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ReservationsTab = () => {
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

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      setUpdatingReservations(prev => new Set([...prev, reservationId]));

      await reservationService.cancelReservation(reservationId);

      toast({
        title: "Reserva cancelada",
        description: "Sua reserva foi cancelada com sucesso.",
        variant: "default"
      });

      // Recarregar reservas
      await loadReservations();
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      toast({
        title: "Erro ao cancelar",
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Reservas</CardTitle>
          <CardDescription>
            Acompanhe suas solicitações de reserva
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
          <CardTitle>Minhas Reservas</CardTitle>
          <CardDescription>
            Acompanhe suas solicitações de reserva
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Minhas Reservas</span>
          <Badge variant="outline">{reservations.length}</Badge>
        </CardTitle>
        <CardDescription>
          Acompanhe suas solicitações de reserva e gerencie suas estadias
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhuma reserva encontrada</p>
            <p>Suas reservas aparecerão aqui quando você fizer solicitações.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="border-l-4 border-l-primary">
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
                    <span className="font-medium">Total pago</span>
                    <span className="text-lg font-bold text-green-600">
                      R$ {reservation.total_price.toFixed(2)}
                    </span>
                  </div>

                  {reservation.message && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Sua mensagem</span>
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

                    {reservation.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.id)}
                        disabled={updatingReservations.has(reservation.id)}
                      >
                        {updatingReservations.has(reservation.id) ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          'Cancelar Reserva'
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationsTab;