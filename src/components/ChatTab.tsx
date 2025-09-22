import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, ArrowLeft, User, Home, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chatService, Chat, ChatMessage } from "@/services/chatService";
import { useAuthFirebase } from "@/contexts/AuthFirebaseContext";

const ChatTab = () => {
  const { toast } = useToast();
  const { user } = useAuthFirebase();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatsCache, setChatsCache] = useState<Chat[]>([]);
  const [lastChatsFetch, setLastChatsFetch] = useState<number>(0);
  const [messagesPage, setMessagesPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [messagesCache, setMessagesCache] = useState<Map<string, { messages: ChatMessage[], timestamp: number }>>(new Map());
  const [preloadedChats, setPreloadedChats] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);

  // Cache de 30 segundos para chats e 2 minutos para mensagens
  const CACHE_DURATION = 30000;
  const MESSAGES_CACHE_DURATION = 120000;
  const MESSAGES_PER_PAGE = 20;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadChats = useCallback(async (forceRefresh = false) => {
    const now = Date.now();

    // Usar cache se ainda válido e não forçar refresh
    if (!forceRefresh && chatsCache.length > 0 && (now - lastChatsFetch) < CACHE_DURATION) {
      setChats(chatsCache);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await chatService.getMyChats();
      setChats(response.chats);
      setChatsCache(response.chats);
      setLastChatsFetch(now);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar suas conversas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [chatsCache, lastChatsFetch, toast]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Pre-loading de mensagens quando hovera sobre chat
  const preloadMessages = useCallback(async (chatId: string) => {
    if (preloadedChats.has(chatId)) return;

    try {
      const response = await chatService.getChatMessages(chatId, 1, MESSAGES_PER_PAGE);

      // Armazenar no cache
      setMessagesCache(prev => new Map(prev.set(chatId, {
        messages: response.messages,
        timestamp: Date.now()
      })));

      setPreloadedChats(prev => new Set(prev.add(chatId)));
    } catch (error) {
      console.error('Erro no pre-loading:', error);
    }
  }, [preloadedChats]);

  const loadMessages = useCallback(async (chat: Chat, page = 1) => {
    const now = Date.now();

    // Verificar cache primeiro se é a primeira página
    if (page === 1) {
      const cached = messagesCache.get(chat.id);
      if (cached && (now - cached.timestamp) < MESSAGES_CACHE_DURATION) {
        // Usar cache - instantâneo!
        setMessages(cached.messages);
        setSelectedChat(chat);
        setMessagesPage(1);
        setHasMoreMessages(cached.messages.length === MESSAGES_PER_PAGE);
        return;
      }
    }

    try {
      if (page === 1) {
        // Para primeira página, mostrar loading mais rápido
        setSelectedChat(chat); // Selecionar imediatamente
        setMessages([]); // Limpar mensagens antigas
        setIsLoadingMessages(true);
        setMessagesPage(1);
        setHasMoreMessages(true);
      } else {
        setIsLoadingMoreMessages(true);
      }

      const response = await chatService.getChatMessages(chat.id, page, MESSAGES_PER_PAGE);

      if (page === 1) {
        setMessages(response.messages);

        // Atualizar cache
        setMessagesCache(prev => new Map(prev.set(chat.id, {
          messages: response.messages,
          timestamp: now
        })));
      } else {
        setMessages(prev => [...response.messages, ...prev]);
      }

      setHasMoreMessages(response.messages.length === MESSAGES_PER_PAGE);
      setMessagesPage(page);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingMoreMessages(false);
    }
  }, [toast, messagesCache]);

  const loadMoreMessages = useCallback(() => {
    if (selectedChat && hasMoreMessages && !isLoadingMoreMessages) {
      loadMessages(selectedChat, messagesPage + 1);
    }
  }, [selectedChat, hasMoreMessages, isLoadingMoreMessages, messagesPage, loadMessages]);

  // Detectar scroll para carregar mais mensagens
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;

    // Se chegou no topo (com margem de 50px), carregar mais
    if (scrollTop < 50 && hasMoreMessages && !isLoadingMoreMessages) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMoreMessages, loadMoreMessages]);

  const sendMessage = useCallback(async () => {
    if (!selectedChat || !newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Limpar campo imediatamente para UX responsiva

    try {
      setIsSending(true);

      const message = await chatService.sendMessage({
        chat_id: selectedChat.id,
        content: messageContent
      });

      // Adicionar mensagem à lista local
      setMessages(prev => [...prev, message]);

      // Atualizar cache e estado dos chats otimizadamente
      const updatedChats = chats.map(chat =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              last_message: messageContent,
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : chat
      );

      setChats(updatedChats);
      setChatsCache(updatedChats); // Atualizar cache também

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setNewMessage(messageContent); // Restaurar mensagem em caso de erro
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  }, [selectedChat, newMessage, chats, toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherParticipantName = useCallback((chat: Chat) => {
    const isStudent = user?.userType === 'student';
    return isStudent ? chat.advertiser_name : chat.student_name;
  }, [user?.userType]);

  const formatLastMessageTime = useCallback((dateString?: string) => {
    if (!dateString) return '';
    return chatService.formatLastMessageTime(dateString);
  }, []);

  const formatMessageTime = useCallback((dateString: string) => {
    return chatService.formatMessageDate(dateString);
  }, []);

  // Memoizar lista de chats para evitar re-renders
  const memoizedChats = useMemo(() => chats, [chats]);

  // Memoizar mensagens para evitar re-renders desnecessários
  const memoizedMessages = useMemo(() => messages, [messages]);

  // Debounce para digitação
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, [isTyping]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  }, [handleTyping]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Carregando conversas...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          {selectedChat && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedChat(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <MessageSquare className="w-5 h-5" />
          {selectedChat ? getOtherParticipantName(selectedChat) : 'Conversas'}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {!selectedChat ? (
          // Lista de chats
          <div className="flex-1 overflow-hidden">
            {memoizedChats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground p-6">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium mb-2">Nenhuma conversa encontrada</p>
                <p>
                  Demonstre interesse em uma propriedade para iniciar uma conversa!
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2 p-4">
                  {memoizedChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => loadMessages(chat)}
                      onMouseEnter={() => preloadMessages(chat.id)}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarFallback>
                          {getOtherParticipantName(chat)?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">
                            {getOtherParticipantName(chat)}
                          </p>
                          <div className="flex items-center gap-2">
                            {chat.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {chat.unread_count}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatLastMessageTime(chat.last_message_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Home className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate">
                            {chat.property_title}
                          </span>
                          {chat.property_price && (
                            <span className="text-sm font-medium text-green-600">
                              R$ {chat.property_price}/mês
                            </span>
                          )}
                        </div>

                        {chat.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.last_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          // Interface do chat
          <div className="flex-1 flex flex-col">
            {/* Informações da propriedade */}
            <div className="bg-muted/30 p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span className="font-medium">{selectedChat?.property_title || 'Carregando...'}</span>
                </div>
                {selectedChat?.property_price && (
                  <span className="text-green-600 font-medium">
                    R$ {selectedChat.property_price}/mês
                  </span>
                )}
                {isLoadingMessages && (
                  <div className="ml-auto flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs text-muted-foreground">Carregando...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Área de mensagens */}
            <ScrollArea className="flex-1 p-4" onScrollCapture={handleScroll}>
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Carregando mensagens...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Indicador de carregamento mais mensagens */}
                  {isLoadingMoreMessages && (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Carregando mais...</span>
                      </div>
                    </div>
                  )}

                  {memoizedMessages.map((message) => {
                    const isMyMessage = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-3 py-2 rounded-lg ${
                              isMyMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(message.created_at)}
                            </span>
                          </div>
                        </div>

                        {!isMyMessage && (
                          <Avatar className={`w-8 h-8 ${isMyMessage ? 'order-1 ml-2' : 'order-2 mr-2'}`}>
                            <AvatarFallback className="text-xs">
                              {message.sender_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Campo de envio de mensagem */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {/* Indicador de digitação */}
              {isTyping && selectedChat && (
                <div className="text-xs text-muted-foreground mt-1">
                  Digitando...
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatTab;