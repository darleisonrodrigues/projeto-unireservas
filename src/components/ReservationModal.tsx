import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Property } from "@/types/property";
import { ReservationFormData } from "@/types/reservation";
import { reservationService } from "@/services/reservationService";
import { useToast } from "@/hooks/use-toast";

interface ReservationModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReservationModal = ({ property, isOpen, onClose, onSuccess }: ReservationModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ReservationFormData>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias a partir de hoje
    guests: 1,
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const calculateTotalPrice = () => {
    return reservationService.calculateTotalPrice(property.price, formData.startDate, formData.endDate);
  };

  const calculateDays = () => {
    const days = Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startDate >= formData.endDate) {
      toast({
        title: "Erro nas datas",
        description: "A data de saída deve ser posterior à data de entrada.",
        variant: "destructive"
      });
      return;
    }

    if (formData.guests > property.capacity) {
      toast({
        title: "Muitos hóspedes",
        description: `Este imóvel suporta no máximo ${property.capacity} pessoa(s).`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      const reservationData = {
        property_id: property.id!,
        start_date: formData.startDate.toISOString().split('T')[0],
        end_date: formData.endDate.toISOString().split('T')[0],
        guests: formData.guests,
        message: formData.message,
        total_price: calculateTotalPrice()
      };

      await reservationService.createReservation(reservationData);

      toast({
        title: "Reserva solicitada!",
        description: "Sua solicitação foi enviada ao proprietário. Você será notificado sobre o status.",
        variant: "default"
      });

      onClose();
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast({
        title: "Erro ao fazer reserva",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      guests: 1,
      message: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fazer Reserva</DialogTitle>
          <DialogDescription>
            {property.title} - {property.location}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de entrada</Label>
              <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, startDate: date }));
                        setShowStartCalendar(false);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de saída</Label>
              <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, endDate: date }));
                        setShowEndCalendar(false);
                      }
                    }}
                    disabled={(date) => date <= formData.startDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Número de hóspedes */}
          <div className="space-y-2">
            <Label htmlFor="guests">Número de pessoas</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="guests"
                type="number"
                min="1"
                max={property.capacity}
                value={formData.guests}
                onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Máximo: {property.capacity} pessoa(s)
            </p>
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Conte um pouco sobre você ou faça alguma pergunta ao proprietário..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Resumo do preço */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>R$ {property.price} x {calculateDays()} dia(s)</span>
                <span>R$ {calculateTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>R$ {calculateTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Solicitando...
                </>
              ) : (
                'Solicitar Reserva'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;