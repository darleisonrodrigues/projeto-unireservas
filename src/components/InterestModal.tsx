import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Loader2, User, Mail, Phone } from "lucide-react";
import { Property } from "@/types/property";
import { chatService } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";

interface InterestModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const InterestModal = ({ property, isOpen, onClose, onSuccess }: InterestModalProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Mensagem obrigatória",
        description: "Por favor, escreva uma mensagem para o proprietário.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      // Criar novo chat ou obter chat existente
      await chatService.createOrGetChat({
        property_id: property.id!,
        initial_message: message.trim()
      });

      toast({
        title: "Chat iniciado!",
        description: "Sua mensagem foi enviada ao proprietário. Você pode continuar a conversa na aba Mensagens.",
        variant: "default"
      });

      onClose();
      setMessage(''); // Limpar formulário
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Erro ao iniciar chat:', error);
      toast({
        title: "Erro ao iniciar conversa",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  // Sugestões de mensagens
  const messageSuggestions = [
    "Olá! Gostaria de saber mais detalhes sobre este imóvel. Você pode me fornecer mais informações?",
    "Oi! Este imóvel ainda está disponível? Posso agendar uma visita?",
    "Olá! Tenho interesse neste imóvel. Você pode me contar mais sobre as condições e disponibilidade?",
    "Oi! Gostaria de saber sobre as condições de locação e se é possível fazer uma visita."
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Demonstrar Interesse
          </DialogTitle>
          <DialogDescription>
            Envie uma mensagem para o proprietário de "{property.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do imóvel */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{property.title}</h3>
            <p className="text-sm text-muted-foreground">{property.location}</p>
            <p className="text-lg font-bold text-green-600 mt-2">
              R$ {property.price}/mês
            </p>
          </div>

          {/* Campo de mensagem */}
          <div className="space-y-2">
            <Label htmlFor="message">Sua mensagem</Label>
            <Textarea
              id="message"
              placeholder="Escreva sua mensagem aqui... (ex: gostaria de saber mais sobre o imóvel, agendar visita, condições, etc.)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Seja educado e específico sobre suas dúvidas ou interesse.
            </p>
          </div>

          {/* Sugestões de mensagens */}
          <div className="space-y-2">
            <Label className="text-sm">Sugestões de mensagem:</Label>
            <div className="space-y-2">
              {messageSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMessage(suggestion)}
                  className="w-full text-left p-2 text-xs bg-muted/30 hover:bg-muted/50 rounded border transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Informações sobre o contato */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Como funciona?</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                O proprietário receberá sua mensagem por email
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                Ele pode responder diretamente ou entrar em contato
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                Seja claro sobre suas dúvidas e interesse
              </li>
            </ul>
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
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InterestModal;